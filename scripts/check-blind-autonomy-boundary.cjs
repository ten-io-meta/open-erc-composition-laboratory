"use strict";
const assert=require("node:assert/strict");
const {readFileSync}=require("node:fs");
const path=require("node:path");
const root=path.resolve(process.argv[2]||"source-output");
const shard=Number(process.argv[3]);
assert(Number.isInteger(shard)&&shard>=0&&shard<=2);
const report=JSON.parse(readFileSync(path.join(root,
  "oecl-blind-autonomy-baseline-"+shard+".json"),"utf8"));
assert.equal(report.schemaVersion,"OECL_BLIND_SOURCE_SCIENTIST_AUTONOMY_BASELINE_V1");
assert.equal(report.inputCohort,"ALL_CURRENTLY_UNCONFIGURED_REGISTERED_PINNED_AST_PAIRS");
assert.equal(report.researchAutonomyLevel,"RULE_BOUND_SOURCE_ONLY_QUESTION_GENERATION");
assert.equal(report.scientificVerdict,"INCONCLUSIVE");
assert.equal(report.compatibilityVerdict,"NOT_EVALUATED");
assert.equal(report.candidateAdmission,"NOT_ADMITTED");
assert.equal(report.evmExecuted,false);
const m=report.summary;
assert.equal(m.pairsAudited,report.pairs.length);
assert.equal(m.pairsAudited,m.pairsWithAtLeastOnePattern+m.pairsWithoutPattern);
assert.equal(m.sourcePatternsSuggested,m.inheritancePatterns+m.stateDecreasePatterns);
assert.equal(m.researchQuestionsProposed,m.sourcePatternsSuggested);
assert.equal(m.specificEvmAdaptersGeneratedAutonomously,0);
assert.equal(m.evmExperimentsExecuted,0);
assert.equal(m.independentTheoryConfirmations,0);
for(const pair of report.pairs){
 assert.equal(pair.hypothesisCount,pair.designs.length);
 assert.equal(pair.evmExperimentsExecuted,0);
 assert.equal(pair.executableAdaptersBuilt,0);
 assert.equal(pair.candidateAdmission,"NOT_ADMITTED");
 assert.equal(pair.scientificVerdict,"INCONCLUSIVE");
 assert(/^[a-f0-9]{64}$/.test(pair.sourceReportSha256));
 assert(/^[a-f0-9]{64}$/.test(pair.genericHypothesisArtifactSha256));
 assert(/^[a-f0-9]{64}$/.test(pair.pathFeasibilityArtifactSha256));
 for(const d of pair.designs){
  assert.equal(d.status,"AUTOMATIC_SOURCE_RESEARCH_DESIGN_ONLY");
  assert.equal(d.evmExecuted,false);
  assert.equal(d.experimentalOutcome,"NOT_OBSERVED");
  assert.equal(d.adapter,"NOT_AVAILABLE_FOR_GENERAL_PAIR");
  assert.equal(d.experimentExecution,"NOT_SCHEDULED");
  assert.equal(d.fullCompatibility,"NOT_EVALUATED");
  assert.equal(d.candidateAdmission,"NOT_ADMITTED");
  assert(d.question&&d.falsificationDesign&&d.alternateExplanations.length>=2);
  assert.equal(d.sourceRevisions.length,2);
  if(d.kind==="POTENTIAL_COUPLED_STATE_DECREASE")
   assert(d.targetStatePaths.length===2&&
    d.targetStatePaths.every(x=>x.sourceCallPath.length>0));
 }
}
console.log("OECL_BLIND_AUTONOMY_BOUNDARY_CHECK_PASS",JSON.stringify({
  shard,pairs:m.pairsAudited,proposals:m.sourcePatternsSuggested,
  autonomousEvmAdapters:0,evmExecutions:0}));
