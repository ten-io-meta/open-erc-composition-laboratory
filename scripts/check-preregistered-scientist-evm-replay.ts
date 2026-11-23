import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {ScientificEvmHypothesisAlignmentEngine} from
    "../laboratory/scientific-independent-review/ScientificEvmHypothesisAlignmentEngine.js";
import type {ScopedScientificPrediction} from
    "../laboratory/scientific-independent-review/ScientificEvmHypothesisAlignmentEngine.js";
import type {ScientificCompositionConstraint} from
    "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionConstraint.js";
import type {ScientificCompositionConstraintObservation} from
    "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintObservation.js";

const reportPath=resolve(process.argv[2]||
    "source-output/pair-8098-4626/scientist-adversarial-falsification.json");
const planPath=resolve(process.argv[3]||
    "laboratory/scientific-open-source-worker/preregistered-8098-4626-falsification.json");
const outputPath=resolve(process.argv[4]||
    "audit-output/scientist-evm-comparison.json");
const rawPlan=readFileSync(planPath);
const report=JSON.parse(readFileSync(reportPath,"utf8"));
const plan=JSON.parse(rawPlan.toString("utf8"));
const digest=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
assert.equal(report.planSha256,digest(rawPlan));
assert.equal(report.experimentId,plan.experimentId);
assert.equal(report.scenarioId,plan.scenarioId);
assert.equal(report.registeredBeforeExecution,true);
assert.equal(report.fullCompatibilityVerdict,"NOT_EVALUATED");
assert.equal(report.candidateAdmission,"NOT_ADMITTED");
assert.equal(report.scientificVerdict,"INCONCLUSIVE");
assert.equal(report.observationTrust,
    "LOCAL_HARDHAT_PROVIDER_CHECKED_NOT_MAINNET_AUTHENTICATION");
assert.equal(report.provenance.localChainId,31337);
assert.equal(report.localEvmReceiptWitness.verification,
    "LIVE_LOCAL_PROVIDER_RECEIPT_AND_BLOCK_AND_EVENT_CHECKED");
assert.equal(report.localEvmReceiptWitness.receiptStatus,1);
assert.match(report.localEvmReceiptWitness.transactionHash,/^0x[a-f0-9]{64}$/i);
assert.match(report.localEvmReceiptWitness.blockHash,/^0x[a-f0-9]{64}$/i);
assert.equal(report.trials.length,2);
const engine=new ScientificEvmHypothesisAlignmentEngine();
const evaluated=[];
for(let index=0;index<2;index++){
    const trial=report.trials[index],prior=plan.hypotheses[index];
    assert.equal(trial.prediction.hypothesisId,prior.hypothesisId);
    assert.equal(trial.prediction.scenarioId,plan.scenarioId);
    assert.equal(trial.prediction.constraintId,prior.constraintId);
    assert.equal(trial.prediction.expectedConstraintVerdict,prior.expectedConstraintVerdict);
    assert.equal(trial.observation.transactionHash,
        report.localEvmReceiptWitness.transactionHash);
    assert.equal(trial.role,prior.role);
    assert.equal(trial.constraint.behavioralPredicate.operator,prior.operator);
    assert.equal(trial.constraint.behavioralPredicate.leftMetric,prior.leftMetric);
    assert.equal(trial.constraint.behavioralPredicate.rightMetric,prior.rightMetric);
    const prediction=trial.prediction as ScopedScientificPrediction;
    const constraint=trial.constraint as ScientificCompositionConstraint;
    const observation=trial.observation as ScientificCompositionConstraintObservation;
    const untouched=JSON.stringify(observation);
    const result=engine.compare(prediction,constraint,observation,plan.scenarioId);
    assert.equal(JSON.stringify(observation),untouched,"Scientific reasoning modified the EVM evidence");
    const expected=index===0?
        "REPORTED_MEASUREMENTS_MATCH_PREDICTION":
        "REPORTED_MEASUREMENTS_CHALLENGE_PREDICTION";
    assert.equal(result.status,expected);
    assert.equal(result.status,trial.comparison);
    assert.equal(result.observedConstraintVerdict,observation.verdict);
    assert.equal(result.predictedConstraintVerdict,prior.expectedConstraintVerdict);
    assert.equal(result.receiptAuthentication,"NOT_PERFORMED_BY_COMPARISON_ENGINE");
    assert.equal(result.fullCompatibilityVerdict,"NOT_EVALUATED");
    assert.equal(result.candidateAdmission,"NOT_ADMITTED");
    // Negative controls: a prediction cannot borrow another role or revision.
    assert.equal(engine.compare(prediction,constraint,observation,
        "ERC8098_USED_AS_ERC4626_SHARES").status,"NOT_COMPARABLE");
    assert.equal(engine.compare({...prediction,sourceRevision:"f".repeat(40)},
        constraint,observation,plan.scenarioId).status,"NOT_COMPARABLE");
    assert.equal(engine.compare(prediction,constraint,{
        ...observation,verdict:observation.verdict==="PRESERVED"?"VIOLATED":"PRESERVED"
    },plan.scenarioId).status,"NOT_COMPARABLE");
    assert.equal(engine.compare(prediction,constraint,{
        ...observation,transactionHash:undefined
    },plan.scenarioId).status,"NOT_COMPARABLE");
    evaluated.push({hypothesisId:prior.hypothesisId,role:prior.role,
        predicted:prior.expectedConstraintVerdict,
        observed:result.observedConstraintVerdict,alignment:result.status,
        sourceRevision:result.sourceRevision,
        receiptAuthentication:result.receiptAuthentication});
}
assert.match(evaluated[1].sourceRevision,/^sha256:[a-f0-9]{64}$/i,
    "Vault-share source must be pinned by a content digest");
const outcome={
    schemaVersion:"OECL_SCIENTIST_EVM_FALSIFICATION_CROSS_ENGINE_V1",
    experimentId:plan.experimentId,
    sourceEvidenceSha256:digest(readFileSync(reportPath)),
    predictionPlanSha256:digest(rawPlan),
    priorLocalProviderWitness:report.localEvmReceiptWitness,
    evidenceTrust:"LOCAL_PROVIDER_CHECKED_UPSTREAM_NOT_INDEPENDENT_MAINNET_AUTHENTICATION",
    results:evaluated,
    globalCompatibility:"NOT_EVALUATED",
    scientificAdmission:"NOT_ADMITTED",
    scientificStatus:"INCONCLUSIVE",
    limitation:"Two controlled pre-registered hypotheses, one falsified; not an autonomous discovery, universal ERC compatibility proof, independent receipt verification or production audit"
};
mkdirSync(dirname(outputPath),{recursive:true});
writeFileSync(outputPath,JSON.stringify(outcome,null,2)+"\n");
console.log("OECL_SCIENTIST_EVM_REAL_ARTIFACT_CROSS_ENGINE_PASS",JSON.stringify({
    matched:evaluated.filter(x=>x.alignment==="REPORTED_MEASUREMENTS_MATCH_PREDICTION").length,
    falsified:evaluated.filter(x=>x.alignment==="REPORTED_MEASUREMENTS_CHALLENGE_PREDICTION").length,
    sourceEvidenceSha256:outcome.sourceEvidenceSha256
}));
