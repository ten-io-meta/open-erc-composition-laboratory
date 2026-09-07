import assert from "node:assert/strict";

import {
    access,
    mkdtemp,
    mkdir,
    rm,
    writeFile
} from "node:fs/promises";

import {
    join
} from "node:path";

import {
    tmpdir
} from "node:os";

import {
    execFile
} from "node:child_process";

import {
    promisify
} from "node:util";

import type {
    ScientificCompositionExecutionRequirement
} from "../laboratory/scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

import {
    ScientificCompositionWorkspaceMaterializer
} from "../laboratory/scientific-composition-workspace-materialization/ScientificCompositionWorkspaceMaterializer.js";


const execFileAsync =
    promisify(
        execFile
    );


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


async function git(
    repositoryPath: string,
    args: string[]
): Promise<string> {

    const {
        stdout
    } =
        await execFileAsync(
            "git",
            [
                "-C",
                repositoryPath,
                ...args
            ],
            {
                encoding: "utf8"
            }
        );

    return stdout.trim();

}


async function createRepository(
    root: string,
    name: string,
    payload: string
): Promise<{
    localPath: string;
    revision: string;
}> {

    const localPath =
        join(
            root,
            name
        );


    await mkdir(
        localPath,
        {
            recursive: true
        }
    );


    await execFileAsync(
        "git",
        [
            "init",
            localPath
        ]
    );


    await git(
        localPath,
        [
            "config",
            "user.email",
            "oecl@example.invalid"
        ]
    );

    await git(
        localPath,
        [
            "config",
            "user.name",
            "OECL Composition Test"
        ]
    );


    await writeFile(
        join(
            localPath,
            "payload.txt"
        ),
        payload + "\n",
        "utf8"
    );


    await git(
        localPath,
        [
            "add",
            "payload.txt"
        ]
    );

    await git(
        localPath,
        [
            "commit",
            "-m",
            "fixture revision"
        ]
    );


    return {

        localPath,

        revision:
            await git(
                localPath,
                [
                    "rev-parse",
                    "HEAD"
                ]
            )

    };

}


function requirement(
    requirementId: string,
    revisionA: string,
    revisionB: string
): ScientificCompositionExecutionRequirement {

    return {

        requirementId,

        evaluationSpecificationId:
            "SPECIFICATION-WORKSPACE-101-202",

        candidate: {

            candidateId:
                "CANDIDATE-WORKSPACE-101-202",

            participantA: {
                kind:
                    "PROTOCOL",
                id:
                    "ERC-101"
            },

            participantB: {
                kind:
                    "PROTOCOL",
                id:
                    "ERC-202"
            },

            mechanism:
                "SHARED_PROTOCOL_FOUNDATION",

            foundationProtocolId:
                "ERC-721",

            capabilityIds:
                [],

            provenance:
                []

        },

        constraints:
            [],

        participantAConstraintIds: [
            "CONSTRAINT-A"
        ],

        participantBConstraintIds: [
            "CONSTRAINT-B"
        ],

        unresolvedGuardFactIds:
            [],

        participantSources: [

            {
                participantSide:
                    "A",

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-101",

                sourceId:
                    "SOURCE-A",

                sourceRevision:
                    revisionA,

                repository:
                    "fixture/repository-a"
            },

            {
                participantSide:
                    "B",

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-202",

                sourceId:
                    "SOURCE-B",

                sourceRevision:
                    revisionB,

                repository:
                    "fixture/repository-b"
            }

        ]

    } as unknown as ScientificCompositionExecutionRequirement;

}


console.log("");
console.log(
    "SCIENTIFIC COMPOSITION WORKSPACE MATERIALIZATION"
);
console.log(
    "----------------------------------------------"
);


const temporaryRoot =
    await mkdtemp(
        join(
            tmpdir(),
            "oecl-composition-workspace-"
        )
    );


