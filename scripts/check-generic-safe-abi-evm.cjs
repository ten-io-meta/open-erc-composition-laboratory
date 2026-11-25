"use strict";
const assert=require("node:assert/strict");
const {admission,deriveProtocol,verifyProtocol,verifyWitness,canonical,digest,TEST_VECTORS}=
  require("../laboratory/scientific-open-source-worker/GenericReadOnlyAbiEvmProtocol.cjs");

const hash=x=>digest(x);
function src(id,contract,unit){
  return {id,kind:"openzeppelin",repository:"@openzeppelin/contracts",
    revision:"4.9.6",sourceUnit:unit,sourceSha256:hash(unit)};
}
const selected=[
  src("ERC-165","ERC165","@openzeppelin/contracts/utils/introspection/ERC165.sol"),
  src("ERC-2981","ERC2981","@openzeppelin/contracts/token/common/ERC2981.sol")];
const graph={schemaVersion:"OECL_SOLIDITY_COMPILER_AST_GRAPH_V1",
  sources:selected.map(s=>({unit:s.sourceUnit,sha256:s.sourceSha256})),
  contracts:[],functions:[],edges:[]};
const report={
  schemaVersion:"OECL_OPEN_GENERIC_AST_RESULT_V1",
  selected,
  graphSha256:canonical(graph),
  compilerVersion:"0.8.26+commit.8a97fa7a",
  dependencyIntegrity:"sha512-immutable-pinned-OZ-4.9.6",
  scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
  sourceOnly:true,evmExecuted:false};
const abi=[
  {type:"constructor",inputs:[],stateMutability:"nonpayable"},
  {type:"function",name:"supportsInterface",inputs:[{type:"bytes4",name:"interfaceId"}],
    outputs:[{type:"bool",name:"supported"}],stateMutability:"view"}
];
const fixture={abi,evm:{bytecode:{object:"600160005560016000f3",linkReferences:{}}}};
const plan=deriveProtocol({graph,report,artifacts:[fixture,fixture],
  compilerVersion:report.compilerVersion,dependencyIntegrity:report.dependencyIntegrity});
assert.equal(plan.workflowStatus,"PREREGISTERED_SAFE_READ_ONLY_PROTOCOL");
assert.equal(plan.compiled.length,2);
assert.equal(plan.candidate.maxReadOnlyCalls,6);
assert.equal(plan.candidate.experimentDispatched,false);
assert.equal(plan.evmExecuted,false);
assert.equal(plan.compatibilityVerdict,"NOT_EVALUATED");
assert.equal(verifyProtocol(plan),true);
assert.equal(plan.selected[0].sourceSha256,hash(selected[0].sourceUnit));
assert.equal(plan.selected[1].sourceSha256,hash(selected[1].sourceUnit));
console.log("OECL_GENERIC_SAFE_ABI_PREREGISTRATION_PASS");

const unavailable=[
  ["unsupported constructor",
    {...fixture,abi:[{type:"constructor",inputs:[{type:"address"}]},
      ...abi.filter(x=>x.type!=="constructor")]},"CONSTRUCTOR_INPUTS_REQUIRE_REVIEW"],
  ["unsafe mutating selector",
    {...fixture,abi:abi.map(x=>x.type==="function"?{...x,stateMutability:"nonpayable"}:x)},
    "NO_REVIEWED_READ_ONLY_METHOD"],
  ["missing ABI",{...fixture,abi:null},"NO_RESOLVED_ABI"],
  ["abstract bytecode",{...fixture,evm:{bytecode:{object:"",linkReferences:{}}}},
    "NONDEPLOYABLE_OR_UNLINKED_BYTECODE"],
  ["unlinked library",{...fixture,evm:{bytecode:{object:"6000",linkReferences:{file:{Lib:[]}}}}},
    "UNRESOLVED_LIBRARY_LINKS"],
  ["oversized bytecode",{...fixture,evm:{bytecode:{object:"aa".repeat(61000),linkReferences:{}}}},
    "BYTECODE_EXCEEDS_BUDGET"]
];
for(const [name,artifact,expected] of unavailable){
  assert.equal(admission(artifact),expected,name);
  const p=deriveProtocol({report,graph,artifacts:[fixture,artifact],
    compilerVersion:report.compilerVersion,dependencyIntegrity:report.dependencyIntegrity});
  assert.equal(p.workflowStatus,"BLOCKED_NO_REVIEWED_EXECUTION_CAPABILITY",name);
  assert.equal(p.blockedReasons.length,1);
  assert.equal(p.evmExecuted,false);
  assert.equal(verifyProtocol(p),true);
}
console.log("OECL_GENERIC_SAFE_ABI_UNSUPPORTED_CONTRACTS_BLOCKED_PASS:"+unavailable.length);

