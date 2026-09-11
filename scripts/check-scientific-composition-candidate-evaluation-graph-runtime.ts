import {
    ScientificCompositionCandidateEvaluationGraphEngine
} from "../laboratory/scientific-composition-candidate-evaluation-graph/ScientificCompositionCandidateEvaluationGraphEngine.js";

import type {
    ScientificCompositionCandidateGraphResult
} from "../laboratory/scientific-composition-candidate-graph/ScientificCompositionCandidateGraph.js";

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


const candidateGraph:
    ScientificCompositionCandidateGraphResult = {

        graph: {

            graphId:
                "CANDIDATE-GRAPH",

            objectiveId:
                "OBJECTIVE-1",

            nodes: [

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
                }

            ],

            edges: [

                {
                    edgeId:
                        "DISCOVERY-EDGE-FUNCTIONAL",

                    candidateId:
                        "CANDIDATE-FUNCTIONAL",

                    kind:
                        "FUNCTIONAL_COMPLEMENTARITY",

                    sourceParticipantId:
                        "ERC-8004",

                    targetParticipantId:
                        "ERC-9000",

                    functionalMatchId:
                        "MATCH-1",

                    needId:
                        "NEED-1",

                    needSubject:
                        "INTERFACE_MEMBER:ITest.verify",

                    contributionId:
                        "CONTRIBUTION-1",

                    contributionKind:
                        "CAPABILITY",

                    contributionSubject:
                        "INTERFACE_MEMBER:ITest.verify",

                    evidenceIds: [
                        "DISCOVERY-FUNCTIONAL"
                    ],

                    evaluationStatus:
                        "UNEVALUATED"
                },

                {
                    edgeId:
                        "DISCOVERY-EDGE-DOCUMENTARY",

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

                    evidenceIds: [
                        "DISCOVERY-DOC"
                    ],

                    evaluationStatus:
                        "UNEVALUATED"
                }

            ],

            statistics: {

                nodes:
                    4,

                candidateEdges:
                    2,

                functionalCandidateEdges:
                    1,

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
                    "ASSESSMENT-FUNCTIONAL",

                candidateId:
                    "CANDIDATE-FUNCTIONAL",

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
                            "COMPAT-A"
                        ]
                    },

                    {
                        boundaryId:
                            "BOUNDARY-B",

                        participantId:
                            "ERC-9000",

                        status:
                            "PRESERVED",

                        observationIds: [
                            "OBS-B"
                        ],

                        evidenceIds: [
                            "COMPAT-B"
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
            }

        ],

        errors:
            []

    };


const engine =
    new ScientificCompositionCandidateEvaluationGraphEngine();


const primary =
    engine.build({

        candidateGraph,

        compatibility

    });


console.log(
    "\nSCIENTIFIC COMPOSITION CANDIDATE EVALUATION GRAPH — RUNTIME"
);
console.log(
    "----------------------------------------------------------"
);


check(
    "VALID EVALUATION GRAPH HAS NO ERRORS",
    primary.errors.length ===
        0
);


check(
    "VALID EVALUATION GRAPH EXISTS",
    primary.graph !==
        null
);


check(
    "ALL CANDIDATE GRAPH NODES ARE PRESERVED",
    primary.graph?.nodes.length ===
        4
);


check(
    "EVERY CANDIDATE RECEIVES ONE EVALUATED EDGE",
    primary.graph?.edges.length ===
        2
);


const functional =
    primary.graph
        ?.edges
        .find(
            edge =>
                edge.candidateId ===
                "CANDIDATE-FUNCTIONAL"
        );


const documentary =
    primary.graph
        ?.edges
        .find(
            edge =>
                edge.candidateId ===
                "CANDIDATE-DOCUMENTARY"
        );


check(
    "FUNCTIONAL SUPPORT IS PRESERVED AS BOUNDARY COMPATIBILITY",
    functional?.kind ===
        "FUNCTIONAL_COMPLEMENTARITY" &&
    functional.compatibilityPolarity ===
        "SUPPORT"
);


check(
    "DOCUMENTARY INCONCLUSIVE RESULT IS PRESERVED",
    documentary?.kind ===
        "DOCUMENTARY_COMPOSITION" &&
    documentary.compatibilityPolarity ===
        "INCONCLUSIVE" &&
    documentary.relation ===
        "COMPOSES_WITH"
);


