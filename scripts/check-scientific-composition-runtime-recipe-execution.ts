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

import type {
    ScientificCompositionExecutionRequirement
} from "../laboratory/scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

import type {
    ScientificJointContractHarnessRecipeRegistration
} from "../laboratory/scientific-joint-contract-harness/ScientificJointContractHarnessRecipeRegistration.js";

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
                encoding:
                    "utf8"
            }
        );

    return stdout.trim();

}


async function createRepository(
    root: string,
    name: string
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
            recursive:
                true
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
            "OECL Runtime Recipe Test"
        ]
    );


    await writeFile(
        join(
            localPath,
            "payload.txt"
        ),
        name + "\n",
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
    revisionA: string,
    revisionB: string
): ScientificCompositionExecutionRequirement {

    return {

        requirementId:
            "REQUIREMENT-RUNTIME-RECIPE-101-202",

        evaluationSpecificationId:
            "SPECIFICATION-RUNTIME-RECIPE-101-202",

        candidate: {

            candidateId:
                "CANDIDATE-RUNTIME-RECIPE-101-202",

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
                    "fixture/runtime-repository-a"
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
                    "fixture/runtime-repository-b"
            }

        ]

    } as ScientificCompositionExecutionRequirement;

}


function runtimeInputs(
    requirement:
        ScientificCompositionExecutionRequirement
): {
    plans: any;
    specifications: any;
} {

    const step = {

        stepId:
            "STEP-COMPOSITION-RUNTIME-RECIPE",

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
            "PLAN-COMPOSITION-RUNTIME-RECIPE",

        executionTaskId:
            "TASK-COMPOSITION-RUNTIME-RECIPE",

        experimentId:
            "EXPERIMENT-COMPOSITION-RUNTIME-RECIPE",

        targetType:
            "COMPOSITION_CANDIDATE",

        targetId:
            requirement.candidate.candidateId,

        sourceIds:
            requirement.participantSources.map(
                source =>
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
            "EXECUTION-SPEC-COMPOSITION-RUNTIME-RECIPE",

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


function registration(
    registrationId: string,
    revisionA: string,
    revisionB: string
): ScientificJointContractHarnessRecipeRegistration {

    const driverSource = `
const report = {

    executionKind:
        "FIXTURE_RUNTIME_SELECTED_JOINT_EXECUTION",

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
        "FIXTURE_RUNTIME_RECIPE_SELECTED",
        "FIXTURE_BILATERAL_EXECUTION_OBSERVED"
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


    return {

        registrationId,

        applicability: {

            mechanism:
                "SHARED_PROTOCOL_FOUNDATION",

            foundationProtocolId:
                "ERC-721",

            participantA: {

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-101",

                repository:
                    "fixture/runtime-repository-a",

                sourceRevision:
                    revisionA

            },

            participantB: {

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-202",

                repository:
                    "fixture/runtime-repository-b",

                sourceRevision:
                    revisionB

            }

        },

        buildRecipe:
            () => ({

                recipeId:
                    `RECIPE-${registrationId}`,

                preparationSteps:
                    [],

                driver: {

                    participantSide:
                        "A",

                    fileName:
                        "runtime-selected-joint-driver.mjs",

                    source:
                        driverSource

                }

            })

    };

}


console.log("");
console.log(
    "SCIENTIFIC COMPOSITION RUNTIME RECIPE EXECUTION"
);
console.log(
    "-----------------------------------------------"
);


const temporaryRoot =
    await mkdtemp(
        join(
            tmpdir(),
            "oecl-runtime-recipe-"
        )
    );


try {

    const originsRoot =
        join(
            temporaryRoot,
            "origins"
        );


    const repositoryA =
        await createRepository(
            originsRoot,
            "repository-a"
        );


    const repositoryB =
        await createRepository(
            originsRoot,
            "repository-b"
        );


    const requirement =
        buildRequirement(
            repositoryA.revision,
            repositoryB.revision
        );


    const inputs =
        runtimeInputs(
            requirement
        );


    const baseOptions = {

        compositionWorkspaceRoot:
            join(
                temporaryRoot,
                "workspaces"
            ),

        compositionRemoteUrls: {

            "fixture/runtime-repository-a":
                repositoryA.localPath,

            "fixture/runtime-repository-b":
                repositoryB.localPath

        }

    };


    /*
     * ============================================================
     * EXACT ONE MATCH
     * ============================================================
     */

    const exactResult =
        await new ScientificExecutionRuntimeEngine()
            .build(
                "CAMPAIGN-RUNTIME-RECIPE-EXACT",
                inputs.plans,
                inputs.specifications,
                {
                    ...baseOptions,

                    compositionRecipeRegistrations: [
                        registration(
                            "EXACT",
                            repositoryA.revision,
                            repositoryB.revision
                        )
                    ]

                } as any
            );


    const exactExecution =
        exactResult.executions[0] as any;


    await check(
        "EXACT RUNTIME RECIPE SELECTION EXECUTES GENERIC JOINT HARNESS",
        () => {

            assert.equal(
                exactResult.errors.length,
                0
            );

            assert.equal(
                exactExecution.runtime,
                "OECL_NATIVE_COMPOSITION_JOINT_CONTRACT_EXECUTION"
            );

            assert.equal(
                exactExecution.status,
                "INCONCLUSIVE"
            );

            assert.ok(
                exactExecution
                    .jointContractHarnessExecution
            );

            assert.equal(
                exactExecution
                    .jointContractHarnessExecution
                    .status,
                "EXECUTED"
            );

            assert.equal(
                exactExecution
                    .jointContractHarnessExecution
                    .driverReport
                    .participantA
                    .executed,
                true
            );

            assert.equal(
                exactExecution
                    .jointContractHarnessExecution
                    .driverReport
                    .participantB
                    .executed,
                true
            );

        }
    );


    await check(
        "RUNTIME PRESERVES SERIALIZABLE EXACT RECIPE SELECTION SNAPSHOT",
        () => {

            assert.deepEqual(
                exactExecution
                    .compositionRecipeSelection,
                {
                    status:
                        "SELECTED",

                    selectedRegistrationId:
                        "EXACT",

                    matchingRegistrationIds: [
                        "EXACT"
                    ],

                    reasons: [
                        "Exactly one registered joint contract harness recipe matches the discovered composition requirement."
                    ]
                }
            );

            assert.equal(
                exactExecution.repository,
                null
            );

            assert.equal(
                exactExecution
                    .selectedExecutableTarget,
                null
            );

        }
    );


    /*
     * ============================================================
     * NO MATCH
     * ============================================================
     */

    const noMatchRegistration =
        registration(
            "WRONG-REVISION",
            repositoryA.revision,
            "3333333333333333333333333333333333333333"
        );


    const noMatchResult =
        await new ScientificExecutionRuntimeEngine()
            .build(
                "CAMPAIGN-RUNTIME-RECIPE-NO-MATCH",
                inputs.plans,
                inputs.specifications,
                {
                    ...baseOptions,

                    compositionRecipeRegistrations: [
                        noMatchRegistration
                    ]

                } as any
            );


    const noMatchExecution =
        noMatchResult.executions[0] as any;


    await check(
        "NO EXACT RECIPE REMAINS INCONCLUSIVE WITHOUT JOINT EXECUTION",
        () => {

            assert.equal(
                noMatchExecution.status,
                "INCONCLUSIVE"
            );

            assert.equal(
                noMatchExecution.runtime,
                "OECL_NATIVE_COMPOSITION_WORKSPACE_MATERIALIZATION"
            );

            assert.equal(
                noMatchExecution
                    .compositionRecipeSelection
                    .status,
                "NO_MATCH"
            );

            assert.equal(
                noMatchExecution
                    .jointContractHarnessExecution,
                undefined
            );

        }
    );


    /*
     * ============================================================
     * AMBIGUOUS
     * ============================================================
     */

    const ambiguousResult =
        await new ScientificExecutionRuntimeEngine()
            .build(
                "CAMPAIGN-RUNTIME-RECIPE-AMBIGUOUS",
                inputs.plans,
                inputs.specifications,
                {
                    ...baseOptions,

                    compositionRecipeRegistrations: [

                        registration(
                            "MATCH-A",
                            repositoryA.revision,
                            repositoryB.revision
                        ),

                        registration(
                            "MATCH-B",
                            repositoryA.revision,
                            repositoryB.revision
                        )

                    ]

                } as any
            );


    const ambiguousExecution =
        ambiguousResult.executions[0] as any;


    await check(
        "AMBIGUOUS RECIPE SELECTION FAILS CLOSED WITHOUT JOINT EXECUTION",
        () => {

            assert.equal(
                ambiguousExecution.status,
                "INCONCLUSIVE"
            );

            assert.equal(
                ambiguousExecution
                    .compositionRecipeSelection
                    .status,
                "AMBIGUOUS"
            );

            assert.deepEqual(
                ambiguousExecution
                    .compositionRecipeSelection
                    .matchingRegistrationIds,
                [
                    "MATCH-A",
                    "MATCH-B"
                ]
            );

            assert.equal(
                ambiguousExecution
                    .jointContractHarnessExecution,
                undefined
            );

            assert.ok(
                ambiguousExecution.errors.length >
                0
            );

        }
    );


    await check(
        "RUNTIME RECIPE EXECUTION CANNOT ESTABLISH COMPOSITION POLARITY",
        () => {

            assert.equal(
                exactExecution
                    .jointContractHarnessExecution
                    .scientificPolarity,
                "NEUTRAL"
            );

            assert.equal(
                exactExecution
                    .jointContractHarnessExecution
                    .driverReport
                    .scientificPolarity,
                "NEUTRAL"
            );

            assert.equal(
                exactExecution.status,
                "INCONCLUSIVE"
            );

        }
    );

} finally {

    await rm(
        temporaryRoot,
        {
            recursive:
                true,
            force:
                true
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
