import assert from "node:assert/strict";
import { ScientificExecutionResultEvaluatorEngine } from "../laboratory/scientific-execution-result-evaluator/ScientificExecutionResultEvaluatorEngine.js";
import type { ScientificExecutionOutcome } from "../laboratory/scientific-execution-outcome/ScientificExecutionOutcome.js";
import type { ScientificExecutionOutcomeResult } from "../laboratory/scientific-execution-outcome/ScientificExecutionOutcomeResult.js";

/** Synthetic regression fixtures only: not evidence of real ERC interoperability. */
const candidateId = "JOINT-REGRESSION-A-B";
function outcome(polarity: "SUPPORT" | "CHALLENGE", defective = false): ScientificExecutionOutcome {
    const constraints = [
        { candidateId, constraintId: "A-1", participantSide: "A" },
        { candidateId, constraintId: "B-1", participantSide: "B" }
    ] as const;
    return {
        outcomeId: "OUT-1", executionPlanId: "PLAN-1", executionTaskId: "TASK-1",
        experimentId: "EXP-1", targetType: "COMPOSITION_CANDIDATE", targetId: candidateId,
        sourceIds: [], targetEvidenceIds: [], successCriteria: [], failureCriteria: [],
        stepId: "STEP-1", stepType: "COMPOSITION_EXECUTION",
        repository: null, selectedExecutableTarget: null,
        status: "INCONCLUSIVE", scientificResult: "INCONCLUSIVE", executedAt: null,
        evidence: [], observations: [], errors: [], explanation: "",
        jointCompositionEvidence: {
            runtime: "OECL_NATIVE_COMPOSITION_JOINT_CONTRACT_EXECUTION",
            compositionExecutionRequirement: {
                candidate: {candidateId},
                constraints,
                participantAConstraintIds: ["A-1"],
                participantBConstraintIds: ["B-1"]
            } as NonNullable<ScientificExecutionOutcome["jointCompositionEvidence"]>["compositionExecutionRequirement"],
            compositionWorkspaceMaterialization: { status: "MATERIALIZED" } as NonNullable<ScientificExecutionOutcome["jointCompositionEvidence"]>["compositionWorkspaceMaterialization"],
            compositionRecipeSelection: {
                status: "SELECTED", selectedRegistrationId: "R-1",
                matchingRegistrationIds: ["R-1"], reasons: []
            },
            jointContractHarnessExecution: {
                status: "EXECUTED", driverReport: { sharedRuntime: true }
            } as NonNullable<ScientificExecutionOutcome["jointCompositionEvidence"]>["jointContractHarnessExecution"],
            compositionConstraintEvaluation: {
                candidateId: defective ? "OTHER-CANDIDATE" : candidateId,
                scientificPolarity: polarity,
                evaluations: constraints.map((constraint) => ({
                    constraintId: constraint.constraintId,
                    candidateId, participantSide: constraint.participantSide,
                    status: polarity === "CHALLENGE" && constraint.participantSide === "B"
                        ? "VIOLATED" : "PRESERVED",
                    observationIds: ["OBS-" + constraint.constraintId],
                    evidence: ["transaction-and-invariant-reference"]
                })),
                statistics: {total: 2, preserved: polarity === "SUPPORT" ? 2 : 1,
                    violated: polarity === "CHALLENGE" ? 1 : 0, unevaluated: 0},
                errors: []
            }
        }
    };
}
function evaluated(input: ScientificExecutionOutcome): string {
    const result = new ScientificExecutionResultEvaluatorEngine().build("REGRESSION", {
        generatedAt: "", campaignId: "REGRESSION", outcomes: [input],
        statistics: {} as ScientificExecutionOutcomeResult["statistics"], errors: []
    });
    assert.deepEqual(result.errors, []);
    return result.updatedOutcomes.outcomes[0].scientificResult;
}
assert.equal(evaluated(outcome("SUPPORT")), "SUPPORTS");
assert.equal(evaluated(outcome("CHALLENGE")), "CHALLENGES");
assert.equal(evaluated(outcome("SUPPORT", true)), "INCONCLUSIVE");
const noHarness = outcome("SUPPORT");
noHarness.jointCompositionEvidence!.jointContractHarnessExecution = undefined;
assert.equal(evaluated(noHarness), "INCONCLUSIVE");
const partial = outcome("SUPPORT");
partial.jointCompositionEvidence!.compositionConstraintEvaluation!.evaluations.pop();
assert.equal(evaluated(partial), "INCONCLUSIVE");
const generic = outcome("SUPPORT");
generic.jointCompositionEvidence = undefined;
assert.equal(evaluated(generic), "INCONCLUSIVE");
const wrongStep = outcome("SUPPORT");
wrongStep.stepType = "TEST_EXECUTION";
assert.equal(evaluated(wrongStep), "INCONCLUSIVE");
console.log("PASS: synthetic joint composition evidence regression (7 cases)");