check(
    "EVALUATED DOES NOT MEAN SUPPORT",
    documentary?.evaluationStatus ===
        "EVALUATED" &&
    documentary.compatibilityPolarity ===
        "INCONCLUSIVE"
);


check(
    "DISCOVERY AND COMPATIBILITY EVIDENCE REMAIN SEPARATE",
    documentary !==
        undefined &&
    JSON.stringify(
        documentary.discoveryEvidenceIds
    ) ===
        JSON.stringify([
            "DISCOVERY-DOC"
        ]) &&
    JSON.stringify(
        documentary.compatibilityEvidenceIds
    ) ===
        JSON.stringify([])
);


check(
    "FUNCTIONAL COMPATIBILITY EVIDENCE IS PRESERVED",
    functional !==
        undefined &&
    JSON.stringify(
        functional.compatibilityEvidenceIds
    ) ===
        JSON.stringify([
            "COMPAT-A",
            "COMPAT-B"
        ])
);


check(
    "STATISTICS DISTINGUISH SUPPORT AND INCONCLUSIVE",
    primary.graph?.statistics.supportedCandidateEdges ===
        1 &&
    primary.graph.statistics.inconclusiveCandidateEdges ===
        1 &&
    primary.graph.statistics.challengedCandidateEdges ===
        0
);


check(
    "GRAPH MAKES NO GLOBAL SCIENTIFIC POLARITY CLAIM",
    primary.graph !==
        null &&
    !(
        "scientificPolarity" in
        primary.graph
    )
);


const missingAssessment =
    engine.build({

        candidateGraph,

        compatibility: {

            assessments: [
                compatibility.assessments[0]
            ],

            errors:
                []

        }

    });


check(
    "MISSING CANDIDATE ASSESSMENT IS DETECTED",
    missingAssessment.errors.length >
        0
);


check(
    "MISSING CANDIDATE ASSESSMENT FAILS CLOSED",
    missingAssessment.graph ===
        null
);


const duplicateAssessment =
    engine.build({

        candidateGraph,

        compatibility: {

            assessments: [
                ...compatibility.assessments,
                compatibility.assessments[1]
            ],

            errors:
                []

        }

    });


check(
    "DUPLICATE CANDIDATE ASSESSMENT IS DETECTED",
    duplicateAssessment.errors.length >
        0
);


check(
    "DUPLICATE CANDIDATE ASSESSMENT FAILS CLOSED",
    duplicateAssessment.graph ===
        null
);


const identityMismatch =
    engine.build({

        candidateGraph,

        compatibility: {

            assessments: [
                compatibility.assessments[0],
                {
                    ...compatibility.assessments[1],

                    targetParticipantId:
                        "ERC-9000"
                }
            ],

            errors:
                []

        }

    });


check(
    "ASSESSMENT PARTICIPANT MISMATCH IS DETECTED",
    identityMismatch.errors.length >
        0
);


check(
    "ASSESSMENT PARTICIPANT MISMATCH FAILS CLOSED",
    identityMismatch.graph ===
        null
);


const contaminated =
    engine.build({

        candidateGraph,

        compatibility: {

            assessments:
                compatibility.assessments,

            errors: [
                "UPSTREAM COMPATIBILITY ERROR"
            ]

        }

    });


check(
    "UPSTREAM COMPATIBILITY ERROR IS DETECTED",
    contaminated.errors.length >
        0
);


check(
    "UPSTREAM COMPATIBILITY ERROR FAILS CLOSED",
    contaminated.graph ===
        null
);


const reverse =
    engine.build({

        candidateGraph: {

            graph: candidateGraph.graph ===
                null
                ? null
                : {

                    ...candidateGraph.graph,

                    nodes:
                        [...candidateGraph.graph.nodes].reverse(),

                    edges:
                        [...candidateGraph.graph.edges].reverse()

                },

            errors:
                []

        },

        compatibility: {

            assessments:
                [...compatibility.assessments].reverse(),

            errors:
                []

        }

    });


check(
    "CANDIDATE EVALUATION GRAPH IS DETERMINISTIC",
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