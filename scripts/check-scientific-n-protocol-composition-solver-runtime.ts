import {
    ScientificNProtocolCompositionSolverEngine
} from "../laboratory/scientific-n-protocol-composition-solver/ScientificNProtocolCompositionSolverEngine.js";


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


function functionalRelation(
    candidateId:
        string,
    sourceParticipantId:
        string,
    targetParticipantId:
        string,
    needId:
        string,
    contributionId:
        string,
    polarity:
        "SUPPORT" |
        "CHALLENGE" |
        "INCONCLUSIVE"
): any {

    return {

        candidateId,

        candidateKind:
            "FUNCTIONAL_COMPLEMENTARITY",

        sourceParticipantId,

        targetParticipantId,

        discoveryEvidenceIds: [
            `DISCOVERY-${candidateId}`
        ],

        compatibilityAssessmentId:
            `ASSESS-${candidateId}`,

        boundaryIds: [
            `BOUNDARY-${sourceParticipantId}`,
            `BOUNDARY-${targetParticipantId}`
        ],

        compatibilityEvidenceIds: [
            `COMPAT-${candidateId}`
        ],

        compatibilityPolarity:
            polarity,

        boundaryCoverage:
            "KNOWN_BOUNDARIES_PRESENT",

        functionalNeedId:
            needId,

        functionalContributionId:
            contributionId,

        evaluationStatus:
            "EVALUATED"

    };

}


function functionalEdge(
    candidateId:
        string,
    sourceParticipantId:
        string,
    targetParticipantId:
        string,
    needId:
        string,
    contributionId:
        string,
    polarity:
        "SUPPORT" |
        "CHALLENGE" |
        "INCONCLUSIVE"
): any {

    return {

        edgeId:
            `EDGE-${candidateId}`,

        candidateGraphEdgeId:
            `CANDIDATE-GRAPH-EDGE-${candidateId}`,

        candidateId,

        kind:
            "FUNCTIONAL_COMPLEMENTARITY",

        sourceParticipantId,

        targetParticipantId,

        discoveryEvidenceIds: [
            `DISCOVERY-${candidateId}`
        ],

        compatibilityAssessmentId:
            `ASSESS-${candidateId}`,

        compatibilityAssessmentBasis:
            "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS",

        boundaryIds: [
            `BOUNDARY-${sourceParticipantId}`,
            `BOUNDARY-${targetParticipantId}`
        ],

        compatibilityEvidenceIds: [
            `COMPAT-${candidateId}`
        ],

        compatibilityPolarity:
            polarity,

        evaluationStatus:
            "EVALUATED",

        functionalMatchId:
            `MATCH-${candidateId}`,

        needId,

        contributionId,

        contributionKind:
            "CAPABILITY"

    };

}


const relationAB =
    functionalRelation(
        "CANDIDATE-A-B",
        "ERC-A",
        "ERC-B",
        "NEED-A",
        "CONTRIBUTION-B",
        "SUPPORT"
    );


const relationBC =
    functionalRelation(
        "CANDIDATE-B-C",
        "ERC-B",
        "ERC-C",
        "NEED-B",
        "CONTRIBUTION-C",
        "SUPPORT"
    );


const challengedAlternative =
    functionalRelation(
        "CANDIDATE-A-C-CHALLENGE",
        "ERC-A",
        "ERC-C",
        "NEED-A",
        "CONTRIBUTION-C",
        "CHALLENGE"
    );


const documentary =
    {

        candidateId:
            "CANDIDATE-DOCUMENTARY",

        candidateKind:
            "DOCUMENTARY_COMPOSITION",

        sourceParticipantId:
            "ERC-A",

        targetParticipantId:
            "ERC-C",

        discoveryEvidenceIds: [
            "DOCUMENTARY-EVIDENCE"
        ],

        compatibilityAssessmentId:
            "ASSESS-DOCUMENTARY",

        boundaryIds:
            [],

        compatibilityEvidenceIds:
            [],

        compatibilityPolarity:
            "INCONCLUSIVE",

        boundaryCoverage:
            "NO_KNOWN_BOUNDARIES",

        documentaryRelation:
            "COMPOSES_WITH",

        evaluationStatus:
            "EVALUATED"

    };


const envelope =
    {

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

        relations: [
            relationAB,
            relationBC,
            challengedAlternative,
            documentary
        ],

        boundaryRegions:
            [],

        unresolvedNeedIds:
            [],

        statistics:
            {},

        assemblyStatus:
            "ASSEMBLED"

    };


const edgeAB =
    functionalEdge(
        "CANDIDATE-A-B",
        "ERC-A",
        "ERC-B",
        "NEED-A",
        "CONTRIBUTION-B",
        "SUPPORT"
    );


const edgeBC =
    functionalEdge(
        "CANDIDATE-B-C",
        "ERC-B",
        "ERC-C",
        "NEED-B",
        "CONTRIBUTION-C",
        "SUPPORT"
    );


const edgeACChallenge =
    functionalEdge(
        "CANDIDATE-A-C-CHALLENGE",
        "ERC-A",
        "ERC-C",
        "NEED-A",
        "CONTRIBUTION-C",
        "CHALLENGE"
    );


const documentaryEdge =
    {

        edgeId:
            "EDGE-DOCUMENTARY",

        candidateGraphEdgeId:
            "CANDIDATE-GRAPH-EDGE-DOCUMENTARY",

        candidateId:
            "CANDIDATE-DOCUMENTARY",

        kind:
            "DOCUMENTARY_COMPOSITION",

        sourceParticipantId:
            "ERC-A",

        targetParticipantId:
            "ERC-C",

        discoveryEvidenceIds: [
            "DOCUMENTARY-EVIDENCE"
        ],

        compatibilityAssessmentId:
            "ASSESS-DOCUMENTARY",

        compatibilityAssessmentBasis:
            "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS",

        boundaryIds:
            [],

        compatibilityEvidenceIds:
            [],

        compatibilityPolarity:
            "INCONCLUSIVE",

        evaluationStatus:
            "EVALUATED",

        documentaryCandidateId:
            "DOC-A-C",

        relation:
            "COMPOSES_WITH"

    };


const objective =
    {

        objectiveId:
            "OBJECTIVE-N",

        description:
            "Synthetic N-protocol objective",

        requiredSubjects: [
            "OBJECTIVE-SUBJECT"
        ]

    };


const complementarity =
    {

        matches:
            [],

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

        errors:
            []

    };


const candidateEvaluationGraph =
    {

        graph: {

            graphId:
                "CANDIDATE-EVALUATION-GRAPH",

            candidateGraphId:
                "CANDIDATE-GRAPH",

            objectiveId:
                "OBJECTIVE-N",

            nodes:
                [],

            edges: [
                edgeAB,
                edgeBC,
                edgeACChallenge,
                documentaryEdge
            ],

            statistics:
                {}

        },

        errors:
            []

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
    new ScientificNProtocolCompositionSolverEngine();


console.log(
    "\nSCIENTIFIC N-PROTOCOL COMPOSITION SOLVER — RUNTIME"
);
console.log(
    "---------------------------------------------------"
);


const primary =
    engine.solve({

        objective,

        envelopes,

        candidateEvaluationGraph,

        complementarity

    });


check(
    "VALID SOLVER BUILD HAS NO ERRORS",
    primary.errors.length ===
        0
);


check(
    "ONE ENVELOPE PRODUCES ONE SOLUTION",
    primary.solutions.length ===
        1
);


const solution =
    primary.solutions[0];


check(
    "SUPPORTED A-B-C FUNCTIONAL TOPOLOGY PRODUCES FULL CONFIGURATION",
    solution.fullConfigurations.length ===
        1 &&
    solution.fullConfigurations[0]
        .participantIds
        .length ===
        3
);


const full =
    solution.fullConfigurations[0];


check(
    "FULL CONFIGURATION SELECTS ONLY SUPPORTED FUNCTIONAL CANDIDATES",
    JSON.stringify(
        full.selectedFunctionalCandidateIds
    ) ===
        JSON.stringify([
            "CANDIDATE-A-B",
            "CANDIDATE-B-C"
        ])
);


check(
    "CHALLENGED ALTERNATIVE DOES NOT POISON SUPPORTED ROUTE",
    full.readiness ===
        "READY_FOR_GLOBAL_EVALUATION" &&
    solution.challengedCandidateIds.includes(
        "CANDIDATE-A-C-CHALLENGE"
    ) &&
    !full.selectedFunctionalCandidateIds.includes(
        "CANDIDATE-A-C-CHALLENGE"
    )
);


check(
    "DOCUMENTARY CANDIDATE NEVER BECOMES FUNCTIONAL ROUTE",
    solution.documentaryCandidateIds.includes(
        "CANDIDATE-DOCUMENTARY"
    ) &&
    !full.selectedFunctionalCandidateIds.includes(
        "CANDIDATE-DOCUMENTARY"
    )
);


check(
    "ALL INTERNAL NEEDS ARE FULFILLED BY SELECTED FUNCTIONAL EDGES",
    JSON.stringify(
        full.fulfilledNeedIds
    ) ===
        JSON.stringify([
            "NEED-A",
            "NEED-B"
        ]) &&
    full.unresolvedNeedIds.length ===
        0
);


check(
    "OBJECTIVE COVERAGE IS FILTERED TO CONFIGURATION PARTICIPANTS",
    full.objectiveCoverage.length ===
        1 &&
    full.objectiveCoverage[0].status ===
        "COVERED" &&
    JSON.stringify(
        full.objectiveCoverage[0]
            .providerParticipantIds
    ) ===
        JSON.stringify([
            "ERC-C"
        ])
);


check(
    "READY CONFIGURATION REMAINS GLOBALLY UNEVALUATED",
    full.readiness ===
        "READY_FOR_GLOBAL_EVALUATION" &&
    full.globalEvaluationStatus ===
        "UNEVALUATED"
);


check(
    "SOLVER DOES NOT CLAIM HARMONY OR SCIENTIFIC POLARITY",
    !(
        "harmonyStatus" in
        full
    ) &&
    !(
        "scientificPolarity" in
        full
    )
);


check(
    "FULL READY CONFIGURATION SETS CORRECT SOLUTION STATUS",
    solution.resolutionStatus ===
        "READY_FULL_CONFIGURATION"
);


/*
 * ------------------------------------------------------------
 * INCONCLUSIVE LINK BREAKS FULL ROUTE
 * ------------------------------------------------------------
 */

const partialRelationBC =
    {

        ...relationBC,

        compatibilityPolarity:
            "INCONCLUSIVE"

    };


const partialEdgeBC =
    {

        ...edgeBC,

        compatibilityPolarity:
            "INCONCLUSIVE"

    };


const partial =
    engine.solve({

        objective,

        envelopes: {

            ...envelopes,

            envelopes: [
                {
                    ...envelope,

                    relations: [
                        relationAB,
                        partialRelationBC,
                        challengedAlternative,
                        documentary
                    ]
                }
            ]

        },

        candidateEvaluationGraph: {

            ...candidateEvaluationGraph,

            graph: {

                ...candidateEvaluationGraph.graph,

                edges: [
                    edgeAB,
                    partialEdgeBC,
                    edgeACChallenge,
                    documentaryEdge
                ]

            }

        },

        complementarity

    });


check(
    "INCONCLUSIVE EDGE IS NOT TREATED AS FUNCTIONALLY COMPATIBLE",
    partial.errors.length ===
        0 &&
    partial.solutions[0]
        .fullConfigurations
        .length ===
        0
);


check(
    "SUPPORTED A-B REMAINS AS STRICT SUBSET",
    partial.solutions[0]
        .subsetConfigurations
        .length ===
        1 &&
    JSON.stringify(
        partial.solutions[0]
            .subsetConfigurations[0]
            .participantIds
    ) ===
        JSON.stringify([
            "ERC-A",
            "ERC-B"
        ])
);


const subset =
    partial.solutions[0]
        .subsetConfigurations[0];


check(
    "STRICT SUBSET PRESERVES ITS UNRESOLVED NEED",
    JSON.stringify(
        subset.unresolvedNeedIds
    ) ===
        JSON.stringify([
            "NEED-B"
        ]) &&
    subset.blockers.includes(
        "UNRESOLVED_NEEDS"
    )
);


check(
    "STRICT SUBSET DOES NOT BORROW OBJECTIVE COVERAGE FROM OUTSIDE PARTICIPANT",
    JSON.stringify(
        subset.unresolvedObjectiveSubjects
    ) ===
        JSON.stringify([
            "OBJECTIVE-SUBJECT"
        ]) &&
    subset.blockers.includes(
        "UNRESOLVED_OBJECTIVE_SUBJECTS"
    )
);


check(
    "PARTIAL FUNCTIONAL TOPOLOGY IS NOT PROMOTED TO FULL",
    partial.solutions[0]
        .resolutionStatus ===
        "PARTIAL_CONFIGURATION_ONLY"
);


/*
 * ------------------------------------------------------------
 * DOCUMENTARY-ONLY REAL-LIKE TOPOLOGY
 * ------------------------------------------------------------
 */

const documentaryOnlyEnvelope =
    {

        ...envelope,

        envelopeId:
            "ENVELOPE-DOC-ONLY",

        participants: [
            participants[0],
            participants[1]
        ],

        participantIds: [
            "ERC-A",
            "ERC-B"
        ],

        relations: [
            {
                ...documentary,

                sourceParticipantId:
                    "ERC-A",

                targetParticipantId:
                    "ERC-B"
            }
        ]

    };


const documentaryOnlyGraph =
    {

        ...candidateEvaluationGraph,

        graph: {

            ...candidateEvaluationGraph.graph,

            edges: [
                {
                    ...documentaryEdge,

                    sourceParticipantId:
                        "ERC-A",

                    targetParticipantId:
                        "ERC-B"
                }
            ]

        }

    };


const documentaryOnly =
    engine.solve({

        objective,

        envelopes: {

            envelopes: [
                documentaryOnlyEnvelope
            ],

            isolatedParticipantIds:
                [],

            errors:
                []

        },

        candidateEvaluationGraph:
            documentaryOnlyGraph,

        complementarity

    });


check(
    "DOCUMENTARY-ONLY TOPOLOGY CREATES NO FUNCTIONAL CONFIGURATION",
    documentaryOnly.errors.length ===
        0 &&
    documentaryOnly.solutions[0]
        .fullConfigurations
        .length ===
        0 &&
    documentaryOnly.solutions[0]
        .subsetConfigurations
        .length ===
        0
);


check(
    "DOCUMENTARY-ONLY TOPOLOGY REMAINS UNRESOLVED",
    documentaryOnly.solutions[0]
        .resolutionStatus ===
        "UNRESOLVED_CANDIDATE_TOPOLOGY"
);


/*
 * ------------------------------------------------------------
 * OWNERSHIP FAIL CLOSED
 * ------------------------------------------------------------
 */

const malformedEdgeAB =
    {

        ...edgeAB,

        needId:
            "NEED-B"

    };


const malformed =
    engine.solve({

        objective,

        envelopes,

        candidateEvaluationGraph: {

            ...candidateEvaluationGraph,

            graph: {

                ...candidateEvaluationGraph.graph,

                edges: [
                    malformedEdgeAB,
                    edgeBC,
                    edgeACChallenge,
                    documentaryEdge
                ]

            }

        },

        complementarity

    });


check(
    "FUNCTIONAL NEED OWNERSHIP MISMATCH IS DETECTED",
    malformed.errors.length >
        0
);


check(
    "MALFORMED SOLVER INPUT FAILS CLOSED",
    malformed.solutions.length ===
        0
);


/*
 * ------------------------------------------------------------
 * GRAPH PROVENANCE FAIL CLOSED
 * ------------------------------------------------------------
 */

const wrongGraph =
    engine.solve({

        objective,

        envelopes: {

            ...envelopes,

            envelopes: [
                {
                    ...envelope,

                    candidateEvaluationGraphId:
                        "OTHER-GRAPH"
                }
            ]

        },

        candidateEvaluationGraph,

        complementarity

    });


check(
    "CANDIDATE EVALUATION GRAPH PROVENANCE MISMATCH FAILS CLOSED",
    wrongGraph.errors.length >
        0 &&
    wrongGraph.solutions.length ===
        0
);


/*
 * ------------------------------------------------------------
 * DETERMINISM
 * ------------------------------------------------------------
 */

const reversed =
    engine.solve({

        objective,

        envelopes: {

            ...envelopes,

            envelopes:
                [...envelopes.envelopes]
                    .reverse()
                    .map(
                        item => ({

                            ...item,

                            participants:
                                [...item.participants]
                                    .reverse(),

                            participantIds:
                                [...item.participantIds]
                                    .reverse(),

                            relations:
                                [...item.relations]
                                    .reverse()

                        })
                    )

        },

        candidateEvaluationGraph: {

            ...candidateEvaluationGraph,

            graph: {

                ...candidateEvaluationGraph.graph,

                edges:
                    [...candidateEvaluationGraph.graph.edges]
                        .reverse()

            }

        },

        complementarity: {

            ...complementarity,

            objectiveCoverage:
                [...complementarity.objectiveCoverage]
                    .reverse()

        }

    });


check(
    "N-PROTOCOL SOLVER IS DETERMINISTIC",
    JSON.stringify(
        primary
    ) ===
        JSON.stringify(
            reversed
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