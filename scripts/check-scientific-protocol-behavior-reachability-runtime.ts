import assert from "node:assert/strict";

import type {
    ScientificSourceFact
} from "../laboratory/scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificProtocolAttributedExternalCall
} from "../laboratory/scientific-protocol-identity/ScientificProtocolAttributedExternalCall.js";

import type {
    ScientificStructuralProtocolRelationEvidence
} from "../laboratory/scientific-protocol-relation-evidence/ScientificStructuralProtocolRelationEvidence.js";

import {
    ScientificSolidityInheritanceGraphEngine
} from "../laboratory/scientific-solidity-inheritance/ScientificSolidityInheritanceGraphEngine.js";

import {
    ScientificProtocolBehaviorReachabilityEngine
} from "../laboratory/scientific-protocol-behavior-reachability/ScientificProtocolBehaviorReachabilityEngine.js";


let pass =
    0;

let fail =
    0;


function check(
    name:
        string,
    fn:
        () => void
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


function declaration(
    factId:
        string,
    observationId:
        string,
    sourceId:
        string,
    sourceRevision:
        string,
    symbol:
        string,
    rawText:
        string
): ScientificSourceFact {

    return {

        factId,

        observationId,

        sourceId,

        sourceRevision,

        kind:
            "CONTRACT_DECLARATION",

        symbol,

        locator: {
            sourceLocation:
                `${sourceId}/${symbol}.sol`,

            filePath:
                `${symbol}.sol`,

            startLine:
                1,

            endLine:
                5
        },

        rawText

    };

}


const participant =
    declaration(
        "FACT-PARTICIPANT",
        "OBS-PARTICIPANT",
        "SOURCE-PARTICIPANT",
        "REV-PARTICIPANT",
        "ERC1234Reference",
        "contract ERC1234Reference is BaseLayer {"
    );


const middle =
    declaration(
        "FACT-MIDDLE",
        "OBS-MIDDLE",
        "SOURCE-DEPENDENCY",
        "REV-DEPENDENCY",
        "BaseLayer",
        "abstract contract BaseLayer is ERC5678 {"
    );


const origin =
    declaration(
        "FACT-ORIGIN",
        "OBS-ORIGIN",
        "SOURCE-DEPENDENCY",
        "REV-DEPENDENCY",
        "ERC5678",
        "contract ERC5678 {"
    );


const unresolved =
    declaration(
        "FACT-UNRESOLVED",
        "OBS-UNRESOLVED",
        "SOURCE-PARTICIPANT",
        "REV-PARTICIPANT",
        "Helper",
        "contract Helper is MissingBase {"
    );


const graphEngine =
    new ScientificSolidityInheritanceGraphEngine();


const graph =
    graphEngine.build({
        facts: [
            unresolved,
            origin,
            participant,
            middle
        ]
    });


check(
    "INHERITANCE GRAPH HAS NO ERRORS",
    () => {

        assert.deepEqual(
            graph.errors,
            []
        );

    }
);


check(
    "PARTICIPANT TO MIDDLE EDGE IS RESOLVED",
    () => {

        assert.equal(
            graph.edges.some(
                edge =>
                    edge.subjectContainerSymbol ===
                        "ERC1234Reference" &&
                    edge.objectContainerSymbol ===
                        "BaseLayer"
            ),
            true
        );

    }
);


check(
    "MIDDLE TO ORIGIN EDGE IS RESOLVED",
    () => {

        assert.equal(
            graph.edges.some(
                edge =>
                    edge.subjectContainerSymbol ===
                        "BaseLayer" &&
                    edge.objectContainerSymbol ===
                        "ERC5678"
            ),
            true
        );

    }
);


check(
    "MISSING BASE REMAINS UNRESOLVED",
    () => {

        assert.equal(
            graph.unresolvedInheritanceReferences.some(
                reference =>
                    reference.inheritedSymbol ===
                        "MissingBase" &&
                    reference.reason ===
                        "NO_DECLARATION_MATCH"
            ),
            true
        );

    }
);


const relation:
    ScientificStructuralProtocolRelationEvidence =
    {
        relationEvidenceId:
            "RELATION-PARTICIPANT-ORIGIN",

        sourceId:
            "SOURCE-PARTICIPANT",

        sourceRevision:
            "REV-PARTICIPANT",

        factId:
            participant.factId,

        observationId:
            participant.observationId,

        subjectProtocolId:
            "ERC-1234",

        subjectContainerKind:
            "CONTRACT",

        subjectContainerSymbol:
            "ERC1234Reference",

        relation:
            "DEPENDS_ON",

        objectProtocolId:
            "ERC-5678",

        inheritedSymbol:
            "BaseLayer",

        evidenceBasis:
            "SOLIDITY_INHERITANCE_ERC_FAMILY",

        locator:
            participant.locator,

        rawText:
            participant.rawText
    };


const originCall:
    ScientificProtocolAttributedExternalCall =
    {
        protocolCallAttributionId:
            "CALL-ATTRIBUTION-ORIGIN",

        protocolId:
            "ERC-5678",

        identityBasis:
            "EXACT_ERC_CONTAINER_SYMBOL",

        sourceFactId:
            "FACT-CALL-ORIGIN",

        observationId:
            origin.observationId,

        containerKind:
            "CONTRACT",

        containerSymbol:
            "ERC5678",

        externalCall: {
            callForm:
                "CAST_MEMBER_CALL",

            targetExpression:
                "receiver",

            castTypeSymbol:
                "ReceiverType",

            memberSymbol:
                "onReceive"
        }
    };


const reachabilityEngine =
    new ScientificProtocolBehaviorReachabilityEngine();


const result =
    reachabilityEngine.evaluate({

        inheritanceGraph:
            graph,

        structuralRelations: [
            relation
        ],

        protocolAttributedExternalCalls: [
            originCall
        ]

    });


check(
    "BEHAVIOR REACHABILITY HAS NO ERRORS",
    () => {

        assert.deepEqual(
            result.errors,
            []
        );

    }
);


check(
    "ONE REACHABLE BEHAVIOR IS PRODUCED",
    () => {

        assert.equal(
            result.reachableBehaviors.length,
            1
        );

    }
);


const reachable =
    result.reachableBehaviors[0];


check(
    "PARTICIPANT PROTOCOL IS PRESERVED",
    () => {

        assert.equal(
            reachable?.participantProtocolId,
            "ERC-1234"
        );

    }
);


check(
    "ORIGIN PROTOCOL IS PRESERVED",
    () => {

        assert.equal(
            reachable?.originProtocolId,
            "ERC-5678"
        );

    }
);


check(
    "EXACT CONTAINER PATH IS PRESERVED",
    () => {

        assert.deepEqual(
            reachable?.containerPath,
            [
                "ERC1234Reference",
                "BaseLayer",
                "ERC5678"
            ]
        );

    }
);


check(
    "EXACT TWO EDGE INHERITANCE PATH IS PRESERVED",
    () => {

        assert.equal(
            reachable?.inheritanceEdgeIds.length,
            2
        );

    }
);


check(
    "PROTOCOL DEPENDENCY EVIDENCE IS PRESERVED",
    () => {

        assert.deepEqual(
            reachable?.protocolRelationEvidenceIds,
            [
                relation.relationEvidenceId
            ]
        );

    }
);


check(
    "ORIGIN CALL ATTRIBUTION IS PRESERVED",
    () => {

        assert.equal(
            reachable?.protocolCallAttributionId,
            originCall.protocolCallAttributionId
        );

        assert.equal(
            reachable?.sourceCallFactId,
            originCall.sourceFactId
        );

    }
);


check(
    "EXTERNAL CALL SYNTAX IS PRESERVED",
    () => {

        assert.deepEqual(
            reachable?.externalCall,
            originCall.externalCall
        );

    }
);


check(
    "REACHABILITY DOES NOT INVENT TARGET PROTOCOL",
    () => {

        assert.equal(
            Object.prototype.hasOwnProperty.call(
                reachable ?? {},
                "targetProtocolId"
            ),
            false
        );

    }
);


check(
    "REACHABILITY DOES NOT INVENT COMPOSITION SEMANTICS",
    () => {

        for (
            const field
            of [
                "candidateId",
                "compositionCandidate",
                "scientificPolarity",
                "compatibility",
                "interactionDirection",
                "confidence"
            ]
        ) {

            assert.equal(
                Object.prototype.hasOwnProperty.call(
                    reachable ?? {},
                    field
                ),
                false
            );

        }

    }
);


const wrongEvidenceRelation:
    ScientificStructuralProtocolRelationEvidence =
    {
        ...relation,

        relationEvidenceId:
            "RELATION-WRONG-FIRST-EDGE",

        inheritedSymbol:
            "DifferentBase"
    };


const wrongEvidence =
    reachabilityEngine.evaluate({

        inheritanceGraph:
            graph,

        structuralRelations: [
            wrongEvidenceRelation
        ],

        protocolAttributedExternalCalls: [
            originCall
        ]

    });


check(
    "PROTOCOL DEPENDENCY WITHOUT MATCHING FIRST EDGE DOES NOT PROPAGATE BEHAVIOR",
    () => {

        assert.deepEqual(
            wrongEvidence.reachableBehaviors,
            []
        );

        assert.deepEqual(
            wrongEvidence.unresolvedProtocolCallAttributionIds,
            [
                originCall.protocolCallAttributionId
            ]
        );

    }
);


const repeated =
    reachabilityEngine.evaluate({

        inheritanceGraph:
            graph,

        structuralRelations: [
            relation
        ],

        protocolAttributedExternalCalls: [
            originCall
        ]

    });


check(
    "REACHABILITY RESULT IS DETERMINISTIC",
    () => {

        assert.deepEqual(
            repeated,
            result
        );

    }
);


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
