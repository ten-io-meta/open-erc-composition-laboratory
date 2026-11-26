"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {
 digest,variants,PROGRAM,fixtureForVariant,compileProgram,verifyPlan,
 transition,emptyState,getArgs
}=require("../laboratory/scientific-open-source-worker/ReusableVaultOperationGrammar.cjs");
const {fixture,nativeSpecs}=require("../laboratory/scientific-open-source-worker/VaultAssetFlowProtocol.cjs");
const VAULT="@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
const ASSET="@openzeppelin/contracts/token/ERC20/ERC20.sol";
const asAbi=spec=>Object.entries(spec).map(([sig,types])=>({
 type:"function",name:sig.slice(0,sig.indexOf("(")),
 inputs:types[0].map(type=>({type})),outputs:types[1].map(type=>({type})),
 stateMutability:types[2]
}));
function fake(){
 const native=[{abi:asAbi(nativeSpecs.VAULT)},{abi:asAbi(nativeSpecs.ASSET)}];
 const records=[
  {id:"ERC-4626",unit:VAULT,sourceSha256:"a".repeat(64),abiSha256:digest(native[0].abi),
    operations:["deposit(uint256,address)","withdraw(uint256,address,address)"]
     .map(signature=>({signature,stat:"ignore",status:"STRUCTURAL_WRITES_OBSERVED",
        supportedByAbi:true,writes:[{state:"_balances"}],unresolved:11,external:1}))},
  {id:"ERC-20",unit:ASSET,sourceSha256:"b".repeat(64),abiSha256:digest(native[1].abi),
    operations:["transfer(address,uint256)","transferFrom(address,address,uint256)"]
     .map(signature=>({signature,status:"STRUCTURAL_WRITES_OBSERVED",
      supportedByAbi:true,writes:[{state:"_balances"}]}))}
 ];
 const source={schemaVersion:"OECL_VAULT_ERC20_BLIND_PROBE_V1",
  compilerVersion:"0.8.26+commit.8a97fa7a",
  sourceGraphSha256:"c".repeat(64),evmExecuted:false,executionAuthorized:false,
  candidateAdmission:"NOT_ADMITTED",compatibilityVerdict:"NOT_EVALUATED",
  participants:records};
 const fixtures={asset:fixture(records[1],1),
  vaults:variants.map((_,i)=>fixtureForVariant(records[0],i))};
 const assetArtifact={abi:asAbi({...nativeSpecs.ASSET,
  "oeclResearchMint(address,uint256)":[["address","uint256"],[],"nonpayable"]}),
  evm:{bytecode:{object:"60006000f3",linkReferences:{}}}};
 const vaultArtifacts=variants.map(()=>({abi:asAbi(nativeSpecs.VAULT),
  evm:{bytecode:{object:"60006000f3",linkReferences:{}}}}));
 return {source,native,fixtures,assetArtifact,vaultArtifacts};
}
function plan(f){
 return compileProgram(f.source,f.native,f.vaultArtifacts,f.assetArtifact,f.fixtures,
  "0.8.26+commit.8a97fa7a","sha512-tested-lock");
}
test("one compiled program admits two reviewed source-bound variants, not runtime",()=>{
 const f=fake(),p=plan(f);
 assert.equal(p.status,"BOUNDED_GRAMMAR_PREREGISTERED");
 assert.equal(p.program.length,9);
 assert.deepEqual(p.variants.map(x=>x.id),["STANDARD","OFFSET_ONE"]);
 assert.equal(verifyPlan(p),true);
 assert.equal(p.candidateAdmission,"NOT_ADMITTED");
 assert.equal(p.evmExecuted,false);
 assert.equal(p.executionAuthorized,false);
});
test("same pure transition interpreter handles 1x and 10x preview shares",()=>{
 const grammar=plan(fake()).program;
 for(const ratio of [1n,10n]){
  let state=emptyState();
  for(const step of grammar){
   const preview=step.preview?{method:step.preview,
     assets:step.op==="CUSTODY_IN"?"40":"15",
     shares:(BigInt(step.op==="CUSTODY_IN"?"40":"15")*ratio).toString()}:null;
   state=transition(state,step,preview);
  }
  assert.equal(state.assetOwner,"75");
  assert.equal(state.assetVault,"25");
  assert.equal(state.sharesOwner,(25n*ratio).toString());
  assert.equal(state.sharesSupply,(25n*ratio).toString());
  assert.equal(state.assetSupply,"100");
 }
});
test("ABI argument symbols are typed, bounded and unknown variable fails",()=>{
 const step=PROGRAM.find(x=>x.id==="DEPOSIT");
 assert.deepEqual(getArgs(step,{
  owner:"0x"+"a".repeat(40),attacker:"0x"+"b".repeat(40),
  vault:"0x"+"c".repeat(40)}),["40","0x"+"a".repeat(40)]);
 assert.throws(()=>getArgs({...step,args:["CUSTOM_CALLDATA"]},
  {owner:"A",attacker:"B",vault:"C"}));
 assert.throws(()=>transition(emptyState(),{op:"EVM_ARBITRARY"},null));
});
test("fail closed for alternate source, missing ABIs, unverified fixture and tampered grammar",()=>{
 for(const modify of [
  x=>x.source.participants[0].id="ERC-721",
  x=>x.source.participants[0].unit="external/unknown.sol",
  x=>x.source.participants[0].operations[0].writes=[],
  x=>x.source.participants[0].operations[0].status="UNRESOLVED",
  x=>x.native[1].abi.pop(),
  x=>x.assetArtifact.abi.pop(),
  x=>x.vaultArtifacts[1].evm.bytecode.object="",
  x=>x.fixtures.vaults[1].solidity+="\nfunction steal() external {}"
 ]){
  const f=fake();modify(f);
  const p=plan(f);
  assert.equal(p.status,"BLOCKED_UNREVIEWED_CONTRACT_OR_OPERATION");
  assert.equal(p.program.length,0);
  assert.equal(verifyPlan(p),true);
 }
 for(const mutate of [
  x=>x.program[3].execution="UNMINED_REVERT",
  x=>x.program[3].signature="burn(uint256)",
  x=>x.quantities.deposit="400",
  x=>x.variants[1].shareRatio=100,
  x=>x.executionGate="LIVE_RPC",
  x=>x.candidateAdmission="ADMITTED"
 ]){
  const p=plan(fake());mutate(p);
  assert.equal(verifyPlan(p),false);
 }
});
