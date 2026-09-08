import {
    ScientificCompositionEnvelopeEngine
} from "../laboratory/scientific-composition-envelope/ScientificCompositionEnvelopeEngine.js";


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


function profile(
    participantId:
        string,
    boundaryId:
        string,
    needId:
        string
): any {

    return {

        profileId:
            `PROFILE-${participantId}`,

        protocolId:
            participantId,

        sourceId:
            `SOURCE-${participantId}`,

        sourceRevision:
            `REV-${participantId}`,

        attributedContainerSymbols:
            [],

        contributions: [

            {
                contributionId:
                    `CONTRIBUTION-${participantId}`,

                participantId,

                kind:
                    "CAPABILITY",

                subject:
                    `CAPABILITY:${participantId}`,

                evidenceIds: [
                    `EVIDENCE-CONTRIBUTION-${participantId}`
                ]
            }

        ],

        boundaries: [

            {
                boundaryId,

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

        needs: [

            {
                needId,

                participantId,

                kind:
                    "UNRESOLVED",

                subject:
                    `NEED:${participantId}`,

                evidenceIds: [
                    `EVIDENCE-NEED-${participantId}`
                ]
            }

        ]

    };

}


const profiles =
    [
        profile(
            "ERC-1001",
            "BOUNDARY-A",
            "NEED-A"
        ),
        profile(
            "ERC-1002",
            "BOUNDARY-B",
            "NEED-B"
        ),
        profile(
            "ERC-1003",
            "BOUNDARY-C",
            "NEED-C"
        )
    ];


const compositionSets:
    any = {

        candidateGraphId:
            "CANDIDATE-GRAPH",

        objectiveId:
            "OBJECTIVE-N",

        sets: [

            {
                setId:
                    "SET-A-B-C",

                candidateGraphId:
                    "CANDIDATE-GRAPH",

                objectiveId:
                    "OBJECTIVE-N",

                participants:
                    profiles.map(
                        profile => ({

                            participantId:
                                profile.protocolId,

                            profileId:
                                profile.profileId,

                            sourceId:
                                profile.sourceId,

                            sourceRevision:
                                profile.sourceRevision

                        })
                    ),

                participantIds: [
                    "ERC-1001",
                    "ERC-1002",
                    "ERC-1003"
                ],

                relations: [

                    {
                        relationId:
                            "REL-A-B",

                        candidateGraphEdgeId:
                            "GRAPH-EDGE-A-B",

                        candidateId:
                            "CANDIDATE-A-B",

                        kind:
                            "FUNCTIONAL_COMPLEMENTARITY",

                        sourceParticipantId:
                            "ERC-1001",

                        targetParticipantId:
                            "ERC-1002",

                        evidenceIds: [
                            "DISCOVERY-A-B"
                        ],

                        evaluationStatus:
                            "UNEVALUATED"
                    },

                    {
                        relationId:
                            "REL-B-C",

                        candidateGraphEdgeId:
                            "GRAPH-EDGE-B-C",

                        candidateId:
                            "CANDIDATE-B-C",

                        kind:
                            "DOCUMENTARY_COMPOSITION",

                        sourceParticipantId:
                            "ERC-1002",

                        targetParticipantId:
                            "ERC-1003",

                        evidenceIds: [
                            "DISCOVERY-B-C"
                        ],

                        evaluationStatus:
                            "UNEVALUATED"
                    }

                ],

                candidateIds: [
                    "CANDIDATE-A-B",
                    "CANDIDATE-B-C"
                ],

                status:
                    "DISCOVERED"
            }

        ],

        isolatedParticipantIds: [
            "ERC-9000"
        ],

        statistics: {

            candidateGraphParticipants:
                4,

            candidateGraphRelations:
                2,

            compositionSets:
                1,

            participantsInCompositionSets:
                3,

            isolatedParticipants:
                1,

            largestCompositionSet:
                3

        },

        errors:
            []

    };


const candidateCompatibility:
    any = {

        assessments: [

            {
                assessmentId:
                    "ASSESS-A-B",

                candidateId:
                    "CANDIDATE-A-B",

                candidateKind:
                    "FUNCTIONAL_COMPLEMENTARITY",

                sourceParticipantId:
                    "ERC-1001",

                targetParticipantId:
                    "ERC-1002",

                assessmentBasis:
                    "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS",

                boundaryEvaluations: [

                    {
                        boundaryId:
                            "BOUNDARY-A",

                        participantId:
                            "ERC-1001",

                        status:
                            "PRESERVED",

                        observationIds: [
                            "OBS-A"
                        ],

                        evidenceIds: [
                            "COMPAT-A"
                        ]
                    },

                    {
                        boundaryId:
                            "BOUNDARY-B",

                        participantId:
                            "ERC-1002",

                        status:
                            "PRESERVED",

                        observationIds: [
                            "OBS-B-1"
                        ],

                        evidenceIds: [
                            "COMPAT-B-1"
                        ]
                    }

                ],

                statistics: {

                    total:
                        2,

                    preserved:
                        2,

                    violated:
                        0,

                    unevaluated:
                        0

                },

                scientificPolarity:
                    "SUPPORT"
            },

            {
                assessmentId:
                    "ASSESS-B-C",

                candidateId:
                    "CANDIDATE-B-C",

                candidateKind:
                    "DOCUMENTARY_COMPOSITION",

                sourceParticipantId:
                    "ERC-1002",

                targetParticipantId:
                    "ERC-1003",

                assessmentBasis:
                    "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS",

                boundaryEvaluations: [

                    {
                        boundaryId:
                            "BOUNDARY-B",

                        participantId:
                            "ERC-1002",

                        status:
                            "VIOLATED",

                        observationIds: [
                            "OBS-B-2"
                        ],

                        evidenceIds: [
                            "COMPAT-B-2"
                        ]
                    },

                    {
                        boundaryId:
                            "BOUNDARY-C",

                        participantId:
                            "ERC-1003",

                        status:
                            "UNEVALUATED",

                        observationIds:
                            [],

                        evidenceIds:
                            []
                    }

                ],

                statistics: {

                    total:
                        2,

                    preserved:
                        0,

                    violated:
                        1,

                    unevaluated:
                        1

                },

                scientificPolarity:
                    "CHALLENGE"
            }

        ],

        errors:
            []

    };


const candidateEvaluationGraph:
    any = {

        graph: {

            graphId:
                "EVALUATION-GRAPH",

            candidateGraphId:
                "CANDIDATE-GRAPH",

            objectiveId:
                "OBJECTIVE-N",

            nodes:
                [],

            edges: [

                {
                    edgeId:
                        "EVAL-A-B",

                    candidateGraphEdgeId:
                        "GRAPH-EDGE-A-B",

                    candidateId:
                        "CANDIDATE-A-B",

                    kind:
                        "FUNCTIONAL_COMPLEMENTARITY",

                    sourceParticipantId:
                        "ERC-1001",

                    targetParticipantId:
                        "ERC-1002",

                    discoveryEvidenceIds: [
                        "DISCOVERY-A-B"
                    ],

                    compatibilityAssessmentId:
                        "ASSESS-A-B",

                    compatibilityAssessmentBasis:
                        "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS",

                    boundaryIds: [
                        "BOUNDARY-A",
                        "BOUNDARY-B"
                    ],

                    compatibilityEvidenceIds: [
                        "COMPAT-A",
                        "COMPAT-B-1"
                    ],

                    compatibilityPolarity:
                        "SUPPORT",

                    evaluationStatus:
                        "EVALUATED",

                    functionalMatchId:
                        "MATCH-A-B",

                    needId:
                        "NEED-A",

                    contributionId:
                        "CONTRIBUTION-ERC-1002",

                    contributionKind:
                        "CAPABILITY"
                },

                {
                    edgeId:
                        "EVAL-B-C",

                    candidateGraphEdgeId:
                        "GRAPH-EDGE-B-C",

                    candidateId:
                        "CANDIDATE-B-C",

                    kind:
                        "DOCUMENTARY_COMPOSITION",

                    sourceParticipantId:
                        "ERC-1002",

                    targetParticipantId:
                        "ERC-1003",

                    discoveryEvidenceIds: [
                        "DISCOVERY-B-C"
                    ],

                    compatibilityAssessmentId:
                        "ASSESS-B-C",

                    compatibilityAssessmentBasis:
                        "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS",

                    boundaryIds: [
                        "BOUNDARY-B",
                        "BOUNDARY-C"
                    ],

                    compatibilityEvidenceIds: [
                        "COMPAT-B-2"
                    ],

                    compatibilityPolarity:
                        "CHALLENGE",

                    evaluationStatus:
                        "EVALUATED",

                    documentaryCandidateId:
                        "DOC-B-C",

                    relation:
                        "COMPOSES_WITH"
                }

            ],

            statistics: {

                nodes:
                    3,

                evaluatedCandidateEdges:
                    2,

                supportedCandidateEdges:
                    1,

                challengedCandidateEdges:
                    1,

                inconclusiveCandidateEdges:
                    0,

                functionalCandidateEdges:
                    1,

                documentaryCandidateEdges:
                    1

            }

        },

        errors:
            []

    };


const complementarity:
    any = {

        matches:
            [],

        unresolvedNeedIds: [
            "NEED-C",
            "NEED-OUTSIDE-SET"
        ],

        objectiveCoverage:
            [],

        errors:
            []

    };


const engine =
    new ScientificCompositionEnvelopeEngine();


const primary =
    engine.build({

        compositionSets,

        profiles,

        candidateCompatibility,

        candidateEvaluationGraph,

        complementarity

    });


console.log(
    "\nSCIENTIFIC COMPOSITION ENVELOPE — RUNTIME"
);
console.log(
    "------------------------------------------"
);


check(
    "VALID ENVELOPE BUILD HAS NO ERRORS",
    primary.errors.length ===
        0
);


check(
    "ONE THREE-PROTOCOL SET PRODUCES ONE ENVELOPE",
    primary.envelopes.length ===
        1 &&
    primary.envelopes[0].statistics.participants ===
        3
);


const envelope =
    primary.envelopes[0];


check(
    "ENVELOPE PRESERVES BOTH CANDIDATE RELATIONS",
    envelope.relations.length ===
        2
);


check(
    "ENVELOPE PRESERVES THREE PARTICIPANT CONTRIBUTIONS",
    envelope.statistics.contributions ===
        3
);


check(
    "ENVELOPE PRESERVES THREE KNOWN BOUNDARIES",
    envelope.statistics.knownBoundaries ===
        3
);


check(
    "ONLY IN-SET UNRESOLVED NEED IS PRESERVED",
    JSON.stringify(
        envelope.unresolvedNeedIds
    ) ===
        JSON.stringify([
            "NEED-C"
        ])
);


const boundaryA =
    envelope.boundaryRegions.find(
        region =>
            region.boundaryId ===
            "BOUNDARY-A"
    );


check(
    "PRESERVED BOUNDARY REGION IS REPRESENTED",
    boundaryA
        ?.candidateEvidenceStatus ===
        "PRESERVED_IN_CANDIDATE_EVIDENCE"
);


const boundaryB =
    envelope.boundaryRegions.find(
        region =>
            region.boundaryId ===
            "BOUNDARY-B"
    );


check(
    "VIOLATION DOMINATES MULTIPLE CANDIDATE BOUNDARY EVALUATIONS",
    boundaryB
        ?.candidateEvidenceStatus ===
        "VIOLATED_IN_CANDIDATE_EVIDENCE" &&
    boundaryB.candidateEvaluations.length ===
        2
);


const boundaryC =
    envelope.boundaryRegions.find(
        region =>
            region.boundaryId ===
            "BOUNDARY-C"
    );


check(
    "UNEVALUATED BOUNDARY REGION REMAINS UNEVALUATED",
    boundaryC
        ?.candidateEvidenceStatus ===
        "UNEVALUATED_IN_CANDIDATE_EVIDENCE"
);


check(
    "ENVELOPE STATISTICS DISTINGUISH BOUNDARY REGIONS",
    envelope.statistics.preservedBoundaryRegions ===
        1 &&
    envelope.statistics.violatedBoundaryRegions ===
        1 &&
    envelope.statistics.unevaluatedBoundaryRegions ===
        1
);


check(
    "ENVELOPE PRESERVES RELATION POLARITIES WITHOUT GLOBAL POLARITY",
    envelope.statistics.supportedRelations ===
        1 &&
    envelope.statistics.challengedRelations ===
        1 &&
    envelope.statistics.inconclusiveRelations ===
        0 &&
    !(
        "scientificPolarity" in
        envelope
    )
);


check(
    "ENVELOPE MAKES NO HARMONY CLAIM",
    envelope.assemblyStatus ===
        "ASSEMBLED" &&
    !(
        "harmony" in
        envelope
    ) &&
    !(
        "compatible" in
        envelope
    )
);


check(
    "ISOLATED PARTICIPANTS REMAIN OUTSIDE ENVELOPES",
    JSON.stringify(
        primary.isolatedParticipantIds
    ) ===
        JSON.stringify([
            "ERC-9000"
        ])
);


const noBoundariesProfiles =
    profiles.map(
        profile => ({

            ...profile,

            boundaries:
                []

        })
    );


const noBoundariesCompatibility =
    {

        assessments:
            candidateCompatibility.assessments.map(
                (assessment: any) => ({

                    ...assessment,

                    boundaryEvaluations:
                        [],

                    statistics: {

                        total:
                            0,

                        preserved:
                            0,

                        violated:
                            0,

                        unevaluated:
                            0

                    },

                    scientificPolarity:
                        "INCONCLUSIVE"

                })
            ),

        errors:
            []

    };


const noBoundariesGraph =
    {

        graph: {

            ...candidateEvaluationGraph.graph,

            edges:
                candidateEvaluationGraph.graph.edges.map(
                    (edge: any) => ({

                        ...edge,

                        boundaryIds:
                            [],

                        compatibilityEvidenceIds:
                            [],

                        compatibilityPolarity:
                            "INCONCLUSIVE"

                    })
                )

        },

        errors:
            []

    };


const noBoundaries =
    engine.build({

        compositionSets,

        profiles:
            noBoundariesProfiles,

        candidateCompatibility:
            noBoundariesCompatibility,

        candidateEvaluationGraph:
            noBoundariesGraph,

        complementarity

    });


check(
    "ZERO KNOWN BOUNDARIES DOES NOT BECOME SUPPORT",
    noBoundaries.errors.length ===
        0 &&
    noBoundaries.envelopes[0]
        .statistics
        .relationsWithoutKnownBoundaries ===
        2 &&
    noBoundaries.envelopes[0]
        .relations
        .every(
            relation =>
                relation.boundaryCoverage ===
                    "NO_KNOWN_BOUNDARIES" &&
                relation.compatibilityPolarity ===
                    "INCONCLUSIVE"
        )
);


const missingEvaluationGraph =
    {

        graph: {

            ...candidateEvaluationGraph.graph,

            edges:
                [
                    candidateEvaluationGraph.graph.edges[0]
                ]

        },

        errors:
            []

    };


const missingEvaluation =
    engine.build({

        compositionSets,

        profiles,

        candidateCompatibility,

        candidateEvaluationGraph:
            missingEvaluationGraph,

        complementarity

    });


check(
    "MISSING CANDIDATE EVALUATION IS DETECTED",
    missingEvaluation.errors.length >
        0
);


check(
    "MISSING CANDIDATE EVALUATION FAILS CLOSED",
    missingEvaluation.envelopes.length ===
        0
);


const reverse =
    engine.build({

        compositionSets: {

            ...compositionSets,

            sets:
                [...compositionSets.sets]
                    .reverse()
                    .map(
                        (set: any) => ({

                            ...set,

                            participants:
                                [...set.participants]
                                    .reverse(),

                            participantIds:
                                [...set.participantIds]
                                    .reverse(),

                            relations:
                                [...set.relations]
                                    .reverse()

                        })
                    )

        },

        profiles:
            [...profiles]
                .reverse(),

        candidateCompatibility: {

            ...candidateCompatibility,

            assessments:
                [...candidateCompatibility.assessments]
                    .reverse()

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

            unresolvedNeedIds:
                [...complementarity.unresolvedNeedIds]
                    .reverse()

        }

    });


check(
    "COMPOSITION ENVELOPE BUILD IS DETERMINISTIC",
    JSON.stringify(
        primary
    ) ===
        JSON.stringify(
            reverse
        )
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