import assert from "node:assert/strict";

import type {
    ScientificCompositionGraph
} from "../laboratory/scientific-composition-graph/ScientificCompositionGraph.js";

import {
    ScientificCompositionGlobalEvaluationEngine
} from "../laboratory/scientific-composition-global-evaluation/ScientificCompositionGlobalEvaluationEngine.js";


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


function graph(
    edgePolarities:
        Array<
            "SUPPORT" |
            "CHALLENGE" |
            "INCONCLUSIVE"
        > = [
            "SUPPORT",
            "SUPPORT"
        ]
): ScientificCompositionGraph {

    return {

        graphId:
            "GRAPH-1",

        objectiveId:
            "OBJECTIVE-1",

        nodes: [

            {
                participantId:
                    "ERC-A",

                profileId:
                    "PROFILE-A",

                sourceId:
                    "SOURCE-A",

                sourceRevision:
                    "REV-A",

                contributionIds: [
                    "CONTRIBUTION-A"
                ],

                boundaryIds: [
                    "BOUNDARY-A"
                ],

                needIds: [
                    "NEED-A"
                ]
            },

            {
                participantId:
                    "ERC-B",

                profileId:
                    "PROFILE-B",

                sourceId:
                    "SOURCE-B",

                sourceRevision:
                    "REV-B",

                contributionIds: [
                    "CONTRIBUTION-B"
                ],

                boundaryIds: [
                    "BOUNDARY-B"
                ],

                needIds: [
                    "NEED-B"
                ]
            },

            {
                participantId:
                    "ERC-C",

                profileId:
                    "PROFILE-C",

                sourceId:
                    "SOURCE-C",

                sourceRevision:
                    "REV-C",

                contributionIds: [
                    "CONTRIBUTION-C"
                ],

                boundaryIds: [
                    "BOUNDARY-C"
                ],

                needIds: []
            }

        ],

        edges:
            edgePolarities.map(
                (
                    polarity,
                    index
                ) => ({

                    edgeId:
                        `EDGE-${index}`,

                    matchId:
                        `MATCH-${index}`,

                    consumerParticipantId:
                        index === 0
                            ? "ERC-A"
                            : "ERC-B",

                    providerParticipantId:
                        index === 0
                            ? "ERC-B"
                            : "ERC-C",

                    needId:
                        `NEED-${index}`,

                    contributionId:
                        `CONTRIBUTION-${index}`,

                    compatibilityAssessmentId:
                        `ASSESSMENT-${index}`,

                    compatibilityPolarity:
                        polarity,

                    boundaryIds:
                        index === 0
                            ? [
                                "BOUNDARY-A",
                                "BOUNDARY-B"
                            ]
                            : [
                                "BOUNDARY-B",
                                "BOUNDARY-C"
                            ],

                    evidenceIds:
                        []

                })
            ),

        unresolvedNeedIds: [],

        objectiveCoverage: [

            {
                requiredSubject:
                    "IDENTITY",

                status:
                    "COVERED",

                providerParticipantIds: [
                    "ERC-A"
                ],

                contributionIds: [
                    "CONTRIBUTION-A"
                ]
            }

        ],

        statistics: {

            nodes:
                3,

            edges:
                edgePolarities.length,

            supportedEdges:
                edgePolarities.filter(
                    polarity =>
                        polarity ===
                        "SUPPORT"
                ).length,

            challengedEdges:
                edgePolarities.filter(
                    polarity =>
                        polarity ===
                        "CHALLENGE"
                ).length,

            inconclusiveEdges:
                edgePolarities.filter(
                    polarity =>
                        polarity ===
                        "INCONCLUSIVE"
                ).length,

            unresolvedNeeds:
                0,

            unresolvedObjectiveSubjects:
                0

        },

        scientificPolarity:
            edgePolarities.some(
                polarity =>
                    polarity ===
                    "CHALLENGE"
            )
                ? "CHALLENGE"
                : "INCONCLUSIVE"

    };

}


function preserved(
    runId: string,
    boundaryId: string
) {

    return {

        observationId:
            `OBS-${runId}-${boundaryId}`,

        graphId:
            "GRAPH-1",

        runId,

        boundaryId,

        verdict:
            "PRESERVED" as const,

        evidenceIds: [
            `EVIDENCE-${runId}-${boundaryId}`
        ]

    };

}


const engine =
    new ScientificCompositionGlobalEvaluationEngine();


const completeRun =
    engine.evaluate({

        graph:
            graph(),

        observations: [

            preserved(
                "RUN-1",
                "BOUNDARY-A"
            ),

            preserved(
                "RUN-1",
                "BOUNDARY-B"
            ),

            preserved(
                "RUN-1",
                "BOUNDARY-C"
            )

        ]

    });


check(
    "COMPLETE SAME RUN HAS NO ERRORS",
    completeRun.errors.length ===
        0
);


check(
    "COMPLETE SAME RUN PRODUCES GLOBAL SUPPORT",
    completeRun.assessment
        ?.scientificPolarity ===
        "SUPPORT"
);


check(
    "SUPPORT IDENTIFIES EXACT RUN",
    completeRun.assessment
        ?.supportingRunId ===
        "RUN-1"
);


const splitRuns =
    engine.evaluate({

        graph:
            graph(),

        observations: [

            preserved(
                "RUN-A",
                "BOUNDARY-A"
            ),

            preserved(
                "RUN-A",
                "BOUNDARY-B"
            ),

            preserved(
                "RUN-B",
                "BOUNDARY-C"
            )

        ]

    });


check(
    "EVIDENCE ACROSS DIFFERENT RUNS IS NOT MERGED",
    splitRuns.assessment
        ?.scientificPolarity ===
        "INCONCLUSIVE"
);


check(
    "EACH SPLIT RUN REMAINS INCOMPLETE",
    splitRuns.assessment
        ?.runAssessments.every(
            run =>
                run.unevaluated >
                0
        ) === true
);


const violation =
    engine.evaluate({

        graph:
            graph(),

        observations: [

            preserved(
                "RUN-V",
                "BOUNDARY-A"
            ),

            preserved(
                "RUN-V",
                "BOUNDARY-B"
            ),

            {
                ...preserved(
                    "RUN-V",
                    "BOUNDARY-C"
                ),

                verdict:
                    "VIOLATED" as const
            }

        ]

    });


check(
    "ONE GLOBAL BOUNDARY VIOLATION PRODUCES CHALLENGE",
    violation.assessment
        ?.scientificPolarity ===
        "CHALLENGE"
);


const conflicting =
    engine.evaluate({

        graph:
            graph(),

        observations: [

            preserved(
                "RUN-X",
                "BOUNDARY-A"
            ),

            preserved(
                "RUN-X",
                "BOUNDARY-B"
            ),

            preserved(
                "RUN-X",
                "BOUNDARY-C"
            ),

            {
                observationId:
                    "OBS-RUN-X-BOUNDARY-C-VIOLATION",

                graphId:
                    "GRAPH-1",

                runId:
                    "RUN-X",

                boundaryId:
                    "BOUNDARY-C",

                verdict:
                    "VIOLATED",

                evidenceIds: []
            }

        ]

    });


check(
    "VIOLATION DOMINATES PRESERVATION IN SAME RUN",
    conflicting.assessment
        ?.scientificPolarity ===
        "CHALLENGE"
);


const inconclusiveEdge =
    engine.evaluate({

        graph:
            graph([
                "SUPPORT",
                "INCONCLUSIVE"
            ]),

        observations: [

            preserved(
                "RUN-E",
                "BOUNDARY-A"
            ),

            preserved(
                "RUN-E",
                "BOUNDARY-B"
            ),

            preserved(
                "RUN-E",
                "BOUNDARY-C"
            )

        ]

    });


check(
    "INCONCLUSIVE EDGE PREVENTS GLOBAL SUPPORT",
    inconclusiveEdge.assessment
        ?.scientificPolarity ===
        "INCONCLUSIVE"
);


const challengedEdge =
    engine.evaluate({

        graph:
            graph([
                "SUPPORT",
                "CHALLENGE"
            ]),

        observations: [

            preserved(
                "RUN-C",
                "BOUNDARY-A"
            ),

            preserved(
                "RUN-C",
                "BOUNDARY-B"
            ),

            preserved(
                "RUN-C",
                "BOUNDARY-C"
            )

        ]

    });


check(
    "CHALLENGED EDGE CHALLENGES GLOBAL COMPOSITION",
    challengedEdge.assessment
        ?.scientificPolarity ===
        "CHALLENGE"
);


const unresolvedGraph =
    graph();


unresolvedGraph.unresolvedNeedIds = [
    "NEED-UNRESOLVED"
];


const unresolved =
    engine.evaluate({

        graph:
            unresolvedGraph,

        observations: [

            preserved(
                "RUN-U",
                "BOUNDARY-A"
            ),

            preserved(
                "RUN-U",
                "BOUNDARY-B"
            ),

            preserved(
                "RUN-U",
                "BOUNDARY-C"
            )

        ]

    });


check(
    "UNRESOLVED FUNCTIONAL NEED PREVENTS SUPPORT",
    unresolved.assessment
        ?.scientificPolarity ===
        "INCONCLUSIVE"
);


const foreignGraph =
    engine.evaluate({

        graph:
            graph(),

        observations: [

            {
                ...preserved(
                    "RUN-F",
                    "BOUNDARY-A"
                ),

                graphId:
                    "OTHER-GRAPH"
            }

        ]

    });


check(
    "FOREIGN GRAPH OBSERVATION FAILS CLOSED",
    foreignGraph.assessment ===
        null &&
    foreignGraph.errors.length >
        0
);


const unknownBoundary =
    engine.evaluate({

        graph:
            graph(),

        observations: [

            preserved(
                "RUN-Z",
                "BOUNDARY-NOT-IN-GRAPH"
            )

        ]

    });


check(
    "UNKNOWN BOUNDARY FAILS CLOSED",
    unknownBoundary.assessment ===
        null &&
    unknownBoundary.errors.length >
        0
);


const reversed =
    engine.evaluate({

        graph:
            graph(),

        observations: [

            preserved(
                "RUN-1",
                "BOUNDARY-C"
            ),

            preserved(
                "RUN-1",
                "BOUNDARY-B"
            ),

            preserved(
                "RUN-1",
                "BOUNDARY-A"
            )

        ]

    });


check(
    "GLOBAL EVALUATION IS DETERMINISTIC",
    JSON.stringify(
        completeRun.assessment
    ) ===
    JSON.stringify(
        reversed.assessment
    )
);


console.log("");
console.log(
    `SCIENTIFIC COMPOSITION GLOBAL EVALUATION: ${passed}/${passed} PASS`
);
