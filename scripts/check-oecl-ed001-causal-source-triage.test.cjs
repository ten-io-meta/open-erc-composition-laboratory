"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {audit,classifyHypothesis}=require("../laboratory/scientific-causal-mechanism/ScientificCausalSourceTriage.cjs");
const root=process.env.OECL_ED001_CI_SOURCE_DIR;
const registerPath=process.env.OECL_ED001_CI_REGISTER;
const digest="a".repeat(64);
const unit="trusted/Test.sol";
function synthetic(){
 const graph={sources:[{unit,sha256:digest}],contracts:[
   {id:100,name:"A",unit,linearizedBaseContracts:[100]},
   {id:200,name:"B",unit,linearizedBaseContracts:[200]}],
   functions:[{id:1,contractId:100,name:"burnA",unit,location:{line:1}},
     {id:2,contractId:100,name:"_writeA",unit,location:{line:10}},
     {id:3,contractId:200,name:"burnB",unit,location:{line:3}},
     {id:4,contractId:200,name:"_writeB",unit,location:{line:20}}],
   edges:[{kind:"CALLS",from:1,to:2},{kind:"CALLS",from:3,to:4}],
   writes:[{owner:2,state:"supply",stateId:42,kind:"DECREASE",location:{unit,line:11}},
     {owner:4,state:"supply",stateId:43,kind:"DECREASE",location:{unit,line:21}}],
   externalCalls:[]};
 const mk=(part,entry,line,callPath,atLine)=>({participant:part,
   publicEntrypoint:{name:entry,unit,sourceSha256:digest,location:{line}},
   stateDecrease:{state:"supply",unit,sourceSha256:digest,location:{line:atLine}},callPath});
 const h={hypothesisId:"AST-HYP-"+"1".repeat(24),
   kind:"POTENTIAL_COUPLED_STATE_DECREASE",status:"SOURCE_ONLY_UNEVALUATED",
   candidateAdmission:"NOT_ADMITTED",scientificVerdict:"INCONCLUSIVE",
   evidence:[mk("ERC-A","burnA",1,[1,2],11),mk("ERC-B","burnB",3,[3,4],21)]};
 const source={primarySources:[
   {id:"ERC-A",primaryContract:"A",sourceUnit:unit,sourceSha256:digest},
   {id:"ERC-B",primaryContract:"B",sourceUnit:unit,sourceSha256:digest}]};
 const feas={hypotheses:[{hypothesisId:h.hypothesisId,kind:h.kind,pathScreen:"NOT_PROVEN_EXECUTABLE"}]};
 return {graph,h,source,feas};
}
const evalOne=s=>classifyHypothesis(s.h,s.graph,s.source,s.feas,"ERC-A|ERC-B");
test("one source definition is not evidence of one deployed state",()=>{
 const s=synthetic();s.graph.writes[1].location.line=11;
 s.h.evidence[1].stateDecrease.location.line=11;
 const r=evalOne(s);
 assert.equal(r.mechanismCategory,"SAME_SOURCE_DEFINITION_NOT_SHARED_RUNTIME_STORAGE");
 assert.equal(r.identicalSourceWriteDefinition,true);
 assert.equal(r.crossParticipantCausalMechanism,"NOT_ESTABLISHED");
 assert.equal(r.canProceedToEvm,false);
});
test("compensating same-state writes trigger semantic transfer challenge",()=>{
 const s=synthetic();s.graph.writes.push({owner:4,state:"supply",stateId:43,kind:"INCREASE",location:{unit,line:22}});
 const r=evalOne(s);
 assert.equal(r.mechanismCategory,"OFFSETTING_BALANCE_WRITE_PATH_NOT_SUPPLY_BURN");
 assert.equal(r.participantWithOffsettingStateWrites,1);
 assert.equal(r.propertyEmergence,"NOT_DEMONSTRATED");
});
test("unbound independent internal paths cannot become causal claims",()=>{
 const r=evalOne(synthetic());
 assert.equal(r.mechanismCategory,"SAME_SOURCE_DEFINITION_NOT_SHARED_RUNTIME_STORAGE");
 assert.equal(r.independentlyBoundCrossParticipantCall,"NOT_ESTABLISHED");
 assert.equal(r.hypotheticalExperimentExecution,"NOT_AUTHORIZED");
});
test("forged, wrong or incomplete callpaths are rejected",()=>{
 const s=synthetic();s.h.evidence[1].callPath=[3,2];
 assert.throws(()=>evalOne(s),/BROKEN_COMPILER_CALL_PATH/);
 const t=synthetic();t.graph.writes.pop();
 assert.throws(()=>evalOne(t),/DECREASE_NOT_COMPILER_BOUND/);
 const u=synthetic();u.h.evidence[0].participant="ERC-B";
 assert.throws(()=>evalOne(u),/EXACT_PARTICIPANTS/);
});
test("source revision and invalid scientific promotion fail closed",()=>{
 const a=synthetic();a.h.evidence[0].stateDecrease.sourceSha256="0".repeat(64);
 assert.throws(()=>evalOne(a),/SOURCE_UNIT_DIGEST_MISMATCH/);
 const b=synthetic();b.h.scientificVerdict="SUPPORTED";
 assert.throws(()=>evalOne(b),/HYPOTHESIS_NOT_UNEVALUATED/);
});
test("unsupported machine hypothesis class cannot slip into causal triage",()=>{
 const a=synthetic();a.h.kind="AUTONOMOUS_EMERGENCE_PROVEN";
 a.feas.hypotheses[0].kind=a.h.kind;
 assert.throws(()=>evalOne(a),/UNREVIEWED_KIND/);
});
test("real frozen 13-hypothesis source campaign has no proven cross-contract causal edge",{skip:!(root&&registerPath)},()=>{
 const input=JSON.parse(fs.readFileSync(registerPath,"utf8"));
 const before=JSON.stringify(input);
 const output=audit(path.resolve(root),input);
 assert.equal(JSON.stringify(input),before);
 assert.equal(output.reviewedHypotheses,13);
 assert.deepEqual(output.categories,{
   SAME_SOURCE_DEFINITION_NOT_SHARED_RUNTIME_STORAGE:2,
   OFFSETTING_BALANCE_WRITE_PATH_NOT_SUPPLY_BURN:4,
   SHARED_IMPLEMENTATION_ANCESTRY_ONLY:7
 });
 assert.equal(output.evmExperimentExecuted,false);
 assert.equal(output.evmExecutionAuthorized,false);
 assert.equal(output.emergentPropertyDemonstrated,false);
 assert.equal(output.candidateAdmission,"NOT_ADMITTED");
 assert.equal(output.findings.filter(x=>x.canProceedToEvm).length,0);
 assert.equal(output.findings.filter(x=>x.kind==="POTENTIAL_COUPLED_STATE_DECREASE" && x.proposedExperiments.length===7).length,6);
});
test("a tampered archived graph is rejected even when the label remains unchanged",{skip:!(root&&registerPath)},()=>{
 const os=require("node:os");const temp=fs.mkdtempSync(path.join(os.tmpdir(),"oecl-ed001-causality-"));
 try{
  const input=JSON.parse(fs.readFileSync(registerPath,"utf8"));
  const dirs=fs.readdirSync(root,{withFileTypes:true}).filter(x=>x.isDirectory());
  for(const d of dirs){const target=path.join(temp,d.name);fs.mkdirSync(target,{recursive:true});for(const f of fs.readdirSync(path.join(root,d.name))){fs.copyFileSync(path.join(root,d.name,f),path.join(target,f));}}
  const target=path.join(temp,"matrix-ERC-20-BURNABLE-ERC-4626","structural-ast-graph.json");
  const a=JSON.parse(fs.readFileSync(target,"utf8"));a.writes=a.writes.filter(x=>x.kind!=="DECREASE");
  fs.writeFileSync(target,JSON.stringify(a));
  assert.throws(()=>audit(temp,input),/COMPILER_ARTIFACT_LINEAGE/);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
