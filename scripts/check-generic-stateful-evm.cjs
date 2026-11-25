"use strict";
const assert=require("node:assert/strict");
const {
  hash,digest,values,approvedMethods,TYPES,abiFunction,astCapability,
  buildHarnessSource,signedProtocolBody,verifyStatefulPlan,verifyStatefulWitness
}=require("../laboratory/scientific-open-source-worker/GenericStatefulEvmProtocol.cjs");
const registry=require("../laboratory/scientific-open-source-worker/source-registry.json");
const refs=["ERC-20","ERC-20-BURNABLE"].map(id=>registry.sources.find(x=>x.id===id));
const units=refs.map(x=>"@openzeppelin/contracts/"+x.file);
const selected=refs.map((ref,i)=>({
  id:ref.id,kind:ref.kind,repository:"@openzeppelin/contracts",
  revision:"4.9.6",sourceUnit:units[i],sourceSha256:hash("locked-"+units[i])}));
const functionNames=["transferFrom","_spendAllowance","_transfer","_approve",
  "_mint","balanceOf","allowance","totalSupply","burnFrom","burn","_burn"];
const functionFacts=functionNames.map((name,i)=>({
  id:100+i,contractId:i<8||i===10?1:2,unit:i<8||i===10?units[0]:units[1],
  name,kind:"function",implemented:true,
  visibility:["transferFrom","balanceOf","allowance","totalSupply","burnFrom","burn"].includes(name)?
    "public":"internal"
}));
const find=(name)=>functionFacts.find(x=>x.name===name).id;
const edges=[
  ["transferFrom","_spendAllowance"],["transferFrom","_transfer"],
  ["burnFrom","_spendAllowance"],["burnFrom","_burn"],["burn","_burn"]
].map(([a,b])=>({kind:"CALLS",from:find(a),to:find(b)}));
const graph={
  schemaVersion:"OECL_SOLIDITY_COMPILER_AST_GRAPH_V1",
  sources:selected.map(x=>({unit:x.sourceUnit,sha256:x.sourceSha256})),
  contracts:[
    {id:1,kind:"contract",name:"ERC20",unit:units[0],linearizedBaseContracts:[1]},
    {id:2,kind:"contract",name:"ERC20Burnable",unit:units[1],linearizedBaseContracts:[2,1]}],
  functions:functionFacts,edges,
  writes:[
    {owner:find("_transfer"),state:"_balances",kind:"ASSIGN"},
    {owner:find("_approve"),state:"_allowances",kind:"ASSIGN"},
    {owner:find("_mint"),state:"_totalSupply",kind:"INCREASE"},
    {owner:find("_burn"),state:"_totalSupply",kind:"DECREASE"}
  ]
};
const report={
  schemaVersion:"OECL_OPEN_GENERIC_AST_RESULT_V1",
  sourceOnly:true,evmExecuted:false,scientificVerdict:"INCONCLUSIVE",
  candidateAdmission:"NOT_ADMITTED",selected,graphSha256:digest(graph),
  compilerVersion:"0.8.26+commit.8a97fa7a",
  dependencyIntegrity:"sha512-exact-audited-lock"
};
function artifact(profile,mint=false){
  const functions=[...approvedMethods.transfer,
    ...(profile==="ERC-20-BURNABLE"?approvedMethods.burn:[]),
    ...(mint?[approvedMethods.harness]:[])];
  const abi=functions.map(signature=>{
    const v=TYPES[signature];
    return {type:"function",name:signature.split("(")[0],
      inputs:v.inputs.map(type=>({type})),
      outputs:v.outputs.map(type=>({type})),stateMutability:v.mutability};
  });
  return {abi,evm:{bytecode:{object:"60006000f3",linkReferences:{}}}};
}
const original=selected.map(x=>artifact(x.id));
const harnesses=selected.map((x,i)=>buildHarnessSource(x,i));
const deployable=selected.map(x=>artifact(x.id,true));
const plan=signedProtocolBody({report,graph,originalArtifacts:original,
  deployableArtifacts:deployable,wrappers:harnesses,
  compilerVersion:report.compilerVersion,dependencyIntegrity:report.dependencyIntegrity});
assert.equal(plan.workflowStatus,"REVIEWED_STATEFUL_PROTOCOL_PREREGISTERED");
assert.equal(plan.experimentalCases.length,2);
assert.deepEqual(plan.experimentalCases.map(x=>x.steps.length),[6,10]);
assert.equal(plan.evmExecuted,false);
assert.equal(plan.candidateAdmission,"NOT_ADMITTED");
assert.equal(verifyStatefulPlan(plan),true);
assert.equal(abiFunction(original[0],"burnFrom(address,uint256)"),false);
assert.equal(abiFunction(original[1],"burnFrom(address,uint256)"),true);
assert.equal(plan.capabilities[0].sourceAST.status,"READY");
assert.equal(plan.capabilities[1].sourceAST.burnFrom.burnCallPath.length,2);
console.log("OECL_STATEFUL_MOCK_AST_ABI_PROTOCOL_PASS");

