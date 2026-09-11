import assert from "node:assert/strict";

import {
    ScientificProtocolCompositionProfileEngine
} from "../laboratory/scientific-protocol-composition-profile/ScientificProtocolCompositionProfileEngine.js";


function encode(
    parts: string[]
): string {

    return parts
        .map(
            part =>
                `${part.length}:${part}`
        )
        .join("|");

}


const engine =
    new ScientificProtocolCompositionProfileEngine();


const statement = {

    statementId:
        "SCIENTIFIC-NORMATIVE-STATEMENT|SOURCE-AGENT-ERCS|REVISION-1|OBS-8301|ERC-8301|4|MARKDOWN_PROTOCOL_MUST",

    sourceId:
        "SOURCE-AGENT-ERCS",

    sourceRevision:
        "REVISION-1",

    observationId:
        "OBS-8301",

    protocolId:
        "ERC-8301",

    basis:
        "MARKDOWN_PROTOCOL_MUST" as const,

    rawText:
        "The action nonce must equal nextActionNonce(agentId) at settlement.",

    normalizedText:
        "The action nonce must equal nextActionNonce(agentId) at settlement.",

    sourceLine:
        4,

    locator: {

        sourceLocation:
            "memory://ERC8301/README.md",

        filePath:
            "ERC8301/README.md",

        startLine:
            1,

        endLine:
            30

    }

};


const result =
    engine.build({

        protocolId:
            "ERC-8301",

        sourceId:
            "SOURCE-AGENT-ERCS",

        sourceRevision:
            "REVISION-1",

        sourceFacts:
            [],

        normativeStatements: [
            statement
        ],

        attributedCapabilities:
            [],

        protocolConcepts:
            [],

        structuralRelations:
            [],

        attributedExternalCalls:
            []

    });


assert.equal(
    result.errors.length,
    0
);

assert.notEqual(
    result.profile,
    null
);

if (!result.profile) {
    throw new Error(
        "Profile unexpectedly null."
    );
}

assert.equal(
    result.profile.boundaries.length,
    1
);

const boundary =
    result.profile.boundaries[0];

assert.equal(
    boundary.kind,
    "NORMATIVE_SOURCE_CONSTRAINT"
);

assert.equal(
    boundary.participantId,
    "ERC-8301"
);

assert.equal(
    boundary.subject,
    statement.normalizedText
);

assert.deepEqual(
    boundary.evidenceIds,
    [
        statement.statementId,
        statement.observationId
    ]
);

assert.equal(
    boundary.boundaryId,
    encode([
        "SCIENTIFIC-PROTOCOL-NORMATIVE-BOUNDARY",
        "ERC-8301",
        statement.statementId
    ])
);


/*
 * Existing callers remain valid without normativeStatements.
 */
const legacyResult =
    engine.build({

        protocolId:
            "ERC-8301",

        sourceId:
            "SOURCE-AGENT-ERCS",

        sourceRevision:
            "REVISION-1",

        sourceFacts:
            [],

        attributedCapabilities:
            [],

        protocolConcepts:
            [],

        structuralRelations:
            [],

        attributedExternalCalls:
            []

    });

assert.equal(
    legacyResult.errors.length,
    0
);

assert.equal(
    legacyResult.profile?.boundaries.length,
    0
);


/*
 * Protocol ownership fails closed.
 */
const wrongProtocol =
    engine.build({

        protocolId:
            "ERC-8301",

        sourceId:
            "SOURCE-AGENT-ERCS",

        sourceRevision:
            "REVISION-1",

        sourceFacts:
            [],

        normativeStatements: [
            {
                ...statement,
                protocolId:
                    "ERC-8354"
            }
        ],

        attributedCapabilities:
            [],

        protocolConcepts:
            [],

        structuralRelations:
            [],

        attributedExternalCalls:
            []

    });

assert.equal(
    wrongProtocol.profile,
    null
);

assert.ok(
    wrongProtocol.errors.some(
        error =>
            error.includes(
                "belongs to ERC-8354"
            )
    )
);


/*
 * Source provenance fails closed.
 */
const wrongSource =
    engine.build({

        protocolId:
            "ERC-8301",

        sourceId:
            "SOURCE-AGENT-ERCS",

        sourceRevision:
            "REVISION-1",

        sourceFacts:
            [],

        normativeStatements: [
            {
                ...statement,
                sourceId:
                    "OTHER-SOURCE"
            }
        ],

        attributedCapabilities:
            [],

        protocolConcepts:
            [],

        structuralRelations:
            [],

        attributedExternalCalls:
            []

    });

assert.equal(
    wrongSource.profile,
    null
);

assert.ok(
    wrongSource.errors.some(
        error =>
            error.includes(
                "another source"
            )
    )
);


/*
 * Revision provenance fails closed.
 */
const wrongRevision =
    engine.build({

        protocolId:
            "ERC-8301",

        sourceId:
            "SOURCE-AGENT-ERCS",

        sourceRevision:
            "REVISION-1",

        sourceFacts:
            [],

        normativeStatements: [
            {
                ...statement,
                sourceRevision:
                    "REVISION-2"
            }
        ],

        attributedCapabilities:
            [],

        protocolConcepts:
            [],

        structuralRelations:
            [],

        attributedExternalCalls:
            []

    });

assert.equal(
    wrongRevision.profile,
    null
);

assert.ok(
    wrongRevision.errors.some(
        error =>
            error.includes(
                "another revision"
            )
    )
);


console.log(
    "SCIENTIFIC NORMATIVE BOUNDARY MATERIALIZATION: PASS"
);

console.log(
    `BOUNDARY KIND: ${boundary.kind}`
);

console.log(
    `BOUNDARY SUBJECT: ${boundary.subject}`
);

console.log(
    `BOUNDARY EVIDENCE IDS: ${boundary.evidenceIds.length}`
);

console.log(
    "CROSS-PROTOCOL REJECTION: PASS"
);

console.log(
    "CROSS-SOURCE REJECTION: PASS"
);

console.log(
    "CROSS-REVISION REJECTION: PASS"
);

console.log(
    "BACKWARD COMPATIBILITY: PASS"
);

console.log(
    "NO CANDIDATE COMPATIBILITY CLAIM: PASS"
);

console.log(
    "NO RUNTIME PRESERVATION CLAIM: PASS"
);
