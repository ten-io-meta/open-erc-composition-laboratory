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
    ScientificExecutionRuntimeEngine
} from "../laboratory/scientific-execution-runtime/ScientificExecutionRuntimeEngine.js";

import {
    buildErc8004Erc8060ControlRegistration,
    ERC8004_ERC8060_CONTROL_REGISTRATION_ID
} from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8004Erc8060ControlRegistration.js";

import {
    ERC8004_CONTROL_REPOSITORY,
    ERC8004_CONTROL_REVISION,
    ERC8060_CONTROL_REPOSITORY,
    ERC8060_CONTROL_REVISION
} from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8004Erc8060ControlRecipe.js";


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


async function loadRealRequirement():
    Promise<ScientificCompositionExecutionRequirement> {

    const runnerPath =
        join(
            process.cwd(),
            "scripts",
            "run-real-scientific-cross-protocol.ts"
        );


    const env = {

        ...process.env,

        OECL_EMIT_COMPOSITION_EXECUTION_REQUIREMENTS:
            "1"

    };


    const invocation =
        process.platform ===
        "win32"
            ? {
                command:
                    process.env.ComSpec ??
                    "cmd.exe",

                args: [
                    "/d",
                    "/c",
                    "npx.cmd",
                    "tsx",
                    runnerPath
                ]
            }
            : {
                command:
                    "npx",

                args: [
                    "tsx",
                    runnerPath
                ]
            };


    const {
        stdout,
        stderr
    } =
        await execFileAsync(
            invocation.command,
            invocation.args,
            {
                cwd:
                    process.cwd(),

                env,

                encoding:
                    "utf8",

                maxBuffer:
                    64 * 1024 * 1024
            }
        );


    const prefix =
        "OECL_COMPOSITION_EXECUTION_REQUIREMENTS=";


    const records =
        stdout
            .split(
                /\r?\n/
            )
            .filter(
                line =>
                    line.startsWith(
                        prefix
                    )
            );


    if (
        records.length !==
        1
    ) {

        throw new Error(
            [
                "Real scientific runner did not emit exactly one requirement record.",
                stderr.slice(
                    -3000
                )
            ].join(
                "\n"
            )
        );

    }


    const exported =
        JSON.parse(
            records[0].slice(
                prefix.length
            )
        ) as ScientificCompositionExecutionRequirement[];


    if (
        !Array.isArray(
            exported
        )
    ) {

        throw new Error(
            "Real scientific requirement export is not an array."
        );

    }


    const matches =
        exported.filter(
            requirement =>
                requirement
                    .candidate
                    .participantA
                    .kind ===
                    "PROTOCOL" &&
                requirement
                    .candidate
                    .participantA
                    .id ===
                    "ERC-8004" &&
                requirement
                    .candidate
                    .participantB
                    .kind ===
                    "PROTOCOL" &&
                requirement
                    .candidate
                    .participantB
                    .id ===
                    "ERC-8060" &&
                requirement
                    .candidate
                    .mechanism ===
                    "SHARED_PROTOCOL_FOUNDATION" &&
                requirement
                    .candidate
                    .foundationProtocolId ===
                    "ERC-721"
        );


    if (
        matches.length !==
        1
    ) {

        throw new Error(
            (
                "Expected exactly one real ERC-8004 x ERC-8060 " +
                `execution requirement, observed ${matches.length}.`
            )
        );

    }


    return matches[0];

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
            "REAL-COMPOSITION-EXECUTION-STEP-8004-8060",

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
            "REAL-EXECUTION-PLAN-8004-8060",

        executionTaskId:
            "REAL-EXECUTION-TASK-8004-8060",

        experimentId:
            "REAL-EXPERIMENT-8004-8060",

        targetType:
            "COMPOSITION_CANDIDATE",

        targetId:
            requirement.candidate.candidateId,

        sourceIds:
            requirement
                .participantSources
                .map(
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
            "REAL-EXECUTION-SPECIFICATION-8004-8060",

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
    "REAL ERC-8004 x ERC-8060 COMPOSITION RUNTIME END TO END"
);
console.log(
    "-------------------------------------------------------"
);


const repositoryRoot =
    process.cwd();


const sourceAPath =
    join(
        repositoryRoot,
        "external",
        "github",
        "erc-8004",
        "erc-8004-contracts"
    );


const sourceBPath =
    join(
        repositoryRoot,
        "external",
        "github",
        "ten-io-meta",
        "erc8060-native-eth-value"
    );


const temporaryRoot =
    await mkdtemp(
        join(
            tmpdir(),
            "ojr-"
        )
    );


try {

    const requirement =
        await loadRealRequirement();


    await check(
        "REAL DISCOVERY PRODUCES READY BILATERAL EXECUTION REQUIREMENT",
        () => {

            assert.equal(
                requirement.constraints.length,
                17
            );

            assert.equal(
                requirement
                    .participantAConstraintIds
                    .length,
                10
            );

            assert.equal(
                requirement
                    .participantBConstraintIds
                    .length,
                7
            );

            assert.equal(
                requirement
                    .unresolvedGuardFactIds
                    .length,
                0
            );


            assert.equal(
                requirement
                    .candidate
                    .participantA
                    .id,
                "ERC-8004"
            );

            assert.equal(
                requirement
                    .candidate
                    .participantB
                    .id,
                "ERC-8060"
            );

            assert.equal(
                requirement
                    .candidate
                    .mechanism,
                "SHARED_PROTOCOL_FOUNDATION"
            );

            assert.equal(
                requirement
                    .candidate
                    .foundationProtocolId,
                "ERC-721"
            );

        }
    );


    const {
        plans,
        specifications
    } =
        runtimeInputs(
            requirement
        );


    const runtimeResult =
        await new ScientificExecutionRuntimeEngine()
            .build(
                "REAL-CAMPAIGN-ERC8004-ERC8060",
                plans,
                specifications,
                {

                    compositionWorkspaceRoot:
                        join(
                            temporaryRoot,
                            "w"
                        ),

                    compositionRemoteUrls: {

                        [ERC8004_CONTROL_REPOSITORY]:
                            sourceAPath,

                        [ERC8060_CONTROL_REPOSITORY]:
                            sourceBPath

                    },

                    compositionRecipeRegistrations: [
                        buildErc8004Erc8060ControlRegistration()
                    ]

                }
            );


    if (
        runtimeResult.errors.length >
        0
    ) {

        console.log("");
        console.log(
            "=== RUNTIME RESULT ERRORS ==="
        );

        console.log(
            runtimeResult.errors
        );

    }


    const execution =
        runtimeResult
            .executions[0];


    if (
        execution
            ?.jointContractHarnessExecution
            ?.status !==
        "EXECUTED"
    ) {

        console.log("");
        console.log(
            "=== EXECUTION ERRORS ==="
        );

        console.log(
            execution?.errors
        );


        console.log("");
        console.log(
            "=== JOINT HARNESS ERRORS ==="
        );

        console.log(
            execution
                ?.jointContractHarnessExecution
                ?.errors
        );


        console.log("");
        console.log(
            "=== JOINT HARNESS STDERR TAIL ==="
        );

        console.log(
            execution
                ?.jointContractHarnessExecution
                ?.stderr
                .slice(
                    -5000
                )
        );


        console.log("");
        console.log(
            "=== JOINT HARNESS STDOUT TAIL ==="
        );

        console.log(
            execution
                ?.jointContractHarnessExecution
                ?.stdout
                .slice(
                    -5000
                )
        );

    }


    await check(
        "REAL RUNTIME MATERIALIZES BOTH EXACT PINNED PARTICIPANTS",
        () => {

            assert.equal(
                runtimeResult.errors.length,
                0
            );

            assert.ok(
                execution
            );

            const workspace =
                execution
                    .compositionWorkspaceMaterialization;


            assert.ok(
                workspace
            );

            assert.equal(
                workspace.status,
                "MATERIALIZED"
            );


            const participantA =
                workspace
                    .sourceMaterializations
                    .find(
                        source =>
                            source.participantSide ===
                            "A"
                    );


            const participantB =
                workspace
                    .sourceMaterializations
                    .find(
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
                ERC8004_CONTROL_REVISION
            );

            assert.equal(
                participantA.observedRevision,
                ERC8004_CONTROL_REVISION
            );


            assert.equal(
                participantB.requiredRevision,
                ERC8060_CONTROL_REVISION
            );

            assert.equal(
                participantB.observedRevision,
                ERC8060_CONTROL_REVISION
            );

        }
    );


    await check(
        "REAL RUNTIME SELECTS EXACT POST-DISCOVERY CONTROL RECIPE",
        () => {

            assert.equal(
                execution
                    ?.compositionRecipeSelection
                    ?.status,
                "SELECTED"
            );

            assert.equal(
                execution
                    ?.compositionRecipeSelection
                    ?.selectedRegistrationId,
                ERC8004_ERC8060_CONTROL_REGISTRATION_ID
            );

            assert.deepEqual(
                execution
                    ?.compositionRecipeSelection
                    ?.matchingRegistrationIds,
                [
                    ERC8004_ERC8060_CONTROL_REGISTRATION_ID
                ]
            );

        }
    );


    await check(
        "REAL RUNTIME EXECUTES BOTH ERC CONTRACT PARTICIPANTS",
        () => {

            assert.equal(
                execution?.runtime,
                "OECL_NATIVE_COMPOSITION_JOINT_CONTRACT_EXECUTION"
            );

            const joint =
                execution
                    ?.jointContractHarnessExecution;


            assert.ok(
                joint
            );

            assert.equal(
                joint.status,
                "EXECUTED"
            );

            assert.ok(
                joint.driverReport
            );


            assert.equal(
                joint
                    .driverReport
                    .participantA
                    .executed,
                true
            );


            assert.equal(
                joint
                    .driverReport
                    .participantB
                    .executed,
                true
            );


            assert.ok(
                joint
                    .driverReport
                    .participantA
                    .contractAddresses
                    .length >
                0
            );


            assert.ok(
                joint
                    .driverReport
                    .participantB
                    .contractAddresses
                    .length >
                0
            );


            assert.ok(
                joint
                    .driverReport
                    .participantA
                    .transactionHashes
                    .length >
                0
            );


            assert.ok(
                joint
                    .driverReport
                    .participantB
                    .transactionHashes
                    .length >
                0
            );

        }
    );


    await check(
        "REAL RUNTIME OBSERVES SAME EVM AND SHARED ERC-721 FOUNDATION",
        () => {

            const report =
                execution
                    ?.jointContractHarnessExecution
                    ?.driverReport;


            assert.ok(
                report
            );

            assert.equal(
                report.chainId,
                31337
            );

            assert.equal(
                report.sharedRuntime,
                true
            );

            assert.equal(
                report.observations.includes(
                    "REAL_ERC8004_TRANSACTION_OBSERVED"
                ),
                true
            );

            assert.equal(
                report.observations.includes(
                    "REAL_ERC8060_TRANSACTION_OBSERVED"
                ),
                true
            );

            assert.equal(
                report.observations.includes(
                    "SAME_EVM_BILATERAL_EXECUTION_OBSERVED"
                ),
                true
            );

            assert.equal(
                report.observations.includes(
                    "ERC721_SHARED_FOUNDATION_PROBE_PASSED"
                ),
                true
            );

        }
    );


    await check(
        "REAL CONTROL OPERATIONALIZES EXACT ERC8060 MINT PRICE CONSTRAINT",
        () => {

            const evaluation =
                execution
                    ?.compositionConstraintEvaluation;


            assert.ok(
                evaluation
            );


            assert.equal(
                evaluation.candidateId,
                requirement
                    .candidate
                    .candidateId
            );


            assert.equal(
                evaluation.scientificPolarity,
                "INCONCLUSIVE"
            );


            assert.deepEqual(
                evaluation.statistics,
                {
                    total:
                        17,

                    preserved:
                        3,

                    violated:
                        0,

                    unevaluated:
                        14
                }
            );


            assert.equal(
                evaluation.evaluations.length,
                17
            );


            assert.equal(
                evaluation.evaluations.filter(
                    item =>
                        item.status ===
                        "PRESERVED"
                ).length,
                3
            );


            assert.equal(
                evaluation.evaluations.filter(
                    item =>
                        item.status ===
                        "UNEVALUATED"
                ).length,
                14
            );


            assert.deepEqual(
                evaluation.errors,
                []
            );


            const expectedConstraints =
                requirement.constraints.filter(
                    constraint =>
                        constraint.participantSide ===
                            "B" &&
                        constraint.basis ===
                            "SOLIDITY_REQUIRE_STATEMENT" &&
                        constraint.rawText.includes(
                            "msg.value"
                        ) &&
                        constraint.rawText.includes(
                            "MINT_PRICE"
                        )
                );


            assert.equal(
                expectedConstraints.length,
                1
            );


            const constraintObservations =
                execution
                    ?.jointContractHarnessExecution
                    ?.driverReport
                    ?.constraintObservations ??
                [];


            assert.equal(
                constraintObservations.length,
                3
            );


            assert.equal(
                constraintObservations[0].constraintId,
                expectedConstraints[0].constraintId
            );


            assert.equal(
                constraintObservations[0].participantSide,
                "B"
            );


            assert.equal(
                constraintObservations[0].verdict,
                "PRESERVED"
            );


            assert.equal(
                constraintObservations[0].evidence.some(
                    evidence =>
                        evidence.startsWith(
                            "ERC8060_EXACT_MINT_PRICE_ACCEPTED_TX:"
                        )
                ),
                true
            );


            assert.equal(
                constraintObservations[0].evidence.includes(
                    "ERC8060_INCORRECT_MINT_PRICE_REVERT_REASON_CONFIRMED:Incorrect ETH amount"
                ),
                true
            );

        }
    );


    await check(
        "REAL CONTROL OPERATIONALIZES ERC8060 NONEXISTENT TOKEN CONSTRAINT",
        () => {

            const expectedConstraints =
                requirement.constraints.filter(
                    constraint =>
                        constraint.participantSide ===
                            "B" &&
                        constraint.basis ===
                            "SOLIDITY_REQUIRE_STATEMENT" &&
                        constraint.rawText.includes(
                            "_exists(tokenId)"
                        ) &&
                        constraint.rawText.includes(
                            "Nonexistent token"
                        )
                );


            assert.equal(
                expectedConstraints.length,
                1
            );


            const expectedConstraint =
                expectedConstraints[0];


            const constraintObservations =
                execution
                    ?.jointContractHarnessExecution
                    ?.driverReport
                    ?.constraintObservations ??
                [];


            const observation =
                constraintObservations.find(
                    item =>
                        item.constraintId ===
                        expectedConstraint.constraintId
                );


            assert.ok(
                observation
            );


            assert.equal(
                observation.participantSide,
                "B"
            );


            assert.equal(
                observation.verdict,
                "PRESERVED"
            );


            assert.equal(
                observation.evidence.includes(
                    "ERC8060_EXISTING_TOKEN_VALUE_CONFIRMED:1"
                ),
                true
            );


            assert.equal(
                observation.evidence.includes(
                    "ERC8060_NONEXISTENT_TOKEN_REVERT_REASON_CONFIRMED:Nonexistent token"
                ),
                true
            );


            const evaluation =
                execution
                    ?.compositionConstraintEvaluation;


            assert.ok(
                evaluation
            );


            const constraintEvaluation =
                evaluation.evaluations.find(
                    item =>
                        item.constraintId ===
                        expectedConstraint.constraintId
                );


            assert.ok(
                constraintEvaluation
            );


            assert.equal(
                constraintEvaluation.status,
                "PRESERVED"
            );

        }
    );

    await check(
        "REAL CONTROL OPERATIONALIZES ERC8060 NONOWNER BURN CONSTRAINT",
        () => {

            const expectedConstraints =
                requirement.constraints.filter(
                    constraint =>
                        constraint.participantSide ===
                            "B" &&
                        constraint.basis ===
                            "SOLIDITY_REQUIRE_STATEMENT" &&
                        constraint.rawText.includes(
                            "ownerOf(tokenId)"
                        ) &&
                        constraint.rawText.includes(
                            "msg.sender"
                        ) &&
                        constraint.rawText.includes(
                            "Not token owner"
                        )
                );


            assert.equal(
                expectedConstraints.length,
                1
            );


            const expectedConstraint =
                expectedConstraints[0];


            const constraintObservations =
                execution
                    ?.jointContractHarnessExecution
                    ?.driverReport
                    ?.constraintObservations ??
                [];


            const observation =
                constraintObservations.find(
                    item =>
                        item.constraintId ===
                        expectedConstraint.constraintId
                );


            assert.ok(
                observation
            );


            assert.equal(
                observation.participantSide,
                "B"
            );


            assert.equal(
                observation.verdict,
                "PRESERVED"
            );


            assert.equal(
                observation.evidence.includes(
                    "ERC8060_TOKEN_OWNER_CONFIRMED:1"
                ),
                true
            );


            assert.equal(
                observation.evidence.includes(
                    "ERC8060_NONOWNER_BURN_REVERT_REASON_CONFIRMED:Not token owner"
                ),
                true
            );


            const evaluation =
                execution
                    ?.compositionConstraintEvaluation;


            assert.ok(
                evaluation
            );


            const constraintEvaluation =
                evaluation.evaluations.find(
                    item =>
                        item.constraintId ===
                        expectedConstraint.constraintId
                );


            assert.ok(
                constraintEvaluation
            );


            assert.equal(
                constraintEvaluation.status,
                "PRESERVED"
            );

        }
    );

    await check(
        "END TO END REAL EXECUTION CANNOT YET CLAIM COMPOSITION POLARITY",
        () => {

            assert.equal(
                execution?.status,
                "INCONCLUSIVE"
            );

            assert.equal(
                execution?.repository,
                null
            );

            assert.equal(
                execution?.selectedExecutableTarget,
                null
            );


            const joint =
                execution
                    ?.jointContractHarnessExecution;


            assert.ok(
                joint
            );

            assert.equal(
                joint.scientificPolarity,
                "NEUTRAL"
            );

            assert.equal(
                joint
                    .driverReport
                    ?.scientificPolarity,
                "NEUTRAL"
            );

            assert.equal(
                joint
                    .driverReport
                    ?.conclusion,
                "BILATERAL_EXECUTION_OBSERVED_WITHOUT_COMPOSITION_POLARITY"
            );

        }
    );


    if (
        execution
            ?.jointContractHarnessExecution
            ?.driverReport
    ) {

        const report =
            execution
                .jointContractHarnessExecution
                .driverReport;


        console.log("");
        console.log(
            "=== REAL END TO END RUNTIME SUMMARY ==="
        );

        console.log(
            JSON.stringify(
                {
                    runtime:
                        execution.runtime,

                    runtimeStatus:
                        execution.status,

                    recipeSelection:
                        execution
                            .compositionRecipeSelection,

                    workspaceStatus:
                        execution
                            .compositionWorkspaceMaterialization
                            ?.status,

                    participantA:
                        report.participantA,

                    participantB:
                        report.participantB,

                    chainId:
                        report.chainId,

                    sharedRuntime:
                        report.sharedRuntime,

                    observations:
                        report.observations,

                    scientificPolarity:
                        report.scientificPolarity,

                    conclusion:
                        report.conclusion
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