const blocked=structuredClone(graph);
blocked.edges=blocked.edges.filter(x=>x.from!==find("burnFrom"));
const noBurn=signedProtocolBody({report:{...report,graphSha256:digest(blocked)},
  graph:blocked,originalArtifacts:original,deployableArtifacts:deployable,
  wrappers:harnesses,compilerVersion:report.compilerVersion,
  dependencyIntegrity:report.dependencyIntegrity});
assert.equal(noBurn.workflowStatus,"BLOCKED_NO_REVIEWED_STATEFUL_CAPABILITY");
assert.equal(noBurn.evmExecuted,false);
assert.equal(noBurn.experimentalCases.length,0);
assert.equal(verifyStatefulPlan(noBurn),true);
const abis=structuredClone(original);
abis[1].abi=abis[1].abi.filter(x=>x.name!=="burnFrom");
const noAbi=signedProtocolBody({report,graph,originalArtifacts:abis,
  deployableArtifacts:deployable,wrappers:harnesses,
  compilerVersion:report.compilerVersion,dependencyIntegrity:report.dependencyIntegrity});
assert.equal(noAbi.workflowStatus,"BLOCKED_NO_REVIEWED_STATEFUL_CAPABILITY");
const fakeHarness=structuredClone(harnesses);
fakeHarness[0].solidity+="function evil() {}";
const noHarness=signedProtocolBody({report,graph,originalArtifacts:original,
  deployableArtifacts:deployable,wrappers:fakeHarness,
  compilerVersion:report.compilerVersion,dependencyIntegrity:report.dependencyIntegrity});
assert.equal(noHarness.workflowStatus,"BLOCKED_NO_REVIEWED_STATEFUL_CAPABILITY");
const forgedGraph=structuredClone(graph);
forgedGraph.sources[0].sha256="0".repeat(64);
assert.throws(()=>signedProtocolBody({report,graph:forgedGraph,
  originalArtifacts:original,deployableArtifacts:deployable,wrappers:harnesses,
  compilerVersion:report.compilerVersion,dependencyIntegrity:report.dependencyIntegrity}),
  /AST_GRAPH_IDENTITY_MISMATCH/);
console.log("OECL_STATEFUL_SOURCE_ABI_AST_HARNESS_FAIL_CLOSED_PASS");

const malicious=[
  ["promote EVM",x=>{x.evmExecuted=true;}],
  ["fake compatibility",x=>{x.compatibilityVerdict="COMPATIBLE";}],
  ["fake admission",x=>{x.candidateAdmission="ADMITTED";}],
  ["alter source",x=>{x.selected[0].sourceSha256="0".repeat(64);}],
  ["alter registry",x=>{x.selected[1].revision="latest";}],
  ["inflate quantity",x=>{x.quantities.transfer="250000";}],
  ["delete negative control",x=>{x.experimentalCases[0].steps.splice(2,1);}],
  ["fake public execution",x=>{x.executionGate="PUBLIC";}],
  ["replace AST facts",x=>{x.capabilities[1].sourceAST.burnFrom=null;}],
  ["mutate minted supply",x=>{x.quantities.minted="10";}],
];
for(const [name,mutate] of malicious){
  const fake=structuredClone(plan);mutate(fake);
  assert.equal(verifyStatefulPlan(fake),false,name);
}
console.log("OECL_STATEFUL_PREREGISTRATION_TAMPER_REJECTED_PASS:"+malicious.length);

const address=x=>"0x"+x.repeat(40),tx=x=>"0x"+x.repeat(64);
const actors={owner:address("a"),spender:address("b"),
  recipient:address("c"),attacker:address("d")};
