import assert from "node:assert/strict";

import {
    ScientificCompositionComplementarityEngine
} from "../laboratory/scientific-composition-complementarity/ScientificCompositionComplementarityEngine.js";

import type {
    ScientificProtocolCompositionProfile
} from "../laboratory/scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";


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


function profile(
    protocolId:
        string,
    contributions:
        string[],
    needs:
        string[]
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

        contributions:
            contributions.map(
                (
                    subject,
                    index
                ) => ({

                    contributionId:
                        `CONTRIBUTION-${protocolId}-${index}`,

                    participantId:
                        protocolId,

                    kind:
                        "CAPABILITY",

                    subject,

                    evidenceIds: [
                        `EVIDENCE-${protocolId}-${index}`
                    ]

                })
            ),

        boundaries: [],

        needs:
            needs.map(
                (
                    subject,
                    index
                ) => ({

                    needId:
                        `NEED-${protocolId}-${index}`,

                    participantId:
                        protocolId,

                    subject,

                    evidenceIds: [
                        `NEED-EVIDENCE-${protocolId}-${index}`
                    ],

                    status:
                        "UNRESOLVED",

                    candidateProviderParticipantIds:
                        []

                })
            )

    };

}


const profiles = [

    profile(
        "ERC-ALPHA",
        [
            "IDENTITY"
        ],
        [
            "VALUE"
        ]
    ),

    profile(
        "ERC-BETA",
        [
            "VALUE"
        ],
        [
            "SETTLEMENT"
        ]
    ),

    profile(
        "ERC-GAMMA",
        [
            "SETTLEMENT"
        ],
        []
    )

];


const objective = {

    objectiveId:
        "MULTI-ERC-OBJECTIVE",

    description:
        "Resolve a multi protocol composition.",

    requiredSubjects: [
        "IDENTITY",
        "VALUE",
        "SETTLEMENT"
    ]

};


const engine =
    new ScientificCompositionComplementarityEngine();


const result =
    engine.discover({

        objective,

        profiles

    });


check(
    "DISCOVERY HAS NO ERRORS",
    result.errors.length ===
        0
);


check(
    "TWO CROSS PROTOCOL COMPLEMENTS ARE DISCOVERED",
    result.matches.length ===
        2
);


check(
    "ALPHA NEED VALUE IS PROVIDED BY BETA",
    result.matches.some(
        match =>
            match.consumerParticipantId ===
                "ERC-ALPHA" &&
            match.providerParticipantId ===
                "ERC-BETA" &&
            match.needSubject ===
                "VALUE"
    )
);


check(
    "BETA NEED SETTLEMENT IS PROVIDED BY GAMMA",
    result.matches.some(
        match =>
            match.consumerParticipantId ===
                "ERC-BETA" &&
            match.providerParticipantId ===
                "ERC-GAMMA" &&
            match.needSubject ===
                "SETTLEMENT"
    )
);


check(
    "SELF PROVIDER IS NEVER CREATED",
    result.matches.every(
        match =>
            match.consumerParticipantId !==
            match.providerParticipantId
    )
);


check(
    "ALL NEEDS ARE RESOLVED AT CANDIDATE LEVEL",
    result.unresolvedNeedIds.length ===
        0
);


check(
    "OBJECTIVE IS FULLY COVERED",
    result.objectiveCoverage.every(
        coverage =>
            coverage.status ===
                "COVERED"
    )
);


check(
    "MATCHES REMAIN UNEVALUATED FOR COMPATIBILITY",
    result.matches.every(
        match =>
            match.evaluationStatus ===
                "UNEVALUATED"
    )
);


const unresolved =
    engine.discover({

        objective: {

            ...objective,

            requiredSubjects: [
                ...objective.requiredSubjects,
                "VERIFICATION"
            ]

        },

        profiles: [

            ...profiles,

            profile(
                "ERC-DELTA",
                [],
                [
                    "VERIFICATION"
                ]
            )

        ]

    });


check(
    "MISSING PROVIDER LEAVES NEED UNRESOLVED",
    unresolved.unresolvedNeedIds.some(
        needId =>
            needId.startsWith(
                "NEED-ERC-DELTA"
            )
    )
);


check(
    "MISSING OBJECTIVE SUBJECT IS UNRESOLVED",
    unresolved.objectiveCoverage.some(
        coverage =>
            coverage.requiredSubject ===
                "VERIFICATION" &&
            coverage.status ===
                "UNRESOLVED"
    )
);


const malformedProfile =
    profile(
        "ERC-BAD",
        [
            "VALUE"
        ],
        []
    );


malformedProfile.contributions[0].participantId =
    "ERC-SOMEONE-ELSE";


const malformed =
    engine.discover({

        objective,

        profiles: [
            ...profiles,
            malformedProfile
        ]

    });


check(
    "BROKEN PROFILE OWNERSHIP FAILS CLOSED",
    malformed.errors.length >
        0 &&
    malformed.matches.length ===
        0
);


const reversed =
    engine.discover({

        objective,

        profiles:
            [...profiles]
                .reverse()
                .map(
                    current => ({

                        ...current,

                        contributions:
                            [...current.contributions]
                                .reverse(),

                        needs:
                            [...current.needs]
                                .reverse()

                    })
                )

    });


check(
    "DISCOVERY IS DETERMINISTIC",
    JSON.stringify(result) ===
    JSON.stringify(reversed)
);


console.log("");
console.log(
    `SCIENTIFIC COMPOSITION COMPLEMENTARITY: ${passed}/${passed} PASS`
);
