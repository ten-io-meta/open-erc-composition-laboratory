"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {
 hash,SOURCE_POLICY,GRAMMAR,nativeSpecs,fixture,makePlan,verifyPlan,BOUNDS
}=require("../laboratory/scientific-open-source-worker/VaultAssetFlowProtocol.cjs");
function abi(specs){
 return Object.entries(specs).map(([sig,defs])=>({
  type:"function",name:sig.split("(")[0],
  inputs:defs[0].map(type=>({type})),outputs:defs[1].map(type=>({type})),
  stateMutability:defs[2]}));
}
function setup(){
 const originals=[{abi:abi(nativeSpecs.VAULT)},{abi:abi(nativeSpecs.ASSET)}];
 const p=Object.entries(SOURCE_POLICY).map(([id,profile],i)=>({
  id,unit:profile.unit,sourceSha256:"a".repeat(64),
  abiSha256:hash(originals[i].abi),
  sourceOnlyHypothesisCount:4,nativeMethods:["any"],
  operations:(i===0?["deposit(uint256,address)","withdraw(uint256,address,address)"]:
   ["transfer(address,uint256)","transferFrom(address,address,uint256)"])
   .map(signature=>({signature,status:"STRUCTURAL_WRITES_OBSERVED",
    writes:[{state:"_balances"}],unresolved:3,external:1,supportedByAbi:true}))
 }));
 const source={schemaVersion:"OECL_VAULT_ERC20_BLIND_PROBE_V1",
  compilerVersion:"0.8.26+commit.8a97fa7a",sourceGraphSha256:"b".repeat(64),
  candidateAdmission:"NOT_ADMITTED",compatibilityVerdict:"NOT_EVALUATED",
  evmExecuted:false,executionAuthorized:false,participants:p};
 const wrappers=p.map((part,i)=>fixture(part,i));
 const deployed=wrappers.map((_,i)=>({abi:originals[i].abi,
  evm:{bytecode:{object:"60006000f3",linkReferences:{}}}}));
 return {source,originals,wrappers,deployed};
}
function derive(s){
 return makePlan(s.source,s.originals,s.wrappers,s.deployed,
  "0.8.26+commit.8a97fa7a","sha512-pinned-test-integrity");
}
test("ERC4626 and ERC20 methods and AST evidence select the reviewed grammar",()=>{
 const s=setup(),p=derive(s);
 assert.equal(p.status,"REVIEWED_LOCAL_VAULT_FLOW_PREREGISTERED");
 assert.equal(p.cases.length,9);assert.equal(verifyPlan(p),true);
 assert.deepEqual(p.cases.map(x=>x.id),GRAMMAR.map(x=>x[0]));
 assert.equal(p.executionAuthorized,false);
 assert.equal(p.candidateAdmission,"NOT_ADMITTED");
 assert.equal(p.compatibilityVerdict,"NOT_EVALUATED");
});
test("unregistered source, missing native method, missing AST or tampered fixture block dispatch",()=>{
 for(const mutation of [
  s=>{s.source.participants[1].id="ERC-721";},
  s=>{s.originals[0].abi.pop();},
  s=>{s.source.participants[0].operations[0].supportedByAbi=false;},
  s=>{s.source.participants[0].operations[0].status="NO_REACHABLE_WRITE_PROVEN";},
  s=>{s.wrappers[1].solidity+="function steal() external {}";},
  s=>{s.deployed[1].evm.bytecode.object="";},
  s=>{s.source.participants[0].sourceSha256="NOT_A_SHA256";}
 ]){
  const s=setup();mutation(s);
  const p=derive(s);
  assert.equal(p.status,"BLOCKED_INCOMPLETE_SOURCE_OR_ABI");
  assert.equal(p.cases.length,0);
  assert.equal(verifyPlan(p),true);
 }
});
test("mutated approval, token quantity, missing case and forged admission invalidate preregistration",()=>{
 const mutations=[
  p=>{p.quantities.depositAssets="90";},
  p=>{p.cases[2].method="burn(uint256)";},
  p=>{p.cases.push({id:"ARBITRARY",execution:"MINED",caller:"OWNER",target:"ASSET",method:"approve(address,uint256)"});},
  p=>{p.candidateAdmission="ADMITTED";},
  p=>{p.executionGate="live-mainnet";},
  p=>{p.experimentDispatched=true;},
  p=>{p.capabilities[0].status="BYPASSED";}
 ];
 for(const mutation of mutations){
  const p=derive(setup());mutation(p);
  assert.equal(verifyPlan(p),false);
 }
 assert.equal(BOUNDS.maxGasPerTransaction,3000000);
});
