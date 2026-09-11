import {
    ScientificCompositionCandidateEvidenceGapEngine
} from "../laboratory/scientific-composition-candidate-evidence-gap/ScientificCompositionCandidateEvidenceGapEngine.js";

import type {
    ScientificCompositionCandidateEvaluationGraphResult
} from "../laboratory/scientific-composition-candidate-evaluation-graph/ScientificCompositionCandidateEvaluationGraph.js";

import type {
    ScientificCompositionCandidateCompatibilityResult
} from "../laboratory/scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityAssessment.js";


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


const evaluationGraph:
    ScientificCompositionCandidateEvaluationGraphResult = {

        graph: {

            graphId:
                "EVALUATION-GRAPH",

            candidateGraphId:
                "CANDIDATE-GRAPH",

            objectiveId:
                "OBJECTIVE-1",

            nodes: [

                {
                    participantId:
                        "ERC-8301",

                    profileId:
                        "PROFILE-8301",

                    sourceId:
                        "SOURCE-AGENTS"
                },

                {
                    participantId:
                        "ERC-8354",

                    profileId:
                        "PROFILE-8354",

                    sourceId:
                        "SOURCE-AGENTS"
                },

                {
                    participantId:
                        "ERC-8004",

                    profileId:
                        "PROFILE-8004",

                    sourceId:
                        "SOURCE-8004"
                },

                {
                    participantId:
                        "ERC-9000",

                    profileId:
                        "PROFILE-9000",

                    sourceId:
                        "SOURCE-9000"
                },

                {
                    participantId:
                        "ERC-7000",

                    profileId:
                        "PROFILE-7000",

                    sourceId:
                        "SOURCE-7000"
                },

                {
                    participantId:
                        "ERC-7001",

                    profileId:
                        "PROFILE-7001",

                    sourceId:
                        "SOURCE-7001"
                }

            ],

            edges: [

                {
                    edgeId:
                        "EDGE-DOCUMENTARY",

                    candidateGraphEdgeId:
                        "DISCOVERY-DOCUMENTARY",

                    candidateId:
                        "CANDIDATE-DOCUMENTARY",

                    kind:
                        "DOCUMENTARY_COMPOSITION",

                    sourceParticipantId:
                        "ERC-8301",

                    targetParticipantId:
                        "ERC-8354",

                    documentaryCandidateId:
                        "DOCUMENTARY-1",

                    relation:
                        "COMPOSES_WITH",

                    discoveryEvidenceIds: [
                        "DISCOVERY-DOC"
                    ],

                    compatibilityAssessmentId:
                        "ASSESSMENT-DOCUMENTARY",

                    compatibilityAssessmentBasis:
                        "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS",

                    boundaryIds:
                        [],

                    compatibilityEvidenceIds:
                        [],

                    compatibilityPolarity:
                        "INCONCLUSIVE",

                    evaluationStatus:
                        "EVALUATED"
                },

                {
                    edgeId:
                        "EDGE-PARTIAL",

                    candidateGraphEdgeId:
                        "DISCOVERY-PARTIAL",

                    candidateId:
                        "CANDIDATE-PARTIAL",

                    kind:
                        "FUNCTIONAL_COMPLEMENTARITY",

                    sourceParticipantId:
                        "ERC-8004",

                    targetParticipantId:
                        "ERC-9000",

                    functionalMatchId:
                        "MATCH-PARTIAL",

                    needId:
                        "NEED-PARTIAL",

                    contributionId:
                        "CONTRIBUTION-PARTIAL",

                    contributionKind:
                        "CAPABILITY",

                    discoveryEvidenceIds: [
                        "DISCOVERY-PARTIAL"
                    ],

                    compatibilityAssessmentId:
                        "ASSESSMENT-PARTIAL",

                    compatibilityAssessmentBasis:
                        "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS",

                    boundaryIds: [
                        "BOUNDARY-A",
                        "BOUNDARY-B"
                    ],

                    compatibilityEvidenceIds: [
                        "EVIDENCE-A"
                    ],

                    compatibilityPolarity:
                        "INCONCLUSIVE",

                    evaluationStatus:
                        "EVALUATED"
                },

                {
                    edgeId:
                        "EDGE-SUPPORT",

                    candidateGraphEdgeId:
                        "DISCOVERY-SUPPORT",

                    candidateId:
                        "CANDIDATE-SUPPORT",

                    kind:
                        "FUNCTIONAL_COMPLEMENTARITY",

                    sourceParticipantId:
                        "ERC-7000",

                    targetParticipantId:
                        "ERC-7001",

                    functionalMatchId:
                        "MATCH-SUPPORT",

                    needId:
                        "NEED-SUPPORT",

                    contributionId:
                        "CONTRIBUTION-SUPPORT",

                    contributionKind:
                        "CAPABILITY",

                    discoveryEvidenceIds: [
                        "DISCOVERY-SUPPORT"
                    ],

                    compatibilityAssessmentId:
                        "ASSESSMENT-SUPPORT",

                    compatibilityAssessmentBasis:
                        "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS",

                    boundaryIds: [
                        "BOUNDARY-SUPPORT-A",
                        "BOUNDARY-SUPPORT-B"
                    ],

                    compatibilityEvidenceIds: [
                        "EVIDENCE-SUPPORT-A",
                        "EVIDENCE-SUPPORT-B"
                    ],

                    compatibilityPolarity:
                        "SUPPORT",

                    evaluationStatus:
                        "EVALUATED"
                }

            ],

            statistics: {

                nodes:
                    6,

                evaluatedCandidateEdges:
                    3,

                supportedCandidateEdges:
                    1,

                challengedCandidateEdges:
                    0,

                inconclusiveCandidateEdges:
                    2,

                functionalCandidateEdges:
                    2,

                documentaryCandidateEdges:
                    1

            }

        },

        errors:
            []

    };


const compatibility:
    ScientificCompositionCandidateCompatibilityResult = {

        assessments: [

            {
                assessmentId:
                    "ASSESSMENT-DOCUMENTARY",

                candidateId:
                    "CANDIDATE-DOCUMENTARY",

                candidateKind:
                    "DOCUMENTARY_COMPOSITION",

                sourceParticipantId:
                    "ERC-8301",

                targetParticipantId:
                    "ERC-8354",

                assessmentBasis:
                    "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS",

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
            },

            {
                assessmentId:
                    "ASSESSMENT-PARTIAL",

                candidateId:
                    "CANDIDATE-PARTIAL",

                candidateKind:
                    "FUNCTIONAL_COMPLEMENTARITY",

                sourceParticipantId:
                    "ERC-8004",

                targetParticipantId:
                    "ERC-9000",

                assessmentBasis:
                    "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS",

                boundaryEvaluations: [

                    {
                        boundaryId:
                            "BOUNDARY-A",

                        participantId:
                            "ERC-8004",

                        status:
                            "PRESERVED",

                        observationIds: [
                            "OBS-A"
                        ],

                        evidenceIds: [
                            "EVIDENCE-A"
                        ]
                    },

                    {
                        boundaryId:
                            "BOUNDARY-B",

                        participantId:
                            "ERC-9000",

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
                        1,

                    violated:
                        0,

                    unevaluated:
                        1

                },

                scientificPolarity:
                    "INCONCLUSIVE"
            },

            {
                assessmentId:
                    "ASSESSMENT-SUPPORT",

                candidateId:
                    "CANDIDATE-SUPPORT",

                candidateKind:
                    "FUNCTIONAL_COMPLEMENTARITY",

                sourceParticipantId:
                    "ERC-7000",

                targetParticipantId:
                    "ERC-7001",

                assessmentBasis:
                    "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS",

                boundaryEvaluations: [

                    {
                        boundaryId:
                            "BOUNDARY-SUPPORT-A",

                        participantId:
                            "ERC-7000",

                        status:
                            "PRESERVED",

                        observationIds: [
                            "OBS-SUPPORT-A"
                        ],

                        evidenceIds: [
                            "EVIDENCE-SUPPORT-A"
                        ]
                    },

                    {
                        boundaryId:
                            "BOUNDARY-SUPPORT-B",

                        participantId:
                            "ERC-7001",

                        status:
                            "PRESERVED",

                        observationIds: [
                            "OBS-SUPPORT-B"
                        ],

                        evidenceIds: [
                            "EVIDENCE-SUPPORT-B"
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
            }

        ],

        errors:
            []

    };


const engine =
    new ScientificCompositionCandidateEvidenceGapEngine();


const primary =
    engine.diagnose({

        evaluationGraph,

        compatibility

    });


console.log(
    "\nSCIENTIFIC COMPOSITION CANDIDATE EVIDENCE GAP — RUNTIME"
);
console.log(
    "------------------------------------------------------"
);


check(
    "VALID EVIDENCE GAP DIAGNOSIS HAS NO ERRORS",
    primary.errors.length ===
        0
);


check(
    "EVERY EVALUATED CANDIDATE RECEIVES A DIAGNOSTIC",
    primary.diagnostics.length ===
        3
);


const documentary =
    primary.diagnostics.find(
        diagnostic =>
            diagnostic.candidateId ===
            "CANDIDATE-DOCUMENTARY"
    );


const partial =
    primary.diagnostics.find(
        diagnostic =>
            diagnostic.candidateId ===
            "CANDIDATE-PARTIAL"
    );


const supported =
    primary.diagnostics.find(
        diagnostic =>
            diagnostic.candidateId ===
            "CANDIDATE-SUPPORT"
    );


check(
    "ZERO-BOUNDARY DOCUMENTARY CANDIDATE REPORTS NO KNOWN BOUNDARIES",
    documentary?.gaps.some(
        gap =>
            gap.kind ===
            "NO_KNOWN_BOUNDARIES"
    ) ===
        true
);


check(
    "ZERO-BOUNDARY DOCUMENTARY CANDIDATE REPORTS NO COMPATIBILITY OBSERVATIONS",
    documentary?.gaps.some(
        gap =>
            gap.kind ===
            "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS"
    ) ===
        true
);


check(
    "ZERO-BOUNDARY DOCUMENTARY CANDIDATE REQUIRES ADDITIONAL EVIDENCE",
    documentary?.resolution ===
        "REQUIRES_ADDITIONAL_EVIDENCE"
);


check(
    "DOCUMENTARY DISCOVERY DOES NOT BECOME COMPATIBILITY EVIDENCE",
    documentary?.compatibilityEvidenceIds.length ===
        0
);


check(
    "PARTIALLY OBSERVED CANDIDATE REPORTS UNEVALUATED BOUNDARY",
    JSON.stringify(
        partial?.unevaluatedBoundaryIds
    ) ===
        JSON.stringify([
            "BOUNDARY-B"
        ]) &&
    partial?.gaps.some(
        gap =>
            gap.kind ===
            "UNEVALUATED_KNOWN_BOUNDARIES" &&
            JSON.stringify(
                gap.boundaryIds
            ) ===
                JSON.stringify([
                    "BOUNDARY-B"
                ])
    ) ===
        true
);


check(
    "PARTIAL OBSERVATIONS DO NOT PRODUCE NO-OBSERVATION GAP",
    partial?.gaps.some(
        gap =>
            gap.kind ===
            "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS"
    ) ===
        false
);


check(
    "PARTIAL CANDIDATE REMAINS ADDITIONAL-EVIDENCE REQUIRED",
    partial?.resolution ===
        "REQUIRES_ADDITIONAL_EVIDENCE"
);


check(
    "SUPPORTED KNOWN BOUNDARY PRESERVATION HAS NO EVIDENCE GAP",
    supported?.gaps.length ===
        0
);


check(
    "SUPPORTED RESULT IS EXPLICITLY LIMITED TO KNOWN BOUNDARY PRESERVATION",
    supported?.resolution ===
        "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED"
);


const missingAssessment =
    engine.diagnose({

        evaluationGraph,

        compatibility: {

            assessments:
                compatibility.assessments.slice(
                    0,
                    2
                ),

            errors:
                []

        }

    });


check(
    "MISSING COMPATIBILITY ASSESSMENT IS DETECTED",
    missingAssessment.errors.length >
        0
);


check(
    "MISSING COMPATIBILITY ASSESSMENT FAILS CLOSED",
    missingAssessment.diagnostics.length ===
        0
);


const polarityMismatch =
    engine.diagnose({

        evaluationGraph,

        compatibility: {

            assessments: [

                {
                    ...compatibility.assessments[0],

                    scientificPolarity:
                        "SUPPORT"
                },

                compatibility.assessments[1],
                compatibility.assessments[2]

            ],

            errors:
                []

        }

    });


check(
    "POLARITY MISMATCH IS DETECTED",
    polarityMismatch.errors.length >
        0
);


check(
    "POLARITY MISMATCH FAILS CLOSED",
    polarityMismatch.diagnostics.length ===
        0
);


const statisticsMismatch =
    engine.diagnose({

        evaluationGraph,

        compatibility: {

            assessments: [

                compatibility.assessments[0],

                {
                    ...compatibility.assessments[1],

                    statistics: {

                        ...compatibility.assessments[1]
                            .statistics,

                        unevaluated:
                            0

                    }

                },

                compatibility.assessments[2]

            ],

            errors:
                []

        }

    });


check(
    "INCONSISTENT COMPATIBILITY STATISTICS ARE DETECTED",
    statisticsMismatch.errors.length >
        0
);


check(
    "INCONSISTENT COMPATIBILITY STATISTICS FAIL CLOSED",
    statisticsMismatch.diagnostics.length ===
        0
);


const reverse =
    engine.diagnose({

        evaluationGraph:
            evaluationGraph.graph ===
                null
                ? evaluationGraph
                : {

                    graph: {

                        ...evaluationGraph.graph,

                        nodes:
                            [...evaluationGraph.graph.nodes]
                                .reverse(),

                        edges:
                            [...evaluationGraph.graph.edges]
                                .reverse()

                    },

                    errors:
                        []

                },

        compatibility: {

            assessments:
                [...compatibility.assessments]
                    .reverse(),

            errors:
                []

        }

    });


check(
    "EVIDENCE GAP DIAGNOSIS IS DETERMINISTIC",
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