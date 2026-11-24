import type { ScientificCompositionConstraint } from "../scientific-composition-evaluation-specification/ScientificCompositionConstraint.js";
import type { ScientificCompositionConstraintObservation } from "../scientific-composition-constraint-evaluation/ScientificCompositionConstraintObservation.js";
import { ScientificCompositionConstraintEvaluatorEngine } from "../scientific-composition-constraint-evaluation/ScientificCompositionConstraintEvaluatorEngine.js";

/**
 * This engine compares an EXACT pre-registered prediction against an observed
 * numeric constraint report. It does not authenticate transaction receipts.
 * A recorded EVM observation cannot be rewritten by a scientific hypothesis.
 */
export interface ScopedScientificPrediction {
    hypothesisId: string;
    candidateId: string;
    constraintId: string;
    participantSide: "A" | "B";
    sourceRevision: string;
    expectedConstraintVerdict: "PRESERVED" | "VIOLATED";
    scenarioId: string;
}
export type ScientificEvmAlignment =
    | "REPORTED_MEASUREMENTS_MATCH_PREDICTION"
    | "REPORTED_MEASUREMENTS_CHALLENGE_PREDICTION"
    | "NOT_COMPARABLE"
    | "NO_EVALUABLE_MEASUREMENT";
export interface ScientificEvmAlignmentResult {
    status: ScientificEvmAlignment;
    hypothesisId: string;
    observedConstraintVerdict: "PRESERVED" | "VIOLATED" | "UNEVALUATED" | null;
    predictedConstraintVerdict: "PRESERVED" | "VIOLATED";
    sourceRevision: string;
    reportedTransactionHash: string | null;
    observationsImmutable: true;
    receiptAuthentication: "NOT_PERFORMED_BY_COMPARISON_ENGINE";
    fullCompatibilityVerdict: "NOT_EVALUATED";
    candidateAdmission: "NOT_ADMITTED";
    errors: string[];
}

/**
 * Inputs must come from an independently trusted local EVM harness, not
 * arbitrary browser-submitted JSON. The source constraint engine recomputes
 * unsigned numeric predicates and checks matching revision/transaction
 * identity. Even then, external receipt authentication is a separate gate.
 */
export class ScientificEvmHypothesisAlignmentEngine {
    compare(
        prediction: ScopedScientificPrediction,
        constraint: ScientificCompositionConstraint,
        observation: ScientificCompositionConstraintObservation,
        observedScenarioId: string
    ): ScientificEvmAlignmentResult {
        const report=(status:ScientificEvmAlignment,
            actual:ScientificEvmAlignmentResult["observedConstraintVerdict"],
            errors:string[]):ScientificEvmAlignmentResult=>({
            status,hypothesisId:typeof prediction?.hypothesisId==="string"
                ? prediction.hypothesisId : "",
            observedConstraintVerdict:actual,
            predictedConstraintVerdict:prediction?.expectedConstraintVerdict,
            sourceRevision:typeof prediction?.sourceRevision==="string"
                ? prediction.sourceRevision : "",
            reportedTransactionHash:typeof observation?.transactionHash==="string"
                ? observation.transactionHash : null,
            observationsImmutable:true,
            receiptAuthentication:"NOT_PERFORMED_BY_COMPARISON_ENGINE",
            fullCompatibilityVerdict:"NOT_EVALUATED",
            candidateAdmission:"NOT_ADMITTED",errors
        });
        if (!prediction || !constraint || !observation ||
            !prediction.hypothesisId?.trim() ||
            !prediction.scenarioId?.trim() ||
            prediction.scenarioId!==observedScenarioId ||
            !/^(?:[0-9a-f]{40}|sha256:[0-9a-f]{64})$/i.test(prediction.sourceRevision??"") ||
            constraint.basis!=="SOURCE_DERIVED_BEHAVIORAL_INVARIANT" ||
            prediction.candidateId!==constraint.candidateId ||
            prediction.candidateId!==observation.candidateId ||
            prediction.constraintId!==constraint.constraintId ||
            prediction.constraintId!==observation.constraintId ||
            prediction.participantSide!==constraint.participantSide ||
            prediction.participantSide!==observation.participantSide ||
            prediction.sourceRevision.toLowerCase()!==
                constraint.sourceRevision?.toLowerCase() ||
            prediction.sourceRevision.toLowerCase()!==
                observation.sourceRevision?.toLowerCase() ||
            !["PRESERVED","VIOLATED"].includes(
                prediction.expectedConstraintVerdict))
            return report("NOT_COMPARABLE",null,["PREDICTION_EVM_SCOPE_NOT_EXACT"]);
        const evaluation = new ScientificCompositionConstraintEvaluatorEngine()
            .evaluate([constraint],[observation]);
        if (evaluation.errors.length ||
            evaluation.candidateId!==prediction.candidateId ||
            evaluation.evaluations.length!==1)
            return report("NOT_COMPARABLE",null,[
                "REPORTED_MEASUREMENT_FAILED_CONSTRAINT_REEVALUATION",
                ...evaluation.errors
            ]);
        const actual=evaluation.evaluations[0].status;
        if (actual==="UNEVALUATED")
            return report("NO_EVALUABLE_MEASUREMENT",actual,[]);
        return report(
            actual===prediction.expectedConstraintVerdict
                ? "REPORTED_MEASUREMENTS_MATCH_PREDICTION"
                : "REPORTED_MEASUREMENTS_CHALLENGE_PREDICTION",
            actual,[]
        );
    }
}