try {

    const originsRoot =
        join(
            temporaryRoot,
            "origins"
        );

    const workspaceRoot =
        join(
            temporaryRoot,
            "workspaces"
        );


    const repositoryA =
        await createRepository(
            originsRoot,
            "repository-a",
            "PARTICIPANT-A"
        );


    const repositoryB =
        await createRepository(
            originsRoot,
            "repository-b",
            "PARTICIPANT-B"
        );


    const materializer =
        new ScientificCompositionWorkspaceMaterializer();


    const successfulRequirement =
        requirement(
            "REQUIREMENT-WORKSPACE-SUCCESS",
            repositoryA.revision,
            repositoryB.revision
        );


    const result =
        await materializer.materialize(
            {
                requirement:
                    successfulRequirement,

                workspaceRoot,

                remoteUrls: {
                    "fixture/repository-a":
                        repositoryA.localPath,

                    "fixture/repository-b":
                        repositoryB.localPath
                }
            }
        );


    await check(
        "COMPOSITION WORKSPACE MATERIALIZES BOTH PINNED PARTICIPANTS",
        async () => {

            assert.equal(
                result.status,
                "MATERIALIZED"
            );

            assert.ok(
                result.workspacePath
            );

            assert.equal(
                result.sourceMaterializations.length,
                2
            );


            const materializedA =
                result.sourceMaterializations.find(
                    item =>
                        item.participantSide ===
                        "A"
                );


            const materializedB =
                result.sourceMaterializations.find(
                    item =>
                        item.participantSide ===
                        "B"
                );


            assert.ok(
                materializedA
            );

            assert.ok(
                materializedB
            );


            assert.equal(
                await git(
                    materializedA.localPath,
                    [
                        "rev-parse",
                        "HEAD"
                    ]
                ),
                repositoryA.revision
            );


            assert.equal(
                await git(
                    materializedB.localPath,
                    [
                        "rev-parse",
                        "HEAD"
                    ]
                ),
                repositoryB.revision
            );

        }
    );


    await check(
        "COMPOSITION WORKSPACE PRESERVES BILATERAL SOURCE IDENTITY",
        async () => {

            const materializedA =
                result.sourceMaterializations.find(
                    item =>
                        item.participantSide ===
                        "A"
                );


            const materializedB =
                result.sourceMaterializations.find(
                    item =>
                        item.participantSide ===
                        "B"
                );


            assert.ok(
                materializedA
            );

            assert.ok(
                materializedB
            );


            assert.equal(
                materializedA.participantId,
                "ERC-101"
            );

            assert.equal(
                materializedA.sourceId,
                "SOURCE-A"
            );

            assert.equal(
                materializedA.repository,
                "fixture/repository-a"
            );

            assert.equal(
                materializedA.requiredRevision,
                repositoryA.revision
            );

            assert.equal(
                materializedA.observedRevision,
                repositoryA.revision
            );

            assert.equal(
                materializedA.worktreeClean,
                true
            );


            assert.equal(
                materializedB.participantId,
                "ERC-202"
            );

            assert.equal(
                materializedB.sourceId,
                "SOURCE-B"
            );

            assert.equal(
                materializedB.repository,
                "fixture/repository-b"
            );

            assert.equal(
                materializedB.requiredRevision,
                repositoryB.revision
            );

            assert.equal(
                materializedB.observedRevision,
                repositoryB.revision
            );

            assert.equal(
                materializedB.worktreeClean,
                true
            );

        }
    );


    const impossibleRevision =
        "0000000000000000000000000000000000000000";


    const failingRequirement =
        requirement(
            "REQUIREMENT-WORKSPACE-FAIL",
            repositoryA.revision,
            impossibleRevision
        );


    const rejected =
        await materializer.materialize(
            {
                requirement:
                    failingRequirement,

                workspaceRoot,

                remoteUrls: {
                    "fixture/repository-a":
                        repositoryA.localPath,

                    "fixture/repository-b":
                        repositoryB.localPath
                }
            }
        );


    await check(
        "ONE PARTICIPANT FAILURE REJECTS ENTIRE COMPOSITION WORKSPACE",
        async () => {

            assert.equal(
                rejected.status,
                "REJECTED"
            );

            assert.equal(
                rejected.workspacePath,
                null
            );

            assert.deepEqual(
                rejected.sourceMaterializations,
                []
            );

            assert.ok(
                rejected.errors.length >
                0
            );


            const failedWorkspacePath =
                join(
                    workspaceRoot,
                    "REQUIREMENT-WORKSPACE-FAIL"
                );


            let failedWorkspaceStillExists =
                true;


            try {

                await access(
                    failedWorkspacePath
                );

            } catch {

                failedWorkspaceStillExists =
                    false;

            }


            assert.equal(
                failedWorkspaceStillExists,
                false
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
