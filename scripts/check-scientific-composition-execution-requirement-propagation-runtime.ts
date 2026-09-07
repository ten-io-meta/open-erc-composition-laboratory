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
