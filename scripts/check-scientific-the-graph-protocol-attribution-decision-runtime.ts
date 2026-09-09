import {
    projectScientificTheGraphProtocolAttributionDecision
} from "../laboratory/scientific-the-graph-protocol-attribution/ScientificTheGraphProtocolAttributionDecision.js";


let pass =
    0;

let fail =
    0;


function check(
    name:
        string,
    condition:
        boolean
): void {

    console.log(
        `${name}: ${condition ? "PASS" : "FAIL"}`
    );

    if (condition) {
        pass++;
    }
    else {
        fail++;
    }

}


function assessment(
    overrides:
        Record<string, unknown>
): any {

    return {

        assessmentId:
            "ASSESSMENT-A",

        protocolId:
            "ERC-8004",

        profileId:
            "PROFILE-ERC-8004",

        normativeSourceId:
            "GITHUB-ERC-8004",

        normativeSourceRevision:
            "REV-A",

        subgraphId:
            "SUBGRAPH-A",

        ipfsHash:
            "Qm11111111111111111111111111111111111111111111",

        providerMode:
            "FIXTURE",

        schemaObservationId:
            "SCHEMA-A",

        schemaHash:
            "HASH-A",

        identifiersChecked:
            [
                "ERC-8004",
                "ERC8004"
            ],

        matchedIdentifiers:
            [],

        rejectedIdentifierOccurrences:
            [],

        status:
            "UNATTRIBUTED",

        attributionBasis:
            "NO_EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER",

        nextAction:
            "REQUIRES_ADDITIONAL_ATTRIBUTION_EVIDENCE",

        ...overrides

    };

}


console.log("");
console.log(
    "SCIENTIFIC THE GRAPH SELECTIVE ATTRIBUTION DECISION"
);
console.log(
    "==================================================="
);


const positive =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            status:
                "ATTRIBUTED",

            attributionBasis:
                "EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER",

            matchedIdentifiers:
                [
                    {
                        identifier:
                            "ERC-8004",

                        occurrenceCount:
                            1
                    }
                ],

            nextAction:
                "ELIGIBLE_FOR_DATA_QUERY_DESIGN"

        })
    );


check(
    "AFFIRMATIVE ATTRIBUTION PROJECTS POSITIVE",
    positive.decision ===
        "POSITIVE" &&
    positive.decisionBasis ===
        "AFFIRMATIVE_ATTRIBUTION_EVIDENCE"
);


const noIdentifier =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({})
    );


check(
    "NO IDENTIFIER PROJECTS NEGATIVE",
    noIdentifier.decision ===
        "NEGATIVE" &&
    noIdentifier.decisionBasis ===
        "NO_EXPLICIT_PROTOCOL_IDENTIFIER"
);


const explicitNegation =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            attributionBasis:
                "ONLY_REJECTED_SCHEMA_PROTOCOL_IDENTIFIER_CONTEXT",

            rejectedIdentifierOccurrences:
                [
                    {
                        identifier:
                            "ERC-8004",

                        occurrenceCount:
                            1,

                        reasons:
                            [
                                "EXPLICIT_NEGATION_CONTEXT"
                            ]
                    }
                ]

        })
    );


check(
    "EXPLICIT NEGATION PROJECTS NEGATIVE",
    explicitNegation.decision ===
        "NEGATIVE" &&
    explicitNegation.decisionBasis ===
        "EXPLICIT_NON_ATTRIBUTION_EVIDENCE"
);


const referenceOnly =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            attributionBasis:
                "ONLY_REJECTED_SCHEMA_PROTOCOL_IDENTIFIER_CONTEXT",

            rejectedIdentifierOccurrences:
                [
                    {
                        identifier:
                            "ERC-8004",

                        occurrenceCount:
                            1,

                        reasons:
                            [
                                "REFERENCE_ONLY_CONTEXT"
                            ]
                    }
                ]

        })
    );


check(
    "REFERENCE ONLY PROJECTS NEGATIVE",
    referenceOnly.decision ===
        "NEGATIVE" &&
    referenceOnly.decisionBasis ===
        "EXPLICIT_NON_ATTRIBUTION_EVIDENCE"
);


const ambiguous =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            attributionBasis:
                "ONLY_REJECTED_SCHEMA_PROTOCOL_IDENTIFIER_CONTEXT",

            rejectedIdentifierOccurrences:
                [
                    {
                        identifier:
                            "ERC-8004",

                        occurrenceCount:
                            1,

                        reasons:
                            [
                                "AMBIGUOUS_IDENTIFIER_CONTEXT"
                            ]
                    }
                ]

        })
    );


check(
    "AMBIGUOUS IDENTIFIER PROJECTS ABSTAIN",
    ambiguous.decision ===
        "ABSTAIN" &&
    ambiguous.decisionBasis ===
        "AMBIGUOUS_PROTOCOL_IDENTIFIER_CONTEXT"
);


const unknownRejectedContext =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            attributionBasis:
                "ONLY_REJECTED_SCHEMA_PROTOCOL_IDENTIFIER_CONTEXT",

            rejectedIdentifierOccurrences:
                []

        })
    );


check(
    "UNKNOWN REJECTED CONTEXT FAILS CLOSED TO ABSTAIN",
    unknownRejectedContext.decision ===
        "ABSTAIN"
);


const mixed =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            attributionBasis:
                "ONLY_REJECTED_SCHEMA_PROTOCOL_IDENTIFIER_CONTEXT",

            rejectedIdentifierOccurrences:
                [
                    {
                        identifier:
                            "ERC-8004",

                        occurrenceCount:
                            2,

                        reasons:
                            [
                                "AMBIGUOUS_IDENTIFIER_CONTEXT",
                                "EXPLICIT_NEGATION_CONTEXT"
                            ]
                    }
                ]

        })
    );


check(
    "EXPLICIT NEGATION REMAINS FIRM IN MIXED REJECTED CONTEXT",
    mixed.decision ===
        "NEGATIVE" &&
    mixed.decisionBasis ===
        "EXPLICIT_NON_ATTRIBUTION_EVIDENCE"
);


const repeated =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            attributionBasis:
                "ONLY_REJECTED_SCHEMA_PROTOCOL_IDENTIFIER_CONTEXT",

            rejectedIdentifierOccurrences:
                [
                    {
                        identifier:
                            "ERC-8004",

                        occurrenceCount:
                            1,

                        reasons:
                            [
                                "AMBIGUOUS_IDENTIFIER_CONTEXT"
                            ]
                    }
                ]

        })
    );


check(
    "DECISION PROJECTION IS DETERMINISTIC",
    JSON.stringify(
        repeated
    ) ===
    JSON.stringify(
        ambiguous
    )
);


check(
    "PROVENANCE IS PRESERVED",
    positive.assessmentId ===
        "ASSESSMENT-A" &&
    positive.protocolId ===
        "ERC-8004" &&
    positive.profileId ===
        "PROFILE-ERC-8004" &&
    positive.subgraphId ===
        "SUBGRAPH-A" &&
    positive.ipfsHash ===
        "Qm11111111111111111111111111111111111111111111"
);


const serialized =
    JSON.stringify([
        positive,
        noIdentifier,
        explicitNegation,
        referenceOnly,
        ambiguous
    ]);


check(
    "DECISION PROJECTION CONTAINS NO SCIENTIFIC POLARITY",
    !serialized.includes(
        "scientificPolarity"
    ) &&
    !serialized.includes(
        "compatibilityPolarity"
    ) &&
    !serialized.includes(
        "\"SUPPORT\""
    ) &&
    !serialized.includes(
        "\"CHALLENGE\""
    ) &&
    !serialized.includes(
        "\"FULL\""
    ) &&
    !serialized.includes(
        "\"PARTIAL\""
    )
);


console.log("");
console.log(
    `PASS: ${pass}`
);

console.log(
    `FAIL: ${fail}`
);

console.log(
    `RESULT: ${fail === 0 ? "PASS" : "FAIL"}`
);


if (fail > 0) {
    process.exitCode = 1;
}