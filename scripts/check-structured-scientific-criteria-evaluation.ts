import {
    ScientificExecutionResultEvaluatorEngine
} from "../laboratory/scientific-execution-result-evaluator/ScientificExecutionResultEvaluatorEngine.js";

import type {
    ScientificExecutionOutcome
} from "../laboratory/scientific-execution-outcome/ScientificExecutionOutcome.js";

import type {
    ScientificExecutionOutcomeResult
} from "../laboratory/scientific-execution-outcome/ScientificExecutionOutcomeResult.js";

const engine =
    new ScientificExecutionResultEvaluatorEngine();

const scientificCriteria = {
    relation:
        "ACCESS:CONSTRAINS:TRANSFER",

    support: {
        expectedPolarity:
            "SUPPORT" as const,

        condition:
            "Observed behavior supports ACCESS:CONSTRAINS:TRANSFER."
    },

    challenge: {
        expectedPolarity:
            "CHALLENGE" as const,

        condition:
            "Observed behavior provides a counterexample to ACCESS:CONSTRAINS:TRANSFER."
    },

    inconclusive: {
        whenNoScientificPolarity:
            true as const
    }
};

function controlledOutcome(
    suffix: string,
    evidence: string[],
    observations: string[]
): ScientificExecutionOutcome {

    return {
        outcomeId:
            `CONTROLLED-OUTCOME-${suffix}`,

        executionPlanId:
            `CONTROLLED-PLAN-${suffix}`,

        executionTaskId:
            `CONTROLLED-TASK-${suffix}`,

        experimentId:
            `CONTROLLED-EXPERIMENT-${suffix}`,

        targetType:
            "THEORY_VALIDATION",

        targetId:
            `CONTROLLED-VALIDATION-${suffix}`,

        targetEvidenceIds: [],

        successCriteria: [
            "The experiment produces a reproducible result."
        ],

        failureCriteria: [
            "No relevant evidence is discovered."
        ],

        scientificCriteria,

        stepId:
            `CONTROLLED-STEP-${suffix}`,

        stepType:
            "TEST_EXECUTION",

        status:
            "SUCCESS",

        scientificResult:
            "NOT_EVALUATED",

        executedAt:
            new Date().toISOString(),

        evidence,

        observations,

        errors: [],

        explanation:
            "Controlled structured scientific criteria evaluation."
    };
}

const outcomes: ScientificExecutionOutcomeResult = {

    generatedAt:
        new Date().toISOString(),

    campaignId:
        "CONTROLLED-SCIENTIFIC-CRITERIA-EVALUATION",

    outcomes: [

        controlledOutcome(
            "00001",
            [],
            [
                "No relevant evidence is discovered."
            ]
        ),

        controlledOutcome(
            "00002",
            [],
            [
                "The experiment produces a reproducible result."
            ]
        ),

        controlledOutcome(
            "00003",
            [
                "SCIENTIFIC_POLARITY:SUPPORT"
            ],
            [
                "No relevant evidence is discovered."
            ]
        ),

        controlledOutcome(
            "00004",
            [
                "SCIENTIFIC_POLARITY:CHALLENGE"
            ],
            [
                "The experiment produces a reproducible result."
            ]
        )

    ],

    statistics: {
    total: 4,
    executed: 4,
    notExecuted: 0,
    success: 4,
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

const processFailure =
    result.evaluations[0];

const processSuccess =
    result.evaluations[1];

const explicitSupport =
    result.evaluations[2];

const explicitChallenge =
    result.evaluations[3];

if (
    !processFailure ||
    !processSuccess ||
    !explicitSupport ||
    !explicitChallenge
) {
    throw new Error(
        "Expected four controlled evaluations."
    );
}

if (
    processFailure.matchedFailureCriteria.length !== 1
) {
    throw new Error(
        "Expected process failure criterion to match."
    );
}

if (
    processFailure.scientificResult !== "INCONCLUSIVE"
) {
    throw new Error(
        "Process failure incorrectly changed scientific polarity."
    );
}

if (
    processSuccess.matchedSuccessCriteria.length !== 1
) {
    throw new Error(
        "Expected process success criterion to match."
    );
}

if (
    processSuccess.scientificResult !== "INCONCLUSIVE"
) {
    throw new Error(
        "Process success incorrectly created scientific support."
    );
}

if (
    explicitSupport.scientificResult !== "SUPPORTS"
) {
    throw new Error(
        `Expected SUPPORTS but received ${explicitSupport.scientificResult}.`
    );
}

if (
    explicitChallenge.scientificResult !== "CHALLENGES"
) {
    throw new Error(
        `Expected CHALLENGES but received ${explicitChallenge.scientificResult}.`
    );
}

console.log(
    "CONTROLLED STRUCTURED SCIENTIFIC CRITERIA EVALUATION: PASS"
);

console.log(
    "PROCESS FAILURE MATCH -> INCONCLUSIVE: PASS"
);

console.log(
    "PROCESS SUCCESS MATCH -> INCONCLUSIVE: PASS"
);

console.log(
    "EXPLICIT SCIENTIFIC SUPPORT -> SUPPORTS: PASS"
);

console.log(
    "EXPLICIT SCIENTIFIC CHALLENGE -> CHALLENGES: PASS"
);

console.log(
    "PROCESS CRITERIA CANNOT OVERRIDE SCIENTIFIC POLARITY: PASS"
);