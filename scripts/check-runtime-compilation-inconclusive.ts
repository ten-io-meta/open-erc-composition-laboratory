import {
    readFile,
    writeFile,
    rm
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

const controlledFixturePath =
    "./external/github/ten-io-meta/erc8060-reservable/contracts/" +
    "OECLControlledCompileFailure.sol";

const controlledFixtureContent =
`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OECLControlledCompileFailure {

    function broken(
        external
    )

}
`;

async function main() {

    const previousFixture =
        await readFile(
            controlledFixturePath,
            "utf8"
        ).catch(
            () => null
        );

    try {

        await writeFile(
            controlledFixturePath,
            controlledFixtureContent,
            "utf8"
        );

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

        const runtimeResult =
            await new ScientificExecutionRuntimeEngine().build(
                plans.campaignId,
                plans,
                specifications
            );

        const execution =
            runtimeResult.executions.find(
                candidate =>
                    candidate.stepId ===
                    hardhatSpecification.stepId
            );

        console.log("");
        console.log(
            "=== CONTROLLED COMPILATION FAILURE EXECUTION ==="
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
            !/EXECUTION_CAUSE:COMPILATION_FAILURE/i.test(
                combinedEvidence
            )
        ) {

            throw new Error(
                "Runtime evidence does not contain COMPILATION_FAILURE."
            );

        }

        if (
            !/HH600|Compilation failed/i.test(
                combinedEvidence
            )
        ) {

            throw new Error(
                "Runtime evidence does not contain the Hardhat compilation signature."
            );

        }

        console.log("");
        console.log(
            "CONTROLLED COMPILATION FAILURE EXECUTION: PASS"
        );

        console.log(
            "COMPILATION FAILURE -> INCONCLUSIVE -> FAILURE=0"
        );

    } finally {

        if (
            previousFixture ===
            null
        ) {

            await rm(
                controlledFixturePath,
                {
                    force: true
                }
            );

        } else {

            await writeFile(
                controlledFixturePath,
                previousFixture,
                "utf8"
            );

        }

    }

}

main();
