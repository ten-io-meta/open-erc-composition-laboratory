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
    "./external/github/ten-io-meta/erc8060-reservable/" +
    "test/OECLControlledHookFailure.js";

const controlledFixtureContent =
`const {
    describe,
    it,
    beforeEach
} = require("mocha");

describe(
    "OECL controlled hook failure",
    function () {

        beforeEach(
            function () {
                throw new Error(
                    "OECL_CONTROLLED_HOOK_ERROR"
                );
            }
        );

        it(
            "controlled hook failure target",
            function () {
                // Test body must never execute.
            }
        );

    }
);
`;

async function main() {

    await writeFile(
        controlledFixturePath,
        controlledFixtureContent,
        "utf8"
    );

    try {

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
            "controlled hook failure target";

        hardhatSpecification.invariantSelector =
            "controlled hook failure target";

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
            "=== CONTROLLED HOOK FAILURE EXECUTION ==="
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
                "Hook failure must not increment FAILURE."
            );

        }

        if (
            result.statistics.inconclusive !==
            1
        ) {

            throw new Error(
                "Hook failure must increment INCONCLUSIVE exactly once."
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
            !/\b1\s+failing\b/i.test(
                combinedEvidence
            )
        ) {

            throw new Error(
                "Runtime evidence does not contain the Hardhat failing signature."
            );

        }

        if (
            !/"before each" hook/i.test(
                combinedEvidence
            )
        ) {

            throw new Error(
                "Runtime evidence does not contain the beforeEach hook signature."
            );

        }

        if (
            !/OECL_CONTROLLED_HOOK_ERROR/i.test(
                combinedEvidence
            )
        ) {

            throw new Error(
                "Runtime evidence does not contain the controlled hook error."
            );

        }

        console.log("");
        console.log(
            "CONTROLLED HOOK FAILURE EXECUTION: PASS"
        );

        console.log(
            "HOOK FAILURE -> INCONCLUSIVE -> FAILURE=0"
        );

    } finally {

        await rm(
            controlledFixturePath,
            {
                force: true
            }
        );

    }

}

main();