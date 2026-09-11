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
    "test/OECLControlledAssertionFailure.js";

const controlledFixtureContent =
`const {
    describe,
    it
} = require("mocha");

const {
    expect
} = require("chai");

describe(
    "OECL controlled assertion failure",
    function () {

        it(
            "controlled assertion failure",
            async function () {

                expect(
                    1
                ).to.equal(
                    2
                );

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
        "controlled assertion failure";

    hardhatSpecification.invariantSelector =
        "controlled assertion failure";

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
        "=== CONTROLLED ASSERTION FAILURE EXECUTION ==="
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
        !/AssertionError/i.test(
            combinedEvidence
        )
    ) {

        throw new Error(
            "Runtime evidence does not contain AssertionError."
        );

    }

    console.log("");
    console.log(
        "CONTROLLED ASSERTION FAILURE EXECUTION: PASS"
    );

    console.log(
        "ASSERTION ERROR -> FAILURE -> INCONCLUSIVE=0"
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
