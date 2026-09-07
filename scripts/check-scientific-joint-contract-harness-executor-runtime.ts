import assert from "node:assert/strict";

import {
    access,
    mkdir,
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
    ScientificCompositionWorkspaceMaterialization
} from "../laboratory/scientific-composition-workspace-materialization/ScientificCompositionWorkspaceMaterialization.js";

import type {
    ScientificJointContractHarnessRecipe
} from "../laboratory/scientific-joint-contract-harness/ScientificJointContractHarness.js";

import type {
    ScientificCompositionExecutionRequirement
} from "../laboratory/scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

import {
    ScientificJointContractHarnessExecutor
} from "../laboratory/scientific-joint-contract-harness/ScientificJointContractHarnessExecutor.js";


let pass =
    0;

let fail =
    0;


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
    "SCIENTIFIC JOINT CONTRACT HARNESS EXECUTOR"
);
console.log(
    "------------------------------------------"
);


const temporaryRoot =
    await mkdtemp(
        join(
            tmpdir(),
            "oecl-joint-harness-executor-"
        )
    );


try {

    const participantAPath =
        join(
            temporaryRoot,
            "participant-a"
        );

    const participantBPath =
        join(
            temporaryRoot,
            "participant-b"
        );


    await mkdir(
        join(
            participantAPath,
            ".git"
        ),
        {
            recursive: true
        }
    );

    await mkdir(
        participantBPath,
        {
            recursive: true
        }
    );


    const materializedWorkspace:
        ScientificCompositionWorkspaceMaterialization = {

            requirementId:
                "REQUIREMENT-JOINT-HARNESS",

            candidateId:
                "CANDIDATE-JOINT-HARNESS",

            workspacePath:
                temporaryRoot,

            sourceMaterializations: [

                {
                    participantSide:
                        "A",

                    participantKind:
                        "PROTOCOL",

                    participantId:
                        "PROTOCOL-A",

                    sourceId:
                        "SOURCE-A",

                    repository:
                        "fixture/repository-a",

                    requiredRevision:
                        "1111111111111111111111111111111111111111",

                    localPath:
                        participantAPath,

                    observedRevision:
                        "1111111111111111111111111111111111111111",

                    worktreeClean:
                        true
                },

                {
                    participantSide:
                        "B",

                    participantKind:
                        "PROTOCOL",

                    participantId:
                        "PROTOCOL-B",

                    sourceId:
                        "SOURCE-B",

                    repository:
                        "fixture/repository-b",

                    requiredRevision:
                        "2222222222222222222222222222222222222222",

                    localPath:
                        participantBPath,

                    observedRevision:
                        "2222222222222222222222222222222222222222",

                    worktreeClean:
                        true
                }

            ],

            status:
                "MATERIALIZED",

            errors:
                []

        };


    const rejectedWorkspace:
        ScientificCompositionWorkspaceMaterialization = {

            ...materializedWorkspace,

            workspacePath:
                null,

            sourceMaterializations:
                [],

            status:
                "REJECTED",

            errors: [
                "Fixture rejected workspace."
            ]

        };


    const requirement = {

        requirementId:
            "REQUIREMENT-CHANNEL-FIXTURE",

        evaluationSpecificationId:
            "SPECIFICATION-CHANNEL-FIXTURE",

        candidate: {
            candidateId:
                "CANDIDATE-CHANNEL-FIXTURE"
        },

        constraints: [
            {
                constraintId:
                    "CONSTRAINT-A-CHANNEL-FIXTURE"
            },
            {
                constraintId:
                    "CONSTRAINT-B-CHANNEL-FIXTURE"
            }
        ]

    } as unknown as ScientificCompositionExecutionRequirement;


    const driverSource = `
import {
    existsSync,
    readFileSync
} from "node:fs";

import {
    join
} from "node:path";


const participantA =
    process.env.OECL_PARTICIPANT_A_ROOT;

const participantB =
    process.env.OECL_PARTICIPANT_B_ROOT;


const requirementPath =
    process.env.OECL_COMPOSITION_EXECUTION_REQUIREMENT_PATH;


if (
    !requirementPath ||
    !existsSync(
        requirementPath
    )
) {

    throw new Error(
        "Composition execution requirement path was not supplied by OECL."
    );

}


const requirement =
    JSON.parse(
        readFileSync(
            requirementPath,
            "utf8"
        )
    );


if (
    !participantA ||
    !participantB
) {
    throw new Error(
        "Bilateral participant paths were not supplied."
    );
}


if (
    !existsSync(
        join(
            participantA,
            "prepared-A.txt"
        )
    )
) {
    throw new Error(
        "Participant A preparation was not observed."
    );
}


if (
    !existsSync(
        join(
            participantB,
            "prepared-B.txt"
        )
    )
) {
    throw new Error(
        "Participant B preparation was not observed."
    );
}


const report = {

    executionKind:
        "FIXTURE_REAL_BILATERAL_EXECUTION",

    chainId:
        31337,

    sharedRuntime:
        true,

    participantA: {

        executed:
            true,

        contractAddresses: [
            "0x00000000000000000000000000000000000000a1"
        ],

        transactionHashes: [
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        ]

    },

    participantB: {

        executed:
            true,

        contractAddresses: [
            "0x00000000000000000000000000000000000000b2"
        ],

        transactionHashes: [
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
        ]

    },

    observations: [
        "Fixture participant A executed.",
        "Fixture participant B executed.",
        "Both participants used one runtime.",
        (
            "Fixture requirement ID:" +
            requirement.requirementId
        ),
        (
            "Fixture candidate ID:" +
            requirement.candidate.candidateId
        ),
        (
            "Fixture constraint IDs:" +
            requirement.constraints
                .map(
                    constraint =>
                        constraint.constraintId
                )
                .join(",")
        ),
        "Fixture requirement path authority:OECL"
    ],

    constraintObservations: [

        {
            observationId:
                "OBSERVATION-A-CHANNEL-FIXTURE",

            candidateId:
                requirement.candidate.candidateId,

            constraintId:
                requirement.constraints[0].constraintId,

            participantSide:
                "A",

            verdict:
                "PRESERVED",

            evidence: [
                "FIXTURE-A-CONSTRAINT-PRESERVED"
            ]
        },

        {
            observationId:
                "OBSERVATION-B-CHANNEL-FIXTURE",

            candidateId:
                requirement.candidate.candidateId,

            constraintId:
                requirement.constraints[1].constraintId,

            participantSide:
                "B",

            verdict:
                "VIOLATED",

            evidence: [
                "FIXTURE-B-CONSTRAINT-VIOLATED"
            ]
        }

    ],

    scientificPolarity:
        "NEUTRAL",

    conclusion:
        "BILATERAL_EXECUTION_OBSERVED_WITHOUT_COMPOSITION_POLARITY"

};


console.log(
    "OECL_JOINT_EXECUTION_RESULT=" +
    JSON.stringify(
        report
    )
);
`;


    const recipe:
        ScientificJointContractHarnessRecipe = {

            recipeId:
                "RECIPE-GENERIC-JOINT-EXECUTION",

            preparationSteps: [

                {
                    stepId:
                        "PREPARE-A",

                    participantSide:
                        "A",

                    command:
                        "node",

                    args: [
                        "-e",
                        (
                            "require('fs').writeFileSync(" +
                            "'prepared-A.txt','A')"
                        )
                    ]
                },

                {
                    stepId:
                        "PREPARE-B",

                    participantSide:
                        "B",

                    command:
                        "node",

                    args: [
                        "-e",
                        (
                            "require('fs').writeFileSync(" +
                            "'prepared-B.txt','B')"
                        )
                    ]
                }

            ],

            driver: {

                participantSide:
                    "A",

                fileName:
                    "oecl-joint-driver.mjs",

                source:
                    driverSource,

                env: {
                    OECL_COMPOSITION_EXECUTION_REQUIREMENT_PATH:
                        "__RECIPE_MUST_NOT_OVERRIDE_REQUIREMENT_PATH__"
                }

            }

        };


    const executor =
        new ScientificJointContractHarnessExecutor();


    const rejected =
        await executor.execute(
            {
                workspace:
                    rejectedWorkspace,

                recipe
            }
        );


    await check(
        "REJECTED WORKSPACE CANNOT ENTER JOINT CONTRACT EXECUTION",
        () => {

            assert.equal(
                rejected.status,
                "REJECTED"
            );

            assert.equal(
                rejected.driverReport,
                null
            );

            assert.equal(
                rejected.scientificPolarity,
                "NEUTRAL"
            );

        }
    );


    const executed =
        await executor.execute(
            {
                workspace:
                    materializedWorkspace,

                recipe,

                requirement
            }
        );


    await check(
        "GENERIC EXECUTOR PREPARES AND EXECUTES BOTH PARTICIPANTS",
        async () => {

            assert.equal(
                executed.status,
                "EXECUTED"
            );

            assert.ok(
                executed.driverReport
            );

            await access(
                join(
                    participantAPath,
                    "prepared-A.txt"
                )
            );

            await access(
                join(
                    participantBPath,
                    "prepared-B.txt"
                )
            );

            assert.equal(
                executed.driverReport
                    .participantA
                    .executed,
                true
            );

            assert.equal(
                executed.driverReport
                    .participantB
                    .executed,
                true
            );

        }
    );


    await check(
        "GENERIC EXECUTOR PRESERVES BILATERAL SOURCE IDENTITY AND SHARED RUNTIME",
        () => {

            assert.equal(
                executed.participantSources.length,
                2
            );

            const participantA =
                executed.participantSources.find(
                    source =>
                        source.participantSide ===
                        "A"
                );

            const participantB =
                executed.participantSources.find(
                    source =>
                        source.participantSide ===
                        "B"
                );


            assert.ok(
                participantA
            );

            assert.ok(
                participantB
            );


            assert.equal(
                participantA.requiredRevision,
                participantA.observedRevision
            );

            assert.equal(
                participantB.requiredRevision,
                participantB.observedRevision
            );


            assert.equal(
                executed.driverReport
                    ?.chainId,
                31337
            );

            assert.equal(
                executed.driverReport
                    ?.sharedRuntime,
                true
            );

        }
    );


    await check(
        "GENERIC EXECUTOR RECEIVES EXACT RUNTIME COMPOSITION REQUIREMENT",
        () => {

            const observations =
                executed
                    .driverReport
                    ?.observations ??
                [];


            assert.ok(
                observations.includes(
                    "Fixture requirement ID:REQUIREMENT-CHANNEL-FIXTURE"
                )
            );


            assert.ok(
                observations.includes(
                    "Fixture candidate ID:CANDIDATE-CHANNEL-FIXTURE"
                )
            );


            assert.ok(
                observations.includes(
                    (
                        "Fixture constraint IDs:" +
                        "CONSTRAINT-A-CHANNEL-FIXTURE," +
                        "CONSTRAINT-B-CHANNEL-FIXTURE"
                    )
                )
            );

        }
    );


    await check(
        "RECIPE CANNOT OVERRIDE OECL COMPOSITION REQUIREMENT PATH",
        () => {

            assert.equal(
                executed.status,
                "EXECUTED"
            );


            assert.ok(
                executed
                    .driverReport
                    ?.observations
                    .includes(
                        "Fixture requirement path authority:OECL"
                    )
            );

        }
    );


    await check(
        "TEMPORARY COMPOSITION REQUIREMENT FILE IS REMOVED AFTER EXECUTION",
        async () => {

            await assert.rejects(
                access(
                    join(
                        participantAPath,
                        ".git",
                        "oecl-joint-runtime",
                        "composition-execution-requirement.json"
                    )
                )
            );

        }
    );


    await check(
        "GENERIC EXECUTOR PRESERVES STRUCTURED CONSTRAINT OBSERVATIONS",
        () => {

            const observations =
                executed
                    .driverReport
                    ?.constraintObservations ??
                [];


            assert.equal(
                observations.length,
                2
            );


            assert.equal(
                observations[0].constraintId,
                "CONSTRAINT-A-CHANNEL-FIXTURE"
            );

            assert.equal(
                observations[0].participantSide,
                "A"
            );

            assert.equal(
                observations[0].verdict,
                "PRESERVED"
            );


            assert.equal(
                observations[1].constraintId,
                "CONSTRAINT-B-CHANNEL-FIXTURE"
            );

            assert.equal(
                observations[1].participantSide,
                "B"
            );

            assert.equal(
                observations[1].verdict,
                "VIOLATED"
            );

        }
    );


    await check(
        "STRUCTURED CONSTRAINT OBSERVATIONS CANNOT SET HARNESS POLARITY",
        () => {

            assert.equal(
                executed.scientificPolarity,
                "NEUTRAL"
            );

            assert.equal(
                executed
                    .driverReport
                    ?.scientificPolarity,
                "NEUTRAL"
            );

        }
    );


    await check(
        "BILATERAL EXECUTION CANNOT CLAIM COMPOSITION POLARITY",
        () => {

            assert.equal(
                executed.scientificPolarity,
                "NEUTRAL"
            );

            assert.equal(
                executed.driverReport
                    ?.scientificPolarity,
                "NEUTRAL"
            );

            assert.equal(
                executed.driverReport
                    ?.conclusion,
                "BILATERAL_EXECUTION_OBSERVED_WITHOUT_COMPOSITION_POLARITY"
            );

        }
    );

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
    `RESULT: ${
        fail === 0
            ? "PASS"
            : "FAIL"
    }`
);


if (
    fail >
    0
) {

    process.exitCode =
        1;

}
