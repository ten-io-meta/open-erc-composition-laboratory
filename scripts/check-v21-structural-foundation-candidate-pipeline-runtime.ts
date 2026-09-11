import {
    ScientificCompositionCandidateSetEngine
} from "../laboratory/scientific-composition-candidate-set/ScientificCompositionCandidateSetEngine.js";

import {
    ScientificCompositionCandidateGraphEngine
} from "../laboratory/scientific-composition-candidate-graph/ScientificCompositionCandidateGraphEngine.js";

import {
    ScientificCompositionCandidateCompatibilityEngine
} from "../laboratory/scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityEngine.js";

import {
    ScientificCompositionCandidateEvaluationGraphEngine
} from "../laboratory/scientific-composition-candidate-evaluation-graph/ScientificCompositionCandidateEvaluationGraphEngine.js";

import {
    ScientificCompositionCandidateEvidenceGapEngine
} from "../laboratory/scientific-composition-candidate-evidence-gap/ScientificCompositionCandidateEvidenceGapEngine.js";

import type {
    ScientificCompositionCandidateBoundaryObservation
} from "../laboratory/scientific-composition-candidate-compatibility/ScientificCompositionCandidateBoundaryObservation.js";

import type {
    ScientificStructuralFoundationCompositionCandidate
} from "../laboratory/scientific-structural-foundation-candidate/ScientificStructuralFoundationCompositionCandidate.js";


let pass = 0;
let fail = 0;


function check(
    name: string,
    condition: boolean
): void {

    console.log(
        `${name}: ${condition ? "PASS" : "FAIL"}`
    );

    condition
        ? pass++
        : fail++;

}


function structuralCandidate():
    ScientificStructuralFoundationCompositionCandidate {

    return {

        candidateId:
            "STRUCTURAL-8004-8060",

        sourceCandidateId:
            "CROSS-PROTOCOL-8004-8060",

        participantAId:
            "ERC-8004",

        participantBId:
            "ERC-8060",

        directionality:
            "UNDIRECTED",

        mechanism:
            "SHARED_PROTOCOL_FOUNDATION",

        foundationProtocolId:
            "ERC-721",

        evidenceIds: [
            "FOUNDATION-EVIDENCE-8004",
            "FOUNDATION-EVIDENCE-8060"
        ],

        provenance: [
            {
                kind:
                    "STRUCTURAL_PROTOCOL_RELATION",

                sourceId:
                    "SOURCE-8004",

                sourceRevision:
                    "REV-8004",

                evidenceId:
                    "FOUNDATION-EVIDENCE-8004"
            },
            {
                kind:
                    "STRUCTURAL_PROTOCOL_RELATION",

                sourceId:
                    "SOURCE-8060",

                sourceRevision:
                    "REV-8060",

                evidenceId:
                    "FOUNDATION-EVIDENCE-8060"
            }
        ],

        evaluationStatus:
            "UNEVALUATED"

    };

}


const candidateSet =
    new ScientificCompositionCandidateSetEngine()
        .build({

            participantIds: [
                "ERC-8004",
                "ERC-8060"
            ],

            functionalMatches:
                [],

            documentaryCandidates:
                [],

            structuralFoundationCandidates: [
                structuralCandidate()
            ]

        });


if (candidateSet.errors.length > 0) {
    throw new Error(candidateSet.errors.join("\n"));
}


const candidate =
    candidateSet.candidates[0];


const candidateGraph =
    new ScientificCompositionCandidateGraphEngine()
        .build({

            objective: {

                objectiveId:
                    "V21-STRUCTURAL-FOUNDATION-CONTROL",

                description:
                    "Evaluate structural foundation without manufacturing functional composition.",

                requiredSubjects:
                    []

            },

            profiles: [
                {
                    protocolId:
                        "ERC-8004",

                    profileId:
                        "PROFILE-8004",

                    sourceId:
                        "SOURCE-8004",

                    sourceRevision:
                        "REV-8004"
                },
                {
                    protocolId:
                        "ERC-8060",

                    profileId:
                        "PROFILE-8060",

                    sourceId:
                        "SOURCE-8060",

                    sourceRevision:
                        "REV-8060"
                }
            ],

            candidateSet

        });


if (
    candidateGraph.errors.length > 0 ||
    candidateGraph.graph === null
) {
    throw new Error(
        candidateGraph.errors.join("\n") ||
        "Candidate graph is null."
    );
}


check(
    "STRUCTURAL FOUNDATION REACHES CANDIDATE GRAPH",
    candidateGraph.graph.edges.length === 1 &&
    candidateGraph.graph.edges[0].kind ===
        "STRUCTURAL_FOUNDATION"
);


check(
    "CANDIDATE GRAPH COUNTS STRUCTURAL FOUNDATION",
    candidateGraph.graph.statistics
        .structuralFoundationCandidateEdges === 1 &&
    candidateGraph.graph.statistics
        .functionalCandidateEdges === 0
);


const profiles = [
    {
        protocolId:
            "ERC-8004",

        boundaries: [
            {
                boundaryId:
                    "BOUNDARY-8004",

                participantId:
                    "ERC-8004"
            }
        ]
    },
    {
        protocolId:
            "ERC-8060",

        boundaries: [
            {
                boundaryId:
                    "BOUNDARY-8060",

                participantId:
                    "ERC-8060"
            }
        ]
    }
];


function evaluate(
    observations:
        ScientificCompositionCandidateBoundaryObservation[]
) {

    const compatibility =
        new ScientificCompositionCandidateCompatibilityEngine()
            .evaluate({

                profiles,

                candidateSet,

                observations

            });


    if (compatibility.errors.length > 0) {
        throw new Error(
            compatibility.errors.join("\n")
        );
    }


    const evaluationGraph =
        new ScientificCompositionCandidateEvaluationGraphEngine()
            .build({

                candidateGraph,

                compatibility

            });


    if (
        evaluationGraph.errors.length > 0 ||
        evaluationGraph.graph === null
    ) {
        throw new Error(
            evaluationGraph.errors.join("\n") ||
            "Evaluation graph is null."
        );
    }


    const gaps =
        new ScientificCompositionCandidateEvidenceGapEngine()
            .diagnose({

                evaluationGraph,

                compatibility

            });


    if (gaps.errors.length > 0) {
        throw new Error(
            gaps.errors.join("\n")
        );
    }


    return {
        compatibility,
        evaluationGraph,
        gaps
    };

}


console.log("");
console.log(
    "V2.1 STRUCTURAL FOUNDATION SCIENTIFIC PIPELINE"
);
console.log(
    "==============================================="
);


// INCONCLUSIVE CASE

const inconclusive =
    evaluate([]);


const inconclusiveAssessment =
    inconclusive.compatibility.assessments[0];

const inconclusiveEdge =
    inconclusive.evaluationGraph.graph!.edges[0];

const inconclusiveDiagnostic =
    inconclusive.gaps.diagnostics[0];


check(
    "NO OBSERVATIONS -> INCONCLUSIVE",
    inconclusiveAssessment.scientificPolarity ===
        "INCONCLUSIVE"
);


check(
    "STRUCTURAL KIND SURVIVES EVALUATION GRAPH",
    inconclusiveEdge.kind ===
        "STRUCTURAL_FOUNDATION"
);


check(
    "UNDIRECTED FOUNDATION SURVIVES EVALUATION GRAPH",
    inconclusiveEdge.kind ===
        "STRUCTURAL_FOUNDATION" &&
    inconclusiveEdge.directionality ===
        "UNDIRECTED" &&
    inconclusiveEdge.foundationProtocolId ===
        "ERC-721"
);


check(
    "MISSING OBSERVATIONS PRODUCE EVIDENCE GAP",
    inconclusiveDiagnostic.gaps.some(
        gap =>
            gap.kind ===
            "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS"
    )
);


// SUPPORT CASE — candidate-level boundary preservation only

const supported =
    evaluate([
        {
            observationId:
                "OBS-8004-PRESERVED",

            candidateId:
                candidate.candidateId,

            boundaryId:
                "BOUNDARY-8004",

            verdict:
                "PRESERVED",

            evidenceIds: [
                "OBS-EVIDENCE-8004"
            ]
        },
        {
            observationId:
                "OBS-8060-PRESERVED",

            candidateId:
                candidate.candidateId,

            boundaryId:
                "BOUNDARY-8060",

            verdict:
                "PRESERVED",

            evidenceIds: [
                "OBS-EVIDENCE-8060"
            ]
        }
    ]);


check(
    "ALL KNOWN BOUNDARIES PRESERVED -> CANDIDATE SUPPORT",
    supported.compatibility.assessments[0]
        .scientificPolarity ===
        "SUPPORT"
);


check(
    "SUPPORT MEANS BOUNDARY PRESERVATION ONLY",
    supported.gaps.diagnostics[0]
        .resolution ===
        "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED"
);


// CHALLENGE CASE

const challenged =
    evaluate([
        {
            observationId:
                "OBS-8004-PRESERVED",

            candidateId:
                candidate.candidateId,

            boundaryId:
                "BOUNDARY-8004",

            verdict:
                "PRESERVED",

            evidenceIds: [
                "OBS-EVIDENCE-8004"
            ]
        },
        {
            observationId:
                "OBS-8060-VIOLATED",

            candidateId:
                candidate.candidateId,

            boundaryId:
                "BOUNDARY-8060",

            verdict:
                "VIOLATED",

            evidenceIds: [
                "OBS-EVIDENCE-8060-VIOLATION"
            ]
        }
    ]);


check(
    "ONE OBSERVED VIOLATION -> CHALLENGE",
    challenged.compatibility.assessments[0]
        .scientificPolarity ===
        "CHALLENGE"
);


check(
    "CHALLENGE RESOLUTION IS PRESERVED",
    challenged.gaps.diagnostics[0]
        .resolution ===
        "BOUNDARY_CHALLENGED"
);


// CRITICAL SCIENTIFIC INVARIANT

check(
    "SHARED ERC-721 FOUNDATION ALONE NEVER PRODUCES SUPPORT",
    inconclusiveAssessment.scientificPolarity !==
        "SUPPORT"
);


const serializedDiscovery =
    JSON.stringify({
        candidateSet,
        candidateGraph
    });


check(
    "DISCOVERY LAYERS CONTAIN NO SCIENTIFIC POLARITY",
    !serializedDiscovery.includes('"SUPPORT"') &&
    !serializedDiscovery.includes('"CHALLENGE"') &&
    !serializedDiscovery.includes('"INCONCLUSIVE"')
);


console.log("");
console.log(
    `candidate:  ${candidate.candidateId}`
);
console.log(
    "foundation: ERC-721"
);
console.log(
    "direction:  UNDIRECTED"
);
console.log("");
console.log(
    `PASS: ${pass}`
);
console.log(
    `FAIL: ${fail}`
);
console.log(
    `RESULT: ${fail === 0 ? "PASS" : "FAIL"}`
);


if (fail > 0) {
    process.exitCode = 1;
}