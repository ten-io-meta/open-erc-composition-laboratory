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
function evaluate(source,observation) {
  const hypotheses=source.hypotheses||[];
  const hypothesis=hypotheses.length===1?hypotheses[0]:null;
  const effect=observation.property;
  const classes=hypothesis?.participants?.map(x=>x.assetClass)||[];
  const scope=hypothesis?.relation==="POTENTIAL_ATOMIC_COUPLED_RESOURCE_DECREASE" &&
    hypothesis.status==="UNEVALUATED_SOURCE_HYPOTHESIS" &&
    hypothesis.admission==="NOT_ADMITTED" &&
    hypothesis.scientificPolarity==="INCONCLUSIVE" &&
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
  ["no_negative_controls",(a,b)=>{b.adversarialFalsificationProbes=[];}]
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
