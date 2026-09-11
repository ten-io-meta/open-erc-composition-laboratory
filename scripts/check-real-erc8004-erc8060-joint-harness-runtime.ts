import assert from "node:assert/strict";

import {
    mkdtemp,
    rm
} from "node:fs/promises";

import {
    join
} from "node:path";

import {
    tmpdir
} from "node:os";

import type {
    ScientificCompositionExecutionRequirement
} from "../laboratory/scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

import {
    ScientificCompositionWorkspaceMaterializer
} from "../laboratory/scientific-composition-workspace-materialization/ScientificCompositionWorkspaceMaterializer.js";

import {
    ScientificJointContractHarnessExecutor
} from "../laboratory/scientific-joint-contract-harness/ScientificJointContractHarnessExecutor.js";

import {
    buildErc8004Erc8060ControlRecipe,
    ERC8004_CONTROL_REPOSITORY,
    ERC8004_CONTROL_REVISION,
    ERC8060_CONTROL_REPOSITORY,
    ERC8060_CONTROL_REVISION
} from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8004Erc8060ControlRecipe.js";


let pass = 0;
let fail = 0;


async function check(
    name: string,
    fn: () => Promise<void> | void
): Promise<void> {

    try {

        await fn();

        console.log(
            `${name}: PASS`
        );

        pass++;

    } catch (error) {

        console.log(
            `${name}: FAIL`
        );

        console.log(
            error instanceof Error
                ? error.message
                : String(error)
        );

        fail++;

    }

}


console.log("");
console.log(
    "REAL ERC-8004 x ERC-8060 JOINT CONTRACT HARNESS"
);
console.log(
    "------------------------------------------------"
);


const root =
    process.cwd();


const sourceAPath =
    join(
        root,
        "external",
        "github",
        "erc-8004",
        "erc-8004-contracts"
    );


const sourceBPath =
    join(
        root,
        "external",
        "github",
        "ten-io-meta",
        "erc8060-native-eth-value"
    );


const temporaryRoot =
    await mkdtemp(
        join(
            tmpdir(),
            "oj-"
        )
    );


try {

    const requirement = {

        requirementId:
            "RC-8004-8060",

        evaluationSpecificationId:
            "REAL-CONTROL-SPEC-8004-8060",

        candidate: {

            candidateId:
                "REAL-CONTROL-CANDIDATE-8004-8060",

            participantA: {
                kind:
                    "PROTOCOL",
                id:
                    "ERC-8004"
            },

            participantB: {
                kind:
                    "PROTOCOL",
                id:
                    "ERC-8060"
            },

            mechanism:
                "SHARED_PROTOCOL_FOUNDATION",

            foundationProtocolId:
                "ERC-721",

            supportingCapabilityIdsA:
                [],

            supportingCapabilityIdsB:
                [],

            provenance:
                [],

            evaluationStatus:
                "UNEVALUATED"

        },

        constraints:
            [],

        participantAConstraintIds:
            [],

        participantBConstraintIds:
            [],

        unresolvedGuardFactIds:
            [],

        participantSources: [

            {
                participantSide:
                    "A",

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-8004",

                sourceId:
                    "GITHUB-ERC-8004-ERC-8004-CONTRACTS",

                sourceRevision:
                    ERC8004_CONTROL_REVISION,

                repository:
                    ERC8004_CONTROL_REPOSITORY
            },

            {
                participantSide:
                    "B",

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-8060",

                sourceId:
                    "GITHUB-TEN-IO-META-ERC8060-NATIVE-ETH-VALUE",

                sourceRevision:
                    ERC8060_CONTROL_REVISION,

                repository:
                    ERC8060_CONTROL_REPOSITORY
            }

        ]

    } as unknown as ScientificCompositionExecutionRequirement;


    const workspace =
        await new ScientificCompositionWorkspaceMaterializer()
            .materialize(
                {
                    requirement,

                    workspaceRoot:
                        temporaryRoot,

                    remoteUrls: {

                        [ERC8004_CONTROL_REPOSITORY]:
                            sourceAPath,

                        [ERC8060_CONTROL_REPOSITORY]:
                            sourceBPath

                    }
                }
            );


    await check(
        "REAL CONTROL MATERIALIZES BOTH EXACT PINNED REVISIONS",
        () => {

            assert.equal(
                workspace.status,
                "MATERIALIZED"
            );

            assert.equal(
                workspace.sourceMaterializations.length,
                2
            );


            const a =
                workspace.sourceMaterializations.find(
                    source =>
                        source.participantSide === "A"
                );

            const b =
                workspace.sourceMaterializations.find(
                    source =>
                        source.participantSide === "B"
                );


            assert.ok(a);
            assert.ok(b);


            assert.equal(
                a.observedRevision,
                ERC8004_CONTROL_REVISION
            );

            assert.equal(
                b.observedRevision,
                ERC8060_CONTROL_REVISION
            );

        }
    );


    if (
        workspace.status !==
        "MATERIALIZED"
    ) {

        console.log(
            workspace.errors
        );

        throw new Error(
            "Real control workspace materialization failed."
        );

    }


    const execution =
        await new ScientificJointContractHarnessExecutor()
            .execute(
                {
                    workspace,

                    recipe:
                        buildErc8004Erc8060ControlRecipe()
                }
            );


    if (
        execution.status !==
        "EXECUTED"
    ) {

        console.log("");
        console.log(
            "=== JOINT EXECUTION ERRORS ==="
        );
        console.log(
            execution.errors
        );

        console.log("");
        console.log(
            "=== STDERR TAIL ==="
        );
        console.log(
            execution.stderr.slice(-5000)
        );

        console.log("");
        console.log(
            "=== STDOUT TAIL ==="
        );
        console.log(
            execution.stdout.slice(-5000)
        );

    }


    await check(
        "GENERIC EXECUTOR RUNS REAL ERC-8004 AND ERC-8060 CONTRACTS",
        () => {

            assert.equal(
                execution.status,
                "EXECUTED"
            );

            assert.ok(
                execution.driverReport
            );

            assert.equal(
                execution.driverReport.participantA.executed,
                true
            );

            assert.equal(
                execution.driverReport.participantB.executed,
                true
            );

            assert.ok(
                execution.driverReport
                    .participantA
                    .contractAddresses.length > 0
            );

            assert.ok(
                execution.driverReport
                    .participantB
                    .contractAddresses.length > 0
            );

            assert.ok(
                execution.driverReport
                    .participantA
                    .transactionHashes.length > 0
            );

            assert.ok(
                execution.driverReport
                    .participantB
                    .transactionHashes.length > 0
            );

        }
    );


    await check(
        "REAL PARTICIPANTS EXECUTE INSIDE ONE SHARED EVM",
        () => {

            assert.equal(
                execution.driverReport?.sharedRuntime,
                true
            );

            assert.equal(
                execution.driverReport?.chainId,
                31337
            );

        }
    );


    await check(
        "REAL SHARED ERC-721 FOUNDATION PROBE IS OBSERVED",
        () => {

            assert.equal(
                execution.driverReport
                    ?.observations
                    .includes(
                        "ERC721_SHARED_FOUNDATION_PROBE_PASSED"
                    ),
                true
            );

        }
    );


    await check(
        "REAL BILATERAL EXECUTION REMAINS SCIENTIFICALLY NEUTRAL",
        () => {

            assert.equal(
                execution.scientificPolarity,
                "NEUTRAL"
            );

            assert.equal(
                execution.driverReport?.scientificPolarity,
                "NEUTRAL"
            );

            assert.equal(
                execution.driverReport?.conclusion,
                "BILATERAL_EXECUTION_OBSERVED_WITHOUT_COMPOSITION_POLARITY"
            );

        }
    );


    if (
        execution.driverReport
    ) {

        console.log("");
        console.log(
            "=== REAL JOINT EXECUTION SUMMARY ==="
        );

        console.log(
            JSON.stringify(
                {
                    recipeId:
                        execution.recipeId,

                    chainId:
                        execution.driverReport.chainId,

                    participantA:
                        execution.driverReport.participantA,

                    participantB:
                        execution.driverReport.participantB,

                    observations:
                        execution.driverReport.observations,

                    scientificPolarity:
                        execution.scientificPolarity,

                    conclusion:
                        execution.driverReport.conclusion
                },
                null,
                2
            )
        );

    }

} finally {

    await rm(
        temporaryRoot,
        {
            recursive: true,
            force: true
        }
    );

}


console.log("");
console.log(
    `PASS: ${pass}`
);
console.log(
    `FAIL: ${fail}`
);
console.log(
    `RESULT: ${fail === 0 ? "PASS" : "FAIL"}`
);


if (
    fail > 0
) {

    process.exitCode =
        1;

}
