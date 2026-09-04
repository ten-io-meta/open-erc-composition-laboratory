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
    "test/OECLControlledRuntimeError.js";

const controlledFixtureContent =
`const { describe, it } = require("mocha");

describe("OECL controlled runtime error", function () {
    it("controlled non assertion failure", async function () {
        throw new Error("OECL_CONTROLLED_RUNTIME_ERROR");
    });
});
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
            "controlled non assertion failure";

        hardhatSpecification.invariantSelector =
            "controlled non assertion failure";

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
            "=== CONTROLLED NON-ASSERTION FAILURE EXECUTION ==="
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
            "FAILURE"
        ) {

            throw new Error(
                `Expected FAILURE but received ${execution.status}.`
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
            1
        ) {

            throw new Error(
                "Non-assertion test failure must increment FAILURE exactly once."
            );

        }

        if (
            result.statistics.inconclusive !==
            0
        ) {

            throw new Error(
                "Non-assertion test failure must not increment INCONCLUSIVE."
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
                "Runtime evidence does not contain the Hardhat failing-test signature."
            );

        }

        if (
            !/OECL_CONTROLLED_RUNTIME_ERROR/i.test(
                combinedEvidence
            )
        ) {

            throw new Error(
                "Runtime evidence does not contain the controlled runtime error."
            );

        }

        if (
            /AssertionError/i.test(
                combinedEvidence
            )
        ) {

            throw new Error(
                "Controlled non-assertion failure unexpectedly contains AssertionError."
            );

        }

        console.log("");
        console.log(
            "CONTROLLED NON-ASSERTION FAILURE EXECUTION: PASS"
        );

        console.log(
            "NON-ASSERTION TEST ERROR -> FAILURE -> INCONCLUSIVE=0"
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