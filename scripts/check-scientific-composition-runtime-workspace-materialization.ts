import assert from "node:assert/strict";

import {
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

import {
    ScientificExecutionRuntimeEngine
} from "../laboratory/scientific-execution-runtime/ScientificExecutionRuntimeEngine.js";


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
            "OECL Composition Runtime Test"
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


function buildRequirement(
    requirementId: string,
    revisionA: string,
    revisionB: string
): any {

    return {

        requirementId,

        evaluationSpecificationId:
            "SPECIFICATION-RUNTIME-WORKSPACE-101-202",

        candidate: {

            candidateId:
                "CANDIDATE-RUNTIME-WORKSPACE-101-202",

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

    };

}


function runtimeInputs(
    requirement: any
): {
    plans: any;
    specifications: any;
} {

    const step = {

        stepId:
            `STEP-${requirement.requirementId}`,

        stepType:
            "COMPOSITION_EXECUTION",

        requiredInputs: [
            requirement.requirementId,
            ...requirement.participantAConstraintIds,
            ...requirement.participantBConstraintIds
        ]

    };


    const plan = {

        executionPlanId:
            `PLAN-${requirement.requirementId}`,

        executionTaskId:
            `TASK-${requirement.requirementId}`,

        experimentId:
            `EXPERIMENT-${requirement.requirementId}`,

        targetType:
            "COMPOSITION_CANDIDATE",

        targetId:
            requirement.candidate.candidateId,

        sourceIds:
            requirement.participantSources.map(
                (source: any) =>
                    source.sourceId
            ),

        targetEvidenceIds:
            [],

        executionReady:
            true,

        compositionExecutionRequirement:
            requirement,

        steps: [
            step
        ],

        successCriteria:
            [],

        failureCriteria:
            []

    };


    const specification = {

        specificationId:
            `EXECUTION-SPEC-${requirement.requirementId}`,

        experimentId:
            plan.experimentId,

        executionTaskId:
            plan.executionTaskId,

        executionPlanId:
            plan.executionPlanId,

        stepId:
            step.stepId,

        specificationType:
            "COMPOSITION_EXECUTION",

        compositionExecutionRequirement:
            requirement,

        repository:
            null,

        selectedExecutableTarget:
            null,

        workingDirectory:
            null,

        command:
            null,

        testSelector:
            null,

        invariantSelector:
            null,

        supportCondition:
            null,

        challengeCondition:
            null,

        scientificPolarity:
            "NEUTRAL",

        expectedExitCode:
            null,

        resolutionStatus:
            "EXECUTABLE",

        unresolvedReasons:
            [],

        successCriteria:
            [],

        failureCriteria:
            [],

        generatedAt:
            new Date().toISOString()

    };


    return {

        plans: {
            plans: [
                plan
            ]
        },

        specifications: {
            specifications: [
                specification
            ]
        }

    };

}


console.log("");
console.log(
    "SCIENTIFIC COMPOSITION RUNTIME WORKSPACE MATERIALIZATION"
);
console.log(
    "--------------------------------------------------------"
);


const temporaryRoot =
    await mkdtemp(
        join(
            tmpdir(),
            "oecl-runtime-composition-workspace-"
        )
    );


try {

    const originsRoot =
        join(
            temporaryRoot,
            "origins"
        );

    const workspacesRoot =
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


    const successfulRequirement =
        buildRequirement(
            "REQUIREMENT-RUNTIME-WORKSPACE-SUCCESS",
            repositoryA.revision,
            repositoryB.revision
        );


    const successfulInputs =
        runtimeInputs(
            successfulRequirement
        );


    /*
     * Existing admission-only behavior remains a valid scientific
     * boundary when no physical workspace materialization has been
     * requested.
     */
    const admissionOnly =
        await new ScientificExecutionRuntimeEngine()
            .build(
                "CAMPAIGN-ADMISSION-ONLY",
                successfulInputs.plans,
                successfulInputs.specifications
            );



    await check(
        "RUNTIME WITHOUT WORKSPACE OPTIONS REMAINS ADMISSION ONLY",
        () => {

            assert.equal(
                admissionOnly.errors.length,
                0
            );

            assert.equal(
                admissionOnly.executions.length,
                1
            );

            assert.equal(
                admissionOnly.executions[0].runtime,
                "OECL_NATIVE_COMPOSITION_REQUIREMENT_ADMISSION"
            );

            assert.equal(
                admissionOnly.executions[0].status,
                "INCONCLUSIVE"
            );

        }
    );


    const materializedResult =
        await new ScientificExecutionRuntimeEngine()
            .build(
                "CAMPAIGN-RUNTIME-WORKSPACE",
                successfulInputs.plans,
                successfulInputs.specifications,
                {
                    compositionWorkspaceRoot:
                        workspacesRoot,

                    compositionRemoteUrls: {
                        "fixture/repository-a":
                            repositoryA.localPath,

                        "fixture/repository-b":
                            repositoryB.localPath
                    }
                }
            );



    const materializedExecution =
        materializedResult
            .executions[0] as any;



    await check(
        "COMPOSITION RUNTIME MATERIALIZES ATOMIC BILATERAL WORKSPACE",
        () => {

            assert.equal(
                materializedResult.errors.length,
                0
            );

            assert.equal(
                materializedResult.executions.length,
                1
            );

            assert.equal(
                materializedExecution.runtime,
                "OECL_NATIVE_COMPOSITION_WORKSPACE_MATERIALIZATION"
            );

            assert.equal(
                materializedExecution.status,
                "INCONCLUSIVE"
            );

            assert.ok(
                materializedExecution
                    .compositionWorkspaceMaterialization
            );

            assert.equal(
                materializedExecution
                    .compositionWorkspaceMaterialization
                    .status,
                "MATERIALIZED"
            );

            assert.ok(
                materializedExecution
                    .compositionWorkspaceMaterialization
                    .workspacePath
            );

            assert.equal(
                materializedExecution
                    .compositionWorkspaceMaterialization
                    .sourceMaterializations
                    .length,
                2
            );

        }
    );


    await check(
        "COMPOSITION RUNTIME WORKSPACE PRESERVES EXACT A AND B REVISIONS",
        async () => {

            const workspace =
                materializedExecution
                    .compositionWorkspaceMaterialization;


            const participantA =
                workspace
                    .sourceMaterializations
                    .find(
                        (item: any) =>
                            item.participantSide ===
                            "A"
                    );


            const participantB =
                workspace
                    .sourceMaterializations
                    .find(
                        (item: any) =>
                            item.participantSide ===
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
                repositoryA.revision
            );

            assert.equal(
                participantA.observedRevision,
                repositoryA.revision
            );

            assert.equal(
                await git(
                    participantA.localPath,
                    [
                        "rev-parse",
                        "HEAD"
                    ]
                ),
                repositoryA.revision
            );


            assert.equal(
                participantB.requiredRevision,
                repositoryB.revision
            );

            assert.equal(
                participantB.observedRevision,
                repositoryB.revision
            );

            assert.equal(
                await git(
                    participantB.localPath,
                    [
                        "rev-parse",
                        "HEAD"
                    ]
                ),
                repositoryB.revision
            );


            assert.equal(
                materializedExecution.repository,
                null
            );

            assert.equal(
                materializedExecution
                    .selectedExecutableTarget,
                null
            );


            assert.equal(
                materializedExecution
                    .observations
                    .includes(
                        "No participant contracts were executed by this runtime workspace materialization step."
                    ),
                true
            );

        }
    );


    const impossibleRevision =
        "0000000000000000000000000000000000000000";


    const failingRequirement =
        buildRequirement(
            "REQUIREMENT-RUNTIME-WORKSPACE-FAIL",
            repositoryA.revision,
            impossibleRevision
        );


    const failingInputs =
        runtimeInputs(
            failingRequirement
        );


    const rejectedResult =
        await new ScientificExecutionRuntimeEngine()
            .build(
                "CAMPAIGN-RUNTIME-WORKSPACE-REJECTED",
                failingInputs.plans,
                failingInputs.specifications,
                {
                    compositionWorkspaceRoot:
                        workspacesRoot,

                    compositionRemoteUrls: {
                        "fixture/repository-a":
                            repositoryA.localPath,

                        "fixture/repository-b":
                            repositoryB.localPath
                    }
                }
            );



    const rejectedExecution =
        rejectedResult
            .executions[0] as any;


    await check(
        "RUNTIME PRESERVES ALL OR NOTHING WHEN ONE PARTICIPANT CANNOT MATERIALIZE",
        () => {

            assert.equal(
                rejectedResult.errors.length,
                0
            );

            assert.equal(
                rejectedExecution.status,
                "INCONCLUSIVE"
            );

            assert.equal(
                rejectedExecution.runtime,
                "OECL_NATIVE_COMPOSITION_WORKSPACE_MATERIALIZATION"
            );

            assert.ok(
                rejectedExecution
                    .compositionWorkspaceMaterialization
            );

            assert.equal(
                rejectedExecution
                    .compositionWorkspaceMaterialization
                    .status,
                "REJECTED"
            );

            assert.equal(
                rejectedExecution
                    .compositionWorkspaceMaterialization
                    .workspacePath,
                null
            );

            assert.deepEqual(
                rejectedExecution
                    .compositionWorkspaceMaterialization
                    .sourceMaterializations,
                []
            );

            assert.ok(
                rejectedExecution.errors.length >
                0
            );

            assert.equal(
                rejectedExecution.repository,
                null
            );

            assert.equal(
                rejectedExecution
                    .selectedExecutableTarget,
                null
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
