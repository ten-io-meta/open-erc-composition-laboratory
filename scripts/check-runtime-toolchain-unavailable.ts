import {
    ScientificExecutionRuntimeEngine
} from "../laboratory/scientific-execution-runtime/ScientificExecutionRuntimeEngine.js";

import type {
    ScientificExecutionPlanResult
} from "../laboratory/scientific-execution-plan/ScientificExecutionPlanResult.js";

import type {
    ScientificExecutionSpecificationResult
} from "../laboratory/scientific-execution-specification/ScientificExecutionSpecificationResult.js";

async function main() {

    const campaignId =
        "CONTROLLED-RUNTIME-TOOLCHAIN-CAMPAIGN";

    const stepId =
        "CONTROLLED-RUNTIME-STEP-00001";

    const plans:
        ScientificExecutionPlanResult = {

            generatedAt:
                new Date().toISOString(),

            campaignId,

            plans: [

                {

                    executionPlanId:
                        "CONTROLLED-RUNTIME-PLAN-00001",

                    executionTaskId:
                        "CONTROLLED-RUNTIME-TASK-00001",

                    experimentId:
                        "CONTROLLED-RUNTIME-EXPERIMENT-00001",

                    targetType:
                        "TEST",

                                        targetId:
                        "CONTROLLED-HARDHAT-TOOLCHAIN",

                    targetEvidenceIds:
                        [],

                    supportCondition:
                        null,

                    challengeCondition:
                        null,

                    successCriteria:
                        [],

                    failureCriteria:
                        [],

                    origin:
                        "AUTONOMOUS",

                    priority:
                        "LOW",

                    queueScore:
                        0,

                    steps: [

                        {

                            stepId,

                            order:
                                1,

                            stepType:
                                "TEST_EXECUTION",

                            title:
                                "Controlled Forge toolchain availability check",

                            objective:
                                "Verify that an unavailable Forge toolchain is not classified as scientific execution failure.",

                            tools:
                                [
                                    "forge"
                                ],

                            requiredInputs:
                                [],

                            expectedOutputs:
                                [],

                            status:
                                "READY"

                        }

                    ],

                    totalSteps:
                        1,

                    readySteps:
                        1,

                    blockedSteps:
                        0,

                    executionReady:
                        true,

                    explanation:
                        "Controlled runtime toolchain regression fixture."

                }

            ],

            statistics: {

                plans:
                    1,

                totalSteps:
                    1,

                readyPlans:
                    1,

                blockedPlans:
                    0,

                sourceReingestionSteps:
                    0,

                staticAnalysisSteps:
                    0,

                testExecutionSteps:
                    1,

                invariantValidationSteps:
                    0,

                evidenceCollectionSteps:
                    0,

                manualReviewSteps:
                    0,

                averageStepsPerPlan:
                    1

            },

            errors:
                []

        };

    const specifications:
        ScientificExecutionSpecificationResult = {

            generatedAt:
                new Date().toISOString(),

            campaignId,

            specifications: [

                {

                    specificationId:
                        "CONTROLLED-RUNTIME-SPECIFICATION-00001",

                    experimentId:
                        "CONTROLLED-RUNTIME-EXPERIMENT-00001",

                    executionTaskId:
                        "CONTROLLED-RUNTIME-TASK-00001",

                    executionPlanId:
                        "CONTROLLED-RUNTIME-PLAN-00001",

                    stepId,

                    specificationType:
                        "TEST_EXECUTION",

                    repository:
                        "controlled/missing-hardhat",

                    workingDirectory:
                        ".",

                    command:
                        "npx hardhat test",
                    testSelector:
                        null,

                    invariantSelector:
                        null,

                    supportCondition:
                        null,

                    challengeCondition:
                        null,

                    scientificPolarity:
                        "NEUTRAL",

                    expectedExitCode:
                        0,

                    resolutionStatus:
                        "EXECUTABLE",

                    unresolvedReasons:
                        [],

                    successCriteria:
                        [],

                    failureCriteria:
                        [],

                    generatedAt:
                        new Date().toISOString()

                }

            ],

            statistics: {

                total:
                    1,

                testExecution:
                    1,

                invariantValidation:
                    0,

                staticAnalysis:
                    0,

                executable:
                    1,

                unresolved:
                    0

            },

            errors:
                []

        };

    const result =
        await new ScientificExecutionRuntimeEngine().build(
            campaignId,
            plans,
            specifications
        );

    const execution =
        result.executions[0];

    console.log("");
    console.log(
        "=== CONTROLLED TOOLCHAIN UNAVAILABLE ==="
    );
    console.log(
        execution
    );

    if (
        !execution
    ) {

        throw new Error(
            "Controlled runtime execution was not produced."
        );

    }

    if (
        execution.status !==
        "UNSUPPORTED"
    ) {

        throw new Error(
            `Expected UNSUPPORTED but received ${execution.status}.`
        );

    }

    if (
        execution.runtime !==
        "TOOLCHAIN_UNAVAILABLE"
    ) {

        throw new Error(
            `Expected TOOLCHAIN_UNAVAILABLE but received ${execution.runtime}.`
        );

    }

    if (
        result.statistics.failure !==
        0
    ) {

        throw new Error(
            "Unavailable toolchain must not increment runtime FAILURE statistics."
        );

    }

    if (
        result.statistics.unsupported !==
        1
    ) {

        throw new Error(
            "Unavailable toolchain must increment runtime UNSUPPORTED statistics."
        );

    }

    console.log("");
    console.log(
        "CONTROLLED TOOLCHAIN UNAVAILABLE: PASS"
    );
       console.log(
        "HARDHAT LOCAL ABSENT -> UNSUPPORTED -> TOOLCHAIN_UNAVAILABLE -> FAILURE=0"
    );

}

main();