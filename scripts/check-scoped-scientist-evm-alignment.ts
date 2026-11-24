import assert from "node:assert/strict";
import {ScientificEvmHypothesisAlignmentEngine} from
    "../laboratory/scientific-independent-review/ScientificEvmHypothesisAlignmentEngine.js";
import type {ScientificCompositionConstraint} from
    "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionConstraint.js";
import type {ScientificCompositionConstraintObservation} from
    "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintObservation.js";
import type {ScopedScientificPrediction} from
    "../laboratory/scientific-independent-review/ScientificEvmHypothesisAlignmentEngine.js";

const revision="a".repeat(40),transactionHash="0x"+"b".repeat(64);
const constraint:ScientificCompositionConstraint={
    constraintId:"CONSTRAINT-8098-SUPPLY",candidateId:"PAIR-8098-4626",
    participantSide:"A",participantKind:"PROTOCOL",participantId:"ERC-8098",
    sourceId:"SOURCE-8098",sourceRevision:revision,factId:"FACT-SUPPLY",
    basis:"SOURCE_DERIVED_BEHAVIORAL_INVARIANT",
    containerKind:"CONTRACT",containerSymbol:"ERC8098Reference",
    locator:{sourceLocation:"https://example.com/pinned",filePath:"ERC8098Reference.sol"},
    rawText:"totalSupply must not increase",
    behavioralPredicate:{
        kind:"UNSIGNED_INTEGER_RELATION",leftMetric:"supplyAfter",
        operator:"LTE",rightMetric:"supplyBefore"
    }
};
const prediction:ScopedScientificPrediction={
    hypothesisId:"SCI-HYPOTHESIS-8098-4626",candidateId:"PAIR-8098-4626",
    constraintId:constraint.constraintId,participantSide:"A",
    sourceRevision:revision,scenarioId:"8098-AS-UNDERLYING",
    expectedConstraintVerdict:"PRESERVED"
};
const obs:ScientificCompositionConstraintObservation={
    observationId:"OBS-LOCAL-8098",candidateId:"PAIR-8098-4626",
    constraintId:constraint.constraintId,participantSide:"A",verdict:"PRESERVED",
    evidence:["MEASURED-LOCAL-SUPPLY"],sourceRevision:revision,transactionHash,
    numericMeasurements:{supplyAfter:"1000",supplyBefore:"1000"}
};
const engine=new ScientificEvmHypothesisAlignmentEngine();
const inputSnapshot=JSON.stringify(obs);
const check=engine.compare(prediction,constraint,obs,"8098-AS-UNDERLYING");
assert.equal(check.status,"REPORTED_MEASUREMENTS_MATCH_PREDICTION");
assert.equal(check.observedConstraintVerdict,"PRESERVED");
assert.equal(check.receiptAuthentication,"NOT_PERFORMED_BY_COMPARISON_ENGINE");
assert.equal(check.fullCompatibilityVerdict,"NOT_EVALUATED");
assert.equal(check.candidateAdmission,"NOT_ADMITTED");
assert.equal(JSON.stringify(obs),inputSnapshot,"Comparison cannot change reported observation");

const sourceMismatch=engine.compare({...prediction,sourceRevision:"c".repeat(40)},
    constraint,obs,"8098-AS-UNDERLYING");
assert.equal(sourceMismatch.status,"NOT_COMPARABLE");
assert.equal(sourceMismatch.observedConstraintVerdict,null);
const roleMismatch=engine.compare(prediction,constraint,obs,"8098-AS-VAULT-SHARE");
assert.equal(roleMismatch.status,"NOT_COMPARABLE",
    "A vault-share hypothesis cannot borrow an underlying-token EVM observation");
const alteredReceipt=engine.compare(prediction,constraint,{
    ...obs,verdict:"VIOLATED"
},"8098-AS-UNDERLYING");
assert.equal(alteredReceipt.status,"NOT_COMPARABLE",
    "A forged EVM verdict must not override measured numeric predicate");
const noReceipt=engine.compare(prediction,constraint,{
    ...obs,transactionHash:undefined
},"8098-AS-UNDERLYING");
assert.equal(noReceipt.status,"NOT_COMPARABLE");
const violation:ScientificCompositionConstraintObservation={
    ...obs,observationId:"OBS-VIOLATION",
    verdict:"VIOLATED",
    numericMeasurements:{supplyAfter:"1001",supplyBefore:"1000"}
};
const contradicts=engine.compare(prediction,constraint,violation,
    "8098-AS-UNDERLYING");
assert.equal(contradicts.status,"REPORTED_MEASUREMENTS_CHALLENGE_PREDICTION");
assert.equal(contradicts.observedConstraintVerdict,"VIOLATED");
assert.equal(contradicts.predictedConstraintVerdict,"PRESERVED");
assert.equal(contradicts.receiptAuthentication,"NOT_PERFORMED_BY_COMPARISON_ENGINE");
assert.equal(contradicts.fullCompatibilityVerdict,"NOT_EVALUATED");
console.log("OECL_SCOPED_SCIENTIST_EVM_MEASUREMENT_ALIGNMENT_PASS");