const bad=[
  ["forged source hash",x=>{x.selected[0].sourceSha256="0".repeat(64);}],
  ["alternative test vectors",x=>{x.candidate.testVectors[2]="0x00000000";}],
  ["fake admission",x=>{x.candidateAdmission="ADMITTED";}],
  ["fake conclusion",x=>{x.scientificVerdict="SUPPORTS";}],
  ["fake dynamic EVM dispatch",x=>{x.candidate.experimentDispatched=true;}],
  ["unexpected compiler",x=>{x.compilerVersion="0.8.99";}],
  ["mutate source profile",x=>{x.selected[0].id="ERC-99999";}],
  ["change source revision",x=>{x.selected[1].revision="latest";}],
  ["expand call budget",x=>{x.candidate.maxReadOnlyCalls=100;}],
  ["external RPC",x=>{x.executionGate="PUBLIC_RPC";}],
];
for(const [name,mutate] of bad){
  const copy=structuredClone(plan);mutate(copy);
  assert.equal(verifyProtocol(copy),false,name);
}
const falseGraph=structuredClone(graph);falseGraph.sources[0].sha256="0".repeat(64);
assert.throws(()=>deriveProtocol({graph:falseGraph,report,artifacts:[fixture,fixture],
  compilerVersion:report.compilerVersion,dependencyIntegrity:report.dependencyIntegrity}),
  /AST_GRAPH_IDENTITY_MISMATCH/);
const falseReport=structuredClone(report);falseReport.evmExecuted=true;
assert.throws(()=>deriveProtocol({graph,report:falseReport,artifacts:[fixture,fixture],
  compilerVersion:report.compilerVersion,dependencyIntegrity:report.dependencyIntegrity}));
console.log("OECL_GENERIC_SAFE_ABI_PROTOCOL_TAMPER_REJECTED_PASS");

const addr=x=>"0x"+x.repeat(40),tx=x=>"0x"+x.repeat(64);
const contract=(index)=>({
  id:plan.selected[index].id,contractAddress:addr(index===0?"a":"b"),
  txHash:tx(index===0?"1":"2"),blockHash:tx(index===0?"3":"4"),
  blockNumber:index+1,status:1,transactionMined:true,
  codeKeccak256:tx(index===0?"5":"6")
});
const vals=[[true,true],[false,false],[false,true]];
const witness={
  schemaVersion:"OECL_GENERIC_ABI_READ_ONLY_EVM_WITNESS_V1",
  selected:plan.selected.map(x=>x.id),planSha256:plan.planSha256,
  chainId:31337,providerScope:"PINNED_LOCAL_HARDHAT_PROVIDER_ONLY",
  evmExecuted:true,deployments:[contract(0),contract(1)],
  readOnlyProbes:TEST_VECTORS.map((vector,i)=>({
    method:"supportsInterface(bytes4)",vector,transactionMined:false,
    responses:vals[i].map((v,j)=>({
      id:plan.selected[j].id,contractAddress:contract(j).contractAddress,
      returnData:"0x"+("0".repeat(63))+(v?"1":"0"),value:v
    }))
  })),
  differingVectorCount:1,
  outcome:"SCOPED_DIFFERENCE_OBSERVED",
  scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",globalInteroperabilityClaim:false
};
assert.equal(verifyWitness(plan,witness),true);
const badWitness=[
  ["invented mainnet chain",x=>{x.chainId=1;}],
  ["fake local mined negative",x=>{x.readOnlyProbes[2].transactionMined=true;}],
  ["changed experiment count",x=>{x.readOnlyProbes.pop();}],
  ["swapped source identity",x=>{x.selected.reverse();}],
  ["duplicated receipt",x=>{x.deployments[1].txHash=x.deployments[0].txHash;}],
  ["incorrect difference count",x=>{x.differingVectorCount=2;}],
  ["non-ABI result",x=>{x.readOnlyProbes[1].responses[0].returnData="0x";}],
  ["invented interoperability",x=>{x.globalInteroperabilityClaim=true;}],
  ["forged protocol",x=>{x.planSha256=tx("c").slice(2);}],
  ["falsified response",x=>{x.readOnlyProbes[2].responses[1].value=false;}],
];
for(const [name,mutate] of badWitness){
  const copy=structuredClone(witness);mutate(copy);
  assert.equal(verifyWitness(plan,copy),false,name);
}
console.log("OECL_GENERIC_SAFE_ABI_SYNTHETIC_EVM_WITNESS_GATES_PASS:"+badWitness.length);
console.log("OECL_GENERIC_SAFE_ABI_ALL_CONTROLS_PASS");