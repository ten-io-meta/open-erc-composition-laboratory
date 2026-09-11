import assert from "node:assert/strict";

import {
    ScientificProtocolCompositionProfileEngine
} from "../laboratory/scientific-protocol-composition-profile/ScientificProtocolCompositionProfileEngine.js";


const engine =
    new ScientificProtocolCompositionProfileEngine();


let passed = 0;


function check(
    name: string,
    condition: boolean
): void {

    assert.equal(
        condition,
        true,
        name
    );

    passed++;

    console.log(
        `PASS ${passed}: ${name}`
    );

}


const input = {

    protocolId:
        "ERC-9999",

    sourceId:
        "SOURCE-9999",

    sourceRevision:
        "REV-9999",

    attributedCapabilities: [

        {
            protocolAttributionId:
                "PROTOCOL-ATTR-1",

            protocolId:
                "ERC-9999",

            identityBasis:
                "EXACT_ERC_CONTAINER_SYMBOL" as const,

            capabilityAttributionId:
                "CAP-ATTR-1",

            capabilityId:
                "CAP-1",

            label:
                "VALUE",

            observationId:
                "OBS-1",

            containerKind:
                "CONTRACT" as const,

            containerSymbol:
                "ERC9999",

            evidence: [
                "EVIDENCE-1"
            ]
        }

    ],

    protocolConcepts: [

        {
            protocolConceptId:
                "PROTOCOL-CONCEPT-1",

            conceptId:
                "CONCEPT-1",

            label:
                "SETTLEMENT",

            protocolId:
                "ERC-9999",

            lexicalCapabilityIds: [
                "CAP-2"
            ],

            protocolAttributionIds: [
                "PROTOCOL-ATTR-2"
            ],

            evidence: [
                "EVIDENCE-2"
            ]
        }

    ],

    structuralRelations: [

        {
            relationEvidenceId:
                "REL-1",

            sourceId:
                "SOURCE-9999",

            sourceRevision:
                "REV-9999",

            factId:
                "FACT-REL",

            observationId:
                "OBS-REL",

            subjectProtocolId:
                "ERC-9999",

            subjectContainerKind:
                "CONTRACT" as const,

            subjectContainerSymbol:
                "ERC9999",

            relation:
                "DEPENDS_ON" as const,

            objectProtocolId:
                "ERC-721",

            inheritedSymbol:
                "ERC721",

            evidenceBasis:
                "SOLIDITY_INHERITANCE_ERC_FAMILY" as const,

            locator: {
                sourceLocation:
                    "SOURCE-9999",

                filePath:
                    "contracts/ERC9999.sol",

                startLine:
                    1,

                endLine:
                    1
            },

            rawText:
                "contract ERC9999 is ERC721 {}"
        }

    ],

    attributedExternalCalls: [

        {
            protocolCallAttributionId:
                "CALL-ATTR-1",

            protocolId:
                "ERC-9999",

            identityBasis:
                "EXACT_ERC_CONTAINER_SYMBOL" as const,

            sourceFactId:
                "FACT-CALL",

            observationId:
                "OBS-CALL",

            containerKind:
                "CONTRACT" as const,

            containerSymbol:
                "ERC9999",

            externalCall: {
                callForm:
                    "CAST_MEMBER_CALL" as const,

                targetExpression:
                    "receiver",

                castTypeSymbol:
                    "IERC1271",

                memberSymbol:
                    "isValidSignature"
            }
        }

    ],

    sourceFacts: [

        {
            factId:
                "FACT-REQUIRE",

            observationId:
                "OBS-REQUIRE",

            sourceId:
                "SOURCE-9999",

            sourceRevision:
                "REV-9999",

            kind:
                "REQUIRE_STATEMENT" as const,

            containerKind:
                "CONTRACT" as const,

            containerSymbol:
                "ERC9999",

            locator: {
                sourceLocation:
                    "SOURCE-9999",

                filePath:
                    "contracts/ERC9999.sol",

                startLine:
                    50,

                endLine:
                    50
            },

            rawText:
                'require(value > 0, "zero");'
        },

        {
            factId:
                "FACT-UNRELATED",

            observationId:
                "OBS-UNRELATED",

            sourceId:
                "SOURCE-9999",

            sourceRevision:
                "REV-9999",

            kind:
                "REQUIRE_STATEMENT" as const,

            containerKind:
                "CONTRACT" as const,

            containerSymbol:
                "UnrelatedContract",

            locator: {
                sourceLocation:
                    "SOURCE-9999",

                filePath:
                    "contracts/Other.sol",

                startLine:
                    10,

                endLine:
                    10
            },

            rawText:
                'require(false, "unrelated");'
        }

    ]

};


const result =
    engine.build(input);


check(
    "PROFILE BUILDS",
    result.profile !== null &&
    result.errors.length === 0
);


check(
    "PROFILE IS PROTOCOL CENTRIC NOT A B",
    result.profile?.protocolId ===
        "ERC-9999"
);


check(
    "CAPABILITY BECOMES CONTRIBUTION",
    result.profile?.contributions.some(
        contribution =>
            contribution.kind ===
                "CAPABILITY" &&
            contribution.subject ===
                "VALUE"
    ) === true
);


check(
    "CONCEPT BECOMES CONTRIBUTION",
    result.profile?.contributions.some(
        contribution =>
            contribution.kind ===
                "CONCEPT" &&
            contribution.subject ===
                "SETTLEMENT"
    ) === true
);


check(
    "DEPENDENCY BECOMES CONTRIBUTION",
    result.profile?.contributions.some(
        contribution =>
            contribution.kind ===
                "PROTOCOL_DEPENDENCY" &&
            contribution.subject ===
                "DEPENDS_ON:ERC-721"
    ) === true
);


check(
    "EXTERNAL CALL BECOMES BEHAVIOR",
    result.profile?.contributions.some(
        contribution =>
            contribution.kind ===
                "EXTERNAL_BEHAVIOR" &&
            contribution.subject ===
                "INTERFACE_MEMBER:IERC1271.isValidSignature"
    ) === true
);


check(
    "EXTERNAL CALL CREATES UNRESOLVED NEED",
    result.profile?.needs.length ===
        1 &&
    result.profile.needs[0].subject ===
        "INTERFACE_MEMBER:IERC1271.isValidSignature" &&
    result.profile.needs[0].status ===
        "UNRESOLVED"
);


check(
    "OWNED REQUIRE BECOMES BOUNDARY",
    result.profile?.boundaries.length ===
        1 &&
    result.profile.boundaries[0].subject.includes(
        "require(value > 0"
    )
);


check(
    "UNRELATED REQUIRE IS EXCLUDED",
    result.profile?.boundaries.some(
        boundary =>
            boundary.subject.includes(
                "unrelated"
            )
    ) === false
);


const wrongProtocol =
    engine.build({

        ...input,

        protocolConcepts: [
            {
                ...input.protocolConcepts[0],
                protocolId:
                    "ERC-OTHER"
            }
        ]

    });


check(
    "MIXED PROTOCOL EVIDENCE FAILS CLOSED",
    wrongProtocol.profile === null &&
    wrongProtocol.errors.length > 0
);


const wrongSource =
    engine.build({

        ...input,

        sourceFacts: [
            {
                ...input.sourceFacts[0],
                sourceId:
                    "OTHER-SOURCE"
            }
        ]

    });


check(
    "MIXED SOURCE EVIDENCE FAILS CLOSED",
    wrongSource.profile === null &&
    wrongSource.errors.length > 0
);


const reordered =
    engine.build({

        ...input,

        sourceFacts:
            [...input.sourceFacts].reverse(),

        attributedCapabilities:
            [...input.attributedCapabilities].reverse(),

        protocolConcepts:
            [...input.protocolConcepts].reverse(),

        structuralRelations:
            [...input.structuralRelations].reverse(),

        attributedExternalCalls:
            [...input.attributedExternalCalls].reverse()

    });


check(
    "OUTPUT IS DETERMINISTIC",
    JSON.stringify(result.profile) ===
    JSON.stringify(reordered.profile)
);


console.log("");
console.log(
    `SCIENTIFIC PROTOCOL COMPOSITION PROFILE: ${passed}/${passed} PASS`
);
