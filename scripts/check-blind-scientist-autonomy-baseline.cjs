"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const sha256=x=>crypto.createHash("sha256").update(x).digest("hex");
const jsonSha=x=>sha256(Buffer.from(JSON.stringify(x)));
const shard=Number(process.argv[2]);
assert(Number.isInteger(shard)&&shard>=0&&shard<=2);
const root=path.resolve(process.argv[3]||"source-output");
const shardFile=path.join(root,"oecl-new-pair-matrix-"+shard+".json");
const rawMatrix=fs.readFileSync(shardFile);
const matrix=JSON.parse(rawMatrix.toString("utf8"));
assert.equal(matrix.schemaVersion,"OECL_REMAINING_PINNED_AST_PAIR_MATRIX_V1");
assert.equal(matrix.evidenceLevel,"COMPILER_RESOLVED_SOURCE_ONLY");
assert.equal(matrix.shard,shard);
assert.equal(matrix.allProfiles,10);
assert.equal(matrix.passed,matrix.attempted);
assert.equal(matrix.failed,0);
assert.equal(matrix.results.length,matrix.attempted);
assert.equal(matrix.remainingPairCount,35);
const allowedHypothesisTypes=new Set([
 "SHARED_STANDARD_INHERITANCE","POTENTIAL_COUPLED_STATE_DECREASE"
]);
const sourceId=x=>typeof x==="string"&&/^ERC-[A-Z0-9-]+$/.test(x);
const isSha=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
function validateArtifacts(report,graph,discovery,feasibility,expected){
 assert.equal(report.schemaVersion,"OECL_OPEN_GENERIC_AST_RESULT_V1");
 assert.equal(graph.schemaVersion,"OECL_SOLIDITY_COMPILER_AST_GRAPH_V1");
 assert.equal(discovery.schemaVersion,"OECL_GENERIC_AST_HYPOTHESES_V1");
 assert.equal(feasibility.schemaVersion,"OECL_AST_PATH_FEASIBILITY_V1");
 assert.equal(report.sourceOnly,true);
 assert.equal(report.evmExecuted,false);
 assert.equal(report.scientificVerdict,"INCONCLUSIVE");
 assert.equal(report.candidateAdmission,"NOT_ADMITTED");
 assert.equal(discovery.verdict,"INCONCLUSIVE");
 assert.equal(discovery.candidateAdmission,"NOT_ADMITTED");
 assert.equal(feasibility.evmExecuted,false);
 assert.equal(feasibility.candidateAdmission,"NOT_ADMITTED");
 assert.deepEqual(discovery.errors,[]);
 assert.deepEqual(report.selected.map(x=>x.id),expected);
 assert.equal(report.selected.length,2);
 assert.equal(new Set(report.selected.map(x=>x.id)).size,2);
 assert(report.selected.every(x=>isSha(x.sourceSha256)));
 assert.equal(report.graphSha256,jsonSha(graph));
 assert.equal(report.hypothesisArtifactSha256,jsonSha(discovery));
 assert.equal(report.pathFeasibilityArtifactSha256,jsonSha(feasibility));
 assert.equal(discovery.sourceGraphSha256,jsonSha(graph));
 assert.equal(feasibility.sourceGraphSha256,jsonSha(graph));
 assert.equal(feasibility.discoverySha256,jsonSha(discovery));
 assert.deepEqual(report.hypotheses,discovery.hypotheses);
 assert.equal(report.counts.hypotheses,discovery.hypotheses.length);
 assert.equal(feasibility.hypotheses.length,discovery.hypotheses.length);
 assert(Array.isArray(graph.sources)&&graph.sources.every(x=>isSha(x.sha256)));
 assert(Array.isArray(graph.edges)&&Array.isArray(graph.writes));
 const ids=new Set(discovery.hypotheses.map(h=>h.hypothesisId));
 assert.equal(ids.size,discovery.hypotheses.length);
 for(const h of discovery.hypotheses){
   assert(allowedHypothesisTypes.has(h.kind),"Unreviewed hypothesis kind");
   assert(/^AST-HYP-[a-f0-9]{24}$/.test(h.hypothesisId));
   assert.equal(h.status,"SOURCE_ONLY_UNEVALUATED");
   assert.equal(h.candidateAdmission,"NOT_ADMITTED");
   assert.equal(h.scientificVerdict,"INCONCLUSIVE");
   assert.equal(h.evidence?.length,2);
   const sourceUnits=new Set(graph.sources.map(x=>x.unit));
   assert(h.evidence.every(x=>isSha(x.sourceSha256||x.publicEntrypoint?.sourceSha256)));
   if(h.kind==="POTENTIAL_COUPLED_STATE_DECREASE"){
     for(const e of h.evidence){
       assert(sourceId(e.participant));
       assert(typeof e.publicEntrypoint?.name==="string"&&e.publicEntrypoint.name);
       assert(typeof e.stateDecrease?.state==="string"&&e.stateDecrease.state);
       assert(isSha(e.publicEntrypoint.sourceSha256));
       assert(isSha(e.stateDecrease.sourceSha256));
       assert(sourceUnits.has(e.publicEntrypoint.unit));
       assert(sourceUnits.has(e.stateDecrease.unit));
       assert(Array.isArray(e.callPath)&&e.callPath.length>0&&e.callPath.length<=20);
     }
   }
   const feasibilityEntry=feasibility.hypotheses.find(p=>p.hypothesisId===h.hypothesisId);
   assert(feasibilityEntry&&feasibilityEntry.kind===h.kind);
   assert(["NOT_PROVEN_EXECUTABLE","AT_LEAST_ONE_MODELED_PATH_BLOCKED",
     "NO_EXECUTABLE_ROUTE_SPECIFIED"].includes(feasibilityEntry.pathScreen));
 }
 return true;
}
function design(h,feasibility,sourceRevisions){
 const found=feasibility.hypotheses.find(p=>p.hypothesisId===h.hypothesisId);
 const base={
  hypothesisId:h.hypothesisId,kind:h.kind,
  sourceFinding:h.finding,
  sourceEvidenceIds:h.evidence.map(e=>e.participant),
  status:"AUTOMATIC_SOURCE_RESEARCH_DESIGN_ONLY",
  experimentalOutcome:"NOT_OBSERVED",
  fullCompatibility:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  evmExecuted:false,
  noHypothesisSelfConfirmation:true,
  alternateExplanations:[
   "Shared implementation ancestry does not entail equal permissions or semantics",
   "An AST call path can be blocked by a modifier, guard or unavailable environmental state",
   "The two contracts may act on distinct units and state variables, not a shared atomic operation"
  ],
  independentConfirmationNeeded:[
   "A source-identified, deployable immutable implementation for each role",
   "Pre-registered role, selector, transaction preconditions and test quantities",
   "Positive and falsifying EVM controls with independently authenticated local-provider receipts"
  ],
  sourceRevisions,
  adapter:"NOT_AVAILABLE_FOR_GENERAL_PAIR",
  experimentExecution:"NOT_SCHEDULED"
 };
 if(h.kind==="SHARED_STANDARD_INHERITANCE"){
  return {...base,question:"Do two pinned implementations that share an inherited ERC base actually honor the same behavioral invariant under equivalent roles?",
   claimedGeneralization:"SHARED_INHERITANCE_IMPLIES_INTEROPERABILITY",
   falsificationDesign:"Pin a common full ABI and compare state transitions and authorization under equivalent roles; any contradictory role-matched behavior defeats the generalization.",
   testMode:"REQUIRES_INDEPENDENT_CONFORMANCE_ORACLE",
   targetStatePaths:[],blockedPathNotes:["NO_EXECUTABLE_ROUTE_SPECIFIED"],
   resultInterpretation:"SOURCE_INHERITANCE_OBSERVED_NOT_COMPATIBILITY_PROVEN"};
 }
 assert.equal(h.kind,"POTENTIAL_COUPLED_STATE_DECREASE");
 const cases=h.evidence.map((e,i)=>{
  const scope=found.participants?.find(p=>p.participant===e.participant);
  assert(scope);
  return {participant:e.participant,entrypoint:e.publicEntrypoint.name,
    stateVariable:e.stateDecrease.state,entrypointSourceSha256:e.publicEntrypoint.sourceSha256,
    stateWriteSourceSha256:e.stateDecrease.sourceSha256,
    sourceCallPath:e.callPath,
    pathScreen:scope.pathScreen,
    guardsAndUnknowns:(scope.flags||[]).slice(0,40),
    counterexampleQuestion:"Can the pinned AST-referenced entrypoint execute successfully without decreasing its named state, or is the apparent path blocked by its preconditions?",
    proposedControls:[
     "Authorized positive action only after ABI, role and amount types are verified",
     "Non-authorized and unsatisfied-precondition call, without treating a revert as a counterexample to successful execution",
     "Control with matched state variables and units; fail closed if common state cannot be established"
    ],
    empiricalFalsifier:"A verified successful same-scope operation that does not produce the claimed decrease falsifies only the overly broad successful-decrease prediction"
  };
 });
 return {...base,question:"Are both compiler-observed state-decrease routes actually executable and comparable, without assuming atomic coupling?",
  claimedGeneralization:"TWO_AST_DECREASE_PATHS_IMPLY_ATOMIC_COMPOSABILITY",
  falsificationDesign:"Probe each pinned route independently, then only if both match roles and units design a separate atomic rollback/hostile-callback experiment.",
  targetStatePaths:cases,
  testMode:"REQUIRES_PAIR_ADAPTER_AND_EVM",
  blockedPathNotes:cases.map(x=>x.pathScreen),
  resultInterpretation:"TWO_STRUCTURAL_STATE_PATHS_OBSERVED_NOT_EXECUTABILITY_OR_ATOMICITY_PROVEN"};
}
const outputPairs=[],seenPairs=new Set();
for(const row of matrix.results){
 assert.equal(row.status,"SOURCE_AST_COMPILED");
 assert.equal(row.scientificVerdict,"INCONCLUSIVE");
 assert.equal(row.candidateAdmission,"NOT_ADMITTED");
 assert.equal(row.evmExecuted,false);
 assert(sourceId(row.sourceA)&&sourceId(row.sourceB)&&row.sourceA!==row.sourceB);
 assert(isSha(row.reportSha256));
 const key=[row.sourceA,row.sourceB].sort().join("|");
 assert(!seenPairs.has(key),"Duplicate held-out source pair");
 seenPairs.add(key);
 const dir=path.join(root,"matrix-"+row.sourceA+"-"+row.sourceB);
 const load=(name)=>{
  const p=path.join(dir,name+".json");
  const bytes=fs.readFileSync(p);
  assert(bytes.length<5*1024*1024,"Artifact exceeds bounded budget");
  return {bytes,value:JSON.parse(bytes.toString("utf8"))};
 };
 const r=load("source-scientific-report"),g=load("structural-ast-graph");
 const d=load("generic-source-hypotheses"),f=load("path-feasibility");
 assert.equal(sha256(r.bytes),row.reportSha256,"Source profile artifact digest mismatch");
 validateArtifacts(r.value,g.value,d.value,f.value,[row.sourceA,row.sourceB]);
 const sourceRevisions=r.value.selected.map(x=>({id:x.id,revision:x.revision,
  unit:x.sourceUnit,sha256:x.sourceSha256}));
 const suggestions=d.value.hypotheses.map(h=>design(h,f.value,sourceRevisions));
 assert(suggestions.every(x=>x.evmExecuted===false&&x.experimentExecution==="NOT_SCHEDULED"));
 outputPairs.push({sourcePair:key,
   sourceReportSha256:row.reportSha256,
   genericHypothesisArtifactSha256:sha256(d.bytes),
   pathFeasibilityArtifactSha256:sha256(f.bytes),
   hypothesisCount:suggestions.length,
   sourceOnlyStatus:suggestions.length?"MECHANICAL_AST_HYPOTHESES_PROPOSED":
     "NO_SUPPORTED_SOURCE_HYPOTHESIS",
   designs:suggestions,
   executableAdaptersBuilt:0,evmExperimentsExecuted:0,
   scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED"});
}
const discovered=outputPairs.flatMap(x=>x.designs);
const report={
 schemaVersion:"OECL_BLIND_SOURCE_SCIENTIST_AUTONOMY_BASELINE_V1",
 benchmarkVersion:"v1-rule-bound",
 shard,
 originalMatrixSha256:sha256(rawMatrix),
 inputCohort:"ALL_CURRENTLY_UNCONFIGURED_REGISTERED_PINNED_AST_PAIRS",
 selectionRule:"Registry pair enumeration minus already configured source regressions, index modulo 3; no cherry-picking by hypothesis outcome",
 summary:{
  pairsAudited:outputPairs.length,
  sourcePatternsSuggested:discovered.length,
  pairsWithAtLeastOnePattern:outputPairs.filter(x=>x.hypothesisCount>0).length,
  pairsWithoutPattern:outputPairs.filter(x=>x.hypothesisCount===0).length,
  inheritancePatterns:discovered.filter(x=>x.kind==="SHARED_STANDARD_INHERITANCE").length,
  stateDecreasePatterns:discovered.filter(x=>x.kind==="POTENTIAL_COUPLED_STATE_DECREASE").length,
  researchQuestionsProposed:discovered.length,
  specificEvmAdaptersGeneratedAutonomously:0,
  evmExperimentsExecuted:0,independentTheoryConfirmations:0
 },
 researchAutonomyLevel:"RULE_BOUND_SOURCE_ONLY_QUESTION_GENERATION",
 scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
 candidateAdmission:"NOT_ADMITTED",evmExecuted:false,pairs:outputPairs,
 limitations:[
  "No ERC-specific expected answer, held-out EVM receipt or pair adapter was supplied to this benchmark.",
  "All hypotheses come from exactly two existing AST patterns and finite deterministic rule templates; this is NOT an autonomous general scientist.",
  "A zero-pattern pair is an unknown finding rather than negative compatibility evidence.",
  "No executable experiment is synthesized; proposed controls need human validation of ABI, roles, test units and a safe local EVM adapter.",
  "This cohort of pinned Solidity profiles does not stand for the complete 626-ERC documentary snapshot."
 ]
};
const target=path.join(root,"oecl-blind-autonomy-baseline-"+shard+".json");
fs.writeFileSync(target,JSON.stringify(report,null,2)+"\n");
console.log("OECL_BLIND_AST_SCIENTIST_AUTONOMY_BASELINE_PASS",JSON.stringify(report.summary));
