import assert from "node:assert/strict";

import {
    ScientificCompositionFrameEngine
} from "../laboratory/scientific-composition-frame/ScientificCompositionFrameEngine.js";


const engine =
    new ScientificCompositionFrameEngine();


let passed =
    0;


function check(
    name:
        string,
    condition:
        boolean
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


/*
 * ============================================================
 * CASE 1 — genuine multi-participant frame
 * ============================================================
 */

const multi =
    engine.build({

        objective: {

            objectiveId:
                "TEST-MULTI-ERC",

            description:
                "Test a composition frame with multiple independent protocols.",

            requiredSubjects: [
                "SETTLEMENT",
                "AUTHORITY",
                "VALUE"
            ]

        },

        participants: [

            {
                participantId:
                    "ERC-8312",

                kind:
                    "PROTOCOL",

                sourceIds: [
                    "SOURCE-8312"
                ],

                sourceRevisions: [
                    "REV-8312"
                ]
            },

            {
                participantId:
                    "ERC-8004",

                kind:
                    "PROTOCOL",

                sourceIds: [
                    "SOURCE-8004"
                ],

                sourceRevisions: [
                    "REV-8004"
                ]
            },

            {
                participantId:
                    "ERC-8060",

                kind:
                    "PROTOCOL",

                sourceIds: [
                    "SOURCE-8060"
                ],

                sourceRevisions: [
                    "REV-8060"
                ]
            },

            {
                participantId:
                    "ERC-8275",

                kind:
                    "PROTOCOL",

                sourceIds: [
                    "SOURCE-8275"
                ],

                sourceRevisions: [
                    "REV-8275"
                ]
            }

        ],

        contributions: [

            {
                contributionId:
                    "CONTRIBUTION-A",

                participantId:
                    "ERC-8004",

                kind:
                    "CAPABILITY",

                subject:
                    "IDENTITY",

                evidenceIds: [
                    "EVIDENCE-A"
                ]
            },

            {
                contributionId:
                    "CONTRIBUTION-B",

                participantId:
                    "ERC-8060",

                kind:
                    "CAPABILITY",

                subject:
                    "VALUE",

                evidenceIds: [
                    "EVIDENCE-B"
                ]
            }

        ],

        boundaries: [

            {
                boundaryId:
                    "BOUNDARY-A",

                participantId:
                    "ERC-8004",

                kind:
                    "SOURCE_CONSTRAINT",

                subject:
                    "AUTHORIZED_CALLER",

                evidenceIds: [
                    "EVIDENCE-C"
                ]
            }

        ],

        needs: [

            {
                needId:
                    "NEED-A",

                participantId:
                    "ERC-8004",

                subject:
                    "VALUE",

                evidenceIds: [
                    "EVIDENCE-D"
                ],

                status:
                    "CANDIDATE_PROVIDER_FOUND",

                candidateProviderParticipantIds: [
                    "ERC-8060"
                ]
            }

        ]

    });


check(
    "MULTI ERC FRAME BUILDS WITHOUT ERRORS",
    multi.errors.length === 0
);


check(
    "MULTI ERC FRAME IS CREATED",
    multi.frame !== null
);


check(
    "FRAME ACCEPTS FOUR PARTICIPANTS",
    multi.frame?.participants.length === 4
);


check(
    "PARTICIPANTS ARE DETERMINISTICALLY ORDERED",
    multi.frame?.participants
        .map(
            participant =>
                participant.participantId
        )
        .join("|") ===
        "ERC-8004|ERC-8060|ERC-8275|ERC-8312"
);


check(
    "OBJECTIVE SUBJECTS ARE DETERMINISTICALLY ORDERED",
    multi.frame?.objective.requiredSubjects.join("|") ===
        "AUTHORITY|SETTLEMENT|VALUE"
);


check(
    "FRAME PRESERVES CONTRIBUTIONS BOUNDARIES AND NEEDS",
    multi.frame?.contributions.length === 2 &&
    multi.frame?.boundaries.length === 1 &&
    multi.frame?.needs.length === 1
);


check(
    "FRAME DOES NOT CLAIM COMPATIBILITY",
    multi.frame?.evaluationStatus ===
        "UNEVALUATED"
);


/*
 * ============================================================
 * CASE 2 — unknown provider must fail closed
 * ============================================================
 */

const unknownProvider =
    engine.build({

        objective: {
            objectiveId:
                "UNKNOWN-PROVIDER",
            description:
                "Fail closed.",
            requiredSubjects: []
        },

        participants: [

            {
                participantId:
                    "ERC-A",
                kind:
                    "PROTOCOL",
                sourceIds: [
                    "SOURCE-A"
                ],
                sourceRevisions: [
                    "REV-A"
                ]
            },

            {
                participantId:
                    "ERC-B",
                kind:
                    "PROTOCOL",
                sourceIds: [
                    "SOURCE-B"
                ],
                sourceRevisions: [
                    "REV-B"
                ]
            }

        ],

        needs: [

            {
                needId:
                    "NEED-UNKNOWN",

                participantId:
                    "ERC-A",

                subject:
                    "SOMETHING",

                evidenceIds: [
                    "EVIDENCE"
                ],

                status:
                    "CANDIDATE_PROVIDER_FOUND",

                candidateProviderParticipantIds: [
                    "ERC-NOT-IN-FRAME"
                ]
            }

        ]

    });


check(
    "UNKNOWN PROVIDER FAILS CLOSED",
    unknownProvider.frame === null &&
    unknownProvider.errors.some(
        error =>
            error.includes(
                "unknown provider ERC-NOT-IN-FRAME"
            )
    )
);


/*
 * ============================================================
 * CASE 3 — unknown contribution owner must fail closed
 * ============================================================
 */

const unknownContribution =
    engine.build({

        objective: {
            objectiveId:
                "UNKNOWN-CONTRIBUTION",
            description:
                "Fail closed.",
            requiredSubjects: []
        },

        participants: [

            {
                participantId:
                    "ERC-A",
                kind:
                    "PROTOCOL",
                sourceIds: [],
                sourceRevisions: []
            },

            {
                participantId:
                    "ERC-B",
                kind:
                    "PROTOCOL",
                sourceIds: [],
                sourceRevisions: []
            }

        ],

        contributions: [

            {
                contributionId:
                    "BAD-CONTRIBUTION",

                participantId:
                    "ERC-C",

                kind:
                    "CAPABILITY",

                subject:
                    "UNKNOWN",

                evidenceIds: []
            }

        ]

    });


check(
    "UNKNOWN CONTRIBUTION PARTICIPANT FAILS CLOSED",
    unknownContribution.frame === null
);


/*
 * ============================================================
 * CASE 4 — duplicate participant identities fail closed
 * ============================================================
 */

const duplicate =
    engine.build({

        objective: {
            objectiveId:
                "DUPLICATE",
            description:
                "Fail closed.",
            requiredSubjects: []
        },

        participants: [

            {
                participantId:
                    "ERC-A",
                kind:
                    "PROTOCOL",
                sourceIds: [],
                sourceRevisions: []
            },

            {
                participantId:
                    "ERC-A",
                kind:
                    "PROTOCOL",
                sourceIds: [],
                sourceRevisions: []
            }

        ]

    });


check(
    "DUPLICATE PARTICIPANT FAILS CLOSED",
    duplicate.frame === null
);


/*
 * ============================================================
 * CASE 5 — one participant is not a composition frame
 * ============================================================
 */

const single =
    engine.build({

        objective: {
            objectiveId:
                "SINGLE",
            description:
                "Not composition.",
            requiredSubjects: []
        },

        participants: [

            {
                participantId:
                    "ERC-A",
                kind:
                    "PROTOCOL",
                sourceIds: [],
                sourceRevisions: []
            }

        ]

    });


check(
    "SINGLE PARTICIPANT FAILS CLOSED",
    single.frame === null
);


console.log("");
console.log(
    `SCIENTIFIC COMPOSITION FRAME RUNTIME: ${passed}/${passed} PASS`
);
