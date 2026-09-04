import {
    readFile
} from "fs/promises";

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

    const plans =
        JSON.parse(
            await readFile(
                "./scientific-execution-plan-results/" +
                "OECL-V2-SCIENTIFIC-EXECUTION-PLANS.json",
                "utf8"
            )
        ) as ScientificExecutionPlanResult;

    const specifications =
        JSON.parse(
            await readFile(
                "./scientific-execution-specification-results/" +
                "OECL-V2-SCIENTIFIC-EXECUTION-SPECIFICATIONS.json",
                "utf8"
            )
        ) as ScientificExecutionSpecificationResult;

    const sourcePlan =
        plans.plans.find(
            plan =>
                plan.steps.some(
                    step =>
                        step.stepType ===
                        "SOURCE_REINGESTION"
                )
        );

    if (
        !sourcePlan
    ) {

        throw new Error(
            "No plan containing SOURCE_REINGESTION was found."
        );

    }

    const sourceStep =
        sourcePlan.steps.find(
            step =>
                step.stepType ===
                "SOURCE_REINGESTION"
        );

    if (
        !sourceStep
    ) {

        throw new Error(
            "No SOURCE_REINGESTION step was found."
        );

    }

    /*
     * Controlled condition:
     * preserve the real execution plan but remove
     * repository inputs only from the in-memory copy.
     */
    const controlledPlan =
        structuredClone(
            sourcePlan
        );

    const controlledSourceStep =
        controlledPlan.steps.find(
            step =>
                step.stepId ===
                sourceStep.stepId
        );

    if (
        !controlledSourceStep
    ) {

        throw new Error(
            "Controlled SOURCE_REINGESTION step was not found."
        );

    }

    controlledSourceStep.requiredInputs =
        [];

    const controlledPlans:
        ScientificExecutionPlanResult = {

        ...plans,

        plans: [
            controlledPlan
        ]
    };

    const controlledStepIds =
        new Set(
            controlledPlan.steps.map(
                step =>
                    step.stepId
            )
        );

    const controlledSpecifications:
        ScientificExecutionSpecificationResult = {

        ...specifications,

        specifications:
            specifications.specifications.filter(
                specification =>
                    controlledStepIds.has(
                        specification.stepId
                    )
            )
    };

    const result =
        await new ScientificExecutionRuntimeEngine().build(
            controlledPlans.campaignId,
            controlledPlans,
            controlledSpecifications
        );

    const execution =
        result.executions.find(
            candidate =>
                candidate.stepId ===
                controlledSourceStep.stepId
        );

    console.log("");

    console.log(
        "=== CONTROLLED SOURCE REINGESTION NO INPUTS ==="
    );

    console.log(
        execution
    );

    if (
        !execution
    ) {

        throw new Error(
            "SOURCE_REINGESTION runtime execution was not produced."
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
        "OECL_NATIVE_SOURCE_REINGESTION"
    ) {

        throw new Error(
            `Unexpected runtime: ${execution.runtime}.`
        );

    }

    if (
        execution.startedAt ===
        null
    ) {

        /*
         * Native re-ingestion entered the runtime method,
         * so a start timestamp is expected even though
         * no repository could be processed.
         */
        throw new Error(
            "SOURCE_REINGESTION did not record its runtime start."
        );

    }

    if (
        !execution.errors.includes(
            "No source inputs were available for re-ingestion."
        )
    ) {

        throw new Error(
            "Expected no-source-input operational error was not recorded."
        );

    }

    if (
        execution.evidence.length !==
        0
    ) {

        throw new Error(
            "No-input SOURCE_REINGESTION must not produce scientific evidence."
        );

    }

    if (
        result.statistics.failure !==
        0
    ) {

        throw new Error(
            `No-input SOURCE_REINGESTION must not produce FAILURE; received ${result.statistics.failure}.`
        );

    }

    const targetFailures =
        result.executions.filter(
            candidate =>
                candidate.stepId ===
                    controlledSourceStep.stepId &&
                candidate.status ===
                    "FAILURE"
        ).length;

    if (
        targetFailures !==
        0
    ) {

        throw new Error(
            "No-input SOURCE_REINGESTION was classified as FAILURE."
        );

    }

    console.log("");

    console.log(
        "CONTROLLED SOURCE REINGESTION NO INPUTS: PASS"
    );

    console.log(
        "NO SOURCE INPUTS -> UNSUPPORTED -> FAILURE=0"
    );

}

main();