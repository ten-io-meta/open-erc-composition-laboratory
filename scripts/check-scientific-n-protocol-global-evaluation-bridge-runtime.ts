import {
    ScientificNProtocolGlobalEvaluationBridgeEngine
} from "../laboratory/scientific-n-protocol-global-evaluation-bridge/ScientificNProtocolGlobalEvaluationBridgeEngine.js";


let passed =
    0;

let failed =
    0;


function check(
    label:
        string,
    condition:
        boolean
): void {

    console.log(
        `${label}: ${condition ? "PASS" : "FAIL"}`
    );


    if (
        condition
    ) {

        passed++;

    }
    else {

        failed++;

    }

}


function participant(
    participantId:
        string,
    needIds:
        string[],
    contributionIds:
        string[]
): any {

    return {

        participantId,

        profileId:
            `PROFILE-${participantId}`,

        sourceId:
            `SOURCE-${participantId}`,

        sourceRevision:
            `REVISION-${participantId}`,

        contributions:
            contributionIds.map(
                contributionId => ({

                    contributionId,

                    participantId,

                    kind:
                        "CAPABILITY",

                    subject:
                        contributionId,

                    evidenceIds: [
                        `EVIDENCE-${contributionId}`
                    ]

                })
            ),

        boundaries: [
            {
                boundaryId:
                    `BOUNDARY-${participantId}`,

                participantId,

                kind:
                    "SOURCE_CONSTRAINT",

                subject:
                    `BOUNDARY:${participantId}`,

                evidenceIds: [
                    `EVIDENCE-BOUNDARY-${participantId}`
                ]
            }
        ],

        needs:
            needIds.map(
                needId => ({

                    needId,

                    participantId,

                    kind:
                        "UNRESOLVED",

                    subject:
                        needId,

                    evidenceIds: [
                        `EVIDENCE-${needId}`
                    ]

                })
            )

    };

}


const participants =
    [
        participant(
            "ERC-A",
            [
                "NEED-A"
            ],
            [
                "CONTRIBUTION-A"
            ]
        ),

        participant(
            "ERC-B",
            [
                "NEED-B"
            ],
            [
                "CONTRIBUTION-B"
            ]
        ),

        participant(
            "ERC-C",
            [],
            [
                "CONTRIBUTION-C",
                "OBJECTIVE-CONTRIBUTION"
            ]
        )
    ];


function relation(
    candidateId:
        string,
    sourceParticipantId:
        string,
    targetParticipantId:
        string,
    needId:
        string,
    contributionId:
        string
): any {

    return {

        candidateId,

        candidateEvaluationEdgeId:
            `EVAL-EDGE-${candidateId}`,

        functionalMatchId:
            `MATCH-${candidateId}`,

        sourceParticipantId,

        targetParticipantId,

        needId,

        contributionId,

        compatibilityAssessmentId:
            `COMPAT-${candidateId}`,

        boundaryIds: [
            `BOUNDARY-${sourceParticipantId}`,
            `BOUNDARY-${targetParticipantId}`
        ],

        discoveryEvidenceIds: [
            `DISCOVERY-${candidateId}`
        ],

        compatibilityEvidenceIds: [
            `COMPAT-EVIDENCE-${candidateId}`
        ],

        compatibilityPolarity:
            "SUPPORT"

    };

}


const relationAB =
    relation(
        "CANDIDATE-A-B",
        "ERC-A",
        "ERC-B",
        "NEED-A",
        "CONTRIBUTION-B"
    );


const relationBC =
    relation(
        "CANDIDATE-B-C",
        "ERC-B",
        "ERC-C",
        "NEED-B",
        "CONTRIBUTION-C"
    );


const readyConfiguration:
    any = {

        configurationId:
            "CONFIGURATION-A-B-C",

        envelopeId:
            "ENVELOPE-A-B-C",

        setId:
            "SET-A-B-C",

        objectiveId:
            "OBJECTIVE-N",

        kind:
            "FULL_SET",

        participantIds: [
            "ERC-A",
            "ERC-B",
            "ERC-C"
        ],

        relations: [
            relationAB,
            relationBC
        ],

        selectedFunctionalCandidateIds: [
            "CANDIDATE-A-B",
            "CANDIDATE-B-C"
        ],

        fulfilledNeedIds: [
            "NEED-A",
            "NEED-B"
        ],

        unresolvedNeedIds:
            [],

        objectiveCoverage: [
            {
                requiredSubject:
                    "OBJECTIVE-SUBJECT",

                status:
                    "COVERED",

                providerParticipantIds: [
                    "ERC-C"
                ],

                contributionIds: [
                    "OBJECTIVE-CONTRIBUTION"
                ]
            }
        ],

        unresolvedObjectiveSubjects:
            [],

        knownBoundaryIds: [
            "BOUNDARY-ERC-A",
            "BOUNDARY-ERC-B",
            "BOUNDARY-ERC-C"
        ],

        blockers:
            [],

        readiness:
            "READY_FOR_GLOBAL_EVALUATION",

        globalEvaluationStatus:
            "UNEVALUATED"

    };


const blockedConfiguration:
    any = {

        ...readyConfiguration,

        configurationId:
            "CONFIGURATION-A-B-BLOCKED",

        kind:
            "STRICT_SUBSET",

        participantIds: [
            "ERC-A",
            "ERC-B"
        ],

        relations: [
            relationAB
        ],

        selectedFunctionalCandidateIds: [
            "CANDIDATE-A-B"
        ],

        fulfilledNeedIds: [
            "NEED-A"
        ],

        unresolvedNeedIds: [
            "NEED-B"
        ],

        objectiveCoverage: [
            {
                requiredSubject:
                    "OBJECTIVE-SUBJECT",

                status:
                    "UNRESOLVED",

                providerParticipantIds:
                    [],

                contributionIds:
                    []
            }
        ],

        unresolvedObjectiveSubjects: [
            "OBJECTIVE-SUBJECT"
        ],

        knownBoundaryIds: [
            "BOUNDARY-ERC-A",
            "BOUNDARY-ERC-B"
        ],

        blockers: [
            "UNRESOLVED_NEEDS",
            "UNRESOLVED_OBJECTIVE_SUBJECTS"
        ],

        readiness:
            "BLOCKED"

    };


const envelope:
    any = {

        envelopeId:
            "ENVELOPE-A-B-C",

        setId:
            "SET-A-B-C",

        candidateGraphId:
            "CANDIDATE-GRAPH",

        candidateEvaluationGraphId:
            "CANDIDATE-EVALUATION-GRAPH",

        objectiveId:
            "OBJECTIVE-N",

        participants,

        participantIds: [
            "ERC-A",
            "ERC-B",
            "ERC-C"
        ],

        relations:
            [],

        boundaryRegions:
            [],

        unresolvedNeedIds:
            [],

        statistics:
            {},

        assemblyStatus:
            "ASSEMBLED"

    };


const solver:
    any = {

        solutions: [
            {
                solutionId:
                    "SOLUTION-A-B-C",

                envelopeId:
                    "ENVELOPE-A-B-C",

                setId:
                    "SET-A-B-C",

                objectiveId:
                    "OBJECTIVE-N",

                participantIds: [
                    "ERC-A",
                    "ERC-B",
                    "ERC-C"
                ],

                fullConfigurations: [
                    readyConfiguration
                ],

                subsetConfigurations: [
                    blockedConfiguration
                ],

                supportedFunctionalCandidateIds: [
                    "CANDIDATE-A-B",
                    "CANDIDATE-B-C"
                ],

                documentaryCandidateIds:
                    [],

                challengedCandidateIds:
                    [],

                inconclusiveCandidateIds:
                    [],

                statistics:
                    {},

                resolutionStatus:
                    "READY_FULL_CONFIGURATION"
            }
        ],

        errors:
            []

    };


const envelopes:
    any = {

        envelopes: [
            envelope
        ],

        isolatedParticipantIds:
            [],

        errors:
            []

    };


const engine =
    new ScientificNProtocolGlobalEvaluationBridgeEngine();


console.log(
    "\nSCIENTIFIC N-PROTOCOL GLOBAL EVALUATION BRIDGE — RUNTIME"
);
console.log(
    "---------------------------------------------------------"
);


const result =
    engine.build({

        solver,

        envelopes

    });


check(
    "VALID BRIDGE BUILD HAS NO ERRORS",
    result.errors.length ===
        0
);


check(
    "ONLY READY CONFIGURATION BECOMES GLOBAL EVALUATION TARGET",
    result.targets.length ===
        1
);


check(
    "BLOCKED CONFIGURATION IS PRESERVED BUT NOT PROMOTED",
    JSON.stringify(
        result.blockedConfigurationIds
    ) ===
        JSON.stringify([
            "CONFIGURATION-A-B-BLOCKED"
        ])
);


const target =
    result.targets[0];

const graph =
    target.graph;


check(
    "TARGET PRESERVES EXACT CONFIGURATION IDENTITY",
    target.configurationId ===
        "CONFIGURATION-A-B-C" &&
    target.envelopeId ===
        "ENVELOPE-A-B-C" &&
    target.status ===
        "READY_FOR_GLOBAL_EVALUATION"
);


check(
    "CONFIGURATION GRAPH CONTAINS THREE PARTICIPANTS",
    graph.nodes.length ===
        3
);


check(
    "CONFIGURATION GRAPH CONTAINS ONLY TWO SELECTED FUNCTIONAL EDGES",
    graph.edges.length ===
        2 &&
    JSON.stringify(
        graph.edges.map(
            edge =>
                edge.matchId
        )
    ) ===
        JSON.stringify([
            "MATCH-CANDIDATE-A-B",
            "MATCH-CANDIDATE-B-C"
        ])
);


check(
    "GRAPH PRESERVES NEED AND CONTRIBUTION DIRECTION",
    graph.edges[0]
        .consumerParticipantId ===
        "ERC-A" &&
    graph.edges[0]
        .providerParticipantId ===
        "ERC-B" &&
    graph.edges[0]
        .needId ===
        "NEED-A" &&
    graph.edges[0]
        .contributionId ===
        "CONTRIBUTION-B"
);


check(
    "GRAPH PRESERVES DISCOVERY AND COMPATIBILITY EVIDENCE",
    JSON.stringify(
        graph.edges[0]
            .evidenceIds
    ) ===
        JSON.stringify([
            "COMPAT-EVIDENCE-CANDIDATE-A-B",
            "DISCOVERY-CANDIDATE-A-B"
        ])
);


check(
    "READY GRAPH HAS NO UNRESOLVED NEEDS",
    graph.unresolvedNeedIds.length ===
        0 &&
    graph.statistics.unresolvedNeeds ===
        0
);


check(
    "READY GRAPH HAS COMPLETE OBJECTIVE COVERAGE",
    graph.objectiveCoverage.length ===
        1 &&
    graph.objectiveCoverage[0]
        .status ===
        "COVERED" &&
    graph.statistics
        .unresolvedObjectiveSubjects ===
        0
);


check(
    "ALL CONFIGURATION GRAPH EDGES REMAIN CANDIDATE-LEVEL SUPPORT",
    graph.edges.every(
        edge =>
            edge.compatibilityPolarity ===
            "SUPPORT"
    )
);


check(
    "BRIDGE NEVER PROMOTES GRAPH TO GLOBAL SUPPORT",
    graph.scientificPolarity ===
        "INCONCLUSIVE"
);


check(
    "GRAPH PRESERVES ALL PARTICIPANT BOUNDARIES",
    JSON.stringify(
        graph.nodes.flatMap(
            node =>
                node.boundaryIds
        ).sort()
    ) ===
        JSON.stringify([
            "BOUNDARY-ERC-A",
            "BOUNDARY-ERC-B",
            "BOUNDARY-ERC-C"
        ])
);


check(
    "GRAPH IS READY FOR EXISTING GLOBAL EVALUATION CONTRACT",
    graph.edges.length >
        0 &&
    graph.edges.every(
        edge =>
            edge.compatibilityPolarity ===
            "SUPPORT"
    ) &&
    graph.unresolvedNeedIds.length ===
        0 &&
    graph.objectiveCoverage.every(
        coverage =>
            coverage.status ===
            "COVERED"
    )
);


/*
 * ------------------------------------------------------------
 * FAKE READY CONFIGURATION
 * ------------------------------------------------------------
 */

const fakeReady:
    any = {

        ...readyConfiguration,

        configurationId:
            "CONFIGURATION-FAKE-READY",

        unresolvedNeedIds: [
            "NEED-A"
        ]

    };


const malformed =
    engine.build({

        solver: {

            ...solver,

            solutions: [
                {
                    ...solver.solutions[0],

                    fullConfigurations: [
                        fakeReady
                    ],

                    subsetConfigurations:
                        []
                }
            ]

        },

        envelopes

    });


check(
    "READY CONFIGURATION WITH UNRESOLVED NEED FAILS CLOSED",
    malformed.errors.length >
        0
);


check(
    "MALFORMED READY CONFIGURATION PRODUCES NO TARGET",
    malformed.targets.length ===
        0
);


/*
 * ------------------------------------------------------------
 * NON-SUPPORTING RELATION
 * ------------------------------------------------------------
 */

const challengedReady:
    any = {

        ...readyConfiguration,

        configurationId:
            "CONFIGURATION-CHALLENGED",

        relations: [
            {
                ...relationAB,

                compatibilityPolarity:
                    "CHALLENGE"
            },

            relationBC
        ]

    };


const challenged =
    engine.build({

        solver: {

            ...solver,

            solutions: [
                {
                    ...solver.solutions[0],

                    fullConfigurations: [
                        challengedReady
                    ],

                    subsetConfigurations:
                        []
                }
            ]

        },

        envelopes

    });


check(
    "NON-SUPPORTING RELATION CANNOT ENTER GLOBAL TARGET",
    challenged.errors.length >
        0 &&
    challenged.targets.length ===
        0
);


/*
 * ------------------------------------------------------------
 * BOUNDARY PROVENANCE
 * ------------------------------------------------------------
 */

const wrongBoundaries:
    any = {

        ...readyConfiguration,

        configurationId:
            "CONFIGURATION-WRONG-BOUNDARIES",

        knownBoundaryIds: [
            "BOUNDARY-ERC-A"
        ]

    };


const boundaryFailure =
    engine.build({

        solver: {

            ...solver,

            solutions: [
                {
                    ...solver.solutions[0],

                    fullConfigurations: [
                        wrongBoundaries
                    ],

                    subsetConfigurations:
                        []
                }
            ]

        },

        envelopes

    });


check(
    "CONFIGURATION BOUNDARY PROVENANCE MISMATCH FAILS CLOSED",
    boundaryFailure.errors.length >
        0 &&
    boundaryFailure.targets.length ===
        0
);


/*
 * ------------------------------------------------------------
 * DETERMINISM
 * ------------------------------------------------------------
 */

const reversedReady:
    any = {

        ...readyConfiguration,

        participantIds:
            [...readyConfiguration.participantIds]
                .reverse(),

        relations:
            [...readyConfiguration.relations]
                .reverse(),

        selectedFunctionalCandidateIds:
            [...readyConfiguration.selectedFunctionalCandidateIds]
                .reverse(),

        fulfilledNeedIds:
            [...readyConfiguration.fulfilledNeedIds]
                .reverse(),

        knownBoundaryIds:
            [...readyConfiguration.knownBoundaryIds]
                .reverse()

    };


const reversed =
    engine.build({

        solver: {

            ...solver,

            solutions: [
                {
                    ...solver.solutions[0],

                    participantIds:
                        [...solver.solutions[0].participantIds]
                            .reverse(),

                    fullConfigurations: [
                        reversedReady
                    ],

                    subsetConfigurations: [
                        blockedConfiguration
                    ]

                }
            ]

        },

        envelopes: {

            ...envelopes,

            envelopes: [
                {
                    ...envelope,

                    participants:
                        [...envelope.participants]
                            .reverse(),

                    participantIds:
                        [...envelope.participantIds]
                            .reverse()

                }
            ]

        }

    });


check(
    "GLOBAL EVALUATION BRIDGE IS DETERMINISTIC",
    JSON.stringify(
        result
    ) ===
        JSON.stringify(
            reversed
        )
);


check(
    "BRIDGE RESULT DOES NOT EXPOSE HARMONY VERDICT",
    !(
        "harmonyStatus" in
        target
    ) &&
    !(
        "scientificPolarity" in
        target
    )
);


console.log("");
console.log(
    `PASS: ${passed}`
);
console.log(
    `FAIL: ${failed}`
);


if (
    failed >
    0
) {

    console.log(
        "\nRESULT: FAIL"
    );

    process.exitCode =
        1;

}
else {

    console.log(
        "\nRESULT: PASS"
    );

}