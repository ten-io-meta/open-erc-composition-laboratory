import {
    ScientificExecutionRuntimeEngine
} from "../laboratory/scientific-execution-runtime/ScientificExecutionRuntimeEngine.js";
import {
    ScientificExecutionSpecificationEngine
} from "../laboratory/scientific-execution-specification/ScientificExecutionSpecificationEngine.js";
import assert from "node:assert/strict";

import {
    ScientificCompositionExperimentAdapter
} from "../laboratory/scientific-composition-experiment/ScientificCompositionExperimentAdapter.js";

import {
    ScientificExperimentQueueEngine
} from "../laboratory/scientific-experiment-queue/ScientificExperimentQueueEngine.js";

import {
    ScientificExperimentExecutionPlannerEngine
} from "../laboratory/scientific-experiment-execution/ScientificExperimentExecutionPlannerEngine.js";

import {
    ScientificExecutionCapabilityEngine
} from "../laboratory/scientific-execution-capability/ScientificExecutionCapabilityEngine.js";

import {
    ScientificExecutionPlanEngine
} from "../laboratory/scientific-execution-plan/ScientificExecutionPlanEngine.js";


let passed =
    0;

let failed =
    0;


async function check(
    name: string,
    run: () => void | Promise<void>
): Promise<void> {

    try {

        await run();

        console.log(
            `${name}: PASS`
        );

        passed++;

    } catch (error) {

        console.log(
            `${name}: FAIL`
        );

        console.log(
            error instanceof Error
                ? error.message
                : String(error)
        );

        failed++;

    }

}


const candidateSnapshot = {

    candidateId:
        "CANDIDATE-JOINT-101-202",

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

    provenance: [
        {
            kind:
                "STRUCTURAL_PROTOCOL_RELATION",

            sourceId:
                "SOURCE-A",

            sourceRevision:
                "REV-A",

            evidenceId:
                "STRUCTURAL-A-721"
        },
        {
            kind:
                "STRUCTURAL_PROTOCOL_RELATION",

            sourceId:
                "SOURCE-B",

            sourceRevision:
                "REV-B",

            evidenceId:
                "STRUCTURAL-B-721"
        }
    ],

    evaluationStatus:
        "UNEVALUATED"

};


const constraints = [
    {
        constraintId:
            "CONSTRAINT-A",

        candidateId:
            "CANDIDATE-JOINT-101-202",

        participantSide:
            "A",

        participantKind:
            "PROTOCOL",

        participantId:
            "ERC-101",

        sourceId:
            "SOURCE-A",

        sourceRevision:
            "REV-A",

        factId:
            "FACT-A",

        basis:
            "SOLIDITY_REQUIRE_STATEMENT",

        containerKind:
            "CONTRACT",

        containerSymbol:
            "ERC101Reference",

        locator: {
            filePath:
                "contracts/ERC101Reference.sol",

            startLine:
                10,

            endLine:
                10
        },

        rawText:
            "require(a > 0);"
    },

    {
        constraintId:
            "CONSTRAINT-B",

        candidateId:
            "CANDIDATE-JOINT-101-202",

        participantSide:
            "B",

        participantKind:
            "PROTOCOL",

        participantId:
            "ERC-202",

        sourceId:
            "SOURCE-B",

        sourceRevision:
            "REV-B",

        factId:
            "FACT-B",

        basis:
            "SOLIDITY_REQUIRE_STATEMENT",

        containerKind:
            "CONTRACT",

        containerSymbol:
            "ERC202Reference",

        locator: {
            filePath:
                "contracts/ERC202Reference.sol",

            startLine:
                20,

            endLine:
                20
        },

        rawText:
            "require(b > 0);"
    }
];


const specification = {

    specificationId:
        "SPECIFICATION-JOINT-101-202",

    candidateId:
        candidateSnapshot.candidateId,

    mechanism:
        candidateSnapshot.mechanism,

    candidateSnapshot,

    status:
        "READY",

    sourceIds: [
        "SOURCE-A",
        "SOURCE-B"
    ],

    targetEvidenceIds: [
        "STRUCTURAL-A-721",
        "STRUCTURAL-B-721",
        "FACT-A",
        "FACT-B"
    ],

    constraints,

    participantAConstraintIds: [
        "CONSTRAINT-A"
    ],

    participantBConstraintIds: [
        "CONSTRAINT-B"
    ],

    unresolvedGuardFactIds:
        [],

    scientificCriteria: {

        relation:
            "PRESERVES_OBSERVED_CONSTRAINTS",

        support: {
            expectedPolarity:
                "SUPPORT",

            condition:
                "ALL_OBSERVED_PARTICIPANT_CONSTRAINTS_PRESERVED"
        },

        challenge: {
            expectedPolarity:
                "CHALLENGE",

            condition:
                "ANY_OBSERVED_PARTICIPANT_CONSTRAINT_VIOLATED"
        },

        inconclusive: {
            whenNoScientificPolarity:
                true
        }

    }

} as any;


const specificationResult = {

    specifications: [
        specification
    ],

    errors:
        []

} as any;


const sources = [
    {
        sourceId:
            "SOURCE-A",

        repository:
            "example/repository-a"
    },
    {
        sourceId:
            "SOURCE-B",

        repository:
            "example/repository-b"
    }
];


const autonomous =
    new ScientificCompositionExperimentAdapter()
        .build(
            specificationResult,
            sources
        );


const experiment =
    autonomous.experiments[0];


const queue =
    new ScientificExperimentQueueEngine()
        .build(
            "CAMPAIGN-COMPOSITION-REQUIREMENT",
            autonomous,
            {
                experiments:
                    []
            } as any
        );


const execution =
    new ScientificExperimentExecutionPlannerEngine()
        .build(
            "CAMPAIGN-COMPOSITION-REQUIREMENT",
            queue
        );


const task =
    execution.tasks[0];


const capabilities =
    new ScientificExecutionCapabilityEngine()
        .build(
            "CAMPAIGN-COMPOSITION-REQUIREMENT",
            execution
        );


const plans =
    new ScientificExecutionPlanEngine()
        .build(
            "CAMPAIGN-COMPOSITION-REQUIREMENT",
            execution,
            capabilities
        );


const plan =
    plans.plans[0];


/*
 * Deliberately provide an individual resolved test target and
 * executable repository paths.
 *
 * A composition specification must ignore all of this and preserve
 * the structured joint requirement instead.
 */
const executionSpecifications =
    new ScientificExecutionSpecificationEngine()
        .build(
            "CAMPAIGN-COMPOSITION-REQUIREMENT",
            plans,
            {
                resolutions: [
                    {
                        executionTaskId:
                            plan.executionTaskId,

                        experimentId:
                            plan.experimentId,

                        resolutionStatus:
                            "RESOLVED",

                        repository:
                            "example/repository-a",

                        selectedExecutableTarget: {
                            repository:
                                "example/repository-a",

                            filePath:
                                "test/IndividualA.t.sol",

                            selector:
                                "testIndividualA",

                            type:
                                "TEST",

                            framework:
                                "FOUNDRY"
                        },

                        scientificPolarity:
                            "SUPPORT"
                    }
                ]
            } as any,
            {
                "example/repository-a":
                    "FOUNDRY",

                "example/repository-b":
                    "HARDHAT"
            },
            {
                "example/repository-a":
                    "C:/oecl/repository-a",

                "example/repository-b":
                    "C:/oecl/repository-b"
            }
        );


const compositionSpecifications =
    executionSpecifications
        .specifications
        .filter(
            item =>
                (item as any)
                    .specificationType ===
                "COMPOSITION_EXECUTION"
        );


const compositionSpecification =
    compositionSpecifications[0] as any;


/*
 * Runtime regression isolation:
 *
 * Execute only the dedicated composition step. Source reingestion is
 * intentionally excluded so this test performs no repository/network
 * work.
 */
const compositionOnlyPlanResult = {

    ...plans,

    plans: [
        {
            ...plan,

            steps:
                plan.steps.filter(
                    step =>
                        step.stepType ===
                        "COMPOSITION_EXECUTION"
                )
        }
    ]

};


const compositionOnlySpecificationResult = {

    ...executionSpecifications,

    specifications:
        compositionSpecifications

};


const compositionRuntimeResult =
    await new ScientificExecutionRuntimeEngine()
        .build(
            "CAMPAIGN-COMPOSITION-RUNTIME",
            compositionOnlyPlanResult,
            compositionOnlySpecificationResult
        );


const compositionRuntimeExecution =
    compositionRuntimeResult
        .executions[0] as any;


console.log("");
console.log(
    "SCIENTIFIC COMPOSITION EXECUTION REQUIREMENT PROPAGATION"
);
console.log(
    "--------------------------------------------------------"
);


await check(
    "READY COMPOSITION PRODUCES ONE AUTONOMOUS EXPERIMENT",
    () => {

        assert.equal(
            autonomous.errors.length,
            0
        );

        assert.equal(
            autonomous.experiments.length,
            1
        );

    }
);


await check(
    "EXPERIMENT PRESERVES STRUCTURED COMPOSITION EXECUTION REQUIREMENT",
    () => {

        const requirement =
            (experiment as any)
                .compositionExecutionRequirement;

        assert.ok(
            requirement
        );

        assert.equal(
            requirement.candidate.candidateId,
            "CANDIDATE-JOINT-101-202"
        );

        assert.equal(
            requirement.candidate.participantA.id,
            "ERC-101"
        );

        assert.equal(
            requirement.candidate.participantB.id,
            "ERC-202"
        );

        assert.equal(
            requirement.candidate.foundationProtocolId,
            "ERC-721"
        );

    }
);


await check(
    "REQUIREMENT PRESERVES BILATERAL CONSTRAINT IDENTITIES",
    () => {

        const requirement =
            (experiment as any)
                .compositionExecutionRequirement;

        assert.deepEqual(
            requirement.participantAConstraintIds,
            [
                "CONSTRAINT-A"
            ]
        );

        assert.deepEqual(
            requirement.participantBConstraintIds,
            [
                "CONSTRAINT-B"
            ]
        );

        assert.deepEqual(
            requirement.constraints.map(
                (constraint: any) =>
                    constraint.constraintId
            ),
            [
                "CONSTRAINT-A",
                "CONSTRAINT-B"
            ]
        );

    }
);


await check(
    "REQUIREMENT BINDS PARTICIPANT A TO EXACT SOURCE REVISION AND REPOSITORY",
    () => {

        const requirement =
            (experiment as any)
                .compositionExecutionRequirement;

        const participantA =
            requirement.participantSources.find(
                (source: any) =>
                    source.participantSide ===
                    "A"
            );

        assert.deepEqual(
            participantA,
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
                    "REV-A",

                repository:
                    "example/repository-a"
            }
        );

    }
);


await check(
    "REQUIREMENT BINDS PARTICIPANT B TO EXACT SOURCE REVISION AND REPOSITORY",
    () => {

        const requirement =
            (experiment as any)
                .compositionExecutionRequirement;

        const participantB =
            requirement.participantSources.find(
                (source: any) =>
                    source.participantSide ===
                    "B"
            );

        assert.deepEqual(
            participantB,
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
                    "REV-B",

                repository:
                    "example/repository-b"
            }
        );

    }
);


await check(
    "QUEUE PRESERVES COMPOSITION REQUIREMENT INSIDE EXPERIMENT",
    () => {

        assert.ok(
            (queue.queue[0]
                ?.experiment as any)
                ?.compositionExecutionRequirement
        );

    }
);


await check(
    "EXECUTION TASK PRESERVES COMPOSITION REQUIREMENT",
    () => {

        const requirement =
            (task as any)
                ?.compositionExecutionRequirement;

        assert.ok(
            requirement
        );

        assert.equal(
            requirement.candidate.foundationProtocolId,
            "ERC-721"
        );

    }
);


await check(
    "EXECUTION PLAN PRESERVES COMPOSITION REQUIREMENT",
    () => {

        const requirement =
            (plan as any)
                ?.compositionExecutionRequirement;

        assert.ok(
            requirement
        );

        assert.equal(
            requirement.candidate.participantA.id,
            "ERC-101"
        );

        assert.equal(
            requirement.candidate.participantB.id,
            "ERC-202"
        );

    }
);


await check(
    "COMPOSITION PLAN USES DEDICATED JOINT EXECUTION STEP",
    () => {

        assert.deepEqual(
            plan.steps.map(
                step =>
                    step.stepType
            ),
            [
                "SOURCE_REINGESTION",
                "COMPOSITION_EXECUTION",
                "EVIDENCE_COLLECTION"
            ]
        );

    }
);


await check(
    "COMPOSITION EXECUTION STEP REFERENCES STRUCTURED REQUIREMENT AND BILATERAL CONSTRAINTS",
    () => {

        const step =
            plan.steps.find(
                item =>
                    item.stepType ===
                    "COMPOSITION_EXECUTION"
            );

        assert.ok(
            step
        );

        assert.deepEqual(
            step.requiredInputs,
            [
                "SCIENTIFIC-COMPOSITION-EXECUTION-REQUIREMENT-SPECIFICATION-JOINT-101-202",
                "CONSTRAINT-A",
                "CONSTRAINT-B"
            ]
        );

        assert.equal(
            plan.steps.some(
                item =>
                    item.stepType ===
                        "TEST_EXECUTION" ||
                    item.stepType ===
                        "INVARIANT_VALIDATION"
            ),
            false
        );

    }
);

await check(
    "COMPOSITION PLAN MATERIALIZES ONE DEDICATED EXECUTION SPECIFICATION",
    () => {

        assert.equal(
            executionSpecifications.errors.length,
            0
        );

        assert.equal(
            compositionSpecifications.length,
            1
        );

    }
);


await check(
    "COMPOSITION SPECIFICATION PRESERVES JOINT REQUIREMENT",
    () => {

        assert.ok(
            compositionSpecification
                .compositionExecutionRequirement
        );

        assert.equal(
            compositionSpecification
                .compositionExecutionRequirement
                .candidate
                .candidateId,
            "CANDIDATE-JOINT-101-202"
        );

        assert.equal(
            compositionSpecification
                .compositionExecutionRequirement
                .candidate
                .participantA
                .id,
            "ERC-101"
        );

        assert.equal(
            compositionSpecification
                .compositionExecutionRequirement
                .candidate
                .participantB
                .id,
            "ERC-202"
        );

        assert.equal(
            compositionSpecification
                .compositionExecutionRequirement
                .candidate
                .foundationProtocolId,
            "ERC-721"
        );

    }
);


await check(
    "COMPOSITION SPECIFICATION CANNOT COLLAPSE TO INDIVIDUAL EXECUTABLE TARGET",
    () => {

        assert.equal(
            compositionSpecification.repository,
            null
        );

        assert.equal(
            compositionSpecification
                .selectedExecutableTarget,
            null
        );

        assert.equal(
            compositionSpecification
                .workingDirectory,
            null
        );

        assert.equal(
            compositionSpecification.command,
            null
        );

        assert.equal(
            compositionSpecification
                .testSelector,
            null
        );

        assert.equal(
            compositionSpecification
                .invariantSelector,
            null
        );

        assert.equal(
            compositionSpecification
                .scientificPolarity,
            "NEUTRAL"
        );

        assert.equal(
            compositionSpecification
                .resolutionStatus,
            "EXECUTABLE"
        );

    }
);

await check(
    "COMPOSITION RUNTIME MATERIALIZES ONE JOINT RUNTIME RECORD",
    () => {

        assert.equal(
            compositionRuntimeResult.errors.length,
            0
        );

        assert.equal(
            compositionRuntimeResult.executions.length,
            1
        );

        assert.ok(
            compositionRuntimeExecution
        );

        assert.equal(
            compositionRuntimeExecution.stepType,
            "COMPOSITION_EXECUTION"
        );

    }
);


await check(
    "COMPOSITION RUNTIME PRESERVES STRUCTURED JOINT REQUIREMENT",
    () => {

        const requirement =
            compositionRuntimeExecution
                .compositionExecutionRequirement;

        assert.ok(
            requirement
        );

        assert.equal(
            requirement.candidate.candidateId,
            "CANDIDATE-JOINT-101-202"
        );

        assert.equal(
            requirement.participantSources.length,
            2
        );

        assert.deepEqual(
            requirement
                .participantAConstraintIds,
            [
                "CONSTRAINT-A"
            ]
        );

        assert.deepEqual(
            requirement
                .participantBConstraintIds,
            [
                "CONSTRAINT-B"
            ]
        );

    }
);


await check(
    "COMPOSITION RUNTIME ADMISSION DOES NOT CLAIM CONTRACT EXECUTION",
    () => {

        assert.equal(
            compositionRuntimeExecution.runtime,
            "OECL_NATIVE_COMPOSITION_REQUIREMENT_ADMISSION"
        );

        assert.equal(
            compositionRuntimeExecution.status,
            "INCONCLUSIVE"
        );

        assert.equal(
            compositionRuntimeExecution.repository,
            null
        );

        assert.equal(
            compositionRuntimeExecution
                .selectedExecutableTarget,
            null
        );

        assert.equal(
            compositionRuntimeExecution
                .evidence
                .includes(
                    "COMPOSITION_REQUIREMENT_ADMITTED"
                ),
            true
        );

        assert.equal(
            compositionRuntimeExecution
                .observations
                .includes(
                    "No participant contracts were executed by this runtime admission step."
                ),
            true
        );

    }
);

/*
 * Fail-closed controls.
 */

await check(
    "READY COMPOSITION WITHOUT CANDIDATE SNAPSHOT FAILS CLOSED",
    () => {

        const malformed = {
            ...specification
        } as any;

        delete malformed.candidateSnapshot;


        const result =
            new ScientificCompositionExperimentAdapter()
                .build(
                    {
                        specifications: [
                            malformed
                        ],

                        errors:
                            []
                    } as any,
                    sources
                );


        assert.equal(
            result.experiments.length,
            0
        );

        assert.equal(
            result.errors.some(
                error =>
                    error
                        .toLowerCase()
                        .includes(
                            "candidate snapshot"
                        )
            ),
            true
        );

    }
);


await check(
    "READY COMPOSITION WITHOUT PINNED PARTICIPANT REVISION FAILS CLOSED",
    () => {

        const malformed = {

            ...specification,

            constraints:
                specification.constraints.map(
                    (constraint: any) =>
                        constraint.participantSide ===
                            "B"
                            ? {
                                ...constraint,
                                sourceRevision:
                                    undefined
                            }
                            : {
                                ...constraint
                            }
                )

        } as any;


        const result =
            new ScientificCompositionExperimentAdapter()
                .build(
                    {
                        specifications: [
                            malformed
                        ],

                        errors:
                            []
                    } as any,
                    sources
                );


        assert.equal(
            result.experiments.length,
            0
        );

        assert.equal(
            result.errors.some(
                error =>
                    error
                        .toLowerCase()
                        .includes(
                            "source revision"
                        )
            ),
            true
        );

    }
);


console.log("");
console.log(
    `PASS: ${passed}`
);

console.log(
    `FAIL: ${failed}`
);

console.log(
    failed ===
        0
        ? "RESULT: PASS"
        : "RESULT: FAIL"
);


if (
    failed >
    0
) {

    process.exitCode =
        1;

}
