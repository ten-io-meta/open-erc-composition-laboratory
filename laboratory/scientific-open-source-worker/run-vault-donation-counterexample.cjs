"use strict";
/**
 * Same preregistered operation PROGRAM from PR #40, new Solmate ERC4626
 * concrete adapter. Hardhat 31337 only; 2 reviewed vaults, no arbitrary RPC.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {prepare,makePlan:makeBasePlan,sha256,digest}=require("./SolmateCrossVaultProtocol.cjs");
const {bounds,emptyState}=require("./ReusableVaultOperationGrammar.cjs");
const {BOUNDS,PROGRAM,buildPlan,verifyPlan,resolveArgs,expectedPreview,
 expectedMaxWithdraw,transitionDonation}=require("./VaultDonationCounterexample.cjs");
const [mode,ozRoot,solmateRoot,outputArg]=process.argv.slice(2);
assert(["probe","plan","execute"].includes(mode),"UNREVIEWED_SOLMATE_MODE");
assert(ozRoot&&solmateRoot&&outputArg,"USAGE: <probe|plan|execute> <locked-toolchain-root> <pinned-solmate-root> <output>");
const root=path.resolve(ozRoot),solmate=path.resolve(solmateRoot),dir=path.resolve(outputArg);
const probeFile=path.join(dir,"solmate-blind-probe.json");
const planFile=path.join(dir,"vault-donation-plan.json");
const witnessFile=path.join(dir,"vault-donation-witness.json");
const ZERO="0x"+"0".repeat(40);
function comparableEvents(events){return events.map(e=>JSON.stringify(e).toLowerCase()).sort();}
function semanticEvents(inst,actors,preview){
 const {owner,vault}=actors;
 const transfer=(contract,from,to,amount)=>({contract,name:"Transfer",from,to,amount});
 const approval=amount=>({contract:"ASSET",name:"Approval",from:owner,to:vault,amount});
 switch(inst.op){
  case "FUND_ASSET":return [transfer("ASSET",ZERO,owner,bounds.minted)];
  case "ALLOW":return [approval(inst.id==="APPROVE_DEPOSIT"?bounds.deposit:bounds.insufficient)];
  case "CUSTODY_IN":return [
   approval("0"),transfer("ASSET",owner,vault,bounds.deposit),
   transfer("VAULT",ZERO,owner,preview.shares),
   {contract:"VAULT",name:"Deposit",sender:owner,receiver:owner,
    assets:bounds.deposit,shares:preview.shares}];
  case "DONATE_ASSET":return [transfer("ASSET",owner,vault,BOUNDS.donation)];
  case "EXPECT_SUCCESS":return [];
  case "CUSTODY_OUT":return [
   transfer("VAULT",owner,ZERO,preview.shares),
   transfer("ASSET",vault,owner,bounds.withdraw),
   {contract:"VAULT",name:"Withdraw",sender:owner,receiver:owner,
    owner,assets:bounds.withdraw,shares:preview.shares}];
  case "REVERT":return [];
  default:throw Error("UNREVIEWED_OPERATION_FOR_EVENT_REVIEW");
 }
}
async function experiment(plan,artifacts){
 assert(verifyPlan(plan));
 assert.equal(plan.status,"PREREGISTERED_DONATION_COUNTEREXAMPLE");
 assert.equal(process.env.HARDHAT_NETWORK||"hardhat","hardhat","REMOTE_EVM_FORBIDDEN");
 process.chdir(root);
 const hre=require(path.join(root,"node_modules/hardhat"));
 const provider=hre.ethers.provider;
 assert.equal(Number((await provider.getNetwork()).chainId),31337,"NONLOCAL_CHAIN_ID");
 const [owner,attacker]=await hre.ethers.getSigners();
 const actors={owner:owner.address,attacker:attacker.address};
 const scenarios=[];
 let allReceipts=0;
 async function snapshot(asset,vault){
  const [aOwner,aVault,aAttacker,sOwner,sAttacker,aSupply,sSupply,assets,allowance]=
   await Promise.all([
    asset.balanceOf(actors.owner),asset.balanceOf(vault.address),
    asset.balanceOf(actors.attacker),vault.balanceOf(actors.owner),
    vault.balanceOf(actors.attacker),asset.totalSupply(),vault.totalSupply(),
    vault.totalAssets(),asset.allowance(actors.owner,vault.address)]);
  return {assetOwner:aOwner.toString(),assetVault:aVault.toString(),
   assetAttacker:aAttacker.toString(),sharesOwner:sOwner.toString(),
   sharesAttacker:sAttacker.toString(),assetSupply:aSupply.toString(),
   sharesSupply:sSupply.toString(),vaultTotalAssets:assets.toString(),
   allowanceOwnerVault:allowance.toString()};
 }
 function parseEvents(raw,asset,vault){
  const result=[];
  for(const log of raw.logs){
   const contract=log.address.toLowerCase()===asset.address.toLowerCase()?"ASSET":
    log.address.toLowerCase()===vault.address.toLowerCase()?"VAULT":null;
   if(!contract)throw Error("UNREVIEWED_EXTERNAL_EVENT");
   const decoded=(contract==="ASSET"?asset:vault).interface.parseLog(log);
   const n=decoded.name,a=decoded.args;
   if(n==="Transfer"||n==="Approval")result.push({
    contract,name:n,from:a[0],to:a[1],amount:a[2].toString()});
   else if(n==="Deposit")result.push({contract,name:n,sender:a[0],
    receiver:a[1],assets:a[2].toString(),shares:a[3].toString()});
   else if(n==="Withdraw")result.push({contract,name:n,sender:a[0],
    receiver:a[1],owner:a[2],assets:a[3].toString(),shares:a[4].toString()});
   else throw Error("UNREVIEWED_EVENT:"+n);
  }
  return result;
 }
 async function checkedTx(tx,target,signer,method,asset,vault){
  const mined=await tx.wait(1);
  const receipt=await provider.getTransactionReceipt(tx.hash),actual=await provider.getTransaction(tx.hash);
  const block=await provider.getBlock(mined.blockNumber);
  assert(mined&&receipt&&actual&&block);
  assert.equal(mined.status,1);assert.equal(receipt.status,1);
  assert.equal(receipt.blockHash,mined.blockHash);assert.equal(block.hash,mined.blockHash);
  assert(block.transactions.some(h=>h.toLowerCase()===tx.hash.toLowerCase()));
  assert.equal(actual.from.toLowerCase(),signer.address.toLowerCase());
  assert.equal(actual.to?.toLowerCase()||null,target?.address.toLowerCase()||null);
  assert(mined.gasUsed.gt(0)&&mined.gasUsed.lte(bounds.maxGasPerTransaction));
  if(target)assert.equal(actual.data.slice(0,10),target.interface.getSighash(method));
  allReceipts++;
  return {txHash:tx.hash,blockHash:receipt.blockHash,blockNumber:receipt.blockNumber,
   from:actual.from,to:actual.to,method,status:1,transactionMined:true,
   methodSelector:target?actual.data.slice(0,10):"CREATE",
   gasUsed:mined.gasUsed.toString(),
   events:target?parseEvents(receipt,asset,vault):[]};
 }
 for(let i=0;i<2;i++){
  const variant=plan.variants[i],vaultArtifact=i===0?artifacts.ozVault:artifacts.solmateVault;
  const assetArtifact=artifacts.asset;
  assert(digest(assetArtifact.abi)===variant.assetAbiSha256);
  assert(sha256(assetArtifact.evm.bytecode.object)===variant.assetBytecodeSha256);
  assert(digest(vaultArtifact.abi)===variant.vaultAbiSha256);
  assert(sha256(vaultArtifact.evm.bytecode.object)===variant.vaultBytecodeSha256);
  const asset=await new hre.ethers.ContractFactory(assetArtifact.abi,
   "0x"+assetArtifact.evm.bytecode.object,owner).deploy({gasLimit:bounds.maxGasPerTransaction});
  await asset.deployed();
  const created=[];
  created.push({role:"ASSET",address:asset.address,receipt:
   await checkedTx(asset.deployTransaction,null,owner,"CONSTRUCTOR",null,null)});
  const vault=await new hre.ethers.ContractFactory(vaultArtifact.abi,
   "0x"+vaultArtifact.evm.bytecode.object,owner).deploy(
    ... (variant.id==="SOLMATE"?[asset.address]:[asset.address]),
    {gasLimit:bounds.maxGasPerTransaction});
  await vault.deployed();
  created.push({role:"VAULT",address:vault.address,receipt:
   await checkedTx(vault.deployTransaction,null,owner,"CONSTRUCTOR",null,null)});
  assert.equal((await vault.asset()).toLowerCase(),asset.address.toLowerCase());
  const vaultCode=await provider.getCode(vault.address);
  const assetCode=await provider.getCode(asset.address);
  assert(vaultCode.length>2&&assetCode.length>2);
  created[0].runtimeKeccak256=hre.ethers.utils.keccak256(assetCode);
  created[1].runtimeKeccak256=hre.ethers.utils.keccak256(vaultCode);
  const initial=await snapshot(asset,vault);
  assert.deepEqual(initial,emptyState(),"UNEXPECTED_NONEMPTY_FIXTURE");
  const steps=[],symbols={owner:actors.owner,attacker:actors.attacker,vault:vault.address};
  for(const inst of plan.program){
   const before=await snapshot(asset,vault),params=resolveArgs(inst,symbols);
   const contract=inst.target==="ASSET"?asset:vault;
   const signer=inst.role==="OWNER"?owner:attacker;
   let preview=null,receipt=null,simulation=null,statePreserved=null,maxWithdraw=null;
   if(inst.preview){
    const assets=inst.op==="CUSTODY_IN"?BOUNDS.deposit:
      inst.op==="CUSTODY_OUT"?BOUNDS.withdraw:BOUNDS.postDonationWithdrawal;
    const shares=(await vault[inst.preview](assets)).toString();
    preview={method:inst.preview,assets,shares};
    assert.equal(shares,expectedPreview(variant.id,assets,before),
      "COMPILER_BACKED_ECONOMIC_PREVIEW_MISMATCH");
   }
   if(inst.id==="POST_DONATION_WITHDRAW41_POSSIBLE"){
    maxWithdraw=(await vault.maxWithdraw(owner.address)).toString();
    assert.equal(maxWithdraw,expectedMaxWithdraw(variant.id,before),
     "MAX_WITHDRAW_DIFFERS_FROM_SOURCE_SEMANTICS");
    assert(BigInt(maxWithdraw)>=41n,"DONATION_DID_NOT_CHANGE_WITHDRAWAL_PRECONDITION");
   }
   if(inst.execution==="UNMINED_REVERT"){
    const block=await provider.getBlockNumber();
    let failed=false;
    try{await contract.connect(signer).callStatic[inst.signature](...params,
      {gasLimit:BOUNDS.maxGasPerTransaction});}catch{failed=true;}
    assert(failed,"EXPECTED_NEGATIVE_CONTROL_SUCCEEDED:"+inst.id);
    assert.equal(await provider.getBlockNumber(),block,"SIMULATION_MINED_TX");
    simulation="ETH_CALL_REVERT";statePreserved=true;
   }else if(inst.execution==="UNMINED_SUCCESS"){
    const block=await provider.getBlockNumber();
    const returned=await contract.connect(signer).callStatic[inst.signature](...params,
     {gasLimit:BOUNDS.maxGasPerTransaction});
    assert.equal(returned.toString(),preview.shares,
      "DONATION_SUCCESS_SIMULATION_RETURNED_DIFFERENT_SHARES");
    assert.equal(await provider.getBlockNumber(),block,
      "SIMULATED_SUCCESS_MINED_A_TRANSACTION");
    simulation="ETH_CALL_SUCCESS";statePreserved=true;
   }else{
    const tx=await contract.connect(signer)[inst.signature](...params,{
     gasLimit:BOUNDS.maxGasPerTransaction});
    receipt=await checkedTx(tx,contract,signer,inst.signature,asset,vault);
    assert.deepEqual(comparableEvents(receipt.events),
      comparableEvents(semanticEvents(inst,symbols,preview)),
      "SEMANTIC_EVENT_MULTISET_CHANGED:"+variant.id+":"+inst.id);
   }
   const after=await snapshot(asset,vault);
   assert.deepEqual(after,transitionDonation(before,inst,preview),
    "DONATION_TRANSITION_PREDICTION_FAILED:"+variant.id+":"+inst.id);
   steps.push({...inst,before,after,preview,maxWithdraw,receipt,simulation,statePreserved,
    transactionMined:inst.execution==="MINED"});
  }
  const finalState=await snapshot(asset,vault);
  assert.equal(finalState.assetOwner,"55");
  assert.equal(finalState.assetVault,"45");
  assert.equal(finalState.vaultTotalAssets,"45");
  assert.equal(finalState.sharesOwner,variant.id==="OPENZEPPELIN"?"29":"30");
  assert.equal(finalState.sharesSupply,variant.id==="OPENZEPPELIN"?"29":"30");
  assert.equal(finalState.assetSupply,"100");
  const withdraw=steps.find(x=>x.id==="WITHDRAW");
  const withdrawEventOrder=withdraw.receipt.events.map(x=>x.contract+":"+x.name);
  scenarios.push({id:variant.id,source:variant.source,created,steps,
   initialState:initial,finalState,withdrawEventOrder,
   minedReceipts:8,unminedControls:5,unminedSuccesses:1});
 }
 assert.equal(allReceipts,16);
 assert.equal(scenarios[0].steps.find(x=>x.id==="WITHDRAW").preview.shares,"11");
 assert.equal(scenarios[1].steps.find(x=>x.id==="WITHDRAW").preview.shares,"10");
 return {schemaVersion:"OECL_VAULT_DONATION_COUNTEREXAMPLE_WITNESS_V1",
  planSha256:plan.planSha256,chainId:31337,
  providerScope:"EPHEMERAL_LOCAL_HARDHAT_RECHECKED",
  actors,scenarios,minedReceipts:16,unminedControls:10,unminedSuccesses:2,
  scopedHypothesis:{id:plan.hypothesis.id,verdict:"REFUTED_IN_LOCAL_TEST_FIXTURES",
   openzeppelinWithdrawBurn:"11",solmateWithdrawBurn:"10",
   claimScope:"EQUAL_SHARE_BURN_FOR_15_ASSETS_AFTER_20_ASSET_DONATION"},
  twoIndependentVaultCodebasesObserved:true,
  sameTypedGrammarProgramAcrossImplementations:true,
  arbitrarySolidityExecutionEnabled:false,testOnlyMintUsed:true,
  scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  limitations:[
   "Two pinned implementation codebases were compared in a local no-fee fixture setup.",
   "Different log order may be legitimate; all typed event values are independently checked.",
   "Donation behavior was measured in two local no-fee fixtures, not in adversarial mainnet vaults.",
   "Solmate source is AGPL-3.0-only; its third-party terms require review before distribution."
  ]};
}
async function main(){
 fs.mkdirSync(dir,{recursive:true});
 const prepared=await prepare(root,solmate);
 const plan=buildPlan(makeBasePlan(prepared),prepared.artifacts);
 assert(verifyPlan(plan),"INVALID_PREREGISTERED_DONATION_PLAN");
 if(mode==="probe"){
  fs.writeFileSync(probeFile,JSON.stringify(prepared.sourceReport,null,2)+"\n");
  console.log("OECL_SOLMATE_BLIND_PROBE",JSON.stringify({
   commit:prepared.sourceReport.solmateRevision,
   compiler:prepared.sourceReport.compilerVersion,
   operations:prepared.sourceReport.operations.map(x=>({
    method:x.signature,status:x.status,writes:x.writes.length,
    unresolved:x.unresolved,external:x.external})),
   evmExecuted:false,candidateAdmission:"NOT_ADMITTED"}));
  return;
 }
 if(mode==="plan"){
  fs.writeFileSync(planFile,JSON.stringify(plan,null,2)+"\n");
  console.log("OECL_SOLMATE_COMPARISON_PLAN",JSON.stringify({
   status:plan.status,variants:plan.variants.map(x=>x.id),
   steps:plan.program.length,planSha256:plan.planSha256,
   evmExecuted:false,candidateAdmission:plan.candidateAdmission}));
  return;
 }
 const archived=JSON.parse(fs.readFileSync(planFile,"utf8"));
 assert(verifyPlan(archived)&&JSON.stringify(archived)===JSON.stringify(plan),
  "COMPILER_OR_GIT_IDENTITY_CHANGED_SINCE_PREREGISTRATION");
 if(plan.status!=="PREREGISTERED_DONATION_COUNTEREXAMPLE"){
  console.log("OECL_SOLMATE_EVM_BLOCKED",plan.status);return;
 }
 const witness=await experiment(plan,prepared.artifacts);
 fs.writeFileSync(witnessFile,JSON.stringify(witness,null,2)+"\n");
 console.log("OECL_DONATION_COUNTEREXAMPLE_LOCAL_EVM",JSON.stringify({
  mined:witness.minedReceipts,unmined:witness.unminedControls,unminedSuccesses:witness.unminedSuccesses,
  scopedHypothesis:witness.scopedHypothesis,
  scenarios:witness.scenarios.map(x=>({id:x.id,order:x.withdrawEventOrder,final:x.finalState})),
  compatibility:witness.compatibilityVerdict,admission:witness.candidateAdmission}));
}
main().catch(e=>{console.error("OECL_DONATION_COUNTEREXAMPLE_FAILURE",
 e.stack||String(e));process.exitCode=1;});
