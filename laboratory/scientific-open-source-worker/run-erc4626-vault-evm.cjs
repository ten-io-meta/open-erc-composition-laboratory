"use strict";
/**
 * Preregister and run ONE bounded ERC4626 × ERC20 custody experiment.
 * Only called from reviewed CI, hardhat 31337. Never arbitrary calldata.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {choosePair,collectSources}=require("./run-generic-source-worker.cjs");
const {probe}=require("./run-erc4626-blind-source-probe.cjs");
const {hash,sha,ZERO,BOUNDS,GRAMMAR,fixture,makePlan,verifyPlan}=
 require("./VaultAssetFlowProtocol.cjs");
const [mode,idVault,idAsset,rootArg,outArg]=process.argv.slice(2);
assert(["plan","execute"].includes(mode),"UNREVIEWED_VAULT_RUN_MODE");
assert(idVault&&idAsset&&idVault!==idAsset&&rootArg&&outArg,"INVALID_VAULT_CLI");
const root=path.resolve(rootArg),out=path.resolve(outArg);
const planPath=path.join(out,"vault-flow-plan.json");
const witnessPath=path.join(out,"vault-flow-witness.json");
function compile(gathered,sources){
 const solc=gathered.deps.solc;
 assert(/^0\.8\.26\+/.test(solc.version()),"UNREVIEWED_SOLC_VERSION");
 const output=JSON.parse(solc.compile(JSON.stringify({language:"Solidity",sources,
  settings:{optimizer:{enabled:false},outputSelection:{"*":{"*":[
   "abi","evm.bytecode.object","evm.bytecode.linkReferences"]}}}})));
 const errors=(output.errors||[]).filter(x=>x.severity==="error");
 assert.equal(errors.length,0,errors.slice(0,2).map(x=>x.formattedMessage).join(" | "));
 return output.contracts||{};
}
async function prepare(){
 const selected=choosePair(idVault,idAsset);
 const source=await probe(idVault,idAsset,root);
 const gathered=await collectSources(selected,root);
 const sources=Object.fromEntries([...gathered.files].map(([unit,file])=>[unit,{content:file.content}]));
 const base=compile(gathered,sources);
 const native=selected.map((ref,i)=>base[gathered.roots[i]]?.[ref.contract]||null);
 const fixtures=source.participants.map((p,i)=>fixture(p,i));
 const withFixtures={...sources};
 for(const item of fixtures.filter(Boolean))withFixtures[item.unit]={content:item.solidity};
 const compiled=fixtures.some(Boolean)?compile(gathered,withFixtures):base;
 const deployable=fixtures.map(item=>item?compiled[item.unit]?.[item.contract]||null:null);
 const plan=makePlan(source,native,fixtures,deployable,
  gathered.deps.solc.version(),gathered.deps.integrity);
 assert(verifyPlan(plan),"VAULT_PREREGISTRATION_INVALID");
 return {plan,deployable};
}
const numeric=v=>BigInt(v);
const add=(state,name,n)=>{state[name]=(numeric(state[name])+n).toString();};
function apply(before,id,preview){
 const after={...before};
 if(id==="MINT_ASSET_100"){add(after,"assetOwner",100n);add(after,"assetSupply",100n);}
 if(id==="APPROVE_40")after.allowanceOwnerVault="40";
 if(id==="DEPOSIT_40"){
  add(after,"assetOwner",-40n);add(after,"assetVault",40n);
  add(after,"sharesOwner",numeric(preview.shares));add(after,"sharesSupply",numeric(preview.shares));
  add(after,"vaultTotalAssets",40n);after.allowanceOwnerVault="0";
 }
 if(id==="WITHDRAW_15"){
  add(after,"assetOwner",15n);add(after,"assetVault",-15n);
  add(after,"sharesOwner",-numeric(preview.shares));add(after,"sharesSupply",-numeric(preview.shares));
  add(after,"vaultTotalAssets",-15n);
 }
 if(id==="APPROVE_101")after.allowanceOwnerVault="101";
 return after;
}
async function executeEvm(plan,artifacts){
 assert(verifyPlan(plan));
 assert.equal(plan.status,"REVIEWED_LOCAL_VAULT_FLOW_PREREGISTERED");
 assert.equal(process.env.HARDHAT_NETWORK||"hardhat","hardhat","REMOTE_HARDHAT_NETWORK_FORBIDDEN");
 process.chdir(root);
 const hre=require(path.join(root,"node_modules/hardhat"));
 const provider=hre.ethers.provider;
 assert.equal(Number((await provider.getNetwork()).chainId),31337,"REMOTE_CHAIN_FORBIDDEN");
 const [owner,attacker]=await hre.ethers.getSigners();
 const actors={owner:owner.address,attacker:attacker.address};
 const created=[];
 let vault,asset;
 async function snapshot(){
  const [ao,av,aa,so,sa,as,ss,ta,allow]=await Promise.all([
   asset.balanceOf(owner.address),asset.balanceOf(vault.address),asset.balanceOf(attacker.address),
   vault.balanceOf(owner.address),vault.balanceOf(attacker.address),
   asset.totalSupply(),vault.totalSupply(),vault.totalAssets(),
   asset.allowance(owner.address,vault.address)
  ]);
  return {assetOwner:ao.toString(),assetVault:av.toString(),assetAttacker:aa.toString(),
   sharesOwner:so.toString(),sharesAttacker:sa.toString(),
   assetSupply:as.toString(),sharesSupply:ss.toString(),
   vaultTotalAssets:ta.toString(),allowanceOwnerVault:allow.toString()};
 }
 const eventsFor=receipt=>{
  const results=[];
  for(const log of receipt.logs){
   const isVault=vault&&log.address.toLowerCase()===vault.address.toLowerCase();
   const isAsset=asset&&log.address.toLowerCase()===asset.address.toLowerCase();
   if(!isVault&&!isAsset)continue;
   const target=isVault?vault:asset;
   const label=isVault?"VAULT":"ASSET";
   let parsed;try{parsed=target.interface.parseLog(log);}catch{continue;}
   if(parsed.name==="Transfer"||parsed.name==="Approval"){
    results.push({contract:label,name:parsed.name,
     from:parsed.args[0],to:parsed.args[1],amount:parsed.args[2].toString()});
   }else if(parsed.name==="Deposit"){
    results.push({contract:label,name:"Deposit",sender:parsed.args[0],
     receiver:parsed.args[1],assets:parsed.args[2].toString(),
     shares:parsed.args[3].toString()});
   }else if(parsed.name==="Withdraw"){
    results.push({contract:label,name:"Withdraw",sender:parsed.args[0],
     receiver:parsed.args[1],owner:parsed.args[2],
     assets:parsed.args[3].toString(),shares:parsed.args[4].toString()});
   }else throw Error("UNREVIEWED_FIXTURE_EVENT:"+parsed.name);
  }
  return results;
 };
 async function checked(tx,label,recipient,method,signer){
  const mined=await tx.wait(1),receipt=await provider.getTransactionReceipt(tx.hash),
    actual=await provider.getTransaction(tx.hash);
  const block=await provider.getBlock(mined.blockNumber);
  assert(mined&&receipt&&actual&&block);
  assert.equal(mined.status,1);assert.equal(receipt.status,1);
  assert.equal(mined.blockHash,receipt.blockHash);
  assert.equal(block.hash,receipt.blockHash);
  assert(block.transactions.some(x=>x.toLowerCase()===tx.hash.toLowerCase()));
  assert.equal(actual.hash.toLowerCase(),tx.hash.toLowerCase());
  assert.equal(actual.from.toLowerCase(),signer.address.toLowerCase());
  assert.equal(actual.to?.toLowerCase()||null,recipient?.toLowerCase()||null);
  assert(mined.gasUsed.gt(0)&&mined.gasUsed.lte(BOUNDS.maxGasPerTransaction));
  if(recipient){
   const contract=label==="ASSET"?asset:vault;
   assert.equal(actual.data.slice(0,10),contract.interface.getSighash(method));
  }
  return {txHash:tx.hash,blockNumber:mined.blockNumber,blockHash:mined.blockHash,
   status:1,gasUsed:mined.gasUsed.toString(),
   transactionMined:true,method,from:actual.from,to:actual.to,
   methodSelector:recipient?actual.data.slice(0,10):"CREATE",
   events:eventsFor(receipt)};
 }
 // Deploy asset first, then a vault whose asset constructor parameter
 // points to the exact address mined above.
 const assetArtifact=artifacts[1],vaultArtifact=artifacts[0];
 for(let i=0;i<2;i++)assert(artifacts[i]?.abi&&artifacts[i].evm?.bytecode?.object&&
  hash(artifacts[i].abi)===plan.capabilities[i].fixtureAbiSha256&&
  sha(artifacts[i].evm.bytecode.object)===plan.capabilities[i].creationBytecodeSha256);
 asset=await new hre.ethers.ContractFactory(assetArtifact.abi,
  "0x"+assetArtifact.evm.bytecode.object,owner).deploy({gasLimit:BOUNDS.maxGasPerTransaction});
 await asset.deployed();
 created.push({role:"ASSET",address:asset.address,
  receipt:await checked(asset.deployTransaction,"ASSET",null,"CONSTRUCTOR",owner)});
 vault=await new hre.ethers.ContractFactory(vaultArtifact.abi,
  "0x"+vaultArtifact.evm.bytecode.object,owner).deploy(asset.address,
   {gasLimit:BOUNDS.maxGasPerTransaction});
 await vault.deployed();
 created.push({role:"VAULT",address:vault.address,
  receipt:await checked(vault.deployTransaction,"VAULT",null,"CONSTRUCTOR",owner)});
 assert.equal((await vault.asset()).toLowerCase(),asset.address.toLowerCase());
 for(const [i,contract] of [[1,asset],[0,vault]]){
  const code=await provider.getCode(contract.address);
  assert(code.length>2&&code!=="0x");
  created.find(x=>x.address===contract.address).runtimeKeccak256=hre.ethers.utils.keccak256(code);
 }
 const initial=await snapshot();
 assert(Object.values(initial).every(x=>x==="0"),"NONEMPTY_TEST_ONLY_INITIAL_STATE");
 const steps=[];
 for(const step of plan.cases){
  const before=await snapshot();
  const connected=(step.target==="ASSET"?asset:vault).connect(
   step.caller==="OWNER"?owner:attacker);
  let args,preview=null;
  switch(step.id){
   case "MINT_ASSET_100":args=[owner.address,BOUNDS.mintedAssets];break;
   case "NO_APPROVAL_DEPOSIT":args=[BOUNDS.deniedAssets,owner.address];break;
   case "APPROVE_40":args=[vault.address,BOUNDS.depositAssets];break;
   case "DEPOSIT_40":{
    args=[BOUNDS.depositAssets,owner.address];
    preview={method:"previewDeposit(uint256)",assets:BOUNDS.depositAssets,
     shares:(await vault.previewDeposit(BOUNDS.depositAssets)).toString()};
    assert.equal(preview.shares,"40","UNREVIEWED_VAULT_PREVIEW_DEPOSIT");
    break;
   }
   case "ATTACKER_WITHDRAW":args=[BOUNDS.deniedAssets,attacker.address,owner.address];break;
   case "OVER_WITHDRAW":args=[BOUNDS.overWithdrawAssets,owner.address,owner.address];break;
   case "WITHDRAW_15":{
    args=[BOUNDS.withdrawAssets,owner.address,owner.address];
    preview={method:"previewWithdraw(uint256)",assets:BOUNDS.withdrawAssets,
     shares:(await vault.previewWithdraw(BOUNDS.withdrawAssets)).toString()};
    assert.equal(preview.shares,"15","UNREVIEWED_VAULT_PREVIEW_WITHDRAW");
    break;
   }
   case "APPROVE_101":args=[vault.address,BOUNDS.insufficientAssets];break;
   case "INSUFFICIENT_ASSET_DEPOSIT":
    args=[BOUNDS.insufficientAssets,owner.address];break;
   default:throw Error("UNREVIEWED_EXPERIMENT_STEP:"+step.id);
  }
  let receipt=null,simulation=null,statePreserved=null;
  if(step.execution==="UNMINED_REVERT"){
   const block=await provider.getBlockNumber();
   let failed=false;
   try{await connected.callStatic[step.method](...args,
    {gasLimit:BOUNDS.maxGasPerTransaction});}
   catch{failed=true;}
   assert(failed,"NEGATIVE_CONTROL_NOT_REVERTED:"+step.id);
   assert.equal(await provider.getBlockNumber(),block,"ETH_CALL_UNEXPECTED_MINING");
   simulation="ETH_CALL_REVERT";statePreserved=true;
   assert.deepEqual(await snapshot(),before);
  }else{
   const tx=await connected[step.method](...args,
    {gasLimit:BOUNDS.maxGasPerTransaction});
   receipt=await checked(tx,step.target,
    step.target==="ASSET"?asset.address:vault.address,step.method,owner);
  }
  const after=await snapshot();
  assert.deepEqual(after,apply(before,step.id,preview),
   "PREDICTED_VAULT_LEDGER_MISMATCH:"+step.id);
  const actualEvents=receipt?.events||[];
  const expected=[];
  if(step.id==="MINT_ASSET_100")
   expected.push({contract:"ASSET",name:"Transfer",from:ZERO,to:owner.address,amount:"100"});
  if(step.id==="APPROVE_40"||step.id==="APPROVE_101")
   expected.push({contract:"ASSET",name:"Approval",from:owner.address,
    to:vault.address,amount:step.id==="APPROVE_40"?"40":"101"});
  if(step.id==="DEPOSIT_40"){
   expected.push({contract:"ASSET",name:"Transfer",from:owner.address,to:vault.address,amount:"40"},
    {contract:"VAULT",name:"Transfer",from:ZERO,to:owner.address,amount:preview.shares},
    {contract:"VAULT",name:"Deposit",sender:owner.address,receiver:owner.address,
      assets:"40",shares:preview.shares});
  }
  if(step.id==="WITHDRAW_15"){
   expected.push({contract:"VAULT",name:"Transfer",from:owner.address,to:ZERO,amount:preview.shares},
    {contract:"ASSET",name:"Transfer",from:vault.address,to:owner.address,amount:"15"},
    {contract:"VAULT",name:"Withdraw",sender:owner.address,receiver:owner.address,
     owner:owner.address,assets:"15",shares:preview.shares});
  }
  const stable=x=>JSON.stringify(x).toLowerCase();
  assert.equal(stable(actualEvents),stable(expected),"MINED_TYPED_EVENTS_DIFFER:"+step.id);
  steps.push({...step,before,after,preview,receipt,simulation,statePreserved,
   transactionMined:step.execution==="MINED"});
 }
 const result={
  schemaVersion:"OECL_ERC4626_ERC20_LOCAL_EVM_WITNESS_V1",
  planSha256:plan.planSha256,chainId:31337,
  providerScope:"EPHEMERAL_HARDHAT_31337_RECHECKED_AT_RUNTIME",
  actors,created,steps,initialState:initial,finalState:await snapshot(),
  minedReceiptCount:7,unminedNegativeCount:4,
  sourceBaselineHypotheses:plan.sourceHypotheses,
  scopeObservation:"ERC4626_VAULT_AND_ERC20_ASSET_INTERACTION_OBSERVED",
  crossContractInteractionObserved:true,
  universalCompatibilityProven:false,
  scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",unsafeTestMintOnly:true,
  limitations:[
   "This is a manually reviewed deposit/withdraw policy, not autonomous transaction synthesis.",
   "Vault and asset interactions happened only between two pinned local fixture deployments.",
   "Four negative controls were eth_call reverts, not mined failed transactions.",
   "The scientific result is scoped behavioral evidence, not an ERC-wide compatibility guarantee."
  ]
 };
 assert.deepEqual(result.finalState,{
  assetOwner:"75",assetVault:"25",assetAttacker:"0",sharesOwner:"25",
  sharesAttacker:"0",assetSupply:"100",sharesSupply:"25",
  vaultTotalAssets:"25",allowanceOwnerVault:"101"});
 assert.equal(created.length,2);assert.equal(steps.filter(x=>x.transactionMined).length,5);
 return result;
}
async function main(){
 const {plan,deployable}=await prepare();
 fs.mkdirSync(out,{recursive:true});
 if(mode==="plan"){
  fs.writeFileSync(planPath,JSON.stringify(plan,null,2)+"\n");
  console.log("OECL_VAULT_FLOW_PREREGISTERED",JSON.stringify({status:plan.status,
   selected:plan.selected.map(x=>x.id),baseHypotheses:plan.sourceHypotheses,
   planSha256:plan.planSha256,evmExecuted:false}));
  return;
 }
 const archived=JSON.parse(fs.readFileSync(planPath,"utf8"));
 assert(verifyPlan(archived),"ARCHIVED_VAULT_PLAN_INVALID");
 assert.deepEqual(archived,plan,"SOURCE_ABI_AST_FIXTURE_CHANGED_AFTER_PREREGISTRATION");
 if(plan.status!=="REVIEWED_LOCAL_VAULT_FLOW_PREREGISTERED"){
  console.log("OECL_VAULT_EVM_BLOCKED",JSON.stringify({status:plan.status}));
  return;
 }
 const witness=await executeEvm(plan,deployable);
 fs.writeFileSync(witnessPath,JSON.stringify(witness,null,2)+"\n");
 console.log("OECL_VAULT_ERC20_LOCAL_EVM",JSON.stringify({
  observation:witness.scopeObservation,mined:witness.minedReceiptCount,
  simulated:witness.unminedNegativeCount,final:witness.finalState,
  admitted:witness.candidateAdmission,compatibility:witness.compatibilityVerdict}));
}
main().catch(e=>{console.error("OECL_VAULT_EVM_FAILURE:",e.stack||e);process.exitCode=1;});
