"use strict";
/**
 * A SECOND physical local-EVM execution, on a clean CI runner.
 * This implementation never imports the first EVM executor or its witness.
 * It recompiles the two pinned sources, rebuilds the candidate, independently
 * submits mined transactions and exercises eth_call controls.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {prepare,digest,sha256}=require("./SolmateCrossVaultProtocol.cjs");
const {propose,verifyProposal}=require("./SourceBoundExperimentProposalPlanner.cjs");

const [ozArg,smArg,proposalArg,outArg]=process.argv.slice(2);
assert(ozArg&&smArg&&proposalArg&&outArg,
 "Usage: <locked-dependency-root> <pinned-solmate-root> <archived-proposal.json> <new-evidence-dir>");
const oz=path.resolve(ozArg),sm=path.resolve(smArg);
const proposalFile=path.resolve(proposalArg),out=path.resolve(outArg);
const ACTIONS_JOB="independent-local-evm-replay";
const MAX_GAS=3000000;
const ZERO="0x"+"0".repeat(40);
const upper=x=>String(x).toLowerCase();
const checksumEvents=events=>events.map(x=>JSON.stringify(x).toLowerCase()).sort();

function expectedEvents(kind,owner,vault,amount,shares){
 const tr=(contract,from,to,value)=>({contract,name:"Transfer",from,to,amount:value});
 const ap=amount=>({contract:"ASSET",name:"Approval",from:owner,to:vault,amount});
 switch(kind){
  case "MINT_TEST_ASSET":return [tr("ASSET",ZERO,owner,amount)];
  case "APPROVE_VAULT_ASSETS":return [ap(amount)];
  case "DEPOSIT_UNDERLYING":return [
   ap("0"),tr("ASSET",owner,vault,amount),tr("VAULT",ZERO,owner,shares),
   {contract:"VAULT",name:"Deposit",sender:owner,receiver:owner,assets:amount,shares}
  ];
  case "DIRECT_UNDERLYING_DONATION":return [tr("ASSET",owner,vault,amount)];
  case "WITHDRAW_TEST":return [
   tr("VAULT",owner,ZERO,shares),tr("ASSET",vault,owner,amount),
   {contract:"VAULT",name:"Withdraw",sender:owner,receiver:owner,
    owner,assets:amount,shares}
  ];
  default:throw Error("INDEPENDENT_REPLAY_UNKNOWN_MINED_EVENT_OPERATION");
 }
}
function nextState(before,kind,amount,shares){
 const state={...before},n=BigInt(amount);
 const get=k=>BigInt(state[k]);
 const add=(key,v)=>{state[key]=(get(key)+v).toString();assert(get(key)>=0n);};
 switch(kind){
  case "MINT_TEST_ASSET":
   add("assetOwner",n);add("assetSupply",n);break;
  case "APPROVE_VAULT_ASSETS":state.allowanceOwnerVault=amount;break;
  case "DEPOSIT_UNDERLYING":
   add("assetOwner",-n);add("assetVault",n);add("vaultTotalAssets",n);
   add("sharesOwner",BigInt(shares));add("sharesSupply",BigInt(shares));
   state.allowanceOwnerVault="0";break;
  case "DIRECT_UNDERLYING_DONATION":
   add("assetOwner",-n);add("assetVault",n);add("vaultTotalAssets",n);break;
  case "WITHDRAW_TEST":
   add("assetOwner",n);add("assetVault",-n);add("vaultTotalAssets",-n);
   add("sharesOwner",-BigInt(shares));add("sharesSupply",-BigInt(shares));break;
  case "NEGATIVE_BEFORE":case "POSITIVE_AFTER":case "NEGATIVE_AFTER":break;
  default:throw Error("INDEPENDENT_REPLAY_UNKNOWN_TRANSITION");
 }
 assert.equal(get("assetOwner")+get("assetVault")+get("assetAttacker"),
   get("assetSupply"),"LOCAL_ASSETS_NOT_CONSERVED");
 assert.equal(state.assetVault,state.vaultTotalAssets);
 assert.equal(state.sharesOwner,state.sharesSupply);
 return state;
}
const empty=()=>({assetOwner:"0",assetVault:"0",assetAttacker:"0",
 sharesOwner:"0",sharesAttacker:"0",assetSupply:"0",sharesSupply:"0",
 vaultTotalAssets:"0",allowanceOwnerVault:"0"});

async function execute(prepared,plan){
 assert.equal(process.env.OECL_SECOND_RUNNER_LOCAL_REPLAY,"CI_REVIEWED_EXACT_SOURCE_V1",
  "SECOND_RUNNER_LACKS_EXPLICIT_REVIEW_GATE");
 assert.equal(process.env.HARDHAT_NETWORK,"hardhat");
 assert.equal(process.env.GITHUB_ACTIONS,"true","SECOND_EXECUTION_NOT_IN_GITHUB_ACTIONS");
 assert.equal(process.env.GITHUB_JOB,ACTIONS_JOB,"SECOND_EXECUTION_WRONG_JOB_SCOPE");
 assert(/^[0-9]+$/.test(process.env.GITHUB_RUN_ID||""));
 assert.equal(plan.executionAuthorized,false);
 assert.equal(plan.experimentDispatched,false);
 assert.equal(plan.candidateAdmission,"NOT_ADMITTED");
 assert(plan.requestedAuthorizations.every(x=>x.granted===false));
 process.chdir(oz);
 const hre=require(path.join(oz,"node_modules","hardhat"));
 const provider=hre.ethers.provider;
 assert.equal(Number((await provider.getNetwork()).chainId),31337);
 const [owner,attacker]=await hre.ethers.getSigners();
 let lastBlock=0,mined=0,controls=0,reverts=0,simSuccess=0;
 const usedTxHashes=new Set(),seenContracts=new Set();
 const actors={owner:owner.address,attacker:attacker.address};
 async function snapshot(asset,vault){
  const [o,v,a,os,as,supply,shares,assets,allowance]=await Promise.all([
   asset.balanceOf(owner.address),asset.balanceOf(vault.address),
   asset.balanceOf(attacker.address),vault.balanceOf(owner.address),
   vault.balanceOf(attacker.address),asset.totalSupply(),
   vault.totalSupply(),vault.totalAssets(),asset.allowance(owner.address,vault.address)
  ]);
  return {assetOwner:o.toString(),assetVault:v.toString(),assetAttacker:a.toString(),
   sharesOwner:os.toString(),sharesAttacker:as.toString(),
   assetSupply:supply.toString(),sharesSupply:shares.toString(),
   vaultTotalAssets:assets.toString(),allowanceOwnerVault:allowance.toString()};
 }
 function parseEvents(receipt,asset,vault){
  return receipt.logs.map(log=>{
   const contract=upper(log.address)===upper(asset.address)?"ASSET":
    upper(log.address)===upper(vault.address)?"VAULT":null;
   assert(contract,"REPLAY_UNRECOGNIZED_LOG_EMITTER");
   const parsed=(contract==="ASSET"?asset:vault).interface.parseLog(log);
   assert(parsed,"REPLAY_UNDECODABLE_TYPED_LOG");
   const a=parsed.args,name=parsed.name;
   if(name==="Transfer"||name==="Approval")
    return {contract,name,from:a[0],to:a[1],amount:a[2].toString()};
   if(name==="Deposit")
    return {contract,name,sender:a[0],receiver:a[1],
     assets:a[2].toString(),shares:a[3].toString()};
   if(name==="Withdraw")
    return {contract,name,sender:a[0],receiver:a[1],owner:a[2],
     assets:a[3].toString(),shares:a[4].toString()};
   throw Error("REPLAY_UNKNOWN_LOG_CLASS");
  });
 }
 async function mine(tx,contract,method,asset,vault){
  const rc=await tx.wait(1);
  const [fetched,chainTx,block]=await Promise.all([
    provider.getTransactionReceipt(tx.hash),provider.getTransaction(tx.hash),
    provider.getBlock(rc.blockNumber)
  ]);
  assert(rc&&fetched&&chainTx&&block);
  assert.equal(rc.status,1);assert.equal(fetched.status,1);
  assert.equal(rc.blockHash,fetched.blockHash);assert.equal(rc.blockHash,block.hash);
  assert(block.transactions.some(hash=>upper(hash)===upper(tx.hash)));
  assert(rc.blockNumber>lastBlock,"REPLAY_NONMONOTONIC_MINED_BLOCK");
  lastBlock=rc.blockNumber;
  assert(rc.gasUsed.gt(0)&&rc.gasUsed.lte(MAX_GAS));
  assert.equal(upper(chainTx.from),upper(owner.address));
  assert.equal(chainTx.to?upper(chainTx.to):null,contract?upper(contract.address):null);
  const selector=contract?contract.interface.getSighash(method):"CREATE";
  if(contract)assert.equal(chainTx.data.slice(0,10),selector);
  const id=upper(tx.hash);assert(!usedTxHashes.has(id),"REPLAY_DUPLICATE_TRANSACTION");
  usedTxHashes.add(id);mined++;
  return {txHash:tx.hash,blockHash:rc.blockHash,blockNumber:rc.blockNumber,
   status:1,transactionMined:true,method,from:chainTx.from,to:chainTx.to,
   methodSelector:selector,gasUsed:rc.gasUsed.toString(),
   events:contract?parseEvents(rc,asset,vault):[]};
 }
 const scenarios=[];
 for(let i=0;i<2;i++){
  const variant=plan.provenance.twoCodebases[i],art=prepared.artifacts;
  const vaultArtifact=i===0?art.ozVault:art.solmateVault,assetArtifact=art.asset;
  assert.equal(digest(vaultArtifact.abi),variant.vaultAbiSha256);
  assert.equal(sha256(vaultArtifact.evm.bytecode.object),variant.vaultBytecodeSha256);
  assert.equal(digest(assetArtifact.abi),variant.assetAbiSha256);
  assert.equal(sha256(assetArtifact.evm.bytecode.object),variant.assetBytecodeSha256);
  const deploy=(artifact,constructorArgs)=>
   new hre.ethers.ContractFactory(artifact.abi,
    "0x"+artifact.evm.bytecode.object,owner).deploy(...constructorArgs,
    {gasLimit:MAX_GAS});
  const asset=await deploy(assetArtifact,[]);
  await asset.deployed();
  const created=[{role:"ASSET",address:asset.address,receipt:
    await mine(asset.deployTransaction,null,"CONSTRUCTOR",null,null)}];
  const vault=await deploy(vaultArtifact,[asset.address]);
  await vault.deployed();
  created.push({role:"VAULT",address:vault.address,receipt:
    await mine(vault.deployTransaction,null,"CONSTRUCTOR",null,null)});
  assert.equal(upper(await vault.asset()),upper(asset.address));
  for(const [item,contract] of [[created[0],asset],[created[1],vault]]){
   assert(!seenContracts.has(upper(item.address)));
   seenContracts.add(upper(item.address));
   const code=await provider.getCode(item.address);
   assert(code&&code!=="0x");
   item.runtimeKeccak256=hre.ethers.utils.keccak256(code);
  }
  const starting=await snapshot(asset,vault);
  assert.deepEqual(starting,empty());
  let previous=starting,steps=[];
  for(const instruction of plan.experimentProgram){
   const before=await snapshot(asset,vault);
   assert.deepEqual(before,previous);
   const kind=instruction.kind,quantity=instruction.quantity;
   let preview=null,maxAvailable=null,returnValue=null,receipt=null,simulation=null;
   if(kind==="NEGATIVE_BEFORE"||kind==="POSITIVE_AFTER"||kind==="NEGATIVE_AFTER"){
    const height=await provider.getBlockNumber();
    if(kind==="POSITIVE_AFTER"){
     maxAvailable=(await vault.maxWithdraw(owner.address)).toString();
     assert.equal(maxAvailable,i===0?"41":"42",
       "INDEPENDENT_SOURCE_MODEL_MAX_WITHDRAW_DIVERGED");
     preview=(await vault.previewWithdraw(quantity)).toString();
     assert.equal(preview,"40","REPLAY_POSITIVE_CALL_PREVIEW_DIFFERED");
     returnValue=(await vault.connect(owner).callStatic[
      "withdraw(uint256,address,address)"](quantity,owner.address,owner.address,
      {gasLimit:MAX_GAS})).toString();
     assert.equal(returnValue,preview,"REPLAY_POSITIVE_CALL_RETURN_MISMATCH");
     simulation="ETH_CALL_SUCCESS";simSuccess++;
    }else{
     let reverted=false;
     try{
      await vault.connect(owner).callStatic[
       "withdraw(uint256,address,address)"](quantity,owner.address,owner.address,
       {gasLimit:MAX_GAS});
     }catch{reverted=true;}
     assert(reverted,"REPLAY_REVERT_CONTROL_UNEXPECTED_SUCCESS");
     simulation="ETH_CALL_REVERT";reverts++;
    }
    controls++;
    assert.equal(await provider.getBlockNumber(),height,"REPLAY_ETH_CALL_MINED_A_BLOCK");
   }else{
    let tx,shares=null,contract;
    if(kind==="MINT_TEST_ASSET"){
     contract=asset;
     tx=await asset.connect(owner)["oeclResearchMint(address,uint256)"](
      owner.address,quantity,{gasLimit:MAX_GAS});
    }else if(kind==="APPROVE_VAULT_ASSETS"){
     contract=asset;
     tx=await asset.connect(owner)["approve(address,uint256)"](
      vault.address,quantity,{gasLimit:MAX_GAS});
    }else if(kind==="DEPOSIT_UNDERLYING"){
     contract=vault;
     shares=(await vault.previewDeposit(quantity)).toString();
     assert.equal(shares,"40","REPLAY_DEPOSIT_NOT_1_TO_1");
     tx=await vault.connect(owner)["deposit(uint256,address)"](
      quantity,owner.address,{gasLimit:MAX_GAS});
    }else if(kind==="DIRECT_UNDERLYING_DONATION"){
     contract=asset;
     tx=await asset.connect(owner)["transfer(address,uint256)"](
      vault.address,quantity,{gasLimit:MAX_GAS});
    }else if(kind==="WITHDRAW_TEST"){
     contract=vault;
     shares=(await vault.previewWithdraw(quantity)).toString();
     assert.equal(shares,i===0?"21":"20","REPLAY_ECONOMIC_COUNTEREXAMPLE_MISSING");
     tx=await vault.connect(owner)["withdraw(uint256,address,address)"](
      quantity,owner.address,owner.address,{gasLimit:MAX_GAS});
    }else throw Error("REPLAY_UNREVIEWED_OPERATION");
    receipt=await mine(tx,contract,instruction.signature,asset,vault);
    assert.deepEqual(checksumEvents(receipt.events),
     checksumEvents(expectedEvents(kind,owner.address,vault.address,quantity,shares)),
     "REPLAY_EVENT_VALUES_DIFFER");
    preview=shares;
   }
   const after=await snapshot(asset,vault);
   assert.deepEqual(after,nextState(before,kind,quantity,preview),
    "REPLAY_EVM_STATE_DIFFERS_FROM_INDEPENDENT_REDUCER");
   steps.push({kind,method:instruction.signature,quantity,
    execution:instruction.review,before,after,preview,maxAvailable,returnValue,
    receipt,simulation,transactionMined:receipt!==null,
    statePreserved:receipt===null});
   previous=after;
  }
  const finalState=await snapshot(asset,vault);
  assert.deepEqual(finalState,i===0?{
   assetOwner:"79",assetVault:"21",assetAttacker:"0",sharesOwner:"19",
   sharesAttacker:"0",assetSupply:"100",sharesSupply:"19",
   vaultTotalAssets:"21",allowanceOwnerVault:"0"}:{
   assetOwner:"79",assetVault:"21",assetAttacker:"0",sharesOwner:"20",
   sharesAttacker:"0",assetSupply:"100",sharesSupply:"20",
   vaultTotalAssets:"21",allowanceOwnerVault:"0"});
  const withdrawal=steps.find(s=>s.kind==="WITHDRAW_TEST");
  const eventOrder=withdrawal.receipt.events.map(e=>e.contract+":"+e.name);
  assert.deepEqual(eventOrder,i===0?[
   "VAULT:Transfer","ASSET:Transfer","VAULT:Withdraw"]:
   ["VAULT:Transfer","VAULT:Withdraw","ASSET:Transfer"]);
  scenarios.push({id:variant.id,created,steps,initialState:starting,
   finalState,burnedShares:withdrawal.preview,withdrawalEventOrder:eventOrder,
   minedReceipts:7,unminedControls:3});
 }
 assert.equal(mined,14);
 assert.equal(controls,6);assert.equal(reverts,4);assert.equal(simSuccess,2);
 assert.equal(usedTxHashes.size,14);assert.equal(seenContracts.size,4);
 return {schemaVersion:"OECL_INDEPENDENT_SECOND_LOCAL_EVM_WITNESS_V1",
  proposalSha256:plan.proposalSha256,provenanceSha256:digest(plan.provenance),
  chainId:31337,reviewGate:"EXACT_SOURCE_CI_SECOND_JOB_LOCAL_ONLY",
  ciRunId:process.env.GITHUB_RUN_ID,ciJob:process.env.GITHUB_JOB,
  actors,scenarios,minedReceipts:14,unminedControls:6,
  unminedExpectedReverts:4,unminedExpectedSuccesses:2,
  hypothesis:{id:plan.falsifiableHypothesis.id,
   verdict:"REFUTED_IN_THESE_LOCAL_EVM_FIXTURES",
   ozBurnedShares:scenarios[0].burnedShares,
   solmateBurnedShares:scenarios[1].burnedShares},
  overallScientificVerdict:"INCONCLUSIVE",
  compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
  claimScope:"TWO_TEST_ONLY_ERC4626_IMPLEMENTATIONS_ONE_DONATION_RESEARCH_CASE",
  independentRunnerImplementation:true,
  independentEvmExecution:true,
  independentEthereumConsensus:false,
  independentSourceOriginAuthentication:false};
}
async function main(){
 // The experiment cannot be dispatched on the basis of an agent-generated
 // proposal alone. A separate reviewed CI policy gate is mandatory.
 assert.equal(process.env.OECL_SECOND_RUNNER_LOCAL_REPLAY,"CI_REVIEWED_EXACT_SOURCE_V1",
  "SECOND_RUNNER_LACKS_EXPLICIT_REVIEW_GATE");
 assert.equal(process.env.HARDHAT_NETWORK,"hardhat");
 assert.equal(process.env.GITHUB_ACTIONS,"true");
 assert.equal(process.env.GITHUB_JOB,ACTIONS_JOB);
 assert(/^[0-9]+$/.test(process.env.GITHUB_RUN_ID||""));
 const archived=JSON.parse(fs.readFileSync(proposalFile,"utf8"));
 const compiled=await prepare(oz,sm);
 const proposal=propose(compiled);
 assert(verifyProposal(archived,compiled),"SECOND_RUNNER_REJECTED_ARCHIVED_PLAN");
 assert.deepEqual(archived,proposal,"SECOND_RUNNER_INDEPENDENT_COMPILER_PLAN_DIFFERS");
 assert.equal(proposal.status,"GENERATED_SOURCE_BOUND_CANDIDATE_NEEDS_REVIEW");
 assert.equal(proposal.selection.donation,2);
 assert.equal(proposal.selection.withdrawal,21);
 const witness=await execute(compiled,proposal);
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,"independent-second-evm-witness.json"),
  JSON.stringify(witness,null,2)+"\n");
 console.log("OECL_SECOND_LOCAL_EVM_EXECUTION_PASS",JSON.stringify({
  runId:witness.ciRunId,job:witness.ciJob,proposalSha256:witness.proposalSha256,
  mined:witness.minedReceipts,unmined:witness.unminedControls,
  burned:witness.scenarios.map(s=>({id:s.id,shares:s.burnedShares,
   finalState:s.finalState})),scientificVerdict:"INCONCLUSIVE"}));
}
main().catch(e=>{console.error("OECL_SECOND_LOCAL_EVM_EXECUTION_FAILED",
 e.stack||e);process.exitCode=1;});
