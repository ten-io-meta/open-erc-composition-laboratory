"use strict";
/**
 * Execute one immutable, typed operation program over TWO pinned 4626 derivatives.
 * Different _decimalsOffset: 0 vs 1. The interpreter has no per-variant actions.
 * All execution is ephemeral local Hardhat; no caller calldata / production RPC.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {choosePair,collectSources}=require("./run-generic-source-worker.cjs");
const {probe}=require("./run-erc4626-blind-source-probe.cjs");
const {fixture}=require("./VaultAssetFlowProtocol.cjs");
const {digest,sha,variants,bounds,PROGRAM,fixtureForVariant,
 compileProgram,verifyPlan,getArgs,transition,emptyState}=
 require("./ReusableVaultOperationGrammar.cjs");
const [mode,vaultId,assetId,rootArg,outArg]=process.argv.slice(2);
assert(["plan","execute"].includes(mode),"UNREVIEWED_GRAMMAR_MODE");
assert(vaultId&&assetId&&vaultId!==assetId&&rootArg&&outArg);
const root=path.resolve(rootArg),output=path.resolve(outArg);
const planFile=path.join(output,"reusable-vault-plan.json");
const witnessFile=path.join(output,"reusable-vault-witness.json");
function compile(solc,sources){
 assert(/^0\.8\.26\+/.test(solc.version()));
 const out=JSON.parse(solc.compile(JSON.stringify({
  language:"Solidity",sources,settings:{optimizer:{enabled:false},
   outputSelection:{"*":{"*":["abi","evm.bytecode.object","evm.bytecode.linkReferences"]}}}})));
 const errs=(out.errors||[]).filter(x=>x.severity==="error");
 assert.equal(errs.length,0,errs.map(e=>e.formattedMessage).slice(0,2).join(" | "));
 return out.contracts||{};
}
async function prepare(){
 const pair=choosePair(vaultId,assetId);
 const source=await probe(vaultId,assetId,root);
 const collected=await collectSources(pair,root);
 const inputs=Object.fromEntries([...collected.files].map(([unit,file])=>[unit,{content:file.content}]));
 const base=compile(collected.deps.solc,inputs);
 const originals=pair.map((p,i)=>base[collected.roots[i]]?.[p.contract]||null);
 const assetFixture=fixture(source.participants[1],1);
 const vaultFixtures=variants.map((_,i)=>fixtureForVariant(source.participants[0],i));
 const fixtures={asset:assetFixture,vaults:vaultFixtures};
 const extra={...inputs};
 for(const f of [assetFixture,...vaultFixtures].filter(Boolean))extra[f.unit]={content:f.solidity};
 const contracts=compile(collected.deps.solc,extra);
 const assetArtifact=assetFixture?contracts[assetFixture.unit]?.[assetFixture.contract]||null:null;
 const vaultArtifacts=vaultFixtures.map(f=>f?contracts[f.unit]?.[f.contract]||null:null);
 const plan=compileProgram(source,originals,vaultArtifacts,assetArtifact,fixtures,
  collected.deps.solc.version(),collected.deps.integrity);
 assert(verifyPlan(plan),"UNVERIFIED_REUSABLE_GRAMMAR_PLAN");
 return {plan,assetArtifact,vaultArtifacts};
}
const ZERO="0x"+"0".repeat(40);
const normalize=x=>JSON.stringify(x).toLowerCase();
async function run(plan,assetArtifact,vaultArtifacts){
 assert(verifyPlan(plan)&&plan.status==="BOUNDED_GRAMMAR_PREREGISTERED");
 assert.equal(process.env.HARDHAT_NETWORK||"hardhat","hardhat","REMOTE_NETWORK_FORBIDDEN");
 process.chdir(root);
 const hre=require(path.join(root,"node_modules/hardhat"));
 const provider=hre.ethers.provider;
 assert.equal(Number((await provider.getNetwork()).chainId),31337,"UNREVIEWED_NETWORK_CHAIN_ID");
 const [owner,attacker]=await hre.ethers.getSigners();
 const actors={owner:owner.address,attacker:attacker.address};
 let nonceWitness=0;
 async function reviewedTransaction(tx,contract,signer,method,label,asset,vault){
  const mined=await tx.wait(1),rc=await provider.getTransactionReceipt(tx.hash),
   actual=await provider.getTransaction(tx.hash),block=await provider.getBlock(mined.blockNumber);
  assert(mined&&rc&&actual&&block);
  assert.equal(rc.status,1);assert.equal(mined.status,1);
  assert.equal(rc.blockHash,mined.blockHash);assert.equal(block.hash,rc.blockHash);
  assert(block.transactions.some(x=>x.toLowerCase()===tx.hash.toLowerCase()));
  assert.equal(actual.from.toLowerCase(),signer.address.toLowerCase());
  assert.equal(actual.to?.toLowerCase()||null,contract?.address.toLowerCase()||null);
  assert(mined.gasUsed.gt(0)&&mined.gasUsed.lte(bounds.maxGasPerTransaction));
  if(contract)assert.equal(actual.data.slice(0,10),contract.interface.getSighash(method));
  const events=[];
  for(const log of rc.logs){
   const contractType=asset&&log.address.toLowerCase()===asset.address.toLowerCase()?
    "ASSET":vault&&log.address.toLowerCase()===vault.address.toLowerCase()?"VAULT":null;
   if(!contractType)throw Error("UNREVIEWED_EXTERNAL_EVENT_ADDRESS");
   const parsed=(contractType==="ASSET"?asset:vault).interface.parseLog(log);
   if(parsed.name==="Transfer"||parsed.name==="Approval"){
    events.push({contract:contractType,name:parsed.name,from:parsed.args[0],
     to:parsed.args[1],amount:parsed.args[2].toString()});
   }else if(parsed.name==="Deposit"){
    events.push({contract:"VAULT",name:"Deposit",sender:parsed.args[0],
     receiver:parsed.args[1],assets:parsed.args[2].toString(),shares:parsed.args[3].toString()});
   }else if(parsed.name==="Withdraw"){
    events.push({contract:"VAULT",name:"Withdraw",sender:parsed.args[0],
     receiver:parsed.args[1],owner:parsed.args[2],
     assets:parsed.args[3].toString(),shares:parsed.args[4].toString()});
   }else throw Error("UNREVIEWED_EVENT:"+parsed.name);
  }
  nonceWitness++;
  return {txHash:tx.hash,blockHash:rc.blockHash,blockNumber:rc.blockNumber,
   status:rc.status,transactionMined:true,from:actual.from,to:actual.to,
   gasUsed:rc.gasUsed.toString(),method,methodSelector:contract?
    actual.data.slice(0,10):"CREATE",events};
 }
 async function deploy(artifact,args,expected,role,asset,vault){
  assert(digest(artifact.abi)===expected[role==="ASSET"?"assetAbiSha256":"vaultAbiSha256"]);
  assert(sha(artifact.evm.bytecode.object)===
   expected[role==="ASSET"?"assetCreationBytecodeSha256":"vaultCreationBytecodeSha256"]);
  const factory=new hre.ethers.ContractFactory(artifact.abi,"0x"+artifact.evm.bytecode.object,owner);
  const obj=await factory.deploy(...args,{gasLimit:bounds.maxGasPerTransaction});
  await obj.deployed();
  const receipt=await reviewedTransaction(obj.deployTransaction,null,owner,"CONSTRUCTOR",role,asset,vault);
  const code=await provider.getCode(obj.address,receipt.blockNumber);
  assert(code&&code!=="0x","DEPLOYED_CODE_MISSING");
  return {contract:obj,archived:{role,address:obj.address,receipt,
   runtimeKeccak256:hre.ethers.utils.keccak256(code)}};
 }
 async function snapshot(asset,vault){
  const [ownerA,vaultA,attackerA,ownerS,attackerS,totalA,totalS,vaultTotal,allowance]=await Promise.all([
   asset.balanceOf(owner.address),asset.balanceOf(vault.address),
   asset.balanceOf(attacker.address),vault.balanceOf(owner.address),
   vault.balanceOf(attacker.address),asset.totalSupply(),vault.totalSupply(),
   vault.totalAssets(),asset.allowance(owner.address,vault.address)
  ]);
  return {assetOwner:ownerA.toString(),assetVault:vaultA.toString(),
   assetAttacker:attackerA.toString(),sharesOwner:ownerS.toString(),
   sharesAttacker:attackerS.toString(),assetSupply:totalA.toString(),
   sharesSupply:totalS.toString(),vaultTotalAssets:vaultTotal.toString(),
   allowanceOwnerVault:allowance.toString()};
 }
 function expectedEvents(inst,addresses,preview){
  const {owner,vault}=addresses;
  const assetTransfer=(from,to,amount)=>({contract:"ASSET",name:"Transfer",from,to,amount});
  const sharesTransfer=(from,to,amount)=>({contract:"VAULT",name:"Transfer",from,to,amount});
  const approval=amount=>({contract:"ASSET",name:"Approval",from:owner,to:vault,amount});
  switch(inst.op){
   case "FUND_ASSET":return [assetTransfer(ZERO,owner,bounds.minted)];
   case "ALLOW":return [approval(inst.id==="APPROVE_DEPOSIT"?bounds.deposit:bounds.insufficient)];
   case "CUSTODY_IN":return [approval("0"),assetTransfer(owner,vault,bounds.deposit),
     sharesTransfer(ZERO,owner,preview.shares),
     {contract:"VAULT",name:"Deposit",sender:owner,receiver:owner,
      assets:bounds.deposit,shares:preview.shares}];
   case "CUSTODY_OUT":return [sharesTransfer(owner,ZERO,preview.shares),
     assetTransfer(vault,owner,bounds.withdraw),
     {contract:"VAULT",name:"Withdraw",sender:owner,receiver:owner,
      owner,assets:bounds.withdraw,shares:preview.shares}];
   case "REVERT":return [];
   default:throw Error("UNREVIEWED_EVENT_MODEL_OPCODE");
  }
 }
 const scenarios=[];
 for(let i=0;i<variants.length;i++){
  const descriptor=plan.variants[i],assetCreated=await deploy(assetArtifact,[],descriptor,"ASSET",null,null);
  const asset=assetCreated.contract;
  const vaultCreated=await deploy(vaultArtifacts[i],[asset.address],descriptor,"VAULT",asset,null);
  const vault=vaultCreated.contract;
  assert.equal((await vault.asset()).toLowerCase(),asset.address.toLowerCase());
  assert.equal(Number(await vault.decimals()),18+descriptor.offset);
  const initial=await snapshot(asset,vault);
  assert.deepEqual(initial,emptyState(),"FIXTURE_NOT_ZERO_INITIALIZED");
  const steps=[];
  const symbols={owner:owner.address,attacker:attacker.address,vault:vault.address};
  for(const inst of plan.program){
   const before=await snapshot(asset,vault);
   const args=getArgs(inst,symbols);
   const target=inst.target==="ASSET"?asset:vault;
   const signer=inst.role==="OWNER"?owner:attacker;
   let preview=null,receipt=null,simulation=null,statePreserved=null;
   if(inst.preview){
    const amount=inst.op==="CUSTODY_IN"?bounds.deposit:bounds.withdraw;
    const fn=inst.preview;
    const shares=(await vault[fn](amount)).toString();
    assert.equal(shares,(BigInt(amount)*BigInt(descriptor.shareRatio)).toString(),
     "OFFSET_VARIANT_PREVIEW_DIFFERS_FROM_REVIEWED_RATIO");
    preview={method:fn,assets:amount,shares};
   }
   if(inst.execution==="UNMINED_REVERT"){
    const b=await provider.getBlockNumber();
    let reverted=false;
    try{await target.connect(signer).callStatic[inst.signature](...args,
       {gasLimit:bounds.maxGasPerTransaction});}catch{reverted=true;}
    assert(reverted,"NEGATIVE_CASE_NOT_REVERTED:"+inst.id);
    assert.equal(await provider.getBlockNumber(),b,"UNEXPECTED_MINING_FROM_ETH_CALL");
    simulation="ETH_CALL_REVERT";statePreserved=true;
   }else{
    const tx=await target.connect(signer)[inst.signature](...args,
      {gasLimit:bounds.maxGasPerTransaction});
    receipt=await reviewedTransaction(tx,target,signer,inst.signature,inst.target,asset,vault);
    assert.equal(normalize(receipt.events),
     normalize(expectedEvents(inst,symbols,preview)),"MINED_TYPED_EVENT_MISMATCH");
   }
   const after=await snapshot(asset,vault);
   assert.deepEqual(after,transition(before,inst,preview),
    "REUSABLE_GRAMMAR_STATE_MODEL_MISMATCH:"+inst.id);
   steps.push({...inst,before,after,preview,receipt,simulation,statePreserved,
    transactionMined:inst.execution==="MINED"});
  }
  const finalState=await snapshot(asset,vault);
  const expectedRatio=BigInt(descriptor.shareRatio);
  assert.deepEqual(finalState,{...emptyState(),assetOwner:"75",assetVault:"25",
    assetSupply:"100",allowanceOwnerVault:"101",vaultTotalAssets:"25",
    sharesOwner:(25n*expectedRatio).toString(),sharesSupply:(25n*expectedRatio).toString()});
  scenarios.push({id:descriptor.id,offset:descriptor.offset,shareRatio:descriptor.shareRatio,
   created:[assetCreated.archived,vaultCreated.archived],
   initialState:initial,steps,finalState,
   minedReceipts:7,unminedNegativeControls:4});
 }
 assert.equal(nonceWitness,14);
 return {schemaVersion:"OECL_REUSABLE_VAULT_GRAMMAR_LOCAL_WITNESS_V1",
  planSha256:plan.planSha256,chainId:31337,
  providerScope:"EPHEMERAL_HARDHAT_BLOCKS_AND_RECEIPTS_RECHECKED",
  actors,scenarios,totalMinedReceipts:14,totalUnminedControls:8,
  testOnlyUnprotectedAssetMint:true,
  sameTypedProgramAcrossVariants:true,
  twoIndependentReviewedVaultFamilies:false,
  scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  limitations:[
   "Two reviewed derivatives of the SAME OZ ERC4626 implementation, not independent standards.",
   "Preview-driven share calculations are verified against fixed 1x and 10x source offset semantics.",
   "All reverts were eth_call simulations, never mined failures.",
   "Neither a generic ERC executor nor universal ERC compatibility has been established."
  ]};
}
async function main(){
 const {plan,assetArtifact,vaultArtifacts}=await prepare();
 fs.mkdirSync(output,{recursive:true});
 if(mode==="plan"){
  fs.writeFileSync(planFile,JSON.stringify(plan,null,2)+"\n");
  console.log("OECL_REUSABLE_VAULT_GRAMMAR_PLAN",JSON.stringify({
   status:plan.status,variants:plan.variants.map(x=>x.id),steps:plan.program.length,
   planSha256:plan.planSha256,evmExecuted:false}));
  return;
 }
 const archived=JSON.parse(fs.readFileSync(planFile,"utf8"));
 assert(verifyPlan(archived),"INVALID_ARCHIVED_GRAMMAR");
 assert.deepEqual(archived,plan,"RECOMPILED_GRAMMAR_CHANGED_BEFORE_EXECUTION");
 if(plan.status!=="BOUNDED_GRAMMAR_PREREGISTERED"){
  console.log("OECL_REUSABLE_GRAMMAR_BLOCKED",plan.status);return;
 }
 const witness=await run(plan,assetArtifact,vaultArtifacts);
 fs.writeFileSync(witnessFile,JSON.stringify(witness,null,2)+"\n");
 console.log("OECL_REUSABLE_VAULT_GRAMMAR_LOCAL_EVM",JSON.stringify({
  scenarios:witness.scenarios.map(s=>({id:s.id,final:s.finalState})),
  mined:witness.totalMinedReceipts,simulated:witness.totalUnminedControls,
  admission:witness.candidateAdmission,compatibility:witness.compatibilityVerdict}));
}
main().catch(e=>{console.error("OECL_REUSABLE_VAULT_GRAMMAR_FAILURE",e.stack||e);process.exitCode=1;});
