import type {
    ScientificCompositionCandidateGraphResult
} from "../scientific-composition-candidate-graph/ScientificCompositionCandidateGraph.js";

import type {
    ScientificCompositionCandidateCompatibilityResult
} from "../scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityAssessment.js";

import type {
    ScientificCompositionCandidateEvaluationGraph,
    ScientificCompositionCandidateEvaluationGraphEdge,
    ScientificCompositionCandidateEvaluationGraphNode,
    ScientificCompositionCandidateEvaluationGraphResult
} from "./ScientificCompositionCandidateEvaluationGraph.js";


export interface ScientificCompositionCandidateEvaluationGraphEngineInput {

    candidateGraph:
        ScientificCompositionCandidateGraphResult;

    compatibility:
        ScientificCompositionCandidateCompatibilityResult;

}


function encode(
    parts:
        string[]
): string {

    return parts
        .map(
            part =>
                `${part.length}:${part}`
        )
        .join("|");

}


export class ScientificCompositionCandidateEvaluationGraphEngine {

    build(
        input:
            ScientificCompositionCandidateEvaluationGraphEngineInput
    ): ScientificCompositionCandidateEvaluationGraphResult {

        const errors:
            string[] = [];


        if (
            input.candidateGraph.errors.length >
            0
        ) {

            errors.push(
                "Cannot build candidate evaluation graph from candidate graph containing errors."
            );

        }


        if (
            input.compatibility.errors.length >
            0
        ) {

            errors.push(
                "Cannot build candidate evaluation graph from compatibility result containing errors."
            );

        }


        const candidateGraph =
            input.candidateGraph.graph;


        if (
            candidateGraph ===
            null
        ) {

            errors.push(
                "Cannot build candidate evaluation graph from a null candidate graph."
            );

        }


        if (
            errors.length >
            0 ||
            candidateGraph ===
            null
        ) {

            return {

                graph:
                    null,

                errors:
                    errors.sort()

            };

        }


        const edgesByCandidateId =
            new Map<
                string,
                typeof candidateGraph.edges
            >();


        for (
            const edge
            of candidateGraph.edges
        ) {

            const existing =
                edgesByCandidateId.get(
                    edge.candidateId
                ) ?? [];


            existing.push(
                edge
            );


            edgesByCandidateId.set(
                edge.candidateId,
                existing
            );

        }


        for (
            const [
                candidateId,
                candidateEdges
            ]
            of edgesByCandidateId
        ) {

            if (
                candidateEdges.length !==
                1
            ) {

                errors.push(
                    `Candidate ${candidateId} requires exactly one candidate graph edge.`
                );

            }

        }


        const assessmentsByCandidateId =
            new Map<
                string,
                typeof input.compatibility.assessments
            >();


        for (
            const assessment
            of input.compatibility.assessments
        ) {

            const candidateEdges =
                edgesByCandidateId.get(
                    assessment.candidateId
                );


            if (
                candidateEdges ===
                undefined
            ) {

                errors.push(
                    `Compatibility assessment ${assessment.assessmentId} references unknown candidate ${assessment.candidateId}.`
                );

            }


            const existing =
                assessmentsByCandidateId.get(
                    assessment.candidateId
                ) ?? [];


            existing.push(
                assessment
            );


            assessmentsByCandidateId.set(
                assessment.candidateId,
                existing
            );

        }


        for (
            const edge
            of candidateGraph.edges
        ) {

            const assessments =
                assessmentsByCandidateId.get(
                    edge.candidateId
                ) ?? [];


            if (
                assessments.length !==
                1
            ) {

                errors.push(
                    `Candidate ${edge.candidateId} requires exactly one compatibility assessment.`
                );

                continue;

            }


            const assessment =
                assessments[0];


            if (
                assessment.candidateKind !==
                    edge.kind
            ) {

                errors.push(
                    `Compatibility assessment ${assessment.assessmentId} candidate kind does not match ${edge.candidateId}.`
                );

            }


            if (
                assessment.sourceParticipantId !==
                    edge.sourceParticipantId ||
                assessment.targetParticipantId !==
                    edge.targetParticipantId
            ) {

                errors.push(
                    `Compatibility assessment ${assessment.assessmentId} participant identities do not match ${edge.candidateId}.`
                );

            }


            if (
                assessment.assessmentBasis !==
                    "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS"
            ) {

                errors.push(
                    `Compatibility assessment ${assessment.assessmentId} has unsupported assessment basis.`
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                graph:
                    null,

                errors:
                    errors.sort()

            };

        }


        const nodes:
            ScientificCompositionCandidateEvaluationGraphNode[] =
            candidateGraph.nodes
                .map(
                    node => ({

                        participantId:
                            node.participantId,

                        profileId:
                            node.profileId,

                        sourceId:
                            node.sourceId,

                        ...(
                            node.sourceRevision !==
                                undefined
                                ? {
                                    sourceRevision:
                                        node.sourceRevision
                                }
                                : {}
                        )

                    })
                )
                .sort(
                    (a, b) =>
                        a.participantId.localeCompare(
                            b.participantId
                        )
                );


        const edges:
            ScientificCompositionCandidateEvaluationGraphEdge[] =
            [];


        for (
            const candidateEdge
            of [...candidateGraph.edges].sort(
                (a, b) =>
                    a.candidateId.localeCompare(
                        b.candidateId
                    )
            )
        ) {

            const assessment =
                assessmentsByCandidateId.get(
                    candidateEdge.candidateId
                )![0];


            const boundaryIds =
                assessment.boundaryEvaluations
                    .map(
                        evaluation =>
                            evaluation.boundaryId
                    )
                    .sort();


            const compatibilityEvidenceIds =
                [
                    ...new Set(
                        assessment
                            .boundaryEvaluations
                            .flatMap(
                                evaluation =>
                                    evaluation.evidenceIds
                            )
                    )
                ].sort();


            const base = {

                edgeId:
                    encode([
                        "SCIENTIFIC-COMPOSITION-CANDIDATE-EVALUATION-GRAPH-EDGE",
                        candidateEdge.candidateId,
                        assessment.assessmentId
                    ]),

                candidateGraphEdgeId:
                    candidateEdge.edgeId,

                candidateId:
                    candidateEdge.candidateId,

                sourceParticipantId:
                    candidateEdge.sourceParticipantId,

                targetParticipantId:
                    candidateEdge.targetParticipantId,

                discoveryEvidenceIds:
                    [...candidateEdge.evidenceIds].sort(),

                compatibilityAssessmentId:
                    assessment.assessmentId,

                compatibilityAssessmentBasis:
                    assessment.assessmentBasis,

                boundaryIds,

                compatibilityEvidenceIds,

                compatibilityPolarity:
                    assessment.scientificPolarity,

                evaluationStatus:
                    "EVALUATED" as const

            };


            if (
                candidateEdge.kind ===
                    "FUNCTIONAL_COMPLEMENTARITY"
            ) {

                edges.push({

                    ...base,

                    kind:
                        "FUNCTIONAL_COMPLEMENTARITY",

                    functionalMatchId:
                        candidateEdge.functionalMatchId,

                    needId:
                        candidateEdge.needId,

                    contributionId:
                        candidateEdge.contributionId,

                    contributionKind:
                        candidateEdge.contributionKind

                });

            }
            else {

                edges.push({

                    ...base,

                    kind:
                        "DOCUMENTARY_COMPOSITION",

                    documentaryCandidateId:
                        candidateEdge.documentaryCandidateId,

                    relation:
                        candidateEdge.relation

                });

            }

        }


        const supportedCandidateEdges =
            edges.filter(
                edge =>
                    edge.compatibilityPolarity ===
                    "SUPPORT"
            ).length;


        const challengedCandidateEdges =
            edges.filter(
                edge =>
                    edge.compatibilityPolarity ===
                    "CHALLENGE"
            ).length;


        const inconclusiveCandidateEdges =
            edges.filter(
                edge =>
                    edge.compatibilityPolarity ===
                    "INCONCLUSIVE"
            ).length;


        const functionalCandidateEdges =
            edges.filter(
                edge =>
                    edge.kind ===
                    "FUNCTIONAL_COMPLEMENTARITY"
            ).length;


        const documentaryCandidateEdges =
            edges.filter(
                edge =>
                    edge.kind ===
                    "DOCUMENTARY_COMPOSITION"
            ).length;


        const graph:
            ScientificCompositionCandidateEvaluationGraph = {

                graphId:
                    encode([
                        "SCIENTIFIC-COMPOSITION-CANDIDATE-EVALUATION-GRAPH",
                        candidateGraph.graphId,
                        ...edges.map(
                            edge =>
                                edge.edgeId
                        )
                    ]),

                candidateGraphId:
                    candidateGraph.graphId,

                objectiveId:
                    candidateGraph.objectiveId,

                nodes,

                edges,

                statistics: {

                    nodes:
                        nodes.length,

                    evaluatedCandidateEdges:
                        edges.length,

                    supportedCandidateEdges,

                    challengedCandidateEdges,

                    inconclusiveCandidateEdges,

                    functionalCandidateEdges,

                    documentaryCandidateEdges

                }

            };


        return {

            graph,

            errors:
                []

        };

    }

}