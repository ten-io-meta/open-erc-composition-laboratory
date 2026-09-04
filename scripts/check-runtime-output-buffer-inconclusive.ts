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
    "./external/github/ten-io-meta/erc8060-reservable/test/" +
    "OECLControlledOutputBuffer.js";

const controlledFixtureContent =
`const {
    describe,
    it
} = require("mocha");

describe(
    "OECL controlled output buffer",
    function () {

        it(
            "controlled output buffer target",
            async function () {

                process.stdout.write(
                    "A".repeat(
                        12 * 1024 * 1024
                    )
                );

            }
        );

    }
);
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
            "controlled output buffer target";

        hardhatSpecification.invariantSelector =
            "controlled output buffer target";

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
            "=== CONTROLLED OUTPUT BUFFER EXECUTION ==="
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
            runtimeResult.statistics.failure !==
            0
        ) {

            throw new Error(
                "Output buffer overflow must not increment FAILURE."
            );

        }

        if (
            runtimeResult.statistics.inconclusive !==
            1
        ) {

            throw new Error(
                "Output buffer overflow must increment INCONCLUSIVE exactly once."
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
                "EXECUTION_CAUSE:OUTPUT_BUFFER_EXCEEDED"
            )
        ) {

            throw new Error(
                "Runtime evidence does not contain OUTPUT_BUFFER_EXCEEDED."
            );

        }
if (
    !combinedEvidence.includes(
        "OECL_OUTPUT_TRUNCATED:"
    )
) {

    throw new Error(
        "Runtime evidence does not contain the output truncation marker."
    );

}
        if (
            !combinedEvidence.includes(
                "ERR_CHILD_PROCESS_STDIO_MAXBUFFER"
            ) &&
            !combinedEvidence.includes(
                "maxBuffer length exceeded"
            )
        ) {

            throw new Error(
                "Runtime evidence does not contain the maxBuffer failure signature."
            );

        }

        console.log("");
        console.log(
            "CONTROLLED OUTPUT BUFFER EXECUTION: PASS"
        );

        console.log(
            "OUTPUT BUFFER EXCEEDED -> INCONCLUSIVE -> FAILURE=0"
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