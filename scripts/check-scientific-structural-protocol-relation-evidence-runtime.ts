import {
    ScientificStructuralProtocolRelationEvidenceEngine
} from "../laboratory/scientific-protocol-relation-evidence/ScientificStructuralProtocolRelationEvidenceEngine.js";


let passed =
    0;

let failed =
    0;


function check(
    name: string,
    condition: boolean
): void {

    if (
        condition
    ) {

        console.log(
            `PASS: ${name}`
        );

        passed++;

        return;

    }


    console.log(
        `FAIL: ${name}`
    );

    failed++;

}


function fact(
    factId: string,
    observationId: string,
    symbol: string,
    rawText: string,
    sourceId = "SOURCE-A",
    sourceRevision = "REVISION-A"
): any {

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
                "https://github.com/example/example",

            filePath:
                `contracts/${symbol}.sol`,

            startLine:
                1,

            endLine:
                10

        },

        rawText

    };

}


function attribution(
    protocolAttributionId: string,
    protocolId: string,
    observationId: string,
    containerSymbol: string
): any {

    return {

        protocolAttributionId,

        protocolId,

        identityBasis:
            "EXACT_ERC_CONTAINER_SYMBOL",

        capabilityAttributionId:
            `CAP-${protocolAttributionId}`,

        capabilityId:
            `LEXICAL-${protocolAttributionId}`,

        label:
            protocolAttributionId,

        observationId,

        containerKind:
            "CONTRACT",

        containerSymbol,

        evidence: [
            `FACT-${protocolAttributionId}`
        ]

    };

}


const engine =
    new ScientificStructuralProtocolRelationEvidenceEngine();


console.log("");
console.log(
    "SCIENTIFIC STRUCTURAL PROTOCOL RELATION EVIDENCE"
);
console.log(
    "------------------------------------------------"
);


/*
 * ERC-8004 real structural shape.
 */

const erc8004 =
    engine.extract({

        sourceId:
            "SOURCE-A",

        sourceRevision:
            "REVISION-A",

        facts: [
            fact(
                "FACT-8004",
                "OBS-8004",
                "IdentityRegistryUpgradeable",
                [
                    "contract IdentityRegistryUpgradeable is",
                    "    ERC721URIStorageUpgradeable,",
                    "    OwnableUpgradeable,",
                    "    UUPSUpgradeable,",
                    "    EIP712Upgradeable",
                    "{"
                ].join("\n")
            )
        ],

        protocolAttributedCapabilities: [
            attribution(
                "ATTR-8004",
                "ERC-8004",
                "OBS-8004",
                "IdentityRegistryUpgradeable"
            )
        ]

    });


check(
    "ERC-8004 PRODUCES ONE EXTERNAL ERC-FAMILY DEPENDENCY",
    erc8004.relations.length ===
        1
);

check(
    "ERC-8004 IS STRUCTURAL RELATION SUBJECT",
    erc8004.relations[0]
        ?.subjectProtocolId ===
        "ERC-8004"
);

check(
    "ERC-8004 DEPENDS ON ERC-721",
    erc8004.relations[0]
        ?.objectProtocolId ===
        "ERC-721"
);

check(
    "ERC721 URI STORAGE UPGRADEABLE IS EXACT EVIDENCE",
    erc8004.relations[0]
        ?.inheritedSymbol ===
        "ERC721URIStorageUpgradeable"
);

check(
    "STRUCTURAL BASIS IS PRESERVED",
    erc8004.relations[0]
        ?.evidenceBasis ===
        "SOLIDITY_INHERITANCE_ERC_FAMILY"
);


/*
 * ERC-8060 real structural shape.
 *
 * ERC721URIStorage and IERC721Value independently establish
 * the same semantic dependency ERC-8060 -> ERC-721.
 *
 * They remain two exact evidence occurrences.
 */

const erc8060 =
    engine.extract({

        sourceId:
            "SOURCE-A",

        sourceRevision:
            "REVISION-A",

        facts: [
            fact(
                "FACT-8060",
                "OBS-8060",
                "ERC8060Reference",
                [
                    "contract ERC8060Reference is",
                    "    ERC721URIStorage,",
                    "    Ownable,",
                    "    ReentrancyGuard,",
                    "    IERC721Value",
                    "{"
                ].join("\n")
            )
        ],

        protocolAttributedCapabilities: [
            attribution(
                "ATTR-8060",
                "ERC-8060",
                "OBS-8060",
                "ERC8060Reference"
            )
        ]

    });


check(
    "ERC-8060 PRESERVES TWO EXACT ERC-721 EVIDENCE OCCURRENCES",
    erc8060.relations.length ===
        2
);

check(
    "BOTH ERC-8060 STRUCTURAL EVIDENCE OCCURRENCES TARGET ERC-721",
    erc8060.relations.every(
        relation =>
            relation.objectProtocolId ===
            "ERC-721"
    )
);

check(
    "ERC721 URI STORAGE IS OBSERVED",
    erc8060.relations.some(
        relation =>
            relation.inheritedSymbol ===
            "ERC721URIStorage"
    )
);

check(
    "IERC721 VALUE IS OBSERVED",
    erc8060.relations.some(
        relation =>
            relation.inheritedSymbol ===
            "IERC721Value"
    )
);

check(
    "OWNABLE AND REENTRANCY GUARD ARE NOT PROTOCOL DEPENDENCIES",
    erc8060.relations.every(
        relation =>
            relation.inheritedSymbol !==
                "Ownable" &&
            relation.inheritedSymbol !==
                "ReentrancyGuard"
    )
);


/*
 * A same-protocol ERC-family base is not an external dependency.
 */

const selfDependency =
    engine.extract({

        sourceId:
            "SOURCE-A",

        sourceRevision:
            "REVISION-A",

        facts: [
            fact(
                "FACT-SELF",
                "OBS-SELF",
                "ERC8060Reference",
                "contract ERC8060Reference is IERC8060MintBurn {"
            )
        ],

        protocolAttributedCapabilities: [
            attribution(
                "ATTR-SELF",
                "ERC-8060",
                "OBS-SELF",
                "ERC8060Reference"
            )
        ]

    });


check(
    "SAME-PROTOCOL INHERITANCE DOES NOT CREATE EXTERNAL DEPENDENCY",
    selfDependency.relations.length ===
        0
);


/*
 * A helper without independently established protocol identity
 * cannot become a protocol relation subject.
 */

const helper =
    engine.extract({

        sourceId:
            "SOURCE-A",

        sourceRevision:
            "REVISION-A",

        facts: [
            fact(
                "FACT-HELPER",
                "OBS-HELPER",
                "MaliciousReceiver",
                "contract MaliciousReceiver is IERC721Receiver {"
            )
        ],

        protocolAttributedCapabilities:
            []

    });


check(
    "UNATTRIBUTED HELPER DOES NOT BECOME PROTOCOL SUBJECT",
    helper.relations.length ===
        0
);


/*
 * Multiple protocol identities for one exact container occurrence
 * fail closed.
 */

const ambiguous =
    engine.extract({

        sourceId:
            "SOURCE-A",

        sourceRevision:
            "REVISION-A",

        facts: [
            fact(
                "FACT-AMBIGUOUS",
                "OBS-AMBIGUOUS",
                "Example",
                "contract Example is ERC721 {"
            )
        ],

        protocolAttributedCapabilities: [
            attribution(
                "ATTR-A",
                "ERC-8004",
                "OBS-AMBIGUOUS",
                "Example"
            ),
            attribution(
                "ATTR-B",
                "ERC-8060",
                "OBS-AMBIGUOUS",
                "Example"
            )
        ]

    });


check(
    "AMBIGUOUS SUBJECT PROTOCOL IDENTITY FAILS CLOSED",
    ambiguous.relations.length ===
        0 &&
    ambiguous.errors.length >
        0
);


/*
 * Source provenance mismatch fails closed.
 */

const wrongSource =
    engine.extract({

        sourceId:
            "SOURCE-A",

        sourceRevision:
            "REVISION-A",

        facts: [
            fact(
                "FACT-WRONG-SOURCE",
                "OBS-WRONG-SOURCE",
                "Example",
                "contract Example is ERC721 {",
                "SOURCE-B",
                "REVISION-A"
            )
        ],

        protocolAttributedCapabilities:
            []

    });


check(
    "MISMATCHED FACT SOURCE FAILS CLOSED",
    wrongSource.relations.length ===
        0 &&
    wrongSource.errors.length >
        0
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
