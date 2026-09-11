import {
    ScientificExecutionResultEvaluatorEngine
} from "../laboratory/scientific-execution-result-evaluator/ScientificExecutionResultEvaluatorEngine.js";

import type {
    ScientificExecutionOutcomeResult
} from "../laboratory/scientific-execution-outcome/ScientificExecutionOutcomeResult.js";

const engine =
    new ScientificExecutionResultEvaluatorEngine();

const outcomes: ScientificExecutionOutcomeResult = {

    generatedAt:
        new Date().toISOString(),

    campaignId:
        "CONTROLLED-LEGACY-SCIENTIFIC-CRITERIA",

    outcomes: [
        {
            outcomeId:
                "CONTROLLED-LEGACY-OUTCOME-00001",

            executionPlanId:
                "CONTROLLED-LEGACY-PLAN-00001",

            executionTaskId:
                "CONTROLLED-LEGACY-TASK-00001",

            experimentId:
                "CONTROLLED-LEGACY-EXPERIMENT-00001",

            targetType:
                "KNOWLEDGE_GAP",

            targetId:
                "CONTROLLED-LEGACY-TARGET-00001",

            targetEvidenceIds: [],

            successCriteria: [
                "Evidence diversity increases."
            ],

            failureCriteria: [
                "No relevant evidence is found."
            ],

            stepId:
                "CONTROLLED-LEGACY-STEP-00001",

            stepType:
                "TEST_EXECUTION",

            status:
                "SUCCESS",

            scientificResult:
                "NOT_EVALUATED",

            executedAt:
                new Date().toISOString(),

            evidence: [],

            observations: [
                "Evidence diversity increases."
            ],

            errors: [],

            explanation:
                "Controlled legacy compatibility evaluation."
        }
    ],

    statistics: {
        total: 1,
        executed: 1,
        notExecuted: 0,
        success: 1,
        failure: 0,
        inconclusive: 0,
        blocked: 0
    },

    errors: []
};

const result =
    engine.build(
        outcomes.campaignId,
        outcomes
    );

const evaluation =
    result.evaluations[0];

if (!evaluation) {
    throw new Error(
        "Expected one legacy evaluation."
    );
}

if (
    evaluation.matchedSuccessCriteria.length !== 1
) {
    throw new Error(
        "Expected legacy success criterion to match."
    );
}

if (
    evaluation.scientificResult !== "SUPPORTS"
) {
    throw new Error(
        `Expected SUPPORTS but received ${evaluation.scientificResult}.`
    );
}

console.log(
    "CONTROLLED LEGACY SCIENTIFIC CRITERIA COMPATIBILITY: PASS"
);

console.log(
    "LEGACY SUCCESS CRITERION MATCHED: PASS"
);

console.log(
    "LEGACY OUTCOME WITHOUT STRUCTURED CRITERIA -> SUPPORTS: PASS"
);