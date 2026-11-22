"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {projectGraphBundle}=require("../laboratory/scientific-open-source-worker/ScientificGraphView.cjs");
const dig=s=>crypto.createHash("sha256").update(s).digest("hex");
const root=process.argv[2];
assert.ok(root,"Expected generated source-output directory");
const cases=["pair-8060-8098","pair-8060-20burnable","pair-8098-20","pair-1155-20"];
const examples=[];
let negatives=0;
for(const folder of cases){
  const read=name=>JSON.parse(fs.readFileSync(path.join(root,folder,name+".json"),"utf8"));
  const graph=read("structural-ast-graph");
  const hypothesis=read("generic-source-hypotheses");
  const report=read("source-scientific-report");
  const run={mode:"CI_REGRESSION",runId:Number(process.env.GITHUB_RUN_ID),
    workflowSha:process.env.GITHUB_SHA,requestId:null};
  const view=projectGraphBundle(graph,hypothesis,report,run);
  assert.equal(view.scientificVerdict,"INCONCLUSIVE");
  assert.equal(view.candidateAdmission,"NOT_ADMITTED");
  assert.equal(view.sourceOnly,true);
  assert.equal(view.evmExecuted,false);
  assert.ok(view.nodes.length>=2);
  assert.equal(view.hypotheses.length,folder==="pair-1155-20"?0:1);
  assert.equal(view.hypotheses.length,report.counts.hypotheses);
  if(folder==="pair-1155-20")
    assert.equal(view.discoveryReason,"NO_ADMISSIBLE_SOURCE_RELATION_DISCOVERED");
  const attack=(mutate)=>{
    const a=structuredClone(graph),b=structuredClone(hypothesis),c=structuredClone(report);
    mutate(a,b,c);
    assert.throws(()=>projectGraphBundle(a,b,c,run));
    negatives++;
  };
  attack((a,b,c)=>{c.scientificVerdict="SUPPORTS"});
  attack((a,b,c)=>{a.sources[0].sha256="0".repeat(64)});
  attack((a,b,c)=>{c.graphSha256="0".repeat(64)});
  attack((a,b,c)=>{b.candidateAdmission="ADMITTED"});
  if(hypothesis.hypotheses.some(h=>h.kind==="POTENTIAL_COUPLED_STATE_DECREASE")){
    attack((a,b,c)=>{b.hypotheses[0].evidence[0].callPath=[0,1]});
  }
  examples.push(view);
}
assert.equal(examples.length,4);
const snapshot={
  schemaVersion:"OECL_VERIFIED_AST_GRAPH_SAMPLES_V1",
  runId:Number(process.env.GITHUB_RUN_ID),workflowSha:process.env.GITHUB_SHA,
  views:examples
};
const out=path.join(root,"scientific-graph-samples.json");
fs.writeFileSync(out,JSON.stringify(snapshot,null,2)+"\n");
const compact=JSON.stringify(snapshot);
console.log("OECL_GRAPH_PROJECTION: PASS · 4 real source-only pairs; "+negatives+" tampering negatives");
console.log("OECL_GRAPH_SNAPSHOT_SHA256:"+dig(compact));
// Split to avoid per-line GitHub Actions log truncation. A trusted operator
// may promote these CI-produced bytes to the reviewed read-only web snapshot.
for(let i=0;i<compact.length;i+=1500){
  console.log("OECL_GRAPH_SNAPSHOT_CHUNK:"+String(i/1500).padStart(4,"0")+":"+
    compact.slice(i,i+1500));
}