let receiptIndex=0;
function receipt(who,to,method,event){
  receiptIndex++;const char=receiptIndex.toString(16);
  return {txHash:tx(char),blockHash:tx("e"),blockNumber:receiptIndex,
    status:1,transactionMined:true,gasUsed:"21000",
    fromAddress:actors[who.toLowerCase()],
    toAddress:to,method,methodSelector:"0x12345678",event};
}
const witness={
  schemaVersion:"OECL_GENERIC_STATEFUL_ERC20_LOCAL_EVM_V1",
  planSha256:plan.planSha256,selected:plan.selected.map(x=>x.id),chainId:31337,
  providerScope:"EPHEMERAL_LOCAL_HARDHAT_RECEIPT_RECHECKED",actors,
  deployments:[],participants:[],
  minedReceiptCount:12,unminedNegativeCount:6,
  isolationCheck:{otherTokenUnchanged:true},
  fixtureHasUnsafeTestMint:true,crossContractAtomicityProven:false,
  generalCompatibilityClaim:false,evmExecuted:true,
  outcome:"SCOPED_TRANSFER_AND_BURN_BEHAVIOR_OBSERVED",
  scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED"
};
const quantityByRole={
  MINTED:values.minted,APPROVED:values.approved,
  UNAUTHORIZED:values.unauthorized,OVER_ALLOWANCE:values.overAllowance,
  OVER_BALANCE:values.overBalance,TRANSFER:values.transfer,
  BURN:values.burn,ZERO:values.zero
};
for(let i=0;i<2;i++){
  const addr=address(i===0?"1":"2");
  witness.deployments.push({
    id:plan.selected[i].id,contractAddress:addr,
    runtimeCodeKeccak256:tx(i===0?"4":"5"),
    receipt:receipt("OWNER",null,"CONSTRUCTOR",null)
  });
  const group=plan.experimentalCases[i],cases=[];
  let state={owner:"0",recipient:"0",spender:"0",attacker:"0",
    supply:"0",allowance:"0"};
  for(const step of group.steps){
    const before={...state};
    const amount=quantityByRole[step.quantityRole];
    const after={...before};
    if(step.id==="MINT_INITIAL"){after.owner="100";after.supply="100";}
    if(step.id==="APPROVE_SPENDER")after.allowance="50";
    if(step.id==="AUTHORIZED_TRANSFER"){
      after.owner="75";after.recipient="25";after.allowance="25";}
    if(step.id==="AUTHORIZED_BURN_FROM"){
      after.owner="65";after.supply="90";after.allowance="15";}
    const mined=step.execution!=="READ_ONLY_EXPECT_REVERT";
    const zero=address("0");
    let evt=null;
    if(mined){
      if(step.id==="MINT_INITIAL")
        evt={name:"Transfer",from:zero,to:actors.owner,amount:"100"};
      else if(step.id==="APPROVE_SPENDER")
        evt={name:"Approval",from:actors.owner,to:actors.spender,amount:"50"};
      else if(step.id.includes("TRANSFER"))
        evt={name:"Transfer",from:actors.owner,to:actors.recipient,
          amount:step.id==="AUTHORIZED_TRANSFER"?"25":"0"};
      else evt={name:"Transfer",from:actors.owner,to:zero,
        amount:step.id==="AUTHORIZED_BURN_FROM"?"10":"0"};
    }
    cases.push({
      ...step,quantity:amount,before,after,transactionMined:mined,
      simulation:mined?null:"ETH_CALL_REVERT",statePreserved:mined?null:true,
      receipt:mined?receipt(step.caller,addr,step.signature,evt):null
    });
    state=after;
  }
  witness.participants.push({
    id:group.id,role:group.role,contractAddress:addr,cases,finalState:state,
    minedTransactions:cases.filter(c=>c.transactionMined).length,
    unminedNegativeControls:cases.filter(c=>!c.transactionMined).length
  });
}
assert.equal(verifyStatefulWitness(plan,witness),true);
const forgedWitness=[
  ["falsified balance",x=>{x.participants[0].cases[4].after.owner="74";}],
  ["fake mined negative",x=>{x.participants[0].cases[2].transactionMined=true;}],
  ["invented compatibility",x=>{x.compatibilityVerdict="COMPATIBLE";}],
  ["change source plan",x=>{x.planSha256="0".repeat(64);}],
  ["duplicate receipt",x=>{x.deployments[1].receipt.txHash=x.deployments[0].receipt.txHash;}],
  ["invented chain",x=>{x.chainId=1;}],
  ["fake burned supply",x=>{x.participants[1].finalState.supply="80";}],
  ["unreported allowance change",x=>{x.participants[0].cases[4].after.allowance="50";}],
  ["forge event",x=>{x.participants[1].cases[8].receipt.event.amount="20";}],
  ["remove negative",x=>{x.participants[1].cases.splice(6,1);}],
  ["false mined count",x=>{x.minedReceiptCount=19;}],
  ["false fixture",x=>{x.fixtureHasUnsafeTestMint=false;}],
  ["fake cross atomicity",x=>{x.crossContractAtomicityProven=true;}],
];
for(const [name,mutate] of forgedWitness){
  const fake=structuredClone(witness);mutate(fake);
  assert.equal(verifyStatefulWitness(plan,fake),false,name);
}
console.log("OECL_STATEFUL_INDEPENDENT_SYNTHETIC_WITNESS_REJECTION_PASS:"+forgedWitness.length);
console.log("OECL_STATEFUL_PROTOCOL_ALL_TESTS_PASS");