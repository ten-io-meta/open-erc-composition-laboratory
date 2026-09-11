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
    "test/OECLControlledTimeout.js";

const controlledFixtureContent =
`const {
    describe,
    it
} = require("mocha");

describe(
    "OECL controlled timeout",
    function () {

        it(
            "controlled timeout target",
            async function () {

                this.timeout(
                    10_000
                );

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            5_000
                        )
                );

            }
        );

    }
);
`;

async function main() {

    const previousTimeout =
        process.env
            .OECL_EXTERNAL_EXECUTION_TIMEOUT_MS;

    process.env
        .OECL_EXTERNAL_EXECUTION_TIMEOUT_MS =
        "1000";

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
            "controlled timeout target";

        hardhatSpecification.invariantSelector =
            "controlled timeout target";

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
            "=== CONTROLLED TIMEOUT EXECUTION ==="
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
            !/controlled timeout target/i.test(
                combinedEvidence
            )
        ) {

            throw new Error(
                "Runtime evidence does not preserve the controlled timeout selector."
            );

        }

        console.log("");
        console.log(
            "CONTROLLED TIMEOUT EXECUTION: PASS"
        );

        console.log(
            "EXECUTION TIMEOUT -> INCONCLUSIVE -> FAILURE=0"
        );

    } finally {

        await rm(
            controlledFixturePath,
            {
                force: true
            }
        );

        if (
            previousTimeout ===
            undefined
        ) {

            delete process.env
                .OECL_EXTERNAL_EXECUTION_TIMEOUT_MS;

        } else {

            process.env
                .OECL_EXTERNAL_EXECUTION_TIMEOUT_MS =
                previousTimeout;

        }

    }

}

main();
