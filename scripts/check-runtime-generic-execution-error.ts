import {
    readFile,
    rename
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

const repositoryDirectory =
    "./external/github/ten-io-meta/erc8060-reservable";

const hardhatConfigPath =
    `${repositoryDirectory}/hardhat.config.js`;

const hardhatConfigBackupPath =
    `${repositoryDirectory}/hardhat.config.js.oecl-generic-error-backup`;

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
        "settles escrow without releasing reserved accounting";

    hardhatSpecification.invariantSelector =
        "settles escrow without releasing reserved accounting";

    let configMoved =
        false;

    try {

        await rename(
            hardhatConfigPath,
            hardhatConfigBackupPath
        );

        configMoved =
            true;

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
            "=== CONTROLLED GENERIC EXECUTION ERROR ==="
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


        const combinedEvidence =
            [
                ...execution.evidence,
                ...execution.errors
            ].join(
                "\n"
            );

        if (
            !combinedEvidence.includes(
                "EXECUTION_CAUSE:EXECUTION_ERROR"
            )
        ) {

            throw new Error(
                "Runtime evidence does not contain EXECUTION_CAUSE:EXECUTION_ERROR."
            );

        }

        if (
            combinedEvidence.includes(
                "EXECUTION_CAUSE:TEST_FAILURE"
            )
        ) {

            throw new Error(
                "Generic execution error was incorrectly classified as TEST_FAILURE."
            );

        }

        if (
            combinedEvidence.includes(
                "EXECUTION_CAUSE:COMPILATION_FAILURE"
            )
        ) {

            throw new Error(
                "Generic execution error was incorrectly classified as COMPILATION_FAILURE."
            );

        }

        if (
            combinedEvidence.includes(
                "EXECUTION_CAUSE:HOOK_FAILURE"
            )
        ) {

            throw new Error(
                "Generic execution error was incorrectly classified as HOOK_FAILURE."
            );

        }

        if (
            combinedEvidence.includes(
                "EXECUTION_CAUSE:EXECUTION_TIMEOUT"
            )
        ) {

            throw new Error(
                "Generic execution error was incorrectly classified as EXECUTION_TIMEOUT."
            );

        }

        if (
            combinedEvidence.includes(
                "EXECUTION_CAUSE:OUTPUT_BUFFER_EXCEEDED"
            )
        ) {

            throw new Error(
                "Generic execution error was incorrectly classified as OUTPUT_BUFFER_EXCEEDED."
            );

        }

        console.log("");

        console.log(
            "CONTROLLED GENERIC EXECUTION ERROR: PASS"
        );

        console.log(
            "EXECUTION_ERROR -> INCONCLUSIVE -> FAILURE=0"
        );

    } finally {

        if (
            configMoved
        ) {

            await rename(
                hardhatConfigBackupPath,
                hardhatConfigPath
            );

        }

    }

}

main();
