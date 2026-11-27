"use strict";
/**
 * OECL-ED-001: deterministic, source-only, prospective campaign register.
 *
 * The input is produced by OECL's existing ten-profile pinned compiler-AST
 * workflow, then verified by its existing blind-source regression. All 35
 * previously unconfigured pairs, including zero-pattern pairs, are retained.
 *
 * NOT EVM experimentation, discovery admission, independent receipt
 * authentication, an emergent-property claim or commercial certification.
 * No network, wallet, smart-contract execution, or untrusted sources here.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const sha256 = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const isHash = value => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const pairKey = (a,b) => [a,b].sort().join("|");
const RULE = Object.freeze({
  id:"OECL-ED-001-SOURCE-SCREEN-V1",
  cohort:"EVERY_PREVIOUSLY_UNCONFIGURED_PAIR_IN_THE_LOCKED_TEN_PROFILE_REGISTRY",
  enumeration:"REGISTRY_ORDER_I_LT_J_EXCLUDING_EXISTING_GENERIC_SOURCE_REGRESSIONS",
  shard:"PAIR_INDEX_MODULO_THREE",
  evidence:"COMPILER_AST_SOURCE_ONLY",
  hypothesisOrigin:"PREEXISTING_BOUNDED_AST_RULES_NOT_UNCONSTRAINED_AI",
  triage:"POTENTIAL_COUPLED_STATE_DECREASE_BEFORE_INHERITANCE",
  order:"LEXICOGRAPHIC_PAIR_KEY_THEN_HYPOTHESIS_ID_WITHIN_KIND",
  selection:"FIRST_SOURCE_STATE_DECREASE_HYPOTHESIS_IF_ANY_FOR_HUMAN_REVIEW",
  noPositiveExpectedOutcome:true,
  noEvmExperiment:true,
  noAutomaticEvmDispatch:true,
  noAutonomousDiscoveryCredit:true
});
const assumption = (p,msg) => assert.ok(p,"OECL_ED001_INVALID_OR_INCOMPLETE_SOURCE_EVIDENCE:"+msg);
function inputFile(filename,max=12*1024*1024){
  const bytes=fs.readFileSync(filename);
  assumption(bytes.byteLength>0 && bytes.byteLength<=max,"BOUNDED_INPUT_"+path.basename(filename));
  return {value:JSON.parse(bytes.toString("utf8")),digest:sha256(bytes)};
}
function expectedCohort(){
  const registryFile=path.resolve(__dirname,"../laboratory/scientific-open-source-worker/source-registry.json");
  const workflowFile=path.resolve(__dirname,"../.github/workflows/oecl-generic-source-lab.yml");
  const registry=inputFile(registryFile,30000);
  const ids=registry.value.sources.map(x=>x.id);
  assumption(registry.value.schemaVersion==="OECL_GENERIC_SOURCE_REGISTRY_V1","REGISTRY_SCHEMA");
  assumption(ids.length===10 && new Set(ids).size===10,"TEN_UNIQUE_PROFILE_REGISTRY");
  assumption(registry.value.openzeppelin?.version==="4.9.6","OPENZEPPELIN_LOCK_VERSION");
  assumption(registry.value.openzeppelin?.lockRevision===
    "c7eed906835ab39fbc8439eb0493e5a5371b23a2","OPENZEPPELIN_LOCK_REVISION");
  for(const x of registry.value.sources){
    assumption(typeof x.id==="string" && /^ERC-[A-Z0-9-]+$/.test(x.id),"PROFILE_ID");
    assumption(typeof x.contract==="string" && x.contract.length>0,"PROFILE_CONTRACT");
    if(x.kind==="github")
      assumption(/^[a-f0-9]{40}$/.test(x.revision)&&x.repository&&x.file,"GITHUB_SOURCE_PIN");
    else assumption(x.kind==="openzeppelin"&&x.file,"REGISTERED_OPENZEPPELIN_SOURCE");
  }
  const workflow=fs.readFileSync(workflowFile,"utf8");
  const configured=new Set();
  for(const m of workflow.matchAll(/run-generic-source-worker\.cjs\s+(ERC-[A-Z0-9-]+)\s+(ERC-[A-Z0-9-]+)\s+dependency-source\s+source-output\/pair-[a-z0-9-]+/g)){
    assumption(ids.includes(m[1])&&ids.includes(m[2]),"CONFIGURED_PAIR_OUTSIDE_REGISTRY");
    configured.add(pairKey(m[1],m[2]));
  }
  assumption(configured.size===10,"PINNED_10_PREVIOUSLY_CONFIGURED_PAIRS");
  const remaining=[];
  for(let i=0;i<ids.length;i++) for(let j=i+1;j<ids.length;j++){
    const key=pairKey(ids[i],ids[j]);
    if(!configured.has(key))remaining.push({a:ids[i],b:ids[j],key});
  }
  assumption(remaining.length===35 && configured.size+remaining.length===45,"COHORT_COVERAGE");
  return {registrySha256:registry.digest,ids,configured:[...configured].sort(),remaining};
}
function build(directory){
  const cohort=expectedCohort();
  const expected=new Map(cohort.remaining.map((p,i)=>[p.key,{...p,index:i}]));
  const seen=new Set(), pairs=[], hypotheses=[];
  const shardDigests=[];
  for(let shard=0;shard<3;shard++){
    const matrix=inputFile(path.join(directory,"oecl-new-pair-matrix-"+shard+".json"));
    const baseline=inputFile(path.join(directory,"oecl-blind-autonomy-baseline-"+shard+".json"));
    const m=matrix.value,b=baseline.value;
    assumption(m.schemaVersion==="OECL_REMAINING_PINNED_AST_PAIR_MATRIX_V1" &&
      m.evidenceLevel==="COMPILER_RESOLVED_SOURCE_ONLY" &&
      m.shard===shard && m.allProfiles===10 &&
      m.existingRegressionPairs===10 && m.remainingPairCount===35 &&
      m.failed===0 && m.passed===m.attempted &&
      Array.isArray(m.results)&&m.attempted===m.results.length,"MATRIX_SHARD_SCOPE_"+shard);
    assumption(b.schemaVersion==="OECL_BLIND_SOURCE_SCIENTIST_AUTONOMY_BASELINE_V1" &&
      b.benchmarkVersion==="v1-rule-bound" &&
      b.shard===shard && b.originalMatrixSha256===matrix.digest &&
      b.inputCohort==="ALL_CURRENTLY_UNCONFIGURED_REGISTERED_PINNED_AST_PAIRS" &&
      b.researchAutonomyLevel==="RULE_BOUND_SOURCE_ONLY_QUESTION_GENERATION" &&
      b.scientificVerdict==="INCONCLUSIVE" && b.compatibilityVerdict==="NOT_EVALUATED" &&
      b.candidateAdmission==="NOT_ADMITTED" && b.evmExecuted===false &&
      Array.isArray(b.pairs) && b.pairs.length===m.results.length &&
      b.summary?.pairsAudited===b.pairs.length &&
      b.summary?.sourcePatternsSuggested===
        b.pairs.reduce((n,p)=>n+p.designs.length,0) &&
      b.summary?.evmExperimentsExecuted===0 &&
      b.summary?.specificEvmAdaptersGeneratedAutonomously===0 &&
      b.summary?.independentTheoryConfirmations===0,"BLIND_SOURCE_SCOPE_"+shard);
    const covered=new Map(b.pairs.map(p=>[p.sourcePair,p]));
    assumption(covered.size===b.pairs.length,"DUPLICATE_BLIND_PAIRS");
    for(const row of m.results){
      const key=pairKey(row.sourceA,row.sourceB);
      const slot=expected.get(key);
      assumption(slot && slot.index%3===shard && row.sourceA===slot.a && row.sourceB===slot.b,
        "UNEXPECTED_OR_MISSHARDED_PAIR_"+key);
      assumption(!seen.has(key),"DUPLICATE_PAIR_"+key);
      seen.add(key);
      assumption(row.status==="SOURCE_AST_COMPILED" &&
        isHash(row.reportSha256) && Number.isSafeInteger(row.sourceUnitCount) &&
        row.sourceUnitCount>=2 && Number.isSafeInteger(row.hypotheses) &&
        row.hypotheses>=0 &&
        row.scientificVerdict==="INCONCLUSIVE" &&
        row.candidateAdmission==="NOT_ADMITTED" &&
        row.evmExecuted===false && row.error===null,"INVALID_PAIR_RESULT_"+key);
      const p=covered.get(key);
      assumption(p && p.sourceReportSha256===row.reportSha256 &&
        p.hypothesisCount===row.hypotheses &&
        p.hypothesisCount===p.designs.length &&
        p.evmExperimentsExecuted===0 &&
        p.executableAdaptersBuilt===0 &&
        p.scientificVerdict==="INCONCLUSIVE" &&
        p.candidateAdmission==="NOT_ADMITTED" &&
        isHash(p.genericHypothesisArtifactSha256) &&
        isHash(p.pathFeasibilityArtifactSha256),"BLIND_PAIR_MISMATCH_"+key);
      const patterns=[];
      for(const d of p.designs){
        assumption(["SHARED_STANDARD_INHERITANCE","POTENTIAL_COUPLED_STATE_DECREASE"].includes(d.kind) &&
          /^AST-HYP-[a-f0-9]{24}$/.test(d.hypothesisId) &&
          d.status==="AUTOMATIC_SOURCE_RESEARCH_DESIGN_ONLY" &&
          d.experimentalOutcome==="NOT_OBSERVED" &&
          d.fullCompatibility==="NOT_EVALUATED" &&
          d.candidateAdmission==="NOT_ADMITTED" &&
          d.evmExecuted===false &&
          d.experimentExecution==="NOT_SCHEDULED" &&
          d.adapter==="NOT_AVAILABLE_FOR_GENERAL_PAIR" &&
          typeof d.question==="string" && d.question.length>10 &&
          typeof d.falsificationDesign==="string" && d.falsificationDesign.length>10 &&
          Array.isArray(d.alternateExplanations) && d.alternateExplanations.length>=2 &&
          Array.isArray(d.sourceRevisions) && d.sourceRevisions.length===2 &&
          d.sourceRevisions.every(s=>s&&[slot.a,slot.b].includes(s.id) &&
            isHash(s.sha256) && typeof s.revision==="string" && s.revision.length>0),
          "UNSUPPORTED_OR_PROMOTED_SOURCE_HYPOTHESIS_"+key);
        if(d.kind==="POTENTIAL_COUPLED_STATE_DECREASE")
          assumption(Array.isArray(d.targetStatePaths)&&d.targetStatePaths.length===2,
            "MISSING_STATE_PATHS_"+key);
        patterns.push({hypothesisId:d.hypothesisId,kind:d.kind});
        hypotheses.push({
          sourcePair:key,hypothesisId:d.hypothesisId,kind:d.kind,
          sourceReportSha256:row.reportSha256,
          sourceHypothesisSha256:p.genericHypothesisArtifactSha256,
          sourceFeasibilitySha256:p.pathFeasibilityArtifactSha256,
          sourceRevisions:d.sourceRevisions,
          sourceFinding:d.sourceFinding,
          researchQuestion:d.question,
          prospectiveFalsificationQuestion:d.falsificationDesign,
          alternativeExplanations:d.alternateExplanations,
          sourcePathScreens:Array.isArray(d.targetStatePaths)?
            d.targetStatePaths.map(x=>({participant:x.participant,pathScreen:x.pathScreen})) : [],
          discoveryLevel:"BOUNDED_AST_SOURCE_QUESTION_NOT_EMERGENT_PROPERTY",
          experiment:"NOT_REGISTERED_OR_EXECUTED",
          sourceAdmission:"NOT_ADMITTED"
        });
      }
      assumption(new Set(patterns.map(p=>p.hypothesisId)).size===patterns.length,
        "DUPLICATE_HYPOTHESIS_"+key);
      pairs.push({sourcePair:key,sourceReportSha256:row.reportSha256,
        patternCount:patterns.length,patterns,
        result:patterns.length?"SOURCE_PATTERNS_PROPOSED":"NO_MATCH_IN_CURRENT_TWO_AST_RULE_FAMILIES",
        scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",evmExecuted:false});
    }
    shardDigests.push({shard,matrixSha256:matrix.digest,blindAutonomySha256:baseline.digest,
      pairsAudited:b.pairs.length,sourcePatternsSuggested:b.summary.sourcePatternsSuggested});
  }
  assumption(seen.size===35 && cohort.remaining.every(x=>seen.has(x.key)),"INCOMPLETE_COHORT");
  assumption(new Set(hypotheses.map(h=>h.hypothesisId+"|"+h.sourcePair)).size===hypotheses.length,
    "DUPLICATE_CROSS_SHARD_HYPOTHESIS");
  const priority=x=>x.kind==="POTENTIAL_COUPLED_STATE_DECREASE"?0:1;
  hypotheses.sort((a,b)=>priority(a)-priority(b)||
    a.sourcePair.localeCompare(b.sourcePair)||
    a.hypothesisId.localeCompare(b.hypothesisId));
  pairs.sort((a,b)=>a.sourcePair.localeCompare(b.sourcePair));
  const emergingQuestions=hypotheses.filter(x=>x.kind==="POTENTIAL_COUPLED_STATE_DECREASE");
  return {
    schemaVersion:"OECL_ED001_PROSPECTIVE_REGISTER_V1",
    scientificPhase:"EXPLORATORY_SOURCE_SCREEN_NOT_CONFIRMATORY_EXPERIMENT",
    selectionRule:RULE,
    selectionRuleSha256:sha256(JSON.stringify(RULE)),
    corpus:{registrySha256:cohort.registrySha256,
      profileCount:cohort.ids.length,
      possiblePairCount:45,previouslyConfiguredPairCount:cohort.configured.length,
      newlyExploredPairCount:pairs.length,
      previouslyConfiguredPairsNotReanalyzed:cohort.configured,
      note:"Ten registered profiles are not ten distinct ERC standards; ERC-20-BURNABLE is an extension."},
    shardDigests,
    summary:{pairsAttempted:pairs.length,pairsWithPatterns:pairs.filter(x=>x.patternCount>0).length,
      pairsWithoutRuleMatch:pairs.filter(x=>x.patternCount===0).length,
      sourceQuestions:hypotheses.length,
      potentialCoupledStateDecreaseQuestions:emergingQuestions.length,
      sharedInheritanceQuestions:hypotheses.length-emergingQuestions.length,
      eligibleForHumanProtocolReview:emergingQuestions.length,
      executedEvmExperiments:0,provenEmergentProperties:0,verifiedAutonomousDiscoveries:0},
    reviewQueue:emergingQuestions,
    otherSourceQuestions:hypotheses.filter(x=>x.kind!=="POTENTIAL_COUPLED_STATE_DECREASE"),
    nextQuestionForHumanProtocolReview:emergingQuestions[0]?
      {sourcePair:emergingQuestions[0].sourcePair,
       hypothesisId:emergingQuestions[0].hypothesisId,
       category:"NEEDS_SOURCE_SEMANTICS_REVIEW_NOT_AN_EXPERIMENT_ORDER"}:null,
    pairInventory:pairs,
    verdict:"NO_EMERGENT_DISCOVERY_CLAIM",
    candidateAdmission:"NOT_ADMITTED",
    compatibilityVerdict:"NOT_EVALUATED",
    evmExecuted:false,
    canAnnounceEmergence:false,
    experimentAuthorized:false,
    confirmatoryHypothesisPreregistered:false,
    independentlyAuthenticatedEvmReceipts:false,
    causalAblationsExecuted:false,
    processLimitations:[
      "Rules and selection were fixed before source-only CI results, but the two AST rule families were pre-existing; this does not demonstrate unconstrained autonomous invention.",
      "Scientific reviewer must verify standard semantics, units, roles, the claimed mechanism, novelty and applicability to deployed source code before a confirmatory preregistration.",
      "The ten previously configured pairs were excluded by the existing benchmark design; their results are not counted as newly explored here.",
      "No observations, EVM experiments, selective ablations, restoration, coordinator-only controls, or independent EVM replay are executed in this stage.",
      "A zero-pattern pair means no match in the finite AST rules; it is not proof of no emergent property or incompatibility.",
      "Any confirmatory EVM experiment requires an independently recorded, source-pinned protocol and safe reviewed adapter AFTER exploratory source generation and BEFORE empirical confirmation.",
      "No external untrusted contract compilation, arbitrary RPC, third-party funds, wallet or public dispatch is enabled."
    ]
  };
}
if(require.main===module){
  const dir=path.resolve(process.argv[2]||"source-output");
  const target=path.resolve(process.argv[3]||"oecl-ed001-source-register.json");
  const output=build(dir);
  fs.writeFileSync(target,JSON.stringify(output,null,2)+"\n");
  console.log("OECL_ED001_PROSPECTIVE_SOURCE_REGISTER",JSON.stringify({
    totalPairs:output.summary.pairsAttempted,
    emptyPairs:output.summary.pairsWithoutRuleMatch,
    hypotheses:output.summary.sourceQuestions,
    humanReviewQueue:output.summary.eligibleForHumanProtocolReview,
    next:output.nextQuestionForHumanProtocolReview,
    scientificVerdict:output.verdict,evmExecuted:output.evmExecuted
  }));
}
module.exports={build,expectedCohort,RULE};
