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

    hardhatSpecification.testSelector =
        "unsafe selector && echo OECL_UNSAFE";

    hardhatSpecification.invariantSelector =
        "unsafe selector && echo OECL_UNSAFE";

    const result =
        await new ScientificExecutionRuntimeEngine().build(
            plans.campaignId,
            plans,
            specifications
        );

    const execution =
        result.executions.find(
            candidate =>
                candidate.stepId ===
                hardhatSpecification.stepId
        );

    console.log("");
    console.log(
        "=== CONTROLLED UNSAFE SELECTOR EXECUTION ==="
    );
    console.log(
        execution
    );

    if (
        !execution
    ) {

        throw new Error(
            "Runtime execution was not produced."
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
        "SELECTOR_EXECUTION_UNSUPPORTED"
    ) {

        throw new Error(
            `Unexpected runtime: ${execution.runtime}.`
        );

    }

    if (
        result.statistics.failure !==
        0
    ) {

        throw new Error(
            "Unsafe selector must not increment FAILURE."
        );

    }

    if (
        result.statistics.unsupported !==
        1
    ) {

        throw new Error(
            "Unsafe selector must increment UNSUPPORTED exactly once."
        );

    }

    const combinedEvidence =
        [
            ...execution.evidence,
            ...execution.errors
        ].join(
            "\n"
        );

    if (
        !/SELECTOR:unsafe selector && echo OECL_UNSAFE/i.test(
            combinedEvidence
        )
    ) {

        throw new Error(
            "Runtime evidence does not preserve the rejected selector."
        );

    }

    console.log("");
    console.log(
        "CONTROLLED UNSAFE SELECTOR EXECUTION: PASS"
    );

    console.log(
        "UNSAFE SELECTOR -> UNSUPPORTED -> SUITE NOT EXECUTED"
    );

}

main();