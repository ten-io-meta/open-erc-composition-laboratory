import {
    ScientificExecutionResultEvaluatorEngine
} from "../laboratory/scientific-execution-result-evaluator/ScientificExecutionResultEvaluatorEngine.js";


let passed =
    0;

let failed =
    0;


function check(
    name: string,
    condition: boolean
): void {

    if (
        condition
    ) {

        console.log(
            `PASS: ${name}`
        );

        passed++;

        return;

    }


    console.log(
        `FAIL: ${name}`
    );

    failed++;

}


function outcome(
    polarity:
        "SUPPORT"
        | "CHALLENGE"
        | "NEUTRAL",
    targetType =
        "COMPOSITION_CANDIDATE"
): any {

    return {

        outcomeId:
            `OUTCOME-${polarity}-${targetType}`,

        executionPlanId:
            "PLAN-1",

        executionTaskId:
            "TASK-1",

        experimentId:
            "EXPERIMENT-1",

        targetType,

        targetId:
            "COMPOSITION-1",

        sourceIds: [
            "SOURCE-A",
            "SOURCE-B"
        ],

        targetEvidenceIds: [
            "EVIDENCE-A",
            "EVIDENCE-B"
        ],

        successCriteria:
            [],

        failureCriteria:
            [],

        scientificCriteria: {

            relation:
                "PRESERVES_OBSERVED_CONSTRAINTS",

            support: {

                expectedPolarity:
                    "SUPPORT",

                condition:
                    "Observed composition constraints are preserved."

            },

            challenge: {

                expectedPolarity:
                    "CHALLENGE",

                condition:
                    "Observed composition constraints are violated."

            },

            inconclusive: {

                whenNoScientificPolarity:
                    true

            }

        },

        stepId:
            "STEP-1",

        stepType:
            "TEST_EXECUTION",

        repository:
            "owner/repository-a",

        selectedExecutableTarget: {

            repository:
                "owner/repository-a",

            filePath:
                "test/example.ts",

            selector:
                "example",

            type:
                "TEST",

            framework:
                "HARDHAT"

        },

        status:
            "SUCCESS",

        scientificResult:
            "NOT_EVALUATED",

        executedAt:
            new Date().toISOString(),

        evidence: [
            `SCIENTIFIC_POLARITY:${polarity}`
        ],

        observations:
            [],

        errors:
            [],

        explanation:
            "Synthetic controlled evaluator boundary input."

    };

}


function outcomeResult(
    campaignId:
        string,
    outcomes:
        any[]
): any {

    return {

        generatedAt:
            new Date().toISOString(),

        campaignId,

        outcomes,

        statistics: {

            total:
                outcomes.length,

            notExecuted:
                0,

            success:
                outcomes.filter(
                    outcome =>
                        outcome.status ===
                        "SUCCESS"
                ).length,

            failure:
                outcomes.filter(
                    outcome =>
                        outcome.status ===
                        "FAILURE"
                ).length,

            inconclusive:
                outcomes.filter(
                    outcome =>
                        outcome.status ===
                        "INCONCLUSIVE"
                ).length,

            blocked:
                0,

            executed:
                outcomes.length

        },

        errors:
            []

    };

}


const engine =
    new ScientificExecutionResultEvaluatorEngine();


console.log("");
console.log(
    "SCIENTIFIC COMPOSITION INDIVIDUAL EXECUTION BARRIER"
);
console.log(
    "---------------------------------------------------"
);


/*
 * Composition SUPPORT from one ordinary repository execution
 * must eventually be refused by the safety boundary.
 */

const supportResult =
    engine.build(
        "CAMPAIGN-1",
        outcomeResult(
            "CAMPAIGN-1",
            [
                outcome(
                    "SUPPORT"
                )
            ]
        )
    );


check(
    "INDIVIDUAL SUPPORT TEST CANNOT SUPPORT COMPOSITION",
    supportResult.evaluations[0]
        ?.scientificResult ===
        "INCONCLUSIVE"
);


/*
 * Composition CHALLENGE from one ordinary repository execution
 * must likewise be refused.
 */

const challengeResult =
    engine.build(
        "CAMPAIGN-2",
        outcomeResult(
            "CAMPAIGN-2",
            [
                outcome(
                    "CHALLENGE"
                )
            ]
        )
    );


check(
    "INDIVIDUAL CHALLENGE TEST CANNOT CHALLENGE COMPOSITION",
    challengeResult.evaluations[0]
        ?.scientificResult ===
        "INCONCLUSIVE"
);


/*
 * Neutral execution is already scientifically inconclusive.
 */

const neutralResult =
    engine.build(
        "CAMPAIGN-3",
        outcomeResult(
            "CAMPAIGN-3",
            [
                outcome(
                    "NEUTRAL"
                )
            ]
        )
    );


check(
    "INDIVIDUAL NEUTRAL COMPOSITION TEST REMAINS INCONCLUSIVE",
    neutralResult.evaluations[0]
        ?.scientificResult ===
        "INCONCLUSIVE"
);


/*
 * Existing non-composition scientific polarity semantics must
 * remain unchanged.
 */

const ordinarySupport =
    engine.build(
        "CAMPAIGN-4",
        outcomeResult(
            "CAMPAIGN-4",
            [
                outcome(
                    "SUPPORT",
                    "KNOWLEDGE_GAP"
                )
            ]
        )
    );


check(
    "NON-COMPOSITION SUPPORT SEMANTICS ARE PRESERVED",
    ordinarySupport.evaluations[0]
        ?.scientificResult ===
        "SUPPORTS"
);


const ordinaryChallenge =
    engine.build(
        "CAMPAIGN-5",
        outcomeResult(
            "CAMPAIGN-5",
            [
                outcome(
                    "CHALLENGE",
                    "KNOWLEDGE_GAP"
                )
            ]
        )
    );


check(
    "NON-COMPOSITION CHALLENGE SEMANTICS ARE PRESERVED",
    ordinaryChallenge.evaluations[0]
        ?.scientificResult ===
        "CHALLENGES"
);


console.log("");
console.log(
    `PASS: ${passed}`
);

console.log(
    `FAIL: ${failed}`
);

console.log(
    failed ===
        0
        ? "RESULT: PASS"
        : "RESULT: FAIL"
);


if (
    failed >
    0
) {

    process.exitCode =
        1;

}
