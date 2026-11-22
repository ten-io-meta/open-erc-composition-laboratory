"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const sha=x=>crypto.createHash("sha256").update(x).digest("hex");
const root=process.argv[2];
assert.ok(root,"Expected four real scientific source-output directories.");
const folders=["pair-8060-8098","pair-8060-20burnable","pair-8098-20","pair-1155-20"];
const audits=[];
for(const folder of folders){
  const dir=path.join(root,folder);
  const read=file=>JSON.parse(fs.readFileSync(path.join(dir,file+".json"),"utf8"));
  const original=read("source-scientific-report");
  const graph=read("structural-ast-graph");
  const discovery=read("generic-source-hypotheses");
  const result=read("path-feasibility");
  assert.equal(result.schemaVersion,"OECL_AST_PATH_FEASIBILITY_V1");
  assert.equal(result.scientificVerdict,"INCONCLUSIVE");
  assert.equal(result.candidateAdmission,"NOT_ADMITTED");
  assert.equal(result.evmExecuted,false);
  assert.equal(result.pathAnalysisScope,"SOURCE_ONLY_PARTIAL_CONSTRAINT_MODEL");
  assert.equal(result.sourceGraphSha256,sha(JSON.stringify(graph)));
  assert.equal(result.discoverySha256,sha(JSON.stringify(discovery)));
  assert.equal(original.pathFeasibilityArtifactSha256,sha(JSON.stringify(result)));
  assert.equal(result.hypotheses.length,discovery.hypotheses.length);
  for(const hypothesis of result.hypotheses){
    assert.ok(["NOT_PROVEN_EXECUTABLE","AT_LEAST_ONE_MODELED_PATH_BLOCKED",
      "NO_EXECUTABLE_ROUTE_SPECIFIED"].includes(hypothesis.pathScreen));
    assert.notEqual(hypothesis.pathScreen,"EXECUTABLE");
    assert.equal(hypothesis.evmPlan.status,"DESIGN_ONLY_NOT_EXECUTED");
    for(const participant of hypothesis.participants){
      assert.ok(["PROVEN_BLOCKED_WITHIN_MODELED_AST_PATH","NOT_PROVEN_EXECUTABLE"]
        .includes(participant.pathScreen));
      assert.ok(participant.functions.every(fn=>fn.variantCount>=1));
    }
  }
  if(folder==="pair-1155-20")assert.equal(result.hypotheses.length,0);
  audits.push({pair:folder,hypotheses:result.hypotheses.map(h=>({
    kind:h.kind,screen:h.pathScreen,
    participants:h.participants?.map(p=>({participant:p.participant,
      screen:p.pathScreen,guards:p.functions.reduce((sum,f)=>
        sum+f.variants.reduce((acc,v)=>acc+v.guards.length,0),0),
      flags:p.flags}))||[]
  }))});
}
const primary=audits[0].hypotheses.find(h=>h.kind==="POTENTIAL_COUPLED_STATE_DECREASE");
assert.ok(primary,"Expected 8060 x 8098 AST-discovered interaction");
assert.equal(primary.participants.length,2);
assert.ok(primary.participants[0].flags.includes("AUTHORIZATION_GATED"),
  "8060 ownership guard must remain visible in path feasibility");
console.log("OECL_REAL_PATH_FEASIBILITY: PASS · 4 source-pinned pairs, no admitted paths, EVM plan only");
console.log("OECL_REAL_PATH_AUDIT:"+JSON.stringify(audits));
