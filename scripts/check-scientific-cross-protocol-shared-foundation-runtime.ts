import {
    CrossProtocolCompositionEngine
} from "../laboratory/scientific-cross-protocol-composition/CrossProtocolCompositionEngine.js";


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


function relation(
    relationEvidenceId: string,
    sourceId: string,
    subjectProtocolId: string,
    objectProtocolId: string,
    inheritedSymbol: string
): any {

    return {

        relationEvidenceId,

        sourceId,

        sourceRevision:
            "REVISION-A",

        factId:
            `FACT-${relationEvidenceId}`,

        observationId:
            `OBS-${relationEvidenceId}`,

        subjectProtocolId,

        subjectContainerKind:
            "CONTRACT",

        subjectContainerSymbol:
            `Container-${subjectProtocolId}`,

        relation:
            "DEPENDS_ON",

        objectProtocolId,

        inheritedSymbol,

        evidenceBasis:
            "SOLIDITY_INHERITANCE_ERC_FAMILY",

        locator: {

            sourceLocation:
                "https://github.com/example/example",

            filePath:
                "contracts/Example.sol",

            startLine:
                1,

            endLine:
                5

        },

        rawText:
            `contract Example is ${inheritedSymbol} {`

    };

}


function structuralResult(
    sourceId: string,
    relations: any[]
): any {

    return {

        sourceId,

        sourceRevision:
            "REVISION-A",

        relations,

        unresolvedFactIds:
            [],

        errors:
            []

    };

}


const engine =
    new CrossProtocolCompositionEngine();


console.log("");
console.log(
    "SCIENTIFIC CROSS-PROTOCOL SHARED FOUNDATION"
);
console.log(
    "-------------------------------------------"
);


const discovered =
    engine.discover({

        protocolConceptResults:
            [],

        protocolRelationEvidenceResults:
            [],

        structuralProtocolRelationEvidenceResults: [

            structuralResult(
                "SOURCE-8004",
                [
                    relation(
                        "REL-8004-721",
                        "SOURCE-8004",
                        "ERC-8004",
                        "ERC-721",
                        "ERC721URIStorageUpgradeable"
                    )
                ]
            ),

            structuralResult(
                "SOURCE-8060",
                [
                    relation(
                        "REL-8060-721-A",
                        "SOURCE-8060",
                        "ERC-8060",
                        "ERC-721",
                        "ERC721URIStorage"
                    ),

                    relation(
                        "REL-8060-721-B",
                        "SOURCE-8060",
                        "ERC-8060",
                        "ERC-721",
                        "IERC721Value"
                    )
                ]
            )

        ]

    } as any);


check(
    "SHARED FOUNDATION DISCOVERS ONE CANDIDATE",
    discovered.candidates.length ===
        1
);


const candidate =
    discovered.candidates[0];


check(
    "MECHANISM IS SHARED PROTOCOL FOUNDATION",
    candidate?.mechanism ===
        "SHARED_PROTOCOL_FOUNDATION"
);


check(
    "PARTICIPANT A IS ERC-8004",
    candidate?.participantA.kind ===
        "PROTOCOL" &&
    candidate?.participantA.id ===
        "ERC-8004"
);


check(
    "PARTICIPANT B IS ERC-8060",
    candidate?.participantB.kind ===
        "PROTOCOL" &&
    candidate?.participantB.id ===
        "ERC-8060"
);


check(
    "FOUNDATION IS ERC-721",
    candidate?.foundationProtocolId ===
        "ERC-721"
);


check(
    "THREE EXACT STRUCTURAL EVIDENCE OCCURRENCES ARE PRESERVED",
    candidate?.provenance.length ===
        3
);


check(
    "ALL PROVENANCE IS STRUCTURAL",
    candidate?.provenance.every(
        provenance =>
            provenance.kind ===
            "STRUCTURAL_PROTOCOL_RELATION"
    ) ===
        true
);


check(
    "FOUNDATION DISCOVERY DOES NOT INVENT CAPABILITY SUPPORT",
    candidate?.supportingCapabilityIdsA.length ===
        0 &&
    candidate?.supportingCapabilityIdsB.length ===
        0
);


check(
    "CANDIDATE REMAINS UNEVALUATED",
    candidate?.evaluationStatus ===
        "UNEVALUATED"
);


const unrelated =
    engine.discover({

        protocolConceptResults:
            [],

        protocolRelationEvidenceResults:
            [],

        structuralProtocolRelationEvidenceResults: [

            structuralResult(
                "SOURCE-8004",
                [
                    relation(
                        "REL-8004-721",
                        "SOURCE-8004",
                        "ERC-8004",
                        "ERC-721",
                        "ERC721"
                    )
                ]
            ),

            structuralResult(
                "SOURCE-8060",
                [
                    relation(
                        "REL-8060-165",
                        "SOURCE-8060",
                        "ERC-8060",
                        "ERC-165",
                        "IERC165"
                    )
                ]
            )

        ]

    } as any);


check(
    "DIFFERENT FOUNDATIONS DO NOT CREATE A CANDIDATE",
    unrelated.candidates.length ===
        0
);


const oneProtocol =
    engine.discover({

        protocolConceptResults:
            [],

        protocolRelationEvidenceResults:
            [],

        structuralProtocolRelationEvidenceResults: [

            structuralResult(
                "SOURCE-A",
                [
                    relation(
                        "REL-A",
                        "SOURCE-A",
                        "ERC-8004",
                        "ERC-721",
                        "ERC721"
                    )
                ]
            ),

            structuralResult(
                "SOURCE-B",
                [
                    relation(
                        "REL-B",
                        "SOURCE-B",
                        "ERC-8004",
                        "ERC-721",
                        "IERC721"
                    )
                ]
            )

        ]

    } as any);


check(
    "DUPLICATE EVIDENCE FOR ONE SUBJECT PROTOCOL DOES NOT SELF-COMPOSE",
    oneProtocol.candidates.length ===
        0
);


const malformed =
    engine.discover({

        protocolConceptResults:
            [],

        protocolRelationEvidenceResults:
            [],

        structuralProtocolRelationEvidenceResults: [

            structuralResult(
                "SOURCE-A",
                [
                    {
                        ...relation(
                            "REL-BAD",
                            "WRONG-SOURCE",
                            "ERC-8004",
                            "ERC-721",
                            "ERC721"
                        )
                    }
                ]
            )

        ]

    } as any);


check(
    "STRUCTURAL PROVENANCE MISMATCH FAILS CLOSED",
    malformed.candidates.length ===
        0 &&
    malformed.errors.length >
        0
);


const legacyEmpty =
    engine.discover({

        protocolConceptResults:
            [],

        protocolRelationEvidenceResults:
            []

    });


check(
    "STRUCTURAL INPUT REMAINS OPTIONAL FOR EXISTING CALLERS",
    legacyEmpty.candidates.length ===
        0 &&
    legacyEmpty.errors.length ===
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
