import {
    ScientificExecutionTargetResolverEngine
} from "../laboratory/scientific-execution-target-resolution/ScientificExecutionTargetResolverEngine.js";

import type {
    ScientificExperimentExecutionResult
} from "../laboratory/scientific-experiment-execution/ScientificExperimentExecutionResult.js";


const execution:
    ScientificExperimentExecutionResult = {

        generatedAt:
            new Date().toISOString(),

        campaignId:
            "POLARITY-CONFIDENCE-UNRESOLVED-TEST",

        tasks: [
            {
                executionTaskId:
                    "EXECUTION-TASK-UNRESOLVED-001",

                queueItemId:
                    "QUEUE-UNRESOLVED-001",

                experimentId:
                    "EXPERIMENT-UNRESOLVED-001",

                origin:
                    "AUTONOMOUS",

                targetType:
                    "TEST",

                targetId:
                    "NONEXISTENT-SEMANTIC-TARGET",

                sourcePatternRelation:
                    "NONEXISTENT:VALIDATES:NOTHING",

                targetEvidenceIds:
                    [],

                title:
                    "Unresolved polarity confidence regression",

                objective:
                    "Verify unresolved scientific target semantics.",

                hypothesis:
                    "An unresolved target must not receive polarity confidence.",

                supportCondition:
                    "nonexistent semantic support",

                challengeCondition:
                    "nonexistent semantic challenge",

                priority:
                    "LOW",

                queueScore:
                    0,

                recommendedRepositories:
                    [],

                procedure:
                    [],

                requiredEvidence:
                    [],

                successCriteria:
                    [],

                failureCriteria:
                    [],

                executionStatus:
                    "READY",

                blockReasons:
                    [],

                explanation:
                    "Synthetic unresolved resolution regression."
            }
        ],

        statistics: {

            total: 1,

            ready: 1,

            pending: 0,

            blocked: 0,

            completed: 0,

            failed: 0,

            autonomous: 1,

            retest: 0,

            highPriority: 0,

            mediumPriority: 0,

            lowPriority: 1,

            averageQueueScore: 0
        },

        errors:
            []
    };


const engine =
    new ScientificExecutionTargetResolverEngine();


const result =
    engine.build(
        execution.campaignId,
        execution,
        {}
    );


const resolution =
    result.resolutions[0];


if (!resolution) {

    console.error(
        "UNRESOLVED POLARITY CONFIDENCE REGRESSION: FAIL"
    );

    console.error(
        "No resolution result was produced."
    );

    process.exitCode =
        1;

} else {

    const checks = [
        {
            invariant:
                "resolutionStatus = UNRESOLVED",

            expected:
                "UNRESOLVED",

            actual:
                resolution.resolutionStatus,

            passed:
                resolution.resolutionStatus ===
                    "UNRESOLVED"
        },
        {
            invariant:
                "scientificPolarity = NEUTRAL",

            expected:
                "NEUTRAL",

            actual:
                resolution.scientificPolarity,

            passed:
                resolution.scientificPolarity ===
                    "NEUTRAL"
        },
        {
            invariant:
                "polarityTrace = null",

            expected:
                "null",

            actual:
                resolution.polarityTrace,

            passed:
                resolution.polarityTrace ===
                    null
        },
        {
            invariant:
                "polarityConfidence = null",

            expected:
                "null",

            actual:
                resolution.polarityConfidence,

            passed:
                resolution.polarityConfidence ===
                    null
        }
    ];


    console.log(
        ""
    );

    console.log(
        "UNRESOLVED POLARITY CONFIDENCE REGRESSION:"
    );

    console.table(
        checks
    );


    const passed =
        checks.every(
            check =>
                check.passed
        );


    console.log(
        ""
    );

    console.log(
        passed
            ? "UNRESOLVED POLARITY CONFIDENCE REGRESSION: PASS"
            : "UNRESOLVED POLARITY CONFIDENCE REGRESSION: FAIL"
    );


    if (!passed) {

        process.exitCode =
            1;

    }

}