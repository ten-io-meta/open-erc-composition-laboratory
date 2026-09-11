import assert from "node:assert/strict";

import type {
    ScientificSourceFact
} from "../laboratory/scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificSourceObservation
} from "../laboratory/scientific-source-observation/ScientificSourceObservation.js";

import {
    ScientificProtocolExternalCallAttributionEngine
} from "../laboratory/scientific-protocol-identity/ScientificProtocolExternalCallAttributionEngine.js";


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


const sourceId =
    "SYNTHETIC-PROTOCOL-CALL-SOURCE";

const sourceRevision =
    "synthetic-revision-1";


const observationA:
    ScientificSourceObservation =
    {
        observationId:
            "OBSERVATION-A",

        sourceId,

        sourceType:
            "SYNTHETIC",

        sourceRevision,

        kind:
            "CONTRACT_SOURCE",

        locator: {
            sourceLocation:
                "SyntheticRegistry.sol",

            filePath:
                "SyntheticRegistry.sol",

            startLine:
                1,

            endLine:
                20
        },

        rawText:
            `
            /// @custom:storage-location erc7201:erc1234.example.storage
            contract SyntheticRegistry {
                function inspect(address peer) external view {
                    peer.staticcall(
                        abi.encodeCall(
                            VerifierType.verify,
                            (bytes32(0))
                        )
                    );
                }
            }
            `
    };


const observationB:
    ScientificSourceObservation =
    {
        observationId:
            "OBSERVATION-B",

        sourceId,

        sourceType:
            "SYNTHETIC",

        sourceRevision,

        kind:
            "CONTRACT_SOURCE",

        locator: {
            sourceLocation:
                "ERC5678.sol",

            filePath:
                "ERC5678.sol",

            startLine:
                1,

            endLine:
                20
        },

        rawText:
            `
            contract ERC5678 {
                function deliver(address receiver) external {
                    ReceiverType(receiver).onReceive(bytes(""));
                }
            }
            `
    };


const callFactA:
    ScientificSourceFact =
    {
        factId:
            "FACT-A",

        observationId:
            observationA.observationId,

        sourceId,

        sourceRevision,

        kind:
            "EXTERNAL_CALL_EXPRESSION",

        containerKind:
            "CONTRACT",

        containerSymbol:
            "SyntheticRegistry",

        externalCall: {
            callForm:
                "LOW_LEVEL_STATICCALL",

            targetExpression:
                "peer",

            encodedCallTypeSymbol:
                "VerifierType",

            encodedCallMemberSymbol:
                "verify"
        },

        locator: {
            sourceLocation:
                "SyntheticRegistry.sol",

            filePath:
                "SyntheticRegistry.sol",

            startLine:
                5,

            endLine:
                11
        },

        rawText:
            "peer.staticcall(abi.encodeCall(VerifierType.verify, (bytes32(0))))"
    };


const callFactB:
    ScientificSourceFact =
    {
        factId:
            "FACT-B",

        observationId:
            observationB.observationId,

        sourceId,

        sourceRevision,

        kind:
            "EXTERNAL_CALL_EXPRESSION",

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
        },

        locator: {
            sourceLocation:
                "ERC5678.sol",

            filePath:
                "ERC5678.sol",

            startLine:
                4,

            endLine:
                4
        },

        rawText:
            'ReceiverType(receiver).onReceive(bytes(""))'
    };


const declarationFact:
    ScientificSourceFact =
    {
        factId:
            "NON-CALL-FACT",

        observationId:
            observationB.observationId,

        sourceId,

        sourceRevision,

        kind:
            "FUNCTION_DECLARATION",

        symbol:
            "deliver",

        containerKind:
            "CONTRACT",

        containerSymbol:
            "ERC5678",

        locator: {
            sourceLocation:
                "ERC5678.sol",

            filePath:
                "ERC5678.sol",

            startLine:
                3,

            endLine:
                3
        },

        rawText:
            "function deliver(address receiver) external"
    };


const unresolvedCallFact:
    ScientificSourceFact =
    {
        factId:
            "FACT-UNRESOLVED",

        observationId:
            observationB.observationId,

        sourceId,

        sourceRevision,

        kind:
            "EXTERNAL_CALL_EXPRESSION",

        containerKind:
            "CONTRACT",

        containerSymbol:
            "GenericCaller",

        externalCall: {
            callForm:
                "LOW_LEVEL_CALL",

            targetExpression:
                "receiver"
        },

        locator: {
            sourceLocation:
                "ERC5678.sol",

            filePath:
                "ERC5678.sol",

            startLine:
                10,

            endLine:
                10
        },

        rawText:
            "receiver.call(bytes(''))"
    };


const engine =
    new ScientificProtocolExternalCallAttributionEngine();


const result =
    engine.attribute({
        sourceId,
        sourceRevision,

        facts: [
            callFactB,
            declarationFact,
            unresolvedCallFact,
            callFactA
        ],

        observations: [
            observationB,
            observationA
        ]
    });


check(
    "VALID ATTRIBUTION HAS NO ERRORS",
    () => {

        assert.deepEqual(
            result.errors,
            []
        );

    }
);


check(
    "RESULT PRESERVES SOURCE ID",
    () => {

        assert.equal(
            result.sourceId,
            sourceId
        );

    }
);


check(
    "RESULT PRESERVES SOURCE REVISION",
    () => {

        assert.equal(
            result.sourceRevision,
            sourceRevision
        );

    }
);


check(
    "NON EXTERNAL CALL FACT IS IGNORED",
    () => {

        const allIds =
            [
                ...result.protocolAttributedExternalCalls.map(
                    item =>
                        item.sourceFactId
                ),
                ...result.unresolvedExternalCallFactIds
            ];

        assert.equal(
            allIds.includes(
                declarationFact.factId
            ),
            false
        );

    }
);


const attributedA =
    result.protocolAttributedExternalCalls.find(
        item =>
            item.sourceFactId ===
                callFactA.factId
    );


const attributedB =
    result.protocolAttributedExternalCalls.find(
        item =>
            item.sourceFactId ===
                callFactB.factId
    );


check(
    "EXPLICIT STORAGE NAMESPACE ATTRIBUTES ORIGIN PROTOCOL",
    () => {

        assert.ok(
            attributedA
        );

        assert.equal(
            attributedA.protocolId,
            "ERC-1234"
        );

        assert.equal(
            attributedA.identityBasis,
            "EXPLICIT_ERC_STORAGE_NAMESPACE"
        );

    }
);


check(
    "EXACT ERC CONTAINER ATTRIBUTES ORIGIN PROTOCOL",
    () => {

        assert.ok(
            attributedB
        );

        assert.equal(
            attributedB.protocolId,
            "ERC-5678"
        );

        assert.equal(
            attributedB.identityBasis,
            "EXACT_ERC_CONTAINER_SYMBOL"
        );

    }
);


check(
    "SOURCE FACT ID IS PRESERVED",
    () => {

        assert.equal(
            attributedA?.sourceFactId,
            callFactA.factId
        );

        assert.equal(
            attributedB?.sourceFactId,
            callFactB.factId
        );

    }
);


check(
    "OBSERVATION ID IS PRESERVED",
    () => {

        assert.equal(
            attributedA?.observationId,
            observationA.observationId
        );

        assert.equal(
            attributedB?.observationId,
            observationB.observationId
        );

    }
);


check(
    "STRUCTURAL CONTAINER IS PRESERVED",
    () => {

        assert.equal(
            attributedA?.containerKind,
            "CONTRACT"
        );

        assert.equal(
            attributedA?.containerSymbol,
            "SyntheticRegistry"
        );

        assert.equal(
            attributedB?.containerKind,
            "CONTRACT"
        );

        assert.equal(
            attributedB?.containerSymbol,
            "ERC5678"
        );

    }
);


check(
    "LOW LEVEL CALL PAYLOAD IS PRESERVED",
    () => {

        assert.deepEqual(
            attributedA?.externalCall,
            callFactA.externalCall
        );

    }
);


check(
    "CAST MEMBER CALL PAYLOAD IS PRESERVED",
    () => {

        assert.deepEqual(
            attributedB?.externalCall,
            callFactB.externalCall
        );

    }
);


check(
    "EXTERNAL CALL PAYLOAD IS COPIED",
    () => {

        assert.ok(
            attributedA
        );

        assert.notEqual(
            attributedA.externalCall,
            callFactA.externalCall
        );

    }
);


check(
    "GENERIC CONTAINER REMAINS UNRESOLVED",
    () => {

        assert.deepEqual(
            result.unresolvedExternalCallFactIds,
            [
                "FACT-UNRESOLVED"
            ]
        );

    }
);


check(
    "UNRESOLVED FACT PRODUCES NO PROTOCOL CLAIM",
    () => {

        assert.equal(
            result.protocolAttributedExternalCalls.some(
                item =>
                    item.sourceFactId ===
                        unresolvedCallFact.factId
            ),
            false
        );

    }
);


check(
    "ATTRIBUTION IDS ARE UNIQUE",
    () => {

        const ids =
            result.protocolAttributedExternalCalls.map(
                item =>
                    item.protocolCallAttributionId
            );

        assert.equal(
            new Set(
                ids
            ).size,
            ids.length
        );

    }
);


const repeated =
    engine.attribute({
        sourceId,
        sourceRevision,

        facts: [
            callFactB,
            declarationFact,
            unresolvedCallFact,
            callFactA
        ],

        observations: [
            observationB,
            observationA
        ]
    });


check(
    "ATTRIBUTION IS DETERMINISTIC",
    () => {

        assert.deepEqual(
            repeated,
            result
        );

    }
);


check(
    "ATTRIBUTED CALL ORDER IS DETERMINISTIC",
    () => {

        const ids =
            result.protocolAttributedExternalCalls.map(
                item =>
                    item.protocolCallAttributionId
            );

        assert.deepEqual(
            ids,
            [
                ...ids
            ].sort()
        );

    }
);


check(
    "NO TARGET PROTOCOL IS INVENTED",
    () => {

        for (
            const attribution
            of result.protocolAttributedExternalCalls
        ) {

            assert.equal(
                Object.prototype.hasOwnProperty.call(
                    attribution,
                    "targetProtocolId"
                ),
                false
            );

        }

    }
);


check(
    "NO COMPOSITION OR POLARITY IS INVENTED",
    () => {

        for (
            const attribution
            of result.protocolAttributedExternalCalls
        ) {

            for (
                const field
                of [
                    "candidateId",
                    "compositionCandidate",
                    "scientificPolarity",
                    "compatibility",
                    "interactionDirection",
                    "confidence",
                    "relationships"
                ]
            ) {

                assert.equal(
                    Object.prototype.hasOwnProperty.call(
                        attribution,
                        field
                    ),
                    false
                );

            }

        }

    }
);


const missingObservationResult =
    engine.attribute({
        sourceId,
        sourceRevision,

        facts: [
            callFactA
        ],

        observations:
            []
    });


check(
    "MISSING OBSERVATION FAILS CLOSED",
    () => {

        assert.equal(
            missingObservationResult.errors.length >
                0,
            true
        );

        assert.deepEqual(
            missingObservationResult.protocolAttributedExternalCalls,
            []
        );

        assert.deepEqual(
            missingObservationResult.unresolvedExternalCallFactIds,
            [
                callFactA.factId
            ]
        );

    }
);


const incompleteFact:
    ScientificSourceFact =
    {
        ...callFactA,

        factId:
            "FACT-INCOMPLETE",

        containerSymbol:
            undefined
    };


const incompleteResult =
    engine.attribute({
        sourceId,
        sourceRevision,

        facts: [
            incompleteFact
        ],

        observations: [
            observationA
        ]
    });


check(
    "INCOMPLETE STRUCTURAL CONTAINER FAILS CLOSED",
    () => {

        assert.equal(
            incompleteResult.errors.length >
                0,
            true
        );

        assert.deepEqual(
            incompleteResult.protocolAttributedExternalCalls,
            []
        );

    }
);


const duplicateResult =
    engine.attribute({
        sourceId,
        sourceRevision,

        facts: [
            callFactA,
            {
                ...callFactA
            }
        ],

        observations: [
            observationA
        ]
    });


check(
    "DUPLICATE EXTERNAL CALL FACT ID FAILS CLOSED",
    () => {

        assert.equal(
            duplicateResult.errors.some(
                error =>
                    error.includes(
                        "Duplicate external-call fact identity"
                    )
            ),
            true
        );

        assert.deepEqual(
            duplicateResult.protocolAttributedExternalCalls,
            []
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
