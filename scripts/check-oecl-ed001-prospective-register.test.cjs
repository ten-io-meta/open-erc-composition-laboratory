"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const os=require("node:os");
const crypto=require("node:crypto");
const {build,expectedCohort,RULE}=require("./build-oecl-ed001-prospective-register.cjs");
const digest=x=>crypto.createHash("sha256").update(x).digest("hex");
const hash="d".repeat(64);
const cohort=expectedCohort();
assert.equal(cohort.remaining.length,35);

function synthetic(kindIndices=[]){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"oecl-ed001-control-"));
 function save(file,value){
   const bytes=Buffer.from(JSON.stringify(value,null,2)+"\n");
   fs.writeFileSync(path.join(root,file),bytes);
   return digest(bytes);
 }
 for(let shard=0;shard<3;shard++){
   const rows=[];
   const pairRecords=[];
   for(let index=0;index<cohort.remaining.length;index++){
     if(index%3!==shard)continue;
     const {a,b,key}=cohort.remaining[index];
     const sourceReportSha256=crypto.createHash("sha256").update(key).digest("hex");
     const hasHypothesis=kindIndices.includes(index);
     rows.push({sourceA:a,sourceB:b,
       status:"SOURCE_AST_COMPILED",reportSha256:sourceReportSha256,
       sourceUnitCount:2,hypotheses:hasHypothesis?1:0,
       scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
       evmExecuted:false,error:null});
     const d=hasHypothesis?[{
       hypothesisId:"AST-HYP-"+index.toString(16).padStart(24,"0"),
       kind:"POTENTIAL_COUPLED_STATE_DECREASE",
       status:"AUTOMATIC_SOURCE_RESEARCH_DESIGN_ONLY",
       experimentalOutcome:"NOT_OBSERVED",
       fullCompatibility:"NOT_EVALUATED",
       candidateAdmission:"NOT_ADMITTED",evmExecuted:false,
       experimentExecution:"NOT_SCHEDULED",
       adapter:"NOT_AVAILABLE_FOR_GENERAL_PAIR",
       sourceFinding:"Synthetic AST relation for preflight testing only",
       question:"Can the two synthetic state paths be compared safely?",
       falsificationDesign:"Check a counterexample without assuming both paths execute",
       alternateExplanations:["shared ancestor","generic EVM transaction"],
       sourceRevisions:[a,b].map(id=>({id,revision:"b".repeat(40),unit:"fake",sha256:hash})),
       targetStatePaths:[{participant:a,pathScreen:"NOT_PROVEN_EXECUTABLE"},
                         {participant:b,pathScreen:"NOT_PROVEN_EXECUTABLE"}]
     }]:[];
     pairRecords.push({sourcePair:key,sourceReportSha256,
       genericHypothesisArtifactSha256:hash,
       pathFeasibilityArtifactSha256:hash,
       hypothesisCount:d.length,designs:d,evmExperimentsExecuted:0,
       executableAdaptersBuilt:0,scientificVerdict:"INCONCLUSIVE",
       candidateAdmission:"NOT_ADMITTED"});
   }
   const matrix={
     schemaVersion:"OECL_REMAINING_PINNED_AST_PAIR_MATRIX_V1",
     evidenceLevel:"COMPILER_RESOLVED_SOURCE_ONLY",
     shard,allProfiles:10,existingRegressionPairs:10,remainingPairCount:35,
     attempted:rows.length,passed:rows.length,failed:0,results:rows
   };
   const matrixSha=save("oecl-new-pair-matrix-"+shard+".json",matrix);
   const baseline={
     schemaVersion:"OECL_BLIND_SOURCE_SCIENTIST_AUTONOMY_BASELINE_V1",
     benchmarkVersion:"v1-rule-bound",shard,originalMatrixSha256:matrixSha,
     inputCohort:"ALL_CURRENTLY_UNCONFIGURED_REGISTERED_PINNED_AST_PAIRS",
     researchAutonomyLevel:"RULE_BOUND_SOURCE_ONLY_QUESTION_GENERATION",
     scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
     candidateAdmission:"NOT_ADMITTED",evmExecuted:false,
     summary:{pairsAudited:pairRecords.length,sourcePatternsSuggested:
       pairRecords.reduce((a,p)=>a+p.designs.length,0),
       evmExperimentsExecuted:0,specificEvmAdaptersGeneratedAutonomously:0,
       independentTheoryConfirmations:0},
     pairs:pairRecords
   };
   save("oecl-blind-autonomy-baseline-"+shard+".json",baseline);
 }
 return {root,change(shard,file,mutate){
   const p=path.join(root,file+"-"+shard+".json");
   const raw=JSON.parse(fs.readFileSync(p,"utf8"));
   mutate(raw);save(file+"-"+shard+".json",raw);
 }};
}
function clean(f){
 const s=synthetic(f);
 return s;
}
function protect(s,fn){
 try{fn(s.root);}finally{fs.rmSync(s.root,{recursive:true,force:true});}
}
test("all 35 synthetic zero-pattern source pairs are retained, no false discovery",()=>{
 protect(clean([]),dir=>{
   const result=build(dir);
   assert.equal(result.corpus.possiblePairCount,45);
   assert.equal(result.summary.pairsAttempted,35);
   assert.equal(result.summary.pairsWithoutRuleMatch,35);
   assert.equal(result.summary.eligibleForHumanProtocolReview,0);
   assert.equal(result.nextQuestionForHumanProtocolReview,null);
   assert.equal(result.canAnnounceEmergence,false);
   assert.equal(result.evmExecuted,false);
   assert.equal(result.experimentAuthorized,false);
   assert.equal(result.verdict,"NO_EMERGENT_DISCOVERY_CLAIM");
   assert.deepEqual(result.pairInventory.map(p=>p.sourcePair).sort(),
     cohort.remaining.map(p=>p.key).sort());
 });
});
test("predeclared rule selects deterministic source question, not EVM result",()=>{
 protect(clean([0,1]),dir=>{
   const x=build(dir);
   assert.equal(x.summary.eligibleForHumanProtocolReview,2);
   assert.equal(x.summary.provenEmergentProperties,0);
   assert.equal(x.summary.verifiedAutonomousDiscoveries,0);
   assert.equal(x.reviewQueue.length,2);
   assert.equal(x.reviewQueue[0].discoveryLevel,
       "BOUNDED_AST_SOURCE_QUESTION_NOT_EMERGENT_PROPERTY");
   assert.equal(x.nextQuestionForHumanProtocolReview.sourcePair,
       [...x.reviewQueue].sort((a,b)=>a.sourcePair.localeCompare(b.sourcePair))[0].sourcePair);
   assert.equal(x.selectionRule.noPositiveExpectedOutcome,true);
   assert.equal(x.selectionRuleSha256,digest(JSON.stringify(RULE)));
   assert.deepEqual(build(dir),x);
 });
});
test("missing shard and mismatched matrix digest cannot pass",()=>{
 protect(clean([0]),dir=>{
   fs.unlinkSync(path.join(dir,"oecl-new-pair-matrix-2.json"));
   assert.throws(()=>build(dir));
 });
 protect(clean([0]),dir=>{
   const p=path.join(dir,"oecl-new-pair-matrix-0.json");
   fs.appendFileSync(p," ");
   assert.throws(()=>build(dir),/BLIND_SOURCE_SCOPE/);
 });
});
test("a duplicate, missing, unassigned or changed pair fails closed",()=>{
 protect(clean([0]),dir=>{
   const p=path.join(dir,"oecl-new-pair-matrix-0.json");
   const data=JSON.parse(fs.readFileSync(p,"utf8"));
   data.results[0].sourceB=data.results[1].sourceB;
   fs.writeFileSync(p,JSON.stringify(data));
   assert.throws(()=>build(dir));
 });
 protect(clean([0]),dir=>{
   const p=path.join(dir,"oecl-blind-autonomy-baseline-0.json");
   const data=JSON.parse(fs.readFileSync(p,"utf8"));
   data.pairs.shift();
   fs.writeFileSync(p,JSON.stringify(data));
   assert.throws(()=>build(dir));
 });
});
test("a manufactured confirmation or EVM execution is never accepted",()=>{
 protect(clean([0]),dir=>{
   const p=path.join(dir,"oecl-blind-autonomy-baseline-0.json");
   const data=JSON.parse(fs.readFileSync(p,"utf8"));
   data.pairs[0].designs[0].experimentalOutcome="CONFIRMED";
   fs.writeFileSync(p,JSON.stringify(data));
   assert.throws(()=>build(dir));
 });
 protect(clean([0]),dir=>{
   const p=path.join(dir,"oecl-new-pair-matrix-0.json");
   const data=JSON.parse(fs.readFileSync(p,"utf8"));
   data.results[0].evmExecuted=true;
   fs.writeFileSync(p,JSON.stringify(data));
   assert.throws(()=>build(dir));
 });
});
test("source-origin and cohort claims cannot be promoted",()=>{
 protect(clean([0]),dir=>{
   const p=path.join(dir,"oecl-blind-autonomy-baseline-0.json");
   const data=JSON.parse(fs.readFileSync(p,"utf8"));
   data.researchAutonomyLevel="UNCONSTRAINED_AI_DISCOVERY";
   fs.writeFileSync(p,JSON.stringify(data));
   assert.throws(()=>build(dir));
 });
 protect(clean([0]),dir=>{
   const p=path.join(dir,"oecl-new-pair-matrix-0.json");
   const data=JSON.parse(fs.readFileSync(p,"utf8"));
   data.remainingPairCount=34;
   fs.writeFileSync(p,JSON.stringify(data));
   assert.throws(()=>build(dir));
 });
});
console.log("OECL_ED001_SYNTHETIC_TEST_FIXTURES_ARE_NOT_EVM_OR_EMERGENCE_EVIDENCE");
