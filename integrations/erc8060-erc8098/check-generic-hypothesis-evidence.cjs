"use strict";
/**
 * Evaluates a source-only generic hypothesis against the separately built
 * local-EVM recognition report; only an explicitly scoped observation can
 * be accepted. Scientific candidate admission remains blocked.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const crypto=require("node:crypto");
const [hypothesisPath,observationPath,outputPath]=process.argv.slice(2);
assert.ok(hypothesisPath&&observationPath&&outputPath,
  "Usage: node check-generic-hypothesis-evidence.cjs <source-hypothesis.json> <observations.json> <out.json>");
const rawA=fs.readFileSync(hypothesisPath), rawB=fs.readFileSync(observationPath);
const h=JSON.parse(rawA),w=JSON.parse(rawB);
const {discover}=require("../../laboratory/scientific-behavioral-complementarity/GenericBehavioralEffectMatcher.cjs");
const hex64=x=>typeof x==="string"&&/^[a-f0-9]{64}$/i.test(x);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function bindingMatches(source,observation,hypothesis) {
  const binding=observation.property?.sourceBinding;
  const normalized=source.normalizedParticipants;
  if(source.schemaVersion!=="OECL_GENERIC_SOURCE_EFFECT_DISCOVERY_V1"||
     !Array.isArray(normalized)||normalized.length!==2||
     !binding||binding.origin!=="PINNED_SOURCE_LINEAGE_AND_LOCAL_EVM_RECEIPT"||
     binding.chainId!==31337||
     binding.witnessTransaction!==observation.property.witnessTransaction||
     !hex64(binding.successEvidenceSha256)||
     !Array.isArray(binding.participants)||binding.participants.length!==2||
     !Array.isArray(binding.inheritedDependencies))return false;
  // Re-run the actual matching algorithm rather than trusting a reported ID,
  // provenance array, role mapping or candidate label in the JSON artifact.
  const derived=discover({participants:normalized});
  if(derived.errors.length||derived.hypotheses.length!==1||
     !same(derived.hypotheses[0],hypothesis))return false;
  const expected=hypothesis.participants;
  if(expected.length!==2)return false;
  const paired=new Set();
  for(const p of expected) {
    const records=normalized.filter(n=>
      n.sourceId===p.sourceId && n.revision===p.revision &&
      n.assetClass===p.assetClass);
    const bound=binding.participants.filter(n=>
      n.sourceId===p.sourceId && n.revision===p.revision &&
      n.assetClass===p.assetClass);
    if(records.length!==1||bound.length!==1||!hex64(bound[0].sourceSha256))
      return false;
    paired.add(p.sourceId+"@"+p.revision);
    const provenance=records[0].provenance;
    if(!Array.isArray(provenance)||!provenance.length)return false;
    const primary=provenance.filter(x=>x.sourceId===p.sourceId);
    if(!primary.length||primary.some(x=>
      x.sourceRevision!==p.revision ||
      x.sourceSha256!==bound[0].sourceSha256))return false;
    for(const fact of provenance.filter(x=>x.sourceId!==p.sourceId)) {
      const dependency=binding.inheritedDependencies.filter(x=>
        x.sourceId===fact.sourceId &&
        x.sourceRevision===fact.sourceRevision &&
        x.sourceSha256===fact.sourceSha256 &&
        x.attributedParticipantId===p.sourceId &&
        hex64(x.sourceSha256) && !!x.packageIntegrity);
      if(dependency.length!==1)return false;
    }
  }
  if(paired.size!==2 ||
     binding.participants.some(x=>
       !paired.has(x.sourceId+"@"+x.revision)) ||
     // The only inherited behavior invoked in this EVM recipe comes from
     // the pinned, lockfile-verified ERC20Burnable dependency.
     binding.inheritedDependencies.length!==1 ||
     !normalized.some(p=>p.provenance.some(f=>
       f.sourceId===binding.inheritedDependencies[0].sourceId &&
       f.sourceRevision===binding.inheritedDependencies[0].sourceRevision &&
       f.sourceSha256===binding.inheritedDependencies[0].sourceSha256 &&
       f.attributedParticipantId===binding.inheritedDependencies[0].attributedParticipantId)))
    return false;
  return true;
}
function evaluate(source,observation) {
  const hypotheses=source.hypotheses||[];
  const hypothesis=hypotheses.length===1?hypotheses[0]:null;
  const effect=observation.property;
  const classes=hypothesis?.participants?.map(x=>x.assetClass)||[];
  const scope=hypothesis?.relation==="POTENTIAL_ATOMIC_COUPLED_RESOURCE_DECREASE" &&
    hypothesis.status==="UNEVALUATED_SOURCE_HYPOTHESIS" &&
    hypothesis.admission==="NOT_ADMITTED" &&
    hypothesis.scientificPolarity==="INCONCLUSIVE" &&
    bindingMatches(source,observation,hypothesis) &&
    source.evidenceOrigin==="SOURCE_ONLY" &&
    source.executionEvidenceUsed===false &&
    source.admission==="NOT_ADMITTED" &&
    source.scientificPolarity==="INCONCLUSIVE" &&
    observation.schemaVersion==="OECL_SOURCE_BOUND_EMERGENT_PROPERTY_RECOGNITION_V1" &&
    observation.candidateAdmission==="NOT_ADMITTED" &&
    observation.scientificPolarity==="INCONCLUSIVE" &&
    effect?.kind==="SCOPED_ATOMIC_CROSS_ASSET_REDEMPTION_WITH_MONOTONE_SUPPLY" &&
    effect.status==="OBSERVED_IN_PINNED_LOCAL_EVM" &&
    new Set(classes).size===2 && classes.includes("NON_FUNGIBLE") &&
    classes.includes("FUNGIBLE") &&
    Array.isArray(hypothesis.sourceEvidence) && hypothesis.sourceEvidence.length>=2 &&
    hypothesis.sourceEvidence.every(x=>x.sourceSha256 && x.factId) &&
    Array.isArray(observation.adversarialFalsificationProbes) &&
    observation.adversarialFalsificationProbes.length>=9;
  if(!scope)return {status:"INCONCLUSIVE",observed:false,reason:"MISSING_OR_INCONSISTENT_SCOPE"};
  const numbers=effect.observations;
  const decimal=x=>typeof x==="string"&&/^(0|[1-9][0-9]*)$/.test(x);
  if(!numbers || !["nftValueRedeemedWei","fungibleSupplyDestroyedUnits",
    "backingAfterWei","remainingNftObligationsWei"].every(x=>decimal(numbers[x])) ||
    BigInt(numbers.nftValueRedeemedWei)<=0n ||
    BigInt(numbers.fungibleSupplyDestroyedUnits)<=0n ||
    BigInt(numbers.backingAfterWei)<BigInt(numbers.remainingNftObligationsWei) ||
    !/^0x[a-f0-9]{64}$/i.test(effect.witnessTransaction||"") ||
    !Array.isArray(numbers.distinctBurnLogIndices) ||
    numbers.distinctBurnLogIndices.length!==2 ||
    numbers.distinctBurnLogIndices[0]===numbers.distinctBurnLogIndices[1] ||
    numbers.independentlyCheckedRollbackScenarios<4)
    return {status:"INCONCLUSIVE",observed:false,reason:"EVIDENCE_INCOMPLETE"};
  return {
    status:"SCOPED_OBSERVATION_CONSISTENT",
    observed:true,
    reason:"SOURCE_ONLY_PREDICTION_MATCHED_BOUNDED_LOCAL_EVM_WITNESS"
  };
}
const result=evaluate(h,w);
assert.equal(result.status,"SCOPED_OBSERVATION_CONSISTENT");
const controls=[
  ["no_source_prediction",(a)=>{a.hypotheses=[];}],
  ["source_witness_laundered",(a)=>{a.executionEvidenceUsed=true;}],
  ["candidate_admitted_without_review",(a)=>{a.admission="ELIGIBLE_FOR_REVIEW";}],
  ["missing_second_asset",(a)=>{a.hypotheses[0].participants[1].assetClass="NON_FUNGIBLE";}],
  ["missing_rollback",(a,b)=>{b.property.observations.independentlyCheckedRollbackScenarios=0;}],
  ["insolvent_backing",(a,b)=>{b.property.observations.remainingNftObligationsWei="9999999999999999999999999";}],
  ["no_supply_burn",(a,b)=>{b.property.observations.fungibleSupplyDestroyedUnits="0";}],
  ["forged_receipt",(a,b)=>{b.property.witnessTransaction="not-a-tx";}],
  ["no_negative_controls",(a,b)=>{b.adversarialFalsificationProbes=[];}],
  ["swapped_hypothesis_sources",(a)=>{const p=a.hypotheses[0].participants;[p[0].sourceId,p[1].sourceId]=[p[1].sourceId,p[0].sourceId];}],
  ["forged_hypothesis_revision",(a)=>{a.hypotheses[0].participants[0].revision="0".repeat(40);}],
  ["swapped_evm_source_identities",(a,b)=>{const p=b.property.sourceBinding.participants;[p[0].sourceId,p[1].sourceId]=[p[1].sourceId,p[0].sourceId];}],
  ["forged_evm_source_revision",(a,b)=>{b.property.sourceBinding.participants[0].revision="f".repeat(40);}],
  ["forged_evm_source_sha",(a,b)=>{b.property.sourceBinding.participants[0].sourceSha256="0".repeat(64);}],
  ["forged_source_fact_sha",(a)=>{a.normalizedParticipants[0].provenance[0].sourceSha256="0".repeat(64);}],
  ["forged_hypothesis_fact_sha",(a)=>{a.hypotheses[0].sourceEvidence[0].sourceSha256="0".repeat(64);}],
  ["wrong_inherited_dependency_revision",(a,b)=>{b.property.sourceBinding.inheritedDependencies[0].sourceRevision="5.0.0";}],
  ["wrong_inherited_dependency_hash",(a,b)=>{b.property.sourceBinding.inheritedDependencies[0].sourceSha256="0".repeat(64);}],
  ["wrong_inherited_dependency_participant",(a,b)=>{b.property.sourceBinding.inheritedDependencies[0].attributedParticipantId="other/repository";}],
  ["missing_inherited_dependency",(a,b)=>{b.property.sourceBinding.inheritedDependencies=[];}],
  ["swapped_asset_classes",(a,b)=>{const p=b.property.sourceBinding.participants;[p[0].assetClass,p[1].assetClass]=[p[1].assetClass,p[0].assetClass];}],
  ["wrong_bound_evm_transaction",(a,b)=>{b.property.sourceBinding.witnessTransaction="0x"+"0".repeat(64);}],
  ["missing_bound_evm_evidence_digest",(a,b)=>{b.property.sourceBinding.successEvidenceSha256="";}],
  ["forged_abstract_hypothesis_id",(a)=>{a.hypotheses[0].hypothesisId="BEHAVIORAL-FORGED";}]
];
for(const [name,mutate] of controls){
  const a=structuredClone(h),b=structuredClone(w);
  mutate(a,b);
  assert.equal(evaluate(a,b).status,"INCONCLUSIVE","Falsification was missed: "+name);
}
const sha=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
const output={
  schemaVersion:"OECL_GENERIC_SOURCE_TO_EXPERIMENT_EVALUATION_V1",
  sources:{hypothesis:{path:hypothesisPath,sha256:sha(rawA)},observation:{path:observationPath,sha256:sha(rawB)}},
  hypothesisId:h.hypotheses[0].hypothesisId,
  evaluation:result,
  evidenceBinding:{
    participants:w.property.sourceBinding.participants,
    inheritedDependencies:w.property.sourceBinding.inheritedDependencies,
    chainId:w.property.sourceBinding.chainId,
    witnessTransaction:w.property.sourceBinding.witnessTransaction,
    successEvidenceSha256:w.property.sourceBinding.successEvidenceSha256,
    hypothesisId:h.hypotheses[0].hypothesisId
  },
  negativeControls:controls.map(x=>x[0]),
  scientificPolarity:"INCONCLUSIVE",
  candidateAdmission:"NOT_ADMITTED",
  limitations:"Only this fixed source-only hypothesis and bounded local-EVM outcome were matched; no universal compatibility, independent discovery admission or proof of arbitrary Solidity behavior."
};
fs.writeFileSync(outputPath,JSON.stringify(output,null,2)+"\n");
console.log("OECL_GENERIC_HYPOTHESIS_EVALUATION:"+JSON.stringify({
  status:result.status,negativeControls:controls.length,
  admission:output.candidateAdmission,scientificPolarity:output.scientificPolarity
}));
