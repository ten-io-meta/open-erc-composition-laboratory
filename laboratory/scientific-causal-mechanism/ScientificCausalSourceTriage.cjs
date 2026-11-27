"use strict";
/**
 * OECL-ED-001 source-level causal screening of real pinned compiler-AST
 * artifacts. Deliberately cannot verify runtime contract identity, causal
 * effects, or EVM experiments; will NEVER admit an emergent property.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const pairKey=(a,b)=>[a,b].sort().join("|");
function load(filename){const bytes=fs.readFileSync(filename);assert(bytes.length>0 && bytes.length<6*1024*1024,"BOUNDED_SOURCE_ARTIFACT");return {value:JSON.parse(bytes.toString("utf8")),rawSha256:sha(bytes)};}
function check(condition,code){assert.ok(condition,"OECL_ED001_CAUSAL_SOURCE_INVALID:"+code);}
function classifyHypothesis(h,graph,sourceDoc,feasibility,sourcePair){
  check(h?.hypothesisId && /^AST-HYP-[0-9a-f]{24}$/.test(h.hypothesisId),"HYPOTHESIS_ID");
  check(h.status==="SOURCE_ONLY_UNEVALUATED" && h.candidateAdmission==="NOT_ADMITTED" && h.scientificVerdict==="INCONCLUSIVE","HYPOTHESIS_NOT_UNEVALUATED");
  const ids=sourcePair.split("|");
  check(h.evidence?.length===2 && h.evidence.every(e=>ids.includes(e.participant)) &&
    new Set(h.evidence.map(e=>e.participant)).size===2,"EXACT_PARTICIPANTS");
  const graphSources=new Map(graph.sources.map(s=>[s.unit,s.sha256]));
  const checkSource=(unit,hash)=>check(graphSources.get(unit)===hash,"SOURCE_UNIT_DIGEST_MISMATCH");
  const screen=feasibility.hypotheses.find(x=>x.hypothesisId===h.hypothesisId);
  check(screen && screen.kind===h.kind,"SOURCE_FEASIBILITY_NOT_BOUND");
  let category,paths=[],sharedDefinition=false,balancedWrites=0;
  if(h.kind==="SHARED_STANDARD_INHERITANCE"){
    check(Array.isArray(h.bases) && h.bases.length>0,"MISSING_SHARED_BASE");
    check(h.evidence.every(e=>{
      checkSource(e.sourceUnit,e.sourceSha256);
      const p=sourceDoc.primarySources.find(p=>p.id===e.participant);
      return p && p.sourceUnit===e.sourceUnit && p.sourceSha256===e.sourceSha256 &&
        h.bases.some(b=>p.inheritedContractNames.includes(b));
    }),"INHERITED_BASE_NOT_SOURCE_ANCHORED");
    category="SHARED_IMPLEMENTATION_ANCESTRY_ONLY";
  }else if(h.kind==="POTENTIAL_COUPLED_STATE_DECREASE"){
    check(["NOT_PROVEN_EXECUTABLE","AT_LEAST_ONE_MODELED_PATH_BLOCKED",
      "NO_EXECUTABLE_ROUTE_SPECIFIED"].includes(screen.pathScreen),"UNSUPPORTED_EXECUTION_PROMOTION");
    for(const e of h.evidence){
      const entry=e.publicEntrypoint,write=e.stateDecrease;
      check(entry && write && Array.isArray(e.callPath) && e.callPath.length>=1 && e.callPath.length<32,"MISSING_CALLPATH");
      checkSource(entry.unit,entry.sourceSha256);checkSource(write.unit,write.sourceSha256);
      const p=sourceDoc.primarySources.find(p=>p.id===e.participant);
      check(Boolean(p),"UNBOUND_PRIMARY_FUNCTION");
      const contract=graph.contracts.find(x=>x.name===p.primaryContract && x.unit===p.sourceUnit);
      check(contract && Array.isArray(contract.linearizedBaseContracts),"PRIMARY_CONTRACT_NOT_COMPILER_BOUND");
      const origin=graph.functions.find(x=>x.id===e.callPath[0]);
      check(origin && contract.linearizedBaseContracts.includes(origin.contractId) && origin.name===entry.name && origin.unit===entry.unit && origin.location.line===entry.location.line,"ENTRYPOINT_NOT_COMPILER_BOUND");
      for(let i=1;i<e.callPath.length;i++)
        check(graph.edges.some(x=>x.kind==="CALLS" && x.from===e.callPath[i-1] && x.to===e.callPath[i]),"BROKEN_COMPILER_CALL_PATH");
      const end=e.callPath[e.callPath.length-1];
      const decrement=graph.writes.find(x=>x.owner===end && x.state===write.state && x.kind==="DECREASE" &&
        x.location.unit===write.unit && x.location.line===write.location.line);
      check(Boolean(decrement),"DECREASE_NOT_COMPILER_BOUND");
      const matchingIncrease=graph.writes.filter(x=>x.owner===end && x.stateId===decrement.stateId && x.kind==="INCREASE");
      if(matchingIncrease.length)balancedWrites++;
      paths.push({participant:e.participant,entrypoint:entry.name,
        entrySourceUnit:entry.unit,entrySourceSha256:entry.sourceSha256,
        stateVariable:write.state,writeSourceUnit:write.unit,
        writeSourceSha256:write.sourceSha256,writeLine:write.location.line,
        internalCallPath:e.callPath,sourceOnlyPathStatus:"NOT_PROVEN_EXECUTABLE",
        hasMatchingStateIncreaseInSameFunction:matchingIncrease.length>0,
        stateEffectMeaning:"NEEDS_UNITS_AND_ROLES_REVIEW"});
    }
    check(paths.length===2 && new Set(paths.map(p=>p.participant)).size===2,"STATE_PATH_ROLE_DUPLICATE");
    sharedDefinition=paths[0].stateVariable===paths[1].stateVariable &&
      paths[0].writeSourceUnit===paths[1].writeSourceUnit &&
      paths[0].writeSourceSha256===paths[1].writeSourceSha256;
    category=balancedWrites>0?"OFFSETTING_BALANCE_WRITE_PATH_NOT_SUPPLY_BURN":
      sharedDefinition?"SAME_SOURCE_DEFINITION_NOT_SHARED_RUNTIME_STORAGE":
      "SEPARATE_STATE_DECREASE_PATHS_WITHOUT_BOUND_CROSS_CALL";
  }else throw Error("OECL_ED001_CAUSAL_SOURCE_UNREVIEWED_KIND");
  return {
    hypothesisId:h.hypothesisId,sourcePair,kind:h.kind,
    mechanismCategory:category,paths,
    inheritedBases:h.kind==="SHARED_STANDARD_INHERITANCE"?h.bases:[],
    identicalSourceWriteDefinition:sharedDefinition,
    participantWithOffsettingStateWrites:balancedWrites,
    unresolvedLowLevelOrLibraryCalls:graph.externalCalls.length,
    sourceInterpretation:"COMPILER_AST_STRUCTURAL_OBSERVATION_ONLY",
    independentlyBoundCrossParticipantCall:"NOT_ESTABLISHED",
    crossParticipantCausalMechanism:"NOT_ESTABLISHED",
    propertyEmergence:"NOT_DEMONSTRATED",
    causalEvidenceStatus:"MISSING_RUNTIME_BINDING_ROLE_UNIT_AND_COUNTERFACTUAL",
    canProceedToEvm:false,
    priority:"HUMAN_SEMANTIC_DEPENDENCY_REVIEW_REQUIRED",
    proposedExperiments:h.kind==="POTENTIAL_COUPLED_STATE_DECREASE"?[
      "Map physical runtime contracts, ABI, caller permissions, asset/share units and relevant state holders",
      "State an exact candidate joint property and counterexample before confirmation",
      "Test role- and unit-matched isolated A and isolated B controls",
      "Test co-deployment with interaction disabled against active composition",
      "Selectively ablate only the proposed cross-protocol edge and, if feasible, restore it",
      "Control for generic EVM atomicity and an ordinary coordinator-only implementation",
      "Preregister adversarial cases and independent receipt/proof reconstruction"
    ]:["Compare inherited behavior under matching roles without assuming two contracts interact"],
    hypotheticalExperimentExecution:"NOT_AUTHORIZED",
    existingVerdictsChanged:false
  };
}
function audit(directory,registered){
  check(registered?.schemaVersion==="OECL_ED001_PROSPECTIVE_REGISTER_V1" && registered?.scientificPhase==="EXPLORATORY_SOURCE_SCREEN_NOT_CONFIRMATORY_EXPERIMENT" &&
    registered?.selectionRule?.id==="OECL-ED-001-SOURCE-SCREEN-V1" && registered?.summary?.pairsAttempted===35 &&
    registered?.summary?.sourceQuestions===13 && registered?.summary?.provenEmergentProperties===0 &&
    registered?.evmExecuted===false && registered?.canAnnounceEmergence===false,"INVALID_CAMPAIGN_BOUNDARY");
  const selected=[...registered.reviewQueue,...registered.otherSourceQuestions];
  check(selected.length===13 && new Set(selected.map(h=>h.hypothesisId)).size===13,"REGISTERED_HYPOTHESES_INCOMPLETE");
  const pairInventory=new Map(registered.pairInventory.map(p=>[p.sourcePair,p]));
  const seen=new Set();const findings=[];
  for(const h of selected){
    const key=h.sourcePair;
    check(pairInventory.has(key) && pairInventory.get(key).patterns.some(x=>x.hypothesisId===h.hypothesisId && x.kind===h.kind),"PAIR_HYPOTHESIS_NOT_REGISTERED");
    const ids=key.split("|");
    check(ids.length===2 && pairKey(...ids)===key,"NONCANONICAL_PAIR");
    const first=path.join(directory,"matrix-"+ids[0]+"-"+ids[1]);
    const second=path.join(directory,"matrix-"+ids[1]+"-"+ids[0]);
    const folder=fs.existsSync(path.join(first,"structural-ast-graph.json"))?first:second;
    const report=load(path.join(folder,"source-scientific-report.json"));
    const hypothesis=load(path.join(folder,"generic-source-hypotheses.json"));
    const feasibility=load(path.join(folder,"path-feasibility.json"));
    const graph=load(path.join(folder,"structural-ast-graph.json"));
    check(report.rawSha256===h.sourceReportSha256 && hypothesis.rawSha256===h.sourceHypothesisSha256 &&
      feasibility.rawSha256===h.sourceFeasibilitySha256,"SOURCE_INPUTS_DONT_MATCH_FROZEN_REGISTER");
    const r=report.value,d=hypothesis.value,f=feasibility.value,g=graph.value;
    check(r.schemaVersion==="OECL_OPEN_GENERIC_AST_RESULT_V1" && r.sourceOnly===true && r.evmExecuted===false &&
      r.scientificVerdict==="INCONCLUSIVE" && r.candidateAdmission==="NOT_ADMITTED" &&
      r.graphSha256===sha(JSON.stringify(g)) &&
      r.hypothesisArtifactSha256===sha(JSON.stringify(d)) &&
      r.pathFeasibilityArtifactSha256===sha(JSON.stringify(f)),"COMPILER_ARTIFACT_LINEAGE");
    check(g.schemaVersion==="OECL_SOLIDITY_COMPILER_AST_GRAPH_V1" && d.schemaVersion==="OECL_GENERIC_AST_HYPOTHESES_V1" &&
      f.schemaVersion==="OECL_AST_PATH_FEASIBILITY_V1" && d.sourceGraphSha256===r.graphSha256 &&
      f.sourceGraphSha256===r.graphSha256 && f.discoverySha256===r.hypothesisArtifactSha256 &&
      Array.isArray(g.functions) && Array.isArray(g.edges) && Array.isArray(g.writes) && Array.isArray(g.externalCalls) &&
      Array.isArray(g.contracts) && Array.isArray(d.primarySources) && d.hypotheses.length===r.counts.hypotheses,"SOURCE_GRAPH_SCHEMA_AND_BINDINGS");
    check(pairKey(...r.selected.map(x=>x.id))===key,"SOURCE_PAIR_NOT_SELECTED");
    const target=d.hypotheses.find(x=>x.hypothesisId===h.hypothesisId);
    check(target && target.kind===h.kind,"MACHINE_HYPOTHESIS_NOT_FOUND");
    const uid=key+"|"+h.hypothesisId;
    check(!seen.has(uid),"DUPLICATE_FINDING");seen.add(uid);
    findings.push({...classifyHypothesis(target,g,d,f,key),
      sourceEvidence:{reportSha256:report.rawSha256,graphSha256:sha(JSON.stringify(g)),
        hypothesisSha256:hypothesis.rawSha256,feasibilitySha256:feasibility.rawSha256}});
  }
  const categories={};for(const x of findings)categories[x.mechanismCategory]=(categories[x.mechanismCategory]||0)+1;
  return {
    schemaVersion:"OECL_ED001_CAUSAL_SOURCE_TRIAGE_V1",
    scientificScope:"INDEPENDENT_SOURCE_ONLY_CAUSAL_GAP_ANALYSIS_NOT_CAUSAL_PROOF",
    sourceScreenRuleSha256:registered.selectionRuleSha256,
    reviewedHypotheses:findings.length,sourcePairs:registered.summary.pairsAttempted,
    categories,findings,
    researchConclusion:"NO_CROSS_PARTICIPANT_CAUSAL_LINK_ESTABLISHED_BY_THIS_AST_CORPUS",
    candidateAdmission:"NOT_ADMITTED",emergentPropertyDemonstrated:false,
    evmExperimentExecuted:false,evmExecutionAuthorized:false,
    sourceInputClaim:"VERIFY_ARCHIVED_ARTIFACT_DIGESTS_ONLY_NOT_EXTERNAL_SOURCE_BYTES_OR_RUNTIME",
    limitations:[
      "Matched Solidity identifiers and shared source bytes do not imply shared storage across deployments",
      "Same-function offsetting writes suggest transfer-like bookkeeping; runtime conservation remains unproven",
      "Compiler-resolved internal call paths do not prove successful execution under guards or dynamic dispatch",
      "Low-level/library calls in the combined compiler graph are not evidence of a call from participant A to deployed participant B",
      "No ERC-specific emergent mechanism, asset unit equivalence, external ABI binding, runtime target, ablation, independent EVM witness or novelty proof has been established",
      "Failure to find causal evidence in this finite source-only screen is not proof that no emergent property exists"
    ]
  };
}
module.exports={audit,classifyHypothesis};
if(require.main===module){
 const dir=process.argv[2],registerPath=process.argv[3],output=process.argv[4];
 assert(dir&&registerPath&&output,"USAGE: ScientificCausalSourceTriage <source-output> <prospective-register> <output>");
 const r=audit(path.resolve(dir),load(path.resolve(registerPath)).value);
 fs.writeFileSync(path.resolve(output),JSON.stringify(r,null,2)+"\n");
 console.log("OECL_ED001_CAUSAL_SOURCE_TRIAGE",JSON.stringify({reviewed:r.reviewedHypotheses,categories:r.categories,conclusion:r.researchConclusion,evm:r.evmExperimentExecuted}));
}
