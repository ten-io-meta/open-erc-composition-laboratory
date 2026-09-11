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
        "THIS TEST DOES NOT EXIST";

    hardhatSpecification.invariantSelector =
        "THIS TEST DOES NOT EXIST";

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
        "=== CONTROLLED ZERO TEST EXECUTION ==="
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
        "INCONCLUSIVE"
    ) {

        throw new Error(
            `Expected INCONCLUSIVE but received ${execution.status}.`
        );

    }

    if (
        execution.runtime !==
        "OECL_EXTERNAL_TEST_EXECUTION"
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
            "Zero executed tests must not increment FAILURE."
        );

    }

    if (
        result.statistics.inconclusive !==
        1
    ) {

        throw new Error(
            "Zero executed tests must increment INCONCLUSIVE."
        );

    }

    console.log("");
    console.log(
        "CONTROLLED ZERO TEST EXECUTION: PASS"
    );

    console.log(
        "0 PASSING -> INCONCLUSIVE -> FAILURE=0"
    );

}

main();