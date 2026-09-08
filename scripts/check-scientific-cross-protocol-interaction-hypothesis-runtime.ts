import assert from "node:assert/strict";

import type {
    ScientificCompositionCandidate
} from "../laboratory/scientific-cross-protocol-composition/ScientificCompositionCandidate.js";

import type {
    ScientificProtocolAttributedExternalCall
} from "../laboratory/scientific-protocol-identity/ScientificProtocolAttributedExternalCall.js";

import type {
    ScientificProtocolBehaviorReachability
} from "../laboratory/scientific-protocol-behavior-reachability/ScientificProtocolBehaviorReachability.js";

import {
    ScientificCrossProtocolInteractionHypothesisEngine
} from "../laboratory/scientific-cross-protocol-interaction-hypothesis/ScientificCrossProtocolInteractionHypothesisEngine.js";


let pass =
    0;

let fail =
    0;


function check(
    name: string,
    fn: () => void
): void {

    try {

        fn();

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


const candidate:
    ScientificCompositionCandidate =
    {
        candidateId:
            "CANDIDATE-A-B",

        participantA: {
            kind:
                "PROTOCOL",
            id:
                "ERC-1111"
        },

        participantB: {
            kind:
                "PROTOCOL",
            id:
                "ERC-2222"
        },

        mechanism:
            "SHARED_PROTOCOL_FOUNDATION",

        foundationProtocolId:
            "ERC-3333",

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
                    "FOUNDATION-EVIDENCE-A"
            },
            {
                kind:
                    "STRUCTURAL_PROTOCOL_RELATION",
                sourceId:
                    "SOURCE-B",
                sourceRevision:
                    "REV-B",
                evidenceId:
                    "FOUNDATION-EVIDENCE-B"
            }
        ],

        evaluationStatus:
            "UNEVALUATED"
    };


const directA:
    ScientificProtocolAttributedExternalCall =
    {
        protocolCallAttributionId:
            "CALL-A",

        protocolId:
            "ERC-1111",

        identityBasis:
            "EXACT_ERC_CONTAINER_SYMBOL",

        sourceFactId:
            "FACT-CALL-A",

        observationId:
            "OBS-A",

        containerKind:
            "CONTRACT",

        containerSymbol:
            "ERC1111",

        externalCall: {
            callForm:
                "LOW_LEVEL_STATICCALL",

            targetExpression:
                "peer",

            encodedCallTypeSymbol:
                "ReceiverContract",

            encodedCallMemberSymbol:
                "validate"
        }
    };


const originDependencyCall:
    ScientificProtocolAttributedExternalCall =
    {
        protocolCallAttributionId:
            "CALL-DEPENDENCY",

        protocolId:
            "ERC-3333",

        identityBasis:
            "EXACT_ERC_CONTAINER_SYMBOL",

        sourceFactId:
            "FACT-CALL-DEPENDENCY",

        observationId:
            "OBS-DEPENDENCY",

        containerKind:
            "CONTRACT",

        containerSymbol:
            "ERC3333",

        externalCall: {
            callForm:
                "CAST_MEMBER_CALL",

            targetExpression:
                "to",

            castTypeSymbol:
                "ReceiverContract",

            memberSymbol:
                "onReceive"
        }
    };


const reachableB:
    ScientificProtocolBehaviorReachability =
    {
        behaviorReachabilityId:
            "REACHABLE-B",

        participantProtocolId:
            "ERC-2222",

        originProtocolId:
            "ERC-3333",

        participantDeclarationFactId:
            "FACT-B",

        participantObservationId:
            "OBS-B",

        participantContainerSymbol:
            "ERC2222Reference",

        originDeclarationFactId:
            "FACT-ORIGIN",

        originObservationId:
            "OBS-DEPENDENCY",

        originContainerSymbol:
            "ERC3333",

        protocolCallAttributionId:
            originDependencyCall.protocolCallAttributionId,

        sourceCallFactId:
            originDependencyCall.sourceFactId,

        externalCall: {
            ...originDependencyCall.externalCall
        },

        protocolRelationEvidenceIds: [
            "REL-B-FOUNDATION"
        ],

        inheritanceEdgeIds: [
            "EDGE-B-MIDDLE",
            "EDGE-MIDDLE-ORIGIN"
        ],

        containerPath: [
            "ERC2222Reference",
            "BaseLayer",
            "ERC3333"
        ],

        evidenceBasis:
            "EXACT_SOLIDITY_INHERITANCE_PATH_WITH_PROTOCOL_DEPENDENCY"
    };


const engine =
    new ScientificCrossProtocolInteractionHypothesisEngine();


const result =
    engine.generate({

        candidates: [
            candidate
        ],

        protocolAttributedExternalCalls: [
            originDependencyCall,
            directA
        ],

        reachableBehaviors: [
            reachableB
        ]

    });


check(
    "HYPOTHESIS GENERATION HAS NO ERRORS",
    () => {

        assert.deepEqual(
            result.errors,
            []
        );

    }
);


check(
    "EXACTLY TWO CROSS-PROTOCOL HYPOTHESES ARE GENERATED",
    () => {

        assert.equal(
            result.hypotheses.length,
            2
        );

    }
);


const aToB =
    result.hypotheses.find(
        hypothesis =>
            hypothesis.sourceSide ===
                "A" &&
            hypothesis.targetSide ===
                "B"
    );


const bToA =
    result.hypotheses.find(
        hypothesis =>
            hypothesis.sourceSide ===
                "B" &&
            hypothesis.targetSide ===
                "A"
    );


check(
    "DIRECT A TO B HYPOTHESIS IS GENERATED",
    () => {

        assert.ok(aToB);

        assert.equal(
            aToB.sourceParticipantProtocolId,
            "ERC-1111"
        );

        assert.equal(
            aToB.hypothesizedTargetParticipantProtocolId,
            "ERC-2222"
        );

    }
);


check(
    "A TO B PRESERVES DIRECT CALL ORIGIN",
    () => {

        assert.equal(
            aToB?.originProtocolId,
            "ERC-1111"
        );

        assert.equal(
            aToB?.behaviorEvidenceKind,
            "DIRECT_PROTOCOL_CALL"
        );

        assert.equal(
            aToB?.protocolCallAttributionId,
            directA.protocolCallAttributionId
        );

    }
);


check(
    "INHERITED B TO A HYPOTHESIS IS GENERATED",
    () => {

        assert.ok(bToA);

        assert.equal(
            bToA.sourceParticipantProtocolId,
            "ERC-2222"
        );

        assert.equal(
            bToA.hypothesizedTargetParticipantProtocolId,
            "ERC-1111"
        );

    }
);


check(
    "B TO A PRESERVES DEPENDENCY ORIGIN",
    () => {

        assert.equal(
            bToA?.originProtocolId,
            "ERC-3333"
        );

        assert.equal(
            bToA?.behaviorEvidenceKind,
            "INHERITED_PROTOCOL_BEHAVIOR"
        );

        assert.equal(
            bToA?.behaviorReachabilityId,
            reachableB.behaviorReachabilityId
        );

    }
);


check(
    "DEPENDENCY ORIGIN CALL DOES NOT BECOME A DIRECT CANDIDATE SIDE",
    () => {

        assert.equal(
            result.hypotheses.filter(
                hypothesis =>
                    hypothesis.behaviorEvidenceKind ===
                        "DIRECT_PROTOCOL_CALL"
            ).length,
            1
        );

    }
);


check(
    "CANDIDATE PROVENANCE IS PRESERVED",
    () => {

        assert.deepEqual(
            aToB?.candidateProvenanceEvidenceIds,
            [
                "FOUNDATION-EVIDENCE-A",
                "FOUNDATION-EVIDENCE-B"
            ]
        );

        assert.deepEqual(
            bToA?.candidateProvenanceEvidenceIds,
            [
                "FOUNDATION-EVIDENCE-A",
                "FOUNDATION-EVIDENCE-B"
            ]
        );

    }
);


check(
    "ALL HYPOTHESES REMAIN UNEVALUATED",
    () => {

        assert.equal(
            result.hypotheses.every(
                hypothesis =>
                    hypothesis.evaluationStatus ===
                        "UNEVALUATED"
            ),
            true
        );

    }
);


check(
    "HYPOTHESES DO NOT CLAIM RUNTIME SUCCESS OR COMPATIBILITY",
    () => {

        for (
            const hypothesis
            of result.hypotheses
        ) {

            for (
                const field
                of [
                    "scientificPolarity",
                    "compatibility",
                    "runtimeStatus",
                    "executionStatus",
                    "confidence",
                    "observedTargetAddress"
                ]
            ) {

                assert.equal(
                    Object.prototype.hasOwnProperty.call(
                        hypothesis,
                        field
                    ),
                    false
                );

            }

        }

    }
);


const symbolicCandidate:
    ScientificCompositionCandidate =
    {
        ...candidate,

        candidateId:
            "SYMBOLIC-CANDIDATE",

        participantB: {
            kind:
                "SYMBOLIC_SUBJECT",
            id:
                "SUBJECT-X"
        }
    };


const symbolicResult =
    engine.generate({

        candidates: [
            symbolicCandidate
        ],

        protocolAttributedExternalCalls: [
            directA
        ],

        reachableBehaviors:
            []

    });


check(
    "SYMBOLIC PEER DOES NOT CREATE A PROTOCOL INTERACTION HYPOTHESIS",
    () => {

        assert.deepEqual(
            symbolicResult.errors,
            []
        );

        assert.deepEqual(
            symbolicResult.hypotheses,
            []
        );

        assert.deepEqual(
            symbolicResult.candidateIdsWithoutHypotheses,
            [
                symbolicCandidate.candidateId
            ]
        );

    }
);


const brokenReachability:
    ScientificProtocolBehaviorReachability =
    {
        ...reachableB,

        behaviorReachabilityId:
            "BROKEN-REACHABILITY",

        originProtocolId:
            "ERC-4444"
    };


const brokenResult =
    engine.generate({

        candidates: [
            candidate
        ],

        protocolAttributedExternalCalls: [
            originDependencyCall,
            directA
        ],

        reachableBehaviors: [
            brokenReachability
        ]

    });


check(
    "BROKEN REACHABILITY PROVENANCE FAILS CLOSED",
    () => {

        assert.equal(
            brokenResult.hypotheses.length,
            0
        );

        assert.equal(
            brokenResult.errors.length >
                0,
            true
        );

    }
);


const repeated =
    engine.generate({

        candidates: [
            candidate
        ],

        protocolAttributedExternalCalls: [
            directA,
            originDependencyCall
        ],

        reachableBehaviors: [
            reachableB
        ]

    });


check(
    "HYPOTHESIS GENERATION IS DETERMINISTIC",
    () => {

        assert.deepEqual(
            repeated,
            result
        );

    }
);


console.log("");
console.log(`PASS: ${pass}`);
console.log(`FAIL: ${fail}`);
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
    process.exitCode = 1;
}
