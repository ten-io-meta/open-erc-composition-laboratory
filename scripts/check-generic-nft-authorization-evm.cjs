"use strict";
const assert=require("node:assert/strict");
const registry=require("../laboratory/scientific-open-source-worker/source-registry.json");
const {
  hash,digest,METHODS,PROFILES,astCapabilities,reviewedWrapper,
  derivePlan,verifyPlan,signatureSpec
}=require("../laboratory/scientific-open-source-worker/GenericNftAuthorizationEvmProtocol.cjs");
const refs=PROFILES.map(id=>registry.sources.find(x=>x.id===id));
const selected=refs.map(ref=>({
  id:ref.id,kind:"openzeppelin",repository:"@openzeppelin/contracts",
  revision:"4.9.6",sourceUnit:"@openzeppelin/contracts/"+ref.file,
  sourceSha256:hash("synthetic AST only: "+ref.file)
}));
let next=50;
const functions=[],edges=[],writes=[];
const add=(root,name)=>{
  const f={id:++next,contractId:root,kind:"function",name,implemented:true};
  functions.push(f);return f.id;
};
const f721={
  transferFrom:add(1,"transferFrom"),_transfer:add(1,"_transfer"),
  _mint:add(1,"_mint"),approve:add(1,"approve"),_approve:add(1,"_approve"),
  setApprovalForAll:add(1,"setApprovalForAll"),
  _isApprovedOrOwner:add(1,"_isApprovedOrOwner")
};
const f1155={
  safeTransferFrom:add(2,"safeTransferFrom"),
  _safeTransferFrom:add(2,"_safeTransferFrom"),
  _mint:add(2,"_mint"),setApprovalForAll:add(2,"setApprovalForAll")
};
function link(a,b){edges.push({from:a,to:b,kind:"CALLS"});}
link(f721.transferFrom,f721._transfer);
link(f721.transferFrom,f721._isApprovedOrOwner);
link(f721.approve,f721._approve);
link(f1155.safeTransferFrom,f1155._safeTransferFrom);
for(const [owner,state] of [
  [f721._mint,"_owners"],[f721._transfer,"_owners"],
  [f721._approve,"_tokenApprovals"],
  [f721.setApprovalForAll,"_operatorApprovals"],
  [f1155._mint,"_balances"],[f1155._safeTransferFrom,"_balances"],
  [f1155.setApprovalForAll,"_operatorApprovals"]])
  writes.push({owner,state,kind:"ASSIGN"});
const graph={schemaVersion:"OECL_SOLIDITY_COMPILER_AST_GRAPH_V1",
  sources:selected.map(s=>({unit:s.sourceUnit,sha256:s.sourceSha256})),
  contracts:selected.map((s,i)=>({
    id:i+1,name:s.contract,unit:s.sourceUnit,
    linearizedBaseContracts:[i+1]})),functions,edges,writes};
const report={schemaVersion:"OECL_OPEN_GENERIC_AST_RESULT_V1",selected,
  graphSha256:digest(graph),sourceOnly:true,evmExecuted:false,
  scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
  compilerVersion:"0.8.26+commit.8a97fa7a",
  dependencyIntegrity:"sha512-immutable-pinned-OZ-4.9.6"};
function abi(profile,mint){
  return Object.entries(METHODS[profile]).filter(([signature])=>
    mint||!signature.startsWith("oeclResearchMint")).map(([signature,x])=>({
    type:"function",name:signature.split("(")[0],
    inputs:x[0].map(type=>({type})),outputs:x[1].map(type=>({type})),
    stateMutability:x[2]
  }));
}
function artifact(profile,mint){
  return {abi:abi(profile,mint),
    evm:{bytecode:{object:"60006000f3",linkReferences:{}}}};
}
const original=PROFILES.map(p=>artifact(p,false));
const compiled=PROFILES.map(p=>artifact(p,true));
const wrappers=selected.map((src,i)=>reviewedWrapper(src,i));
function build(g=graph,r=report,org=original,dep=compiled,wrap=wrappers){
  return derivePlan({graph:g,report:r,originalArtifacts:org,
    deployableArtifacts:dep,wrappers:wrap,
    compilerVersion:r.compilerVersion,dependencyIntegrity:r.dependencyIntegrity});
}
const plan=build();
assert.equal(plan.workflowStatus,"REVIEWED_OWNERSHIP_PROTOCOL_PREREGISTERED");
assert.deepEqual(plan.experimentalCases.map(x=>x.steps.length),[12,9]);
assert.equal(plan.evmExecuted,false);
assert.equal(plan.candidateAdmission,"NOT_ADMITTED");
assert.equal(verifyPlan(plan),true);
assert.equal(astCapabilities(graph,selected[0]).status,"READY");
assert.equal(astCapabilities(graph,selected[1]).status,"READY");
assert.equal(signatureSpec(original[0].abi,
  "transferFrom(address,address,uint256)",METHODS["ERC-721"]["transferFrom(address,address,uint256)"]),true);
assert.equal(signatureSpec(original[1].abi,
  "safeTransferFrom(address,address,uint256,uint256,bytes)",
  METHODS["ERC-1155"]["safeTransferFrom(address,address,uint256,uint256,bytes)"]),true);
console.log("OECL_NFT_ROLE_PREREGISTRATION_MOCK_PASS");

const noApproval=structuredClone(graph);
noApproval.writes=noApproval.writes.filter(w=>
  !(w.owner===f721.setApprovalForAll&&w.state==="_operatorApprovals"));
const missing=build(noApproval,{...report,graphSha256:digest(noApproval)});
assert.equal(missing.workflowStatus,"BLOCKED_NO_REVIEWED_OWNERSHIP_CAPABILITY");
assert(missing.blockedReasons.some(x=>x.includes("REQUIRED_STATE_WRITE")));
assert(verifyPlan(missing));
const badAbi=structuredClone(original);
badAbi[1].abi=badAbi[1].abi.filter(x=>x.name!=="isApprovedForAll");
const skipped=build(graph,report,badAbi);
assert.equal(skipped.workflowStatus,"BLOCKED_NO_REVIEWED_OWNERSHIP_CAPABILITY");
const badHarness=structuredClone(wrappers);
badHarness[0].solidity+="function unsafe() external {}";
assert.equal(build(graph,report,original,compiled,badHarness).workflowStatus,
  "BLOCKED_NO_REVIEWED_OWNERSHIP_CAPABILITY");
const badGraph=structuredClone(graph);
badGraph.sources[0].sha256="0".repeat(64);
assert.throws(()=>build(badGraph,report),/AST_GRAPH_IDENTITY_MISMATCH/);
console.log("OECL_NFT_MISSING_AST_ABI_HARNESS_FAIL_CLOSED_PASS");

const tampering=[
  ["promote acceptance",x=>{x.candidateAdmission="ADMITTED";}],
  ["claim runtime evidence",x=>{x.evmExecuted=true;}],
  ["claim compatibility",x=>{x.compatibilityVerdict="COMPATIBLE";}],
  ["swap registry source",x=>{x.selected[0].sourceUnit="@openzeppelin/contracts/token/ERC1155/ERC1155.sol";}],
  ["alter checksum",x=>{x.selected[0].sourceSha256="0".repeat(64);}],
  ["add mint recipient",x=>{x.experimentalCases[0].steps[0].caller="ATTACKER";}],
  ["delete negative",x=>{x.experimentalCases[1].steps.splice(1,1);}],
  ["change max gas",x=>{x.executionBudget.maxGasPerTransaction=9000000;}],
  ["relabel mainnet RPC",x=>{x.executionGate="PUBLIC";}],
  ["swap test signature",x=>{x.experimentalCases[0].steps[5].signature="safeTransferFrom";}],
  ["alter quantity",x=>{x.quantities.send1155="1000";}]
];
for(const [name,mutate] of tampering){
  const copy=structuredClone(plan);mutate(copy);
  assert.equal(verifyPlan(copy),false,name);
}
console.log("OECL_NFT_ROLE_PROTOCOL_TAMPER_REJECTED_PASS:"+tampering.length);
console.log("OECL_NFT_ROLE_SCIENTIST_POLICY_TESTS_PASS");