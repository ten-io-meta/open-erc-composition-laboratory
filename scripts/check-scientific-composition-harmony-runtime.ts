import {
    ScientificCompositionHarmonyAssessmentEngine
} from "../laboratory/scientific-composition-harmony/ScientificCompositionHarmonyAssessmentEngine.js";


let failures =
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
        !condition
    ) {

        failures++;

    }

}


function node(
    participantId:
        string,
    boundaryId:
        string
): any {

    return {

        participantId,

        profileId:
            `PROFILE-${participantId}`,

        sourceId:
            `SOURCE-${participantId}`,

        boundaryIds: [
            boundaryId
        ],

        contributionIds:
            [],

        needIds:
            []

    };

}


function graph(
    graphId:
        string,
    participantIds:
        string[],
    polarity:
        "SUPPORT" |
        "CHALLENGE" |
        "INCONCLUSIVE"
): any {

    const nodes =
        participantIds.map(
            participantId =>
                node(
                    participantId,
                    `BOUNDARY-${participantId}`
                )
        );


    return {

        graph: {

            graphId,

            objectiveId:
                "OBJECTIVE-HARMONY",

            nodes,

            edges:
                participantIds.length >
                    1
                    ? [
                        {
                            edgeId:
                                `EDGE-${graphId}`,

                            matchId:
                                `MATCH-${graphId}`,

                            consumerParticipantId:
                                participantIds[0],

                            providerParticipantId:
                                participantIds[1],

                            needId:
                                `NEED-${graphId}`,

                            contributionId:
                                `CONTRIBUTION-${graphId}`,

                            compatibilityAssessmentId:
                                `COMPAT-${graphId}`,

                            compatibilityPolarity:
                                polarity ===
                                    "SUPPORT"
                                    ? "SUPPORT"
                                    : polarity ===
                                        "CHALLENGE"
                                        ? "CHALLENGE"
                                        : "INCONCLUSIVE",

                            boundaryIds:
                                nodes.flatMap(
                                    (node: any) =>
                                        node.boundaryIds
                                ),

                            evidenceIds:
                                []
                        }
                    ]
                    : [],

            unresolvedNeedIds:
                polarity ===
                    "SUPPORT"
                    ? []
                    : [
                        `UNRESOLVED-${graphId}`
                    ],

            objectiveCoverage: [
                {
                    objectiveSubject:
                        "OBJECTIVE-SUBJECT",

                    status:
                        polarity ===
                            "SUPPORT"
                            ? "COVERED"
                            : "UNCOVERED",

                    contributionIds:
                        []
                }
            ],

            statistics: {

                nodes:
                    nodes.length,

                edges:
                    participantIds.length >
                        1
                        ? 1
                        : 0,

                supportedEdges:
                    polarity ===
                        "SUPPORT"
                        ? 1
                        : 0,

                challengedEdges:
                    polarity ===
                        "CHALLENGE"
                        ? 1
                        : 0,

                inconclusiveEdges:
                    polarity ===
                        "INCONCLUSIVE"
                        ? 1
                        : 0,

                unresolvedNeeds:
                    polarity ===
                        "SUPPORT"
                        ? 0
                        : 1,

                unresolvedObjectiveSubjects:
                    polarity ===
                        "SUPPORT"
                        ? 0
                        : 1

            },

            scientificPolarity:
                polarity ===
                    "CHALLENGE"
                    ? "CHALLENGE"
                    : "INCONCLUSIVE"

        },

        errors:
            []

    };

}


function globalEvaluation(
    graphId:
        string,
    participantIds:
        string[],
    polarity:
        "SUPPORT" |
        "CHALLENGE" |
        "INCONCLUSIVE"
): any {

    const runId =
        `RUN-${graphId}`;


    const boundaryEvaluations =
        participantIds.map(
            participantId => ({

                boundaryId:
                    `BOUNDARY-${participantId}`,

                participantId,

                status:
                    polarity ===
                        "SUPPORT"
                        ? "PRESERVED"
                        : polarity ===
                            "CHALLENGE"
                            ? "VIOLATED"
                            : "UNEVALUATED",

                observationIds:
                    polarity ===
                        "SUPPORT"
                        ? [
                            `OBS-${participantId}`
                        ]
                        : [],

                evidenceIds:
                    polarity ===
                        "SUPPORT"
                        ? [
                            `EVIDENCE-${participantId}`
                        ]
                        : []

            })
        );


    return {

        assessment: {

            assessmentId:
                `GLOBAL-${graphId}`,

            graphId,

            runAssessments: [
                {
                    runId,

                    boundaryEvaluations,

                    preserved:
                        polarity ===
                            "SUPPORT"
                            ? participantIds.length
                            : 0,

                    violated:
                        polarity ===
                            "CHALLENGE"
                            ? participantIds.length
                            : 0,

                    unevaluated:
                        polarity ===
                            "INCONCLUSIVE"
                            ? participantIds.length
                            : 0,

                    scientificPolarity:
                        polarity
                }
            ],

            scientificPolarity:
                polarity,

            ...(
                polarity ===
                    "SUPPORT"
                    ? {
                        supportingRunId:
                            runId
                    }
                    : {}
            )

        },

        errors:
            []

    };

}


const envelope:
    any = {

        envelopeId:
            "ENVELOPE-A-B-C",

        setId:
            "SET-A-B-C",

        candidateGraphId:
            "CANDIDATE-GRAPH",

        candidateEvaluationGraphId:
            "CANDIDATE-EVAL-GRAPH",

        objectiveId:
            "OBJECTIVE-HARMONY",

        participants:
            [],

        participantIds: [
            "ERC-1001",
            "ERC-1002",
            "ERC-1003"
        ],

        relations: [

            {
                candidateId:
                    "CANDIDATE-A-B",

                candidateKind:
                    "FUNCTIONAL_COMPLEMENTARITY",

                sourceParticipantId:
                    "ERC-1001",

                targetParticipantId:
                    "ERC-1002",

                discoveryEvidenceIds:
                    [],

                compatibilityAssessmentId:
                    "COMPAT-A-B",

                boundaryIds:
                    [],

                compatibilityEvidenceIds:
                    [],

                compatibilityPolarity:
                    "SUPPORT",

                boundaryCoverage:
                    "KNOWN_BOUNDARIES_PRESENT",

                functionalNeedId:
                    "NEED-A",

                functionalContributionId:
                    "CONTRIBUTION-B",

                evaluationStatus:
                    "EVALUATED"
            },

            /*
             * Challenged alternative candidate.
             * It must NOT poison a different globally-supported
             * complete configuration.
             */
            {
                candidateId:
                    "CANDIDATE-A-C-ALTERNATIVE",

                candidateKind:
                    "DOCUMENTARY_COMPOSITION",

                sourceParticipantId:
                    "ERC-1001",

                targetParticipantId:
                    "ERC-1003",

                discoveryEvidenceIds:
                    [],

                compatibilityAssessmentId:
                    "COMPAT-A-C",

                boundaryIds:
                    [],

                compatibilityEvidenceIds:
                    [],

                compatibilityPolarity:
                    "CHALLENGE",

                boundaryCoverage:
                    "KNOWN_BOUNDARIES_PRESENT",

                documentaryRelation:
                    "COMPOSES_WITH",

                evaluationStatus:
                    "EVALUATED"
            }

        ],

        boundaryRegions: [

            {
                boundaryId:
                    "BOUNDARY-ERC-1001",

                participantId:
                    "ERC-1001",

                candidateIds:
                    [],

                candidateEvaluations:
                    [],

                candidateEvidenceStatus:
                    "PRESERVED_IN_CANDIDATE_EVIDENCE",

                evidenceIds:
                    []
            },

            {
                boundaryId:
                    "BOUNDARY-ERC-1003",

                participantId:
                    "ERC-1003",

                candidateIds:
                    [],

                candidateEvaluations:
                    [],

                candidateEvidenceStatus:
                    "VIOLATED_IN_CANDIDATE_EVIDENCE",

                evidenceIds:
                    []
            }

        ],

        unresolvedNeedIds:
            [],

        statistics: {

            participants:
                3,

            relations:
                2,

            contributions:
                0,

            knownBoundaries:
                2,

            needs:
                0,

            unresolvedNeeds:
                0,

            preservedBoundaryRegions:
                1,

            violatedBoundaryRegions:
                1,

            unevaluatedBoundaryRegions:
                0,

            supportedRelations:
                1,

            challengedRelations:
                1,

            inconclusiveRelations:
                0,

            relationsWithoutKnownBoundaries:
                0

        },

        assemblyStatus:
            "ASSEMBLED"

    };


const envelopes =
    {

        envelopes: [
            envelope
        ],

        isolatedParticipantIds:
            [],

        errors:
            []

    };


const engine =
    new ScientificCompositionHarmonyAssessmentEngine();


console.log(
    "\nSCIENTIFIC COMPOSITION HARMONY — RUNTIME"
);
console.log(
    "-----------------------------------------"
);


/*
 * ------------------------------------------------------------
 * FULL
 * ------------------------------------------------------------
 */

const fullGraph =
    graph(
        "GRAPH-FULL-SUPPORT",
        [
            "ERC-1001",
            "ERC-1002",
            "ERC-1003"
        ],
        "SUPPORT"
    );


const full =
    engine.assess({

        envelopes,

        compositionGraphs: [
            fullGraph
        ],

        globalEvaluations: [
            globalEvaluation(
                "GRAPH-FULL-SUPPORT",
                [
                    "ERC-1001",
                    "ERC-1002",
                    "ERC-1003"
                ],
                "SUPPORT"
            )
        ]

    });


check(
    "FULL BUILD HAS NO ERRORS",
    full.errors.length ===
        0
);


check(
    "EXACT GLOBAL SUPPORT PRODUCES FULL HARMONY",
    full.assessments[0]
        .harmonyStatus ===
        "FULL"
);


check(
    "CHALLENGED ALTERNATIVE CANDIDATE DOES NOT POISON SUPPORTED FULL CONFIGURATION",
    full.assessments[0]
        .harmonyStatus ===
        "FULL" &&
    JSON.stringify(
        full.assessments[0]
            .challengedCandidateIds
    ) ===
        JSON.stringify([
            "CANDIDATE-A-C-ALTERNATIVE"
        ])
);


check(
    "FULL PRESERVES SUPPORTING RUN",
    full.assessments[0]
        .fullConfigurationEvidence[0]
        .supportingRunId ===
        "RUN-GRAPH-FULL-SUPPORT"
);


/*
 * ------------------------------------------------------------
 * PARTIAL
 * ------------------------------------------------------------
 */

const partial =
    engine.assess({

        envelopes,

        compositionGraphs: [

            graph(
                "GRAPH-FULL-INCONCLUSIVE",
                [
                    "ERC-1001",
                    "ERC-1002",
                    "ERC-1003"
                ],
                "INCONCLUSIVE"
            ),

            graph(
                "GRAPH-SUBSET-A-B",
                [
                    "ERC-1001",
                    "ERC-1002"
                ],
                "SUPPORT"
            )

        ],

        globalEvaluations: [

            globalEvaluation(
                "GRAPH-FULL-INCONCLUSIVE",
                [
                    "ERC-1001",
                    "ERC-1002",
                    "ERC-1003"
                ],
                "INCONCLUSIVE"
            ),

            globalEvaluation(
                "GRAPH-SUBSET-A-B",
                [
                    "ERC-1001",
                    "ERC-1002"
                ],
                "SUPPORT"
            )

        ]

    });


check(
    "SUPPORTED STRICT SUBSET PRODUCES PARTIAL",
    partial.errors.length ===
        0 &&
    partial.assessments[0]
        .harmonyStatus ===
        "PARTIAL"
);


check(
    "PARTIAL PRESERVES EXACT SUPPORTED SUBSET",
    JSON.stringify(
        partial.assessments[0]
            .supportedSubsets[0]
            .participantIds
    ) ===
        JSON.stringify([
            "ERC-1001",
            "ERC-1002"
        ])
);


/*
 * ------------------------------------------------------------
 * CHALLENGED
 * ------------------------------------------------------------
 */

const challenged =
    engine.assess({

        envelopes,

        compositionGraphs: [

            graph(
                "GRAPH-FULL-CHALLENGED",
                [
                    "ERC-1001",
                    "ERC-1002",
                    "ERC-1003"
                ],
                "CHALLENGE"
            )

        ],

        globalEvaluations: [

            globalEvaluation(
                "GRAPH-FULL-CHALLENGED",
                [
                    "ERC-1001",
                    "ERC-1002",
                    "ERC-1003"
                ],
                "CHALLENGE"
            )

        ]

    });


check(
    "ONLY FULL CONFIGURATION CHALLENGED PRODUCES CHALLENGED",
    challenged.errors.length ===
        0 &&
    challenged.assessments[0]
        .harmonyStatus ===
        "CHALLENGED"
);


/*
 * ------------------------------------------------------------
 * INCONCLUSIVE
 * ------------------------------------------------------------
 */

const inconclusive =
    engine.assess({

        envelopes,

        compositionGraphs:
            [],

        globalEvaluations:
            []

    });


check(
    "ABSENT GLOBAL CONFIGURATION EVIDENCE REMAINS INCONCLUSIVE",
    inconclusive.errors.length ===
        0 &&
    inconclusive.assessments[0]
        .harmonyStatus ===
        "INCONCLUSIVE"
);


check(
    "LOCAL PAIR SUPPORT DOES NOT BECOME FULL WITHOUT GLOBAL RUN",
    inconclusive.assessments[0]
        .supportedCandidateIds
        .length ===
        1 &&
    inconclusive.assessments[0]
        .harmonyStatus ===
        "INCONCLUSIVE"
);


/*
 * ------------------------------------------------------------
 * ALTERNATIVE FULL CONFIGURATIONS
 * ------------------------------------------------------------
 */

const alternatives =
    engine.assess({

        envelopes,

        compositionGraphs: [

            graph(
                "GRAPH-ALTERNATIVE-CHALLENGE",
                [
                    "ERC-1001",
                    "ERC-1002",
                    "ERC-1003"
                ],
                "CHALLENGE"
            ),

            graph(
                "GRAPH-ALTERNATIVE-SUPPORT",
                [
                    "ERC-1001",
                    "ERC-1002",
                    "ERC-1003"
                ],
                "SUPPORT"
            )

        ],

        globalEvaluations: [

            globalEvaluation(
                "GRAPH-ALTERNATIVE-CHALLENGE",
                [
                    "ERC-1001",
                    "ERC-1002",
                    "ERC-1003"
                ],
                "CHALLENGE"
            ),

            globalEvaluation(
                "GRAPH-ALTERNATIVE-SUPPORT",
                [
                    "ERC-1001",
                    "ERC-1002",
                    "ERC-1003"
                ],
                "SUPPORT"
            )

        ]

    });


check(
    "SUPPORTED FULL ROUTE WINS OVER CHALLENGED ALTERNATIVE ROUTE",
    alternatives.errors.length ===
        0 &&
    alternatives.assessments[0]
        .harmonyStatus ===
        "FULL" &&
    alternatives.assessments[0]
        .fullConfigurationEvidence
        .length ===
        2
);


/*
 * ------------------------------------------------------------
 * FAKE SUPPORT FAILS CLOSED
 * ------------------------------------------------------------
 */

const fakeSupportGraph =
    graph(
        "GRAPH-FAKE-SUPPORT",
        [
            "ERC-1001",
            "ERC-1002",
            "ERC-1003"
        ],
        "SUPPORT"
    );


fakeSupportGraph.graph.nodes =
    fakeSupportGraph.graph.nodes.map(
        (node: any) => ({

            ...node,

            boundaryIds:
                []

        })
    );


const fakeSupport =
    engine.assess({

        envelopes,

        compositionGraphs: [
            fakeSupportGraph
        ],

        globalEvaluations: [
            globalEvaluation(
                "GRAPH-FAKE-SUPPORT",
                [
                    "ERC-1001",
                    "ERC-1002",
                    "ERC-1003"
                ],
                "SUPPORT"
            )
        ]

    });


check(
    "MALFORMED GLOBAL SUPPORT IS DETECTED",
    fakeSupport.errors.length >
        0
);


check(
    "MALFORMED GLOBAL SUPPORT FAILS CLOSED",
    fakeSupport.assessments.length ===
        0
);


/*
 * ------------------------------------------------------------
 * DETERMINISM
 * ------------------------------------------------------------
 */

const reverse =
    engine.assess({

        envelopes: {

            ...envelopes,

            envelopes:
                [...envelopes.envelopes]
                    .reverse()

        },

        compositionGraphs: [
            fullGraph
        ],

        globalEvaluations: [
            globalEvaluation(
                "GRAPH-FULL-SUPPORT",
                [
                    "ERC-1001",
                    "ERC-1002",
                    "ERC-1003"
                ],
                "SUPPORT"
            )
        ]

    });


check(
    "HARMONY ASSESSMENT IS DETERMINISTIC",
    JSON.stringify(
        full
    ) ===
        JSON.stringify(
            reverse
        )
);


check(
    "HARMONY MODEL DOES NOT EXPOSE SCIENTIFIC POLARITY AS ITS OWN VERDICT",
    !(
        "scientificPolarity" in
        full.assessments[0]
    ) &&
    full.assessments[0]
        .evidenceBasis ===
        "EXACT_GLOBAL_CONFIGURATION_EVIDENCE"
);


if (
    failures >
    0
) {

    console.log(
        `\nRESULT: FAIL (${failures})`
    );

    process.exitCode =
        1;

}
else {

    console.log(
        "\nRESULT: PASS"
    );

}