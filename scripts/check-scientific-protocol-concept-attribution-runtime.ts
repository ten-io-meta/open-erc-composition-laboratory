import {
    ScientificProtocolConceptAttributionEngine
} from "../laboratory/scientific-protocol-concept-attribution/ScientificProtocolConceptAttributionEngine.js";

import type {
    ScientificConceptAbstractionResult
} from "../laboratory/scientific-concept-abstraction/ScientificConceptAbstractionResult.js";

import type {
    ScientificProtocolIdentityAttributionResult
} from "../laboratory/scientific-protocol-identity/ScientificProtocolIdentityAttributionResult.js";

import type {
    ScientificProtocolAttributedCapability
} from "../laboratory/scientific-protocol-identity/ScientificProtocolAttributedCapability.js";


const sourceId =
    "CONTROLLED-SOURCE";

const sourceRevision =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const sourceModelId =
    "CONTROLLED-MODEL";


function protocolCapability(
    protocolAttributionId:
        string,
    protocolId:
        string,
    capabilityId:
        string,
    label:
        string,
    observationId:
        string,
    factId:
        string
): ScientificProtocolAttributedCapability {

    return {

        protocolAttributionId,

        protocolId,

        identityBasis:
            "EXACT_ERC_CONTAINER_SYMBOL",

        capabilityAttributionId:
            `STRUCTURAL-${protocolAttributionId}`,

        capabilityId,

        label,

        observationId,

        containerKind:
            "INTERFACE",

        containerSymbol:
            protocolId.replace(
                "-",
                ""
            ),

        evidence: [
            factId
        ]

    };

}


const concepts:
    ScientificConceptAbstractionResult = {

    sourceId,

    sourceRevision,

    sourceModelId,

    concepts: [
        {
            conceptId:
                "CONCEPT-VALUE",

            label:
                "value",

            lexicalCapabilityIds: [
                "LEXICAL-A-VALUE",
                "LEXICAL-B-VALUE",
                "LEXICAL-C-VALUE"
            ],

            evidence: [
                "FACT-A-P",
                "FACT-B-P",
                "FACT-C-Q"
            ]
        },
        {
            conceptId:
                "CONCEPT-CROSS",

            label:
                "cross",

            lexicalCapabilityIds: [
                "LEXICAL-CROSS-A",
                "LEXICAL-CROSS-B"
            ],

            evidence: [
                "FACT-CROSS-A",
                "FACT-CROSS-B"
            ]
        },
        {
            conceptId:
                "CONCEPT-SHARED",

            label:
                "shared",

            lexicalCapabilityIds: [
                "LEXICAL-SHARED-A",
                "LEXICAL-SHARED-B"
            ],

            evidence: [
                "FACT-SHARED-A-P",
                "FACT-SHARED-B-P",
                "FACT-SHARED-A-Q",
                "FACT-SHARED-B-Q"
            ]
        }
    ],

    errors:
        []

};


const capabilities:
    ScientificProtocolAttributedCapability[] = [
        protocolCapability(
            "PA-P-A",
            "ERC-101",
            "LEXICAL-A-VALUE",
            "a value",
            "OBS-P-A",
            "FACT-A-P"
        ),
        protocolCapability(
            "PA-P-B",
            "ERC-101",
            "LEXICAL-B-VALUE",
            "b value",
            "OBS-P-B",
            "FACT-B-P"
        ),
        protocolCapability(
            "PA-Q-C",
            "ERC-202",
            "LEXICAL-C-VALUE",
            "c value",
            "OBS-Q-C",
            "FACT-C-Q"
        ),

        /*
         * Cross-protocol recurrence:
         * one supporting lexical capability in each protocol.
         * Neither protocol independently reaches recurrence.
         */
        protocolCapability(
            "PA-P-CROSS-A",
            "ERC-101",
            "LEXICAL-CROSS-A",
            "cross a",
            "OBS-P-CROSS-A",
            "FACT-CROSS-A"
        ),
        protocolCapability(
            "PA-Q-CROSS-B",
            "ERC-202",
            "LEXICAL-CROSS-B",
            "cross b",
            "OBS-Q-CROSS-B",
            "FACT-CROSS-B"
        ),

        /*
         * Same concept independently recurrent in both protocols.
         */
        protocolCapability(
            "PA-P-SHARED-A",
            "ERC-101",
            "LEXICAL-SHARED-A",
            "shared a",
            "OBS-P-SHARED-A",
            "FACT-SHARED-A-P"
        ),
        protocolCapability(
            "PA-P-SHARED-B",
            "ERC-101",
            "LEXICAL-SHARED-B",
            "shared b",
            "OBS-P-SHARED-B",
            "FACT-SHARED-B-P"
        ),
        protocolCapability(
            "PA-Q-SHARED-A",
            "ERC-202",
            "LEXICAL-SHARED-A",
            "shared a",
            "OBS-Q-SHARED-A",
            "FACT-SHARED-A-Q"
        ),
        protocolCapability(
            "PA-Q-SHARED-B",
            "ERC-202",
            "LEXICAL-SHARED-B",
            "shared b",
            "OBS-Q-SHARED-B",
            "FACT-SHARED-B-Q"
        )
    ];


const protocols:
    ScientificProtocolIdentityAttributionResult = {

    sourceId,

    sourceRevision,

    sourceModelId,

    protocolAttributedCapabilities:
        capabilities,

    unresolvedAttributionIds:
        [],

    structurallyUnattributedCapabilityIds:
        [],

    errors:
        []

};


const engine =
    new ScientificProtocolConceptAttributionEngine();


const result =
    engine.attribute({
        concepts,
        protocols
    });


const secondRun =
    engine.attribute({

        concepts: {
            ...concepts,

            concepts: [
                ...concepts.concepts
            ].reverse()
        },

        protocols: {
            ...protocols,

            protocolAttributedCapabilities: [
                ...protocols.protocolAttributedCapabilities
            ].reverse()
        }

    });


const valueConcepts =
    result.protocolConcepts.filter(
        concept =>
            concept.conceptId ===
            "CONCEPT-VALUE"
    );


const valueForP =
    valueConcepts.find(
        concept =>
            concept.protocolId ===
            "ERC-101"
    );


const valueForQ =
    valueConcepts.find(
        concept =>
            concept.protocolId ===
            "ERC-202"
    );


const crossConcepts =
    result.protocolConcepts.filter(
        concept =>
            concept.conceptId ===
            "CONCEPT-CROSS"
    );


const sharedConcepts =
    result.protocolConcepts.filter(
        concept =>
            concept.conceptId ===
            "CONCEPT-SHARED"
    );


const sharedForP =
    sharedConcepts.find(
        concept =>
            concept.protocolId ===
            "ERC-101"
    );


const sharedForQ =
    sharedConcepts.find(
        concept =>
            concept.protocolId ===
            "ERC-202"
    );


const sourceMismatch =
    engine.attribute({

        concepts,

        protocols: {
            ...protocols,

            sourceId:
                "OTHER-SOURCE"
        }

    });


const revisionMismatch =
    engine.attribute({

        concepts,

        protocols: {
            ...protocols,

            sourceRevision:
                "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
        }

    });


const modelMismatch =
    engine.attribute({

        concepts,

        protocols: {
            ...protocols,

            sourceModelId:
                "OTHER-MODEL"
        }

    });


const evidenceDrift =
    engine.attribute({

        concepts,

        protocols: {
            ...protocols,

            protocolAttributedCapabilities:
                protocols
                    .protocolAttributedCapabilities
                    .map(
                        (
                            capability,
                            index
                        ) =>
                            index ===
                                0
                                ? {
                                    ...capability,

                                    evidence: [
                                        "FACT-NOT-IN-CONCEPT"
                                    ]
                                }
                                : capability
                    )
        }

    });


const duplicateConcept =
    engine.attribute({

        concepts: {
            ...concepts,

            concepts: [
                ...concepts.concepts,
                {
                    ...concepts.concepts[0]
                }
            ]
        },

        protocols

    });


const duplicateProtocolAttribution =
    engine.attribute({

        concepts,

        protocols: {
            ...protocols,

            protocolAttributedCapabilities: [
                ...protocols.protocolAttributedCapabilities,
                {
                    ...protocols.protocolAttributedCapabilities[0]
                }
            ]
        }

    });


const upstreamConceptFailure =
    engine.attribute({

        concepts: {
            ...concepts,

            errors: [
                "CONTROLLED CONCEPT FAILURE"
            ]
        },

        protocols

    });


const upstreamProtocolFailure =
    engine.attribute({

        concepts,

        protocols: {
            ...protocols,

            errors: [
                "CONTROLLED PROTOCOL FAILURE"
            ]
        }

    });


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "RUNTIME PRESERVES SOURCE ID",
        passed:
            result.sourceId ===
            sourceId
    },
    {
        name:
            "RUNTIME PRESERVES SOURCE REVISION",
        passed:
            result.sourceRevision ===
            sourceRevision
    },
    {
        name:
            "RUNTIME PRESERVES SOURCE MODEL ID",
        passed:
            result.sourceModelId ===
            sourceModelId
    },
    {
        name:
            "VALID PROTOCOL CONCEPT ATTRIBUTION HAS NO ERRORS",
        passed:
            result.errors.length ===
            0
    },
    {
        name:
            "VALUE CONCEPT IS ATTRIBUTED TO PROTOCOL WITH TWO SUPPORTING CAPABILITIES",
        passed:
            valueForP !==
            undefined
    },
    {
        name:
            "VALUE CONCEPT PRESERVES PROTOCOL ID",
        passed:
            valueForP
                ?.protocolId ===
            "ERC-101"
    },
    {
        name:
            "VALUE CONCEPT PRESERVES CONCEPT LABEL",
        passed:
            valueForP
                ?.label ===
            "value"
    },
    {
        name:
            "VALUE CONCEPT PRESERVES TWO DISTINCT LEXICAL CAPABILITIES",
        passed:
            valueForP
                ?.lexicalCapabilityIds
                .length ===
            2
    },
    {
        name:
            "VALUE CONCEPT PRESERVES FIRST SUPPORTING CAPABILITY",
        passed:
            valueForP
                ?.lexicalCapabilityIds
                .includes(
                    "LEXICAL-A-VALUE"
                ) ===
            true
    },
    {
        name:
            "VALUE CONCEPT PRESERVES SECOND SUPPORTING CAPABILITY",
        passed:
            valueForP
                ?.lexicalCapabilityIds
                .includes(
                    "LEXICAL-B-VALUE"
                ) ===
            true
    },
    {
        name:
            "VALUE CONCEPT PRESERVES PROTOCOL ATTRIBUTION IDS",
        passed:
            valueForP
                ?.protocolAttributionIds
                .length ===
                2 &&
            valueForP
                ?.protocolAttributionIds
                .includes(
                    "PA-P-A"
                ) ===
                true &&
            valueForP
                ?.protocolAttributionIds
                .includes(
                    "PA-P-B"
                ) ===
                true
    },
    {
        name:
            "VALUE CONCEPT PRESERVES ONLY PROTOCOL LOCAL FACT EVIDENCE",
        passed:
            valueForP
                ?.evidence
                .length ===
                2 &&
            valueForP
                ?.evidence
                .includes(
                    "FACT-A-P"
                ) ===
                true &&
            valueForP
                ?.evidence
                .includes(
                    "FACT-B-P"
                ) ===
                true
    },
    {
        name:
            "SINGLE CAPABILITY DOES NOT GIVE VALUE CONCEPT TO SECOND PROTOCOL",
        passed:
            valueForQ ===
            undefined
    },
    {
        name:
            "CROSS PROTOCOL RECURRENCE PRODUCES NO PROTOCOL CONCEPT",
        passed:
            crossConcepts.length ===
            0
    },
    {
        name:
            "CROSS PROTOCOL RECURRENCE REMAINS UNATTRIBUTED",
        passed:
            result
                .unattributedConceptIds
                .includes(
                    "CONCEPT-CROSS"
                )
    },
    {
        name:
            "ONE PROTOCOL CANNOT BORROW RECURRENCE FROM ANOTHER",
        passed:
            !result.protocolConcepts.some(
                concept =>
                    concept.conceptId ===
                        "CONCEPT-CROSS" &&
                    (
                        concept.protocolId ===
                            "ERC-101" ||
                        concept.protocolId ===
                            "ERC-202"
                    )
            )
    },
    {
        name:
            "SAME CONCEPT MAY BE INDEPENDENTLY ATTRIBUTED TO TWO PROTOCOLS",
        passed:
            sharedConcepts.length ===
                2 &&
            sharedForP !==
                undefined &&
            sharedForQ !==
                undefined
    },
    {
        name:
            "FIRST SHARED PROTOCOL HAS TWO LOCAL CAPABILITIES",
        passed:
            sharedForP
                ?.lexicalCapabilityIds
                .length ===
            2
    },
    {
        name:
            "SECOND SHARED PROTOCOL HAS TWO LOCAL CAPABILITIES",
        passed:
            sharedForQ
                ?.lexicalCapabilityIds
                .length ===
            2
    },
    {
        name:
            "FIRST SHARED PROTOCOL KEEPS ONLY ITS FACT EVIDENCE",
        passed:
            sharedForP
                ?.evidence
                .includes(
                    "FACT-SHARED-A-P"
                ) ===
                true &&
            sharedForP
                ?.evidence
                .includes(
                    "FACT-SHARED-B-P"
                ) ===
                true &&
            sharedForP
                ?.evidence
                .includes(
                    "FACT-SHARED-A-Q"
                ) !==
                true
    },
    {
        name:
            "SECOND SHARED PROTOCOL KEEPS ONLY ITS FACT EVIDENCE",
        passed:
            sharedForQ
                ?.evidence
                .includes(
                    "FACT-SHARED-A-Q"
                ) ===
                true &&
            sharedForQ
                ?.evidence
                .includes(
                    "FACT-SHARED-B-Q"
                ) ===
                true &&
            sharedForQ
                ?.evidence
                .includes(
                    "FACT-SHARED-A-P"
                ) !==
                true
    },
    {
        name:
            "PROTOCOL CONCEPT IDS ARE UNIQUE",
        passed:
            new Set(
                result.protocolConcepts.map(
                    concept =>
                        concept.protocolConceptId
                )
            ).size ===
            result.protocolConcepts.length
    },
    {
        name:
            "PROTOCOL CONCEPT ORDER IS DETERMINISTIC",
        passed:
            result
                .protocolConcepts
                .every(
                    (
                        concept,
                        index,
                        protocolConcepts
                    ) =>
                        index ===
                            0 ||
                        protocolConcepts[
                            index - 1
                        ].protocolConceptId
                            .localeCompare(
                                concept.protocolConceptId
                            ) <=
                            0
                )
    },
    {
        name:
            "PROTOCOL CONCEPT IDS ARE DETERMINISTIC ACROSS INPUT ORDER",
        passed:
            JSON.stringify(
                result.protocolConcepts.map(
                    concept =>
                        concept.protocolConceptId
                )
            ) ===
            JSON.stringify(
                secondRun.protocolConcepts.map(
                    concept =>
                        concept.protocolConceptId
                )
            )
    },
    {
        name:
            "UNATTRIBUTED CONCEPT IDS ARE SORTED",
        passed:
            JSON.stringify(
                result.unattributedConceptIds
            ) ===
            JSON.stringify(
                [
                    ...result.unattributedConceptIds
                ].sort()
            )
    },
    {
        name:
            "PROTOCOL CONCEPTS CONTAIN NO CONFIDENCE",
        passed:
            !result.protocolConcepts.some(
                concept =>
                    Object.prototype.hasOwnProperty.call(
                        concept,
                        "confidence"
                    )
            )
    },
    {
        name:
            "SOURCE MISMATCH IS DETECTED",
        passed:
            sourceMismatch.errors.some(
                error =>
                    error.includes(
                        "does not match protocol attribution source"
                    )
            )
    },
    {
        name:
            "SOURCE MISMATCH FAILS CLOSED",
        passed:
            sourceMismatch.protocolConcepts.length ===
            0
    },
    {
        name:
            "REVISION MISMATCH IS DETECTED",
        passed:
            revisionMismatch.errors.some(
                error =>
                    error.includes(
                        "source revisions do not match"
                    )
            )
    },
    {
        name:
            "REVISION MISMATCH FAILS CLOSED",
        passed:
            revisionMismatch.protocolConcepts.length ===
            0
    },
    {
        name:
            "MODEL MISMATCH IS DETECTED",
        passed:
            modelMismatch.errors.some(
                error =>
                    error.includes(
                        "does not match protocol attribution model"
                    )
            )
    },
    {
        name:
            "MODEL MISMATCH FAILS CLOSED",
        passed:
            modelMismatch.protocolConcepts.length ===
            0
    },
    {
        name:
            "PROTOCOL EVIDENCE DRIFT IS DETECTED",
        passed:
            evidenceDrift.errors.some(
                error =>
                    error.includes(
                        "FACT-NOT-IN-CONCEPT"
                    )
            )
    },
    {
        name:
            "PROTOCOL EVIDENCE DRIFT FAILS CLOSED",
        passed:
            evidenceDrift.protocolConcepts.length ===
            0
    },
    {
        name:
            "DUPLICATE SCIENTIFIC CONCEPT ID IS DETECTED",
        passed:
            duplicateConcept.errors.some(
                error =>
                    error.includes(
                        "Duplicate scientific concept identity CONCEPT-VALUE"
                    )
            )
    },
    {
        name:
            "DUPLICATE SCIENTIFIC CONCEPT ID FAILS CLOSED",
        passed:
            duplicateConcept.protocolConcepts.length ===
            0
    },
    {
        name:
            "DUPLICATE PROTOCOL ATTRIBUTION ID IS DETECTED",
        passed:
            duplicateProtocolAttribution.errors.some(
                error =>
                    error.includes(
                        "Duplicate protocol attribution identity PA-P-A"
                    )
            )
    },
    {
        name:
            "DUPLICATE PROTOCOL ATTRIBUTION ID FAILS CLOSED",
        passed:
            duplicateProtocolAttribution.protocolConcepts.length ===
            0
    },
    {
        name:
            "UPSTREAM CONCEPT FAILURE IS PRESERVED",
        passed:
            upstreamConceptFailure.errors.includes(
                "CONTROLLED CONCEPT FAILURE"
            )
    },
    {
        name:
            "UPSTREAM CONCEPT FAILURE FAILS CLOSED",
        passed:
            upstreamConceptFailure.protocolConcepts.length ===
            0
    },
    {
        name:
            "UPSTREAM PROTOCOL FAILURE IS PRESERVED",
        passed:
            upstreamProtocolFailure.errors.includes(
                "CONTROLLED PROTOCOL FAILURE"
            )
    },
    {
        name:
            "UPSTREAM PROTOCOL FAILURE FAILS CLOSED",
        passed:
            upstreamProtocolFailure.protocolConcepts.length ===
            0
    }
];


console.log("");
console.log(
    "SCIENTIFIC PROTOCOL CONCEPT ATTRIBUTION — RUNTIME"
);
console.log(
    "------------------------------------------------"
);


for (
    const check
    of checks
) {

    console.log(
        `${check.name}: ${
            check.passed
                ? "PASS"
                : "FAIL"
        }`
    );

}


const failures =
    checks.filter(
        check =>
            !check.passed
    );


console.log("");


if (
    failures.length ===
    0
) {

    console.log(
        "RESULT: PASS"
    );

} else {

    console.log(
        `RESULT: FAIL (${failures.length}/${checks.length})`
    );

    process.exitCode =
        1;

}
