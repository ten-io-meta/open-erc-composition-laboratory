import {
    CrossProtocolCompositionEngine
} from "../laboratory/scientific-cross-protocol-composition/CrossProtocolCompositionEngine.js";

import type {
    ScientificProtocolConcept
} from "../laboratory/scientific-protocol-concept-attribution/ScientificProtocolConcept.js";

import type {
    ScientificProtocolConceptAttributionResult
} from "../laboratory/scientific-protocol-concept-attribution/ScientificProtocolConceptAttributionResult.js";

import type {
    ScientificProtocolRelationEvidence
} from "../laboratory/scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.js";

import type {
    ScientificProtocolRelationEvidenceResult
} from "../laboratory/scientific-protocol-relation-evidence/ScientificProtocolRelationEvidenceResult.js";


function protocolConcept(
    protocolConceptId:
        string,
    conceptId:
        string,
    label:
        string,
    protocolId:
        string,
    lexicalCapabilityIds:
        string[],
    protocolAttributionIds:
        string[],
    evidence:
        string[]
): ScientificProtocolConcept {

    return {

        protocolConceptId,

        conceptId,

        label,

        protocolId,

        lexicalCapabilityIds,

        protocolAttributionIds,

        evidence

    };

}


function conceptResult(
    sourceId:
        string,
    sourceRevision:
        string,
    sourceModelId:
        string,
    protocolConcepts:
        ScientificProtocolConcept[]
): ScientificProtocolConceptAttributionResult {

    return {

        sourceId,

        sourceRevision,

        sourceModelId,

        protocolConcepts,

        unattributedConceptIds:
            [],

        errors:
            []

    };

}


function relationEvidence(
    relationEvidenceId:
        string,
    sourceId:
        string,
    sourceRevision:
        string,
    observationId:
        string,
    subjectSymbol:
        string,
    objectProtocolId:
        string
): ScientificProtocolRelationEvidence {

    return {

        relationEvidenceId,

        sourceId,

        sourceRevision,

        observationId,

        subjectSymbol,

        relation:
            "EXTENSION_FOR",

        objectProtocolId,

        evidenceBasis:
            "MARKDOWN_H1_EXPLICIT_EXTENSION_FOR_ERC",

        subjectLocator: {

            sourceLocation:
                sourceId,

            filePath:
                "README.md",

            startLine:
                1,

            endLine:
                1

        },

        subjectRawText:
            `# ${subjectSymbol}`,

        locator: {

            sourceLocation:
                sourceId,

            filePath:
                "README.md",

            startLine:
                3,

            endLine:
                3

        },

        rawText:
            `Minimal extension for ${objectProtocolId}.`

    };

}


function relationResult(
    sourceId:
        string,
    sourceRevision:
        string,
    relations:
        ScientificProtocolRelationEvidence[]
): ScientificProtocolRelationEvidenceResult {

    return {

        sourceId,

        sourceRevision,

        relations,

        unresolvedObservationIds:
            [],

        errors:
            []

    };

}


const revisionA =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const revisionA2 =
    "abababababababababababababababababababab";

const revisionB =
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

const revisionC =
    "cccccccccccccccccccccccccccccccccccccccc";

const revisionD =
    "dddddddddddddddddddddddddddddddddddddddd";

const revisionE =
    "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

const revisionR1 =
    "1111111111111111111111111111111111111111";

const revisionR2 =
    "2222222222222222222222222222222222222222";


/*
 * SOURCE A:
 * first independent proof that ERC-101 exhibits
 * recurrent BALANCE semantics.
 */
const conceptA1 =
    conceptResult(
        "SOURCE-A",
        revisionA,
        "MODEL-A",
        [
            protocolConcept(
                "PC-A-BALANCE",
                "CONCEPT-BALANCE",
                "balance",
                "ERC-101",
                [
                    "LEXICAL-READ-BALANCE",
                    "LEXICAL-LOCK-BALANCE"
                ],
                [
                    "PA-A-READ",
                    "PA-A-LOCK"
                ],
                [
                    "FACT-A-READ",
                    "FACT-A-LOCK"
                ]
            )
        ]
    );


/*
 * A second source independently strengthens the same
 * protocol/concept combination.
 *
 * This must enrich provenance and capabilities without
 * changing candidate identity.
 */
const conceptA2 =
    conceptResult(
        "SOURCE-A-SECONDARY",
        revisionA2,
        "MODEL-A-SECONDARY",
        [
            protocolConcept(
                "PC-A2-BALANCE",
                "CONCEPT-BALANCE",
                "balance",
                "ERC-101",
                [
                    "LEXICAL-RESERVE-BALANCE",
                    "LEXICAL-RELEASE-BALANCE"
                ],
                [
                    "PA-A2-RESERVE",
                    "PA-A2-RELEASE"
                ],
                [
                    "FACT-A2-RESERVE",
                    "FACT-A2-RELEASE"
                ]
            )
        ]
    );


/*
 * SOURCE B:
 * a different protocol independently demonstrates the
 * same recurrent concept.
 */
const conceptB =
    conceptResult(
        "SOURCE-B",
        revisionB,
        "MODEL-B",
        [
            protocolConcept(
                "PC-B-BALANCE",
                "CONCEPT-BALANCE",
                "balance",
                "ERC-202",
                [
                    "LEXICAL-HOLD-BALANCE",
                    "LEXICAL-SPEND-BALANCE"
                ],
                [
                    "PA-B-HOLD",
                    "PA-B-SPEND"
                ],
                [
                    "FACT-B-HOLD",
                    "FACT-B-SPEND"
                ]
            )
        ]
    );


/*
 * A concept present in only one protocol must not open
 * a cross-protocol candidate.
 */
const conceptSingleton =
    conceptResult(
        "SOURCE-C",
        revisionC,
        "MODEL-C",
        [
            protocolConcept(
                "PC-C-NONCE",
                "CONCEPT-NONCE",
                "nonce",
                "ERC-303",
                [
                    "LEXICAL-READ-NONCE",
                    "LEXICAL-INCREMENT-NONCE"
                ],
                [
                    "PA-C-READ",
                    "PA-C-INCREMENT"
                ],
                [
                    "FACT-C-READ",
                    "FACT-C-INCREMENT"
                ]
            )
        ]
    );


/*
 * The same concept may be observed repeatedly for the
 * same protocol in independent sources. That is additional
 * evidence for one participant, not a cross-protocol pair.
 */
const sameProtocolD =
    conceptResult(
        "SOURCE-D",
        revisionD,
        "MODEL-D",
        [
            protocolConcept(
                "PC-D-LIMIT",
                "CONCEPT-LIMIT",
                "limit",
                "ERC-404",
                [
                    "LEXICAL-SET-LIMIT",
                    "LEXICAL-READ-LIMIT"
                ],
                [
                    "PA-D-SET",
                    "PA-D-READ"
                ],
                [
                    "FACT-D-SET",
                    "FACT-D-READ"
                ]
            )
        ]
    );


const sameProtocolE =
    conceptResult(
        "SOURCE-E",
        revisionE,
        "MODEL-E",
        [
            protocolConcept(
                "PC-E-LIMIT",
                "CONCEPT-LIMIT",
                "limit",
                "ERC-404",
                [
                    "LEXICAL-INCREASE-LIMIT",
                    "LEXICAL-DECREASE-LIMIT"
                ],
                [
                    "PA-E-INCREASE",
                    "PA-E-DECREASE"
                ],
                [
                    "FACT-E-INCREASE",
                    "FACT-E-DECREASE"
                ]
            )
        ]
    );


/*
 * Two independent documentary observations support the
 * same directed explicit extension relation.
 */
const relation1 =
    relationEvidence(
        "REL-EXAMPLE-1",
        "SOURCE-R1",
        revisionR1,
        "OBS-R1",
        "IExampleExtension",
        "ERC-505"
    );


const relation2 =
    relationEvidence(
        "REL-EXAMPLE-2",
        "SOURCE-R2",
        revisionR2,
        "OBS-R2",
        "IExampleExtension",
        "ERC-505"
    );


const relationSource1 =
    relationResult(
        "SOURCE-R1",
        revisionR1,
        [
            relation1
        ]
    );


const relationSource2 =
    relationResult(
        "SOURCE-R2",
        revisionR2,
        [
            relation2
        ]
    );


const engine =
    new CrossProtocolCompositionEngine();


const result =
    engine.discover({

        protocolConceptResults: [
            conceptSingleton,
            conceptA2,
            sameProtocolE,
            conceptB,
            conceptA1,
            sameProtocolD
        ],

        protocolRelationEvidenceResults: [
            relationSource2,
            relationSource1
        ]

    });


const shuffledResult =
    engine.discover({

        protocolConceptResults: [
            sameProtocolD,
            conceptA1,
            conceptB,
            sameProtocolE,
            conceptA2,
            conceptSingleton
        ],

        protocolRelationEvidenceResults: [
            relationSource1,
            relationSource2
        ]

    });


/*
 * Baseline contains enough evidence to open both semantic
 * candidates, but excludes the extra reinforcing sources.
 *
 * Candidate identity must remain stable after reinforcement.
 */
const baseline =
    engine.discover({

        protocolConceptResults: [
            conceptA1,
            conceptB
        ],

        protocolRelationEvidenceResults: [
            relationSource1
        ]

    });


const sharedCandidate =
    result.candidates.find(
        candidate =>
            candidate.mechanism ===
                "SHARED_RECURRENT_CONCEPT" &&
            candidate.conceptId ===
                "CONCEPT-BALANCE"
    );


const extensionCandidate =
    result.candidates.find(
        candidate =>
            candidate.mechanism ===
            "EXPLICIT_EXTENSION_FOR"
    );


const baselineSharedCandidate =
    baseline.candidates.find(
        candidate =>
            candidate.mechanism ===
                "SHARED_RECURRENT_CONCEPT" &&
            candidate.conceptId ===
                "CONCEPT-BALANCE"
    );


const baselineExtensionCandidate =
    baseline.candidates.find(
        candidate =>
            candidate.mechanism ===
            "EXPLICIT_EXTENSION_FOR"
    );


const upstreamConceptFailure =
    engine.discover({

        protocolConceptResults: [
            {
                ...conceptA1,

                errors: [
                    "CONTROLLED CONCEPT FAILURE"
                ]
            },
            conceptB
        ],

        protocolRelationEvidenceResults:
            []

    });


const upstreamRelationFailure =
    engine.discover({

        protocolConceptResults:
            [],

        protocolRelationEvidenceResults: [
            {
                ...relationSource1,

                errors: [
                    "CONTROLLED RELATION FAILURE"
                ]
            }
        ]

    });


const relationSourceMismatch =
    engine.discover({

        protocolConceptResults:
            [],

        protocolRelationEvidenceResults: [
            {
                ...relationSource1,

                sourceId:
                    "OTHER-SOURCE"
            }
        ]

    });


const relationRevisionMismatch =
    engine.discover({

        protocolConceptResults:
            [],

        protocolRelationEvidenceResults: [
            {
                ...relationSource1,

                sourceRevision:
                    "9999999999999999999999999999999999999999"
            }
        ]

    });


const duplicateProtocolConceptEvidence =
    engine.discover({

        protocolConceptResults: [
            conceptA1,
            {
                ...conceptA1,

                sourceId:
                    "SOURCE-A-DUPLICATE",

                protocolConcepts: [
                    {
                        ...conceptA1.protocolConcepts[0]
                    }
                ]
            }
        ],

        protocolRelationEvidenceResults:
            []

    });


const duplicateRelationEvidence =
    engine.discover({

        protocolConceptResults:
            [],

        protocolRelationEvidenceResults: [
            relationSource1,
            {
                ...relationSource1,

                sourceId:
                    "SOURCE-R1-DUPLICATE",

                relations: [
                    {
                        ...relation1,

                        sourceId:
                            "SOURCE-R1-DUPLICATE"
                    }
                ]
            }
        ]

    });


const checks: Array<{
    name: string;
    passed: boolean;
}> = [

    {
        name:
            "VALID CROSS PROTOCOL DISCOVERY HAS NO ERRORS",
        passed:
            result.errors.length ===
            0
    },

    {
        name:
            "VALID INPUT PRODUCES EXACTLY TWO SEMANTIC CANDIDATES",
        passed:
            result.candidates.length ===
            2
    },

    {
        name:
            "SHARED RECURRENT CONCEPT CANDIDATE EXISTS",
        passed:
            sharedCandidate !==
            undefined
    },

    {
        name:
            "EXPLICIT EXTENSION CANDIDATE EXISTS",
        passed:
            extensionCandidate !==
            undefined
    },

    {
        name:
            "SHARED CANDIDATE PRESERVES DISCOVERY MECHANISM",
        passed:
            sharedCandidate
                ?.mechanism ===
            "SHARED_RECURRENT_CONCEPT"
    },

    {
        name:
            "SHARED CANDIDATE PRESERVES CONCEPT ID",
        passed:
            sharedCandidate
                ?.conceptId ===
            "CONCEPT-BALANCE"
    },

    {
        name:
            "SHARED PARTICIPANT A IS A PROTOCOL",
        passed:
            sharedCandidate
                ?.participantA
                .kind ===
            "PROTOCOL"
    },

    {
        name:
            "SHARED PARTICIPANT A IS CANONICAL FIRST PROTOCOL",
        passed:
            sharedCandidate
                ?.participantA
                .id ===
            "ERC-101"
    },

    {
        name:
            "SHARED PARTICIPANT B IS A PROTOCOL",
        passed:
            sharedCandidate
                ?.participantB
                .kind ===
            "PROTOCOL"
    },

    {
        name:
            "SHARED PARTICIPANT B IS CANONICAL SECOND PROTOCOL",
        passed:
            sharedCandidate
                ?.participantB
                .id ===
            "ERC-202"
    },

    {
        name:
            "SHARED CANDIDATE AGGREGATES FOUR FIRST-PROTOCOL CAPABILITIES",
        passed:
            sharedCandidate
                ?.supportingCapabilityIdsA
                .length ===
            4
    },

    {
        name:
            "FIRST PROTOCOL PRESERVES PRIMARY SOURCE CAPABILITIES",
        passed:
            sharedCandidate
                ?.supportingCapabilityIdsA
                .includes(
                    "LEXICAL-READ-BALANCE"
                ) ===
                true &&
            sharedCandidate
                ?.supportingCapabilityIdsA
                .includes(
                    "LEXICAL-LOCK-BALANCE"
                ) ===
                true
    },

    {
        name:
            "FIRST PROTOCOL PRESERVES REINFORCING SOURCE CAPABILITIES",
        passed:
            sharedCandidate
                ?.supportingCapabilityIdsA
                .includes(
                    "LEXICAL-RESERVE-BALANCE"
                ) ===
                true &&
            sharedCandidate
                ?.supportingCapabilityIdsA
                .includes(
                    "LEXICAL-RELEASE-BALANCE"
                ) ===
                true
    },

    {
        name:
            "SECOND PROTOCOL PRESERVES ITS TWO LOCAL CAPABILITIES",
        passed:
            sharedCandidate
                ?.supportingCapabilityIdsB
                .length ===
                2 &&
            sharedCandidate
                ?.supportingCapabilityIdsB
                .includes(
                    "LEXICAL-HOLD-BALANCE"
                ) ===
                true &&
            sharedCandidate
                ?.supportingCapabilityIdsB
                .includes(
                    "LEXICAL-SPEND-BALANCE"
                ) ===
                true
    },

    {
        name:
            "SHARED CANDIDATE AGGREGATES THREE CONCEPT PROVENANCE RECORDS",
        passed:
            sharedCandidate
                ?.provenance
                .length ===
            3
    },

    {
        name:
            "SHARED CANDIDATE PROVENANCE IS PROTOCOL CONCEPT EVIDENCE",
        passed:
            sharedCandidate
                ?.provenance
                .every(
                    provenance =>
                        provenance.kind ===
                        "PROTOCOL_CONCEPT"
                ) ===
            true
    },

    {
        name:
            "SHARED CANDIDATE REMAINS UNEVALUATED",
        passed:
            sharedCandidate
                ?.evaluationStatus ===
            "UNEVALUATED"
    },

    {
        name:
            "SINGLE-PROTOCOL CONCEPT OPENS NO CANDIDATE",
        passed:
            !result.candidates.some(
                candidate =>
                    candidate.conceptId ===
                    "CONCEPT-NONCE"
            )
    },

    {
        name:
            "REPEATED SAME-PROTOCOL CONCEPT OPENS NO CROSS-PROTOCOL CANDIDATE",
        passed:
            !result.candidates.some(
                candidate =>
                    candidate.conceptId ===
                    "CONCEPT-LIMIT"
            )
    },

    {
        name:
            "SHARED CONCEPT NEVER CREATES SELF COMPOSITION",
        passed:
            !result.candidates.some(
                candidate =>
                    candidate.mechanism ===
                        "SHARED_RECURRENT_CONCEPT" &&
                    candidate.participantA.id ===
                        candidate.participantB.id
            )
    },

    {
        name:
            "EXTENSION CANDIDATE PRESERVES DISCOVERY MECHANISM",
        passed:
            extensionCandidate
                ?.mechanism ===
            "EXPLICIT_EXTENSION_FOR"
    },

    {
        name:
            "EXTENSION SUBJECT REMAINS SYMBOLIC",
        passed:
            extensionCandidate
                ?.participantA
                .kind ===
            "SYMBOLIC_SUBJECT"
    },

    {
        name:
            "EXTENSION SUBJECT SYMBOL IS PRESERVED",
        passed:
            extensionCandidate
                ?.participantA
                .id ===
            "IExampleExtension"
    },

    {
        name:
            "EXTENSION OBJECT IS AN EXPLICIT PROTOCOL",
        passed:
            extensionCandidate
                ?.participantB
                .kind ===
            "PROTOCOL"
    },

    {
        name:
            "EXTENSION OBJECT PROTOCOL IS PRESERVED",
        passed:
            extensionCandidate
                ?.participantB
                .id ===
            "ERC-505"
    },

    {
        name:
            "EXTENSION CANDIDATE DOES NOT INVENT CONCEPT ID",
        passed:
            extensionCandidate
                ?.conceptId ===
            undefined
    },

    {
        name:
            "EXTENSION CANDIDATE DOES NOT INVENT SUBJECT CAPABILITIES",
        passed:
            extensionCandidate
                ?.supportingCapabilityIdsA
                .length ===
            0
    },

    {
        name:
            "EXTENSION CANDIDATE DOES NOT INVENT OBJECT CAPABILITIES",
        passed:
            extensionCandidate
                ?.supportingCapabilityIdsB
                .length ===
            0
    },

    {
        name:
            "EXTENSION CANDIDATE AGGREGATES TWO RELATION EVIDENCE RECORDS",
        passed:
            extensionCandidate
                ?.provenance
                .length ===
            2
    },

    {
        name:
            "EXTENSION PROVENANCE IS PROTOCOL RELATION EVIDENCE",
        passed:
            extensionCandidate
                ?.provenance
                .every(
                    provenance =>
                        provenance.kind ===
                        "PROTOCOL_RELATION"
                ) ===
            true
    },

    {
        name:
            "EXTENSION CANDIDATE REMAINS UNEVALUATED",
        passed:
            extensionCandidate
                ?.evaluationStatus ===
            "UNEVALUATED"
    },

    {
        name:
            "CANDIDATE IDS ARE UNIQUE",
        passed:
            new Set(
                result.candidates.map(
                    candidate =>
                        candidate.candidateId
                )
            ).size ===
            result.candidates.length
    },

    {
        name:
            "CANDIDATES ARE DETERMINISTICALLY SORTED",
        passed:
            result.candidates.every(
                (
                    candidate,
                    index,
                    candidates
                ) =>
                    index ===
                        0 ||
                    candidates[
                        index - 1
                    ].candidateId.localeCompare(
                        candidate.candidateId
                    ) <=
                        0
            )
    },

    {
        name:
            "CANDIDATE IDS ARE DETERMINISTIC ACROSS INPUT ORDER",
        passed:
            JSON.stringify(
                result.candidates.map(
                    candidate =>
                        candidate.candidateId
                )
            ) ===
            JSON.stringify(
                shuffledResult.candidates.map(
                    candidate =>
                        candidate.candidateId
                )
            )
    },

    {
        name:
            "COMPLETE CANDIDATE OUTPUT IS DETERMINISTIC ACROSS INPUT ORDER",
        passed:
            JSON.stringify(
                result.candidates
            ) ===
            JSON.stringify(
                shuffledResult.candidates
            )
    },

    {
        name:
            "ADDITIONAL CONCEPT EVIDENCE DOES NOT CHANGE CANDIDATE IDENTITY",
        passed:
            sharedCandidate
                ?.candidateId ===
            baselineSharedCandidate
                ?.candidateId
    },

    {
        name:
            "ADDITIONAL RELATION EVIDENCE DOES NOT CHANGE CANDIDATE IDENTITY",
        passed:
            extensionCandidate
                ?.candidateId ===
            baselineExtensionCandidate
                ?.candidateId
    },

    {
        name:
            "SCIENTIFIC CANDIDATES CONTAIN NO CONFIDENCE",
        passed:
            !result.candidates.some(
                candidate =>
                    Object.prototype.hasOwnProperty.call(
                        candidate,
                        "confidence"
                    )
            )
    },

    {
        name:
            "SCIENTIFIC CANDIDATES CONTAIN NO FREE TEXT REASON",
        passed:
            !result.candidates.some(
                candidate =>
                    Object.prototype.hasOwnProperty.call(
                        candidate,
                        "reason"
                    )
            )
    },

    {
        name:
            "SCIENTIFIC CANDIDATES CONTAIN NO LEGACY PROTOCOL PAIR",
        passed:
            !result.candidates.some(
                candidate =>
                    Object.prototype.hasOwnProperty.call(
                        candidate,
                        "protocolPair"
                    )
            )
    },

    {
        name:
            "UPSTREAM CONCEPT FAILURE IS PRESERVED",
        passed:
            upstreamConceptFailure
                .errors
                .includes(
                    "CONTROLLED CONCEPT FAILURE"
                )
    },

    {
        name:
            "UPSTREAM CONCEPT FAILURE FAILS CLOSED",
        passed:
            upstreamConceptFailure
                .candidates
                .length ===
            0
    },

    {
        name:
            "UPSTREAM RELATION FAILURE IS PRESERVED",
        passed:
            upstreamRelationFailure
                .errors
                .includes(
                    "CONTROLLED RELATION FAILURE"
                )
    },

    {
        name:
            "UPSTREAM RELATION FAILURE FAILS CLOSED",
        passed:
            upstreamRelationFailure
                .candidates
                .length ===
            0
    },

    {
        name:
            "RELATION SOURCE CONTAMINATION IS DETECTED",
        passed:
            relationSourceMismatch
                .errors
                .some(
                    error =>
                        error.includes(
                            "source does not match its result source"
                        )
                )
    },

    {
        name:
            "RELATION SOURCE CONTAMINATION FAILS CLOSED",
        passed:
            relationSourceMismatch
                .candidates
                .length ===
            0
    },

    {
        name:
            "RELATION REVISION CONTAMINATION IS DETECTED",
        passed:
            relationRevisionMismatch
                .errors
                .some(
                    error =>
                        error.includes(
                            "revision does not match its result revision"
                        )
                )
    },

    {
        name:
            "RELATION REVISION CONTAMINATION FAILS CLOSED",
        passed:
            relationRevisionMismatch
                .candidates
                .length ===
            0
    },

    {
        name:
            "DUPLICATE PROTOCOL CONCEPT EVIDENCE ID IS DETECTED",
        passed:
            duplicateProtocolConceptEvidence
                .errors
                .some(
                    error =>
                        error.includes(
                            "Duplicate protocol concept evidence identity PC-A-BALANCE"
                        )
                )
    },

    {
        name:
            "DUPLICATE PROTOCOL CONCEPT EVIDENCE FAILS CLOSED",
        passed:
            duplicateProtocolConceptEvidence
                .candidates
                .length ===
            0
    },

    {
        name:
            "DUPLICATE RELATION EVIDENCE ID IS DETECTED",
        passed:
            duplicateRelationEvidence
                .errors
                .some(
                    error =>
                        error.includes(
                            "Duplicate protocol relation evidence identity REL-EXAMPLE-1"
                        )
                )
    },

    {
        name:
            "DUPLICATE RELATION EVIDENCE FAILS CLOSED",
        passed:
            duplicateRelationEvidence
                .candidates
                .length ===
            0
    }

];


console.log("");
console.log(
    "SCIENTIFIC CROSS PROTOCOL COMPOSITION - RUNTIME"
);

console.log(
    "-----------------------------------------------"
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
