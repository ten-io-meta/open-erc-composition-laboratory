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

    const hardhatSpecification =
        specifications.specifications.find(
            specification =>
                specification.command ===
                "npx hardhat test"
        );

    if (
        !hardhatSpecification
    ) {

        throw new Error(
            "No executable Hardhat specification was found."
        );

    }

    const matchingPlan =
        plans.plans.find(
            plan =>
                plan.steps.some(
                    step =>
                        step.stepId ===
                        hardhatSpecification.stepId
                )
        );

    if (
        !matchingPlan
    ) {

        throw new Error(
            "No execution plan was found for the Hardhat specification."
        );

    }

    const matchingStep =
        matchingPlan.steps.find(
            step =>
                step.stepId ===
                hardhatSpecification.stepId
        );

    if (
        !matchingStep
    ) {

        throw new Error(
            "No execution step was found for the Hardhat specification."
        );

    }

   const selectorA =
    "settles escrow without releasing reserved accounting";

const selectorB =
    "settles escrow without releasing reserved accounting";

    const clonedPlan =
        structuredClone(
            matchingPlan
        );

    clonedPlan.executionPlanId =
        `${matchingPlan.executionPlanId}-CACHE-B`;

    clonedPlan.executionTaskId =
        `${matchingPlan.executionTaskId}-CACHE-B`;

    clonedPlan.experimentId =
        `${matchingPlan.experimentId}-CACHE-B`;

    const clonedStep =
        clonedPlan.steps.find(
            step =>
                step.stepId ===
                matchingStep.stepId
        );

    if (
        !clonedStep
    ) {

        throw new Error(
            "Cloned execution step was not found."
        );

    }

    clonedStep.stepId =
        `${matchingStep.stepId}-CACHE-B`;

    const clonedSpecification =
        structuredClone(
            hardhatSpecification
        );

    clonedSpecification.stepId =
        clonedStep.stepId;

    hardhatSpecification.testSelector =
        selectorA;

    hardhatSpecification.invariantSelector =
        selectorA;

    clonedSpecification.testSelector =
        selectorB;

    clonedSpecification.invariantSelector =
        selectorB;

    const controlledPlans =
        structuredClone(
            plans
        );

    controlledPlans.plans = [
        matchingPlan,
        clonedPlan
    ];

    const controlledSpecifications =
        structuredClone(
            specifications
        );

    controlledSpecifications.specifications = [
        hardhatSpecification,
        clonedSpecification
    ];

    const result =
        await new ScientificExecutionRuntimeEngine().build(
            controlledPlans.campaignId,
            controlledPlans,
            controlledSpecifications
        );

    const executionA =
        result.executions.find(
            execution =>
                execution.stepId ===
                matchingStep.stepId
        );

    const executionB =
        result.executions.find(
            execution =>
                execution.stepId ===
                clonedStep.stepId
        );

    if (
        !executionA ||
        !executionB
    ) {

        throw new Error(
            "Both controlled executions were not produced."
        );

    }

    const executionAReused =
        executionA.evidence.some(
            evidence =>
                evidence.startsWith(
                    "REUSED_RUNTIME_EXECUTION:"
                )
        );

    const executionBReused =
        executionB.evidence.some(
            evidence =>
                evidence.startsWith(
                    "REUSED_RUNTIME_EXECUTION:"
                )
        );

    console.log("");
    console.log(
        "=== CONTROLLED CACHE SELECTOR ISOLATION ==="
    );

    console.log(
        "Execution A:",
        executionA.status,
        executionAReused
    );

    console.log(
        "Execution B:",
        executionB.status,
        executionBReused
    );

    if (
        executionAReused
    ) {

        throw new Error(
            "First execution must not be reused."
        );

    }

    if (
    !executionBReused
) {

    throw new Error(
        "Identical selector did not reuse cached execution."
    );

}

    if (
        executionA.status !==
            "SUCCESS" ||
        executionB.status !==
            "SUCCESS"
    ) {

        throw new Error(
            "Both selector-isolated executions must succeed."
        );

    }

    console.log("");
    console.log(
    "CONTROLLED CACHE IDENTICAL REUSE: PASS"
);

console.log(
    "SAME COMMAND + SAME SELECTOR -> CACHE REUSED"
);

}

main();