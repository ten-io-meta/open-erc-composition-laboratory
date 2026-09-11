import assert from "node:assert/strict";

import type {
    ScientificCompositionComplementarityMatch
} from "../laboratory/scientific-composition-complementarity/ScientificCompositionComplementarityMatch.js";

import type {
    ScientificProtocolCompositionProfile
} from "../laboratory/scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";

import {
    ScientificCompositionCompatibilityEngine
} from "../laboratory/scientific-composition-compatibility/ScientificCompositionCompatibilityEngine.js";


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


function profile(
    protocolId: string,
    boundaries: string[]
): ScientificProtocolCompositionProfile {

    return {

        profileId:
            `PROFILE-${protocolId}`,

        protocolId,

        sourceId:
            `SOURCE-${protocolId}`,

        sourceRevision:
            `REV-${protocolId}`,

        attributedContainerSymbols: [
            protocolId
        ],

        contributions: [],

        needs: [],

        boundaries:
            boundaries.map(
                (
                    subject,
                    index
                ) => ({

                    boundaryId:
                        `BOUNDARY-${protocolId}-${index}`,

                    participantId:
                        protocolId,

                    kind:
                        "SOURCE_CONSTRAINT",

                    subject,

                    evidenceIds: [
                        `BOUNDARY-EVIDENCE-${protocolId}-${index}`
                    ]

                })
            )

    };

}


function match(
    matchId: string,
    consumer: string,
    provider: string
): ScientificCompositionComplementarityMatch {

    return {

        matchId,

        consumerParticipantId:
            consumer,

        providerParticipantId:
            provider,

        needId:
            `NEED-${matchId}`,

        needSubject:
            "VALUE",

        contributionId:
            `CONTRIBUTION-${matchId}`,

        contributionKind:
            "CAPABILITY",

        contributionSubject:
            "VALUE",

        evidenceBasis:
            "EXACT_NORMALIZED_SUBJECT_MATCH",

        evidenceIds: [
            `MATCH-EVIDENCE-${matchId}`
        ],

        evaluationStatus:
            "UNEVALUATED"

    };

}


const alpha =
    profile(
        "ERC-ALPHA",
        [
            "alpha-boundary"
        ]
    );

const beta =
    profile(
        "ERC-BETA",
        [
            "beta-boundary"
        ]
    );

const gamma =
    profile(
        "ERC-GAMMA",
        [
            "gamma-boundary"
        ]
    );


const alphaBeta =
    match(
        "MATCH-ALPHA-BETA",
        "ERC-ALPHA",
        "ERC-BETA"
    );


const engine =
    new ScientificCompositionCompatibilityEngine();


const supported =
    engine.evaluate({

        profiles: [
            alpha,
            beta
        ],

        matches: [
            alphaBeta
        ],

        observations: [

            {
                observationId:
                    "OBS-A",

                matchId:
                    alphaBeta.matchId,

                boundaryId:
                    "BOUNDARY-ERC-ALPHA-0",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "RUNTIME-A"
                ]
            },

            {
                observationId:
                    "OBS-B",

                matchId:
                    alphaBeta.matchId,

                boundaryId:
                    "BOUNDARY-ERC-BETA-0",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "RUNTIME-B"
                ]
            }

        ]

    });


check(
    "SUPPORTED EVALUATION HAS NO ERRORS",
    supported.errors.length === 0
);


check(
    "ALL OBSERVED BARRIERS PRESERVED PRODUCES SUPPORT",
    supported.assessments[0]
        .scientificPolarity ===
        "SUPPORT"
);


check(
    "SUPPORT STATISTICS ARE COMPLETE",
    supported.assessments[0]
        .statistics.preserved === 2 &&
    supported.assessments[0]
        .statistics.violated === 0 &&
    supported.assessments[0]
        .statistics.unevaluated === 0
);


const missing =
    engine.evaluate({

        profiles: [
            alpha,
            beta
        ],

        matches: [
            alphaBeta
        ],

        observations: [

            {
                observationId:
                    "OBS-ONLY-A",

                matchId:
                    alphaBeta.matchId,

                boundaryId:
                    "BOUNDARY-ERC-ALPHA-0",

                verdict:
                    "PRESERVED",

                evidenceIds: []
            }

        ]

    });


check(
    "MISSING BOUNDARY EVIDENCE PRODUCES INCONCLUSIVE",
    missing.assessments[0]
        .scientificPolarity ===
        "INCONCLUSIVE"
);


check(
    "MISSING EVIDENCE REMAINS UNEVALUATED",
    missing.assessments[0]
        .statistics.unevaluated ===
        1
);


const challenged =
    engine.evaluate({

        profiles: [
            alpha,
            beta
        ],

        matches: [
            alphaBeta
        ],

        observations: [

            {
                observationId:
                    "OBS-A-PRESERVED",

                matchId:
                    alphaBeta.matchId,

                boundaryId:
                    "BOUNDARY-ERC-ALPHA-0",

                verdict:
                    "PRESERVED",

                evidenceIds: []
            },

            {
                observationId:
                    "OBS-B-VIOLATED",

                matchId:
                    alphaBeta.matchId,

                boundaryId:
                    "BOUNDARY-ERC-BETA-0",

                verdict:
                    "VIOLATED",

                evidenceIds: []
            }

        ]

    });


check(
    "ONE VIOLATED BOUNDARY PRODUCES CHALLENGE",
    challenged.assessments[0]
        .scientificPolarity ===
        "CHALLENGE"
);


const conflicting =
    engine.evaluate({

        profiles: [
            alpha,
            beta
        ],

        matches: [
            alphaBeta
        ],

        observations: [

            {
                observationId:
                    "OBS-CONFLICT-P",

                matchId:
                    alphaBeta.matchId,

                boundaryId:
                    "BOUNDARY-ERC-BETA-0",

                verdict:
                    "PRESERVED",

                evidenceIds: []
            },

            {
                observationId:
                    "OBS-CONFLICT-V",

                matchId:
                    alphaBeta.matchId,

                boundaryId:
                    "BOUNDARY-ERC-BETA-0",

                verdict:
                    "VIOLATED",

                evidenceIds: []
            }

        ]

    });


check(
    "VIOLATION DOMINATES CONFLICTING PRESERVATION",
    conflicting.assessments[0]
        .boundaryEvaluations
        .find(
            evaluation =>
                evaluation.boundaryId ===
                "BOUNDARY-ERC-BETA-0"
        )?.status ===
        "VIOLATED"
);


check(
    "CONFLICTING OBSERVATIONS PRODUCE CHALLENGE",
    conflicting.assessments[0]
        .scientificPolarity ===
        "CHALLENGE"
);


const noBoundaries =
    engine.evaluate({

        profiles: [
            profile(
                "ERC-EMPTY-A",
                []
            ),
            profile(
                "ERC-EMPTY-B",
                []
            )
        ],

        matches: [
            match(
                "MATCH-EMPTY",
                "ERC-EMPTY-A",
                "ERC-EMPTY-B"
            )
        ],

        observations: []

    });


check(
    "ABSENCE OF OBSERVED BARRIERS DOES NOT PRODUCE SUPPORT",
    noBoundaries.assessments[0]
        .scientificPolarity ===
        "INCONCLUSIVE"
);


const foreignBoundary =
    engine.evaluate({

        profiles: [
            alpha,
            beta,
            gamma
        ],

        matches: [
            alphaBeta
        ],

        observations: [

            {
                observationId:
                    "OBS-FOREIGN",

                matchId:
                    alphaBeta.matchId,

                boundaryId:
                    "BOUNDARY-ERC-GAMMA-0",

                verdict:
                    "PRESERVED",

                evidenceIds: []
            }

        ]

    });


check(
    "FOREIGN PARTICIPANT BOUNDARY FAILS CLOSED",
    foreignBoundary.errors.length > 0 &&
    foreignBoundary.assessments.length === 0
);


const twoMatches =
    engine.evaluate({

        profiles: [
            alpha,
            beta,
            gamma
        ],

        matches: [

            alphaBeta,

            match(
                "MATCH-BETA-GAMMA",
                "ERC-BETA",
                "ERC-GAMMA"
            )

        ],

        observations: [

            {
                observationId:
                    "OBS-AB-A",

                matchId:
                    "MATCH-ALPHA-BETA",

                boundaryId:
                    "BOUNDARY-ERC-ALPHA-0",

                verdict:
                    "PRESERVED",

                evidenceIds: []
            },

            {
                observationId:
                    "OBS-AB-B",

                matchId:
                    "MATCH-ALPHA-BETA",

                boundaryId:
                    "BOUNDARY-ERC-BETA-0",

                verdict:
                    "PRESERVED",

                evidenceIds: []
            },

            {
                observationId:
                    "OBS-BG-B",

                matchId:
                    "MATCH-BETA-GAMMA",

                boundaryId:
                    "BOUNDARY-ERC-BETA-0",

                verdict:
                    "PRESERVED",

                evidenceIds: []
            },

            {
                observationId:
                    "OBS-BG-G",

                matchId:
                    "MATCH-BETA-GAMMA",

                boundaryId:
                    "BOUNDARY-ERC-GAMMA-0",

                verdict:
                    "VIOLATED",

                evidenceIds: []
            }

        ]

    });


check(
    "EDGE EVALUATIONS REMAIN INDEPENDENT",
    twoMatches.assessments.some(
        assessment =>
            assessment.matchId ===
                "MATCH-ALPHA-BETA" &&
            assessment.scientificPolarity ===
                "SUPPORT"
    ) &&
    twoMatches.assessments.some(
        assessment =>
            assessment.matchId ===
                "MATCH-BETA-GAMMA" &&
            assessment.scientificPolarity ===
                "CHALLENGE"
    )
);


const reordered =
    engine.evaluate({

        profiles: [
            beta,
            alpha
        ],

        matches: [
            alphaBeta
        ],

        observations: [
            ...supported.assessments[0]
                .boundaryEvaluations
                .flatMap(
                    evaluation =>
                        evaluation.observationIds
                )
                .reverse()
                .map(
                    observationId => {

                        if (
                            observationId ===
                            "OBS-A"
                        ) {

                            return {
                                observationId,
                                matchId:
                                    alphaBeta.matchId,
                                boundaryId:
                                    "BOUNDARY-ERC-ALPHA-0",
                                verdict:
                                    "PRESERVED" as const,
                                evidenceIds: [
                                    "RUNTIME-A"
                                ]
                            };

                        }


                        return {
                            observationId,
                            matchId:
                                alphaBeta.matchId,
                            boundaryId:
                                "BOUNDARY-ERC-BETA-0",
                            verdict:
                                "PRESERVED" as const,
                            evidenceIds: [
                                "RUNTIME-B"
                            ]
                        };

                    }
                )
        ]

    });


check(
    "COMPATIBILITY EVALUATION IS DETERMINISTIC",
    JSON.stringify(
        supported
    ) ===
    JSON.stringify(
        reordered
    )
);


console.log("");
console.log(
    `SCIENTIFIC COMPOSITION COMPATIBILITY: ${passed}/${passed} PASS`
);
