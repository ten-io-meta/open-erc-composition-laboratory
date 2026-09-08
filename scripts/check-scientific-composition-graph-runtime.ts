import assert from "node:assert/strict";

import type {
    ScientificProtocolCompositionProfile
} from "../laboratory/scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";

import {
    ScientificCompositionComplementarityEngine
} from "../laboratory/scientific-composition-complementarity/ScientificCompositionComplementarityEngine.js";

import {
    ScientificCompositionCompatibilityEngine
} from "../laboratory/scientific-composition-compatibility/ScientificCompositionCompatibilityEngine.js";

import {
    ScientificCompositionGraphEngine
} from "../laboratory/scientific-composition-graph/ScientificCompositionGraphEngine.js";


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
    contributions: string[],
    needs: string[]
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
                        `CONTRIBUTION-EVIDENCE-${protocolId}-${index}`
                    ]

                })
            ),

        boundaries: [

            {
                boundaryId:
                    `BOUNDARY-${protocolId}`,

                participantId:
                    protocolId,

                kind:
                    "SOURCE_CONSTRAINT",

                subject:
                    `BOUNDARY-${protocolId}`,

                evidenceIds: [
                    `BOUNDARY-SOURCE-${protocolId}`
                ]
            }

        ],

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


const alpha =
    profile(
        "ERC-ALPHA",
        [
            "IDENTITY"
        ],
        [
            "VALUE"
        ]
    );


const beta =
    profile(
        "ERC-BETA",
        [
            "VALUE"
        ],
        [
            "SETTLEMENT"
        ]
    );


const gamma =
    profile(
        "ERC-GAMMA",
        [
            "SETTLEMENT"
        ],
        []
    );


const profiles = [
    alpha,
    beta,
    gamma
];


const objective = {

    objectiveId:
        "GRAPH-OBJECTIVE",

    description:
        "Build an N-protocol responsibility graph.",

    requiredSubjects: [
        "IDENTITY",
        "VALUE",
        "SETTLEMENT"
    ]

};


const complementarityEngine =
    new ScientificCompositionComplementarityEngine();


const complementarity =
    complementarityEngine.discover({

        objective,

        profiles

    });


const observations =
    complementarity.matches.flatMap(
        match => [

            {
                observationId:
                    `OBS-${match.matchId}-CONSUMER`,

                matchId:
                    match.matchId,

                boundaryId:
                    `BOUNDARY-${match.consumerParticipantId}`,

                verdict:
                    "PRESERVED" as const,

                evidenceIds: [
                    `RUNTIME-${match.matchId}-CONSUMER`
                ]
            },

            {
                observationId:
                    `OBS-${match.matchId}-PROVIDER`,

                matchId:
                    match.matchId,

                boundaryId:
                    `BOUNDARY-${match.providerParticipantId}`,

                verdict:
                    "PRESERVED" as const,

                evidenceIds: [
                    `RUNTIME-${match.matchId}-PROVIDER`
                ]
            }

        ]
    );


const compatibilityEngine =
    new ScientificCompositionCompatibilityEngine();


const compatibility =
    compatibilityEngine.evaluate({

        profiles,

        matches:
            complementarity.matches,

        observations

    });


const graphEngine =
    new ScientificCompositionGraphEngine();


const result =
    graphEngine.build({

        objective,

        profiles,

        complementarity,

        compatibility

    });


check(
    "GRAPH BUILDS WITHOUT ERRORS",
    result.graph !== null &&
    result.errors.length === 0
);


check(
    "GRAPH CONTAINS THREE PROTOCOL NODES",
    result.graph?.nodes.length ===
        3
);


check(
    "GRAPH CONTAINS TWO COMPLEMENTARY EDGES",
    result.graph?.edges.length ===
        2
);


check(
    "ALPHA CONTINUES INTO BETA",
    result.graph?.edges.some(
        edge =>
            edge.consumerParticipantId ===
                "ERC-ALPHA" &&
            edge.providerParticipantId ===
                "ERC-BETA"
    ) === true
);


check(
    "BETA CONTINUES INTO GAMMA",
    result.graph?.edges.some(
        edge =>
            edge.consumerParticipantId ===
                "ERC-BETA" &&
            edge.providerParticipantId ===
                "ERC-GAMMA"
    ) === true
);


check(
    "BOTH EDGES CARRY SUPPORT",
    result.graph?.statistics.supportedEdges ===
        2
);


check(
    "EDGE SUPPORT DOES NOT INVENT GLOBAL SUPPORT",
    result.graph?.scientificPolarity ===
        "INCONCLUSIVE"
);


check(
    "OBJECTIVE IS FULLY COVERED",
    result.graph?.statistics
        .unresolvedObjectiveSubjects ===
        0
);


check(
    "NO NEED IS LEFT UNRESOLVED",
    result.graph?.statistics
        .unresolvedNeeds ===
        0
);


const challengedObservations =
    observations.map(
        observation => {

            if (
                observation.boundaryId ===
                    "BOUNDARY-ERC-GAMMA"
            ) {

                return {
                    ...observation,
                    verdict:
                        "VIOLATED" as const
                };

            }


            return observation;

        }
    );


const challengedCompatibility =
    compatibilityEngine.evaluate({

        profiles,

        matches:
            complementarity.matches,

        observations:
            challengedObservations

    });


const challengedGraph =
    graphEngine.build({

        objective,

        profiles,

        complementarity,

        compatibility:
            challengedCompatibility

    });


check(
    "ONE CHALLENGED EDGE CHALLENGES THE GRAPH",
    challengedGraph.graph
        ?.scientificPolarity ===
        "CHALLENGE"
);


check(
    "CHALLENGED EDGE IS RETAINED AS EVIDENCE",
    challengedGraph.graph
        ?.statistics.challengedEdges ===
        1
);


const malformedCompatibility = {

    ...compatibility,

    assessments:
        compatibility.assessments.slice(
            1
        )

};


const malformed =
    graphEngine.build({

        objective,

        profiles,

        complementarity,

        compatibility:
            malformedCompatibility

    });


check(
    "MISSING EDGE ASSESSMENT FAILS CLOSED",
    malformed.graph ===
        null &&
    malformed.errors.length >
        0
);


const reversed =
    graphEngine.build({

        objective,

        profiles:
            [...profiles].reverse(),

        complementarity: {

            ...complementarity,

            matches:
                [...complementarity.matches]
                    .reverse(),

            unresolvedNeedIds:
                [...complementarity.unresolvedNeedIds]
                    .reverse(),

            objectiveCoverage:
                [...complementarity.objectiveCoverage]
                    .reverse()

        },

        compatibility: {

            ...compatibility,

            assessments:
                [...compatibility.assessments]
                    .reverse()

        }

    });


check(
    "GRAPH CONSTRUCTION IS DETERMINISTIC",
    JSON.stringify(
        result.graph
    ) ===
    JSON.stringify(
        reversed.graph
    )
);


console.log("");
console.log(
    `SCIENTIFIC COMPOSITION GRAPH: ${passed}/${passed} PASS`
);
