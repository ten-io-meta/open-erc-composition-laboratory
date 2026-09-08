import type {
    ScientificCompositionCandidateEvaluationGraphResult
} from "../scientific-composition-candidate-evaluation-graph/ScientificCompositionCandidateEvaluationGraph.js";

import type {
    ScientificCompositionCandidateCompatibilityAssessment,
    ScientificCompositionCandidateCompatibilityResult
} from "../scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityAssessment.js";

import type {
    ScientificCompositionCandidateEvidenceDiagnostic,
    ScientificCompositionCandidateEvidenceGap,
    ScientificCompositionCandidateEvidenceResolution
} from "./ScientificCompositionCandidateEvidenceGap.js";

import type {
    ScientificCompositionCandidateEvidenceGapResult
} from "./ScientificCompositionCandidateEvidenceGapResult.js";


export interface ScientificCompositionCandidateEvidenceGapEngineInput {

    evaluationGraph:
        ScientificCompositionCandidateEvaluationGraphResult;

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


function sortedUnique(
    values:
        string[]
): string[] {

    return [
        ...new Set(
            values
        )
    ].sort();

}


function sameStrings(
    left:
        string[],
    right:
        string[]
): boolean {

    return JSON.stringify(
        [...left].sort()
    ) ===
        JSON.stringify(
            [...right].sort()
        );

}


export class ScientificCompositionCandidateEvidenceGapEngine {

    diagnose(
        input:
            ScientificCompositionCandidateEvidenceGapEngineInput
    ): ScientificCompositionCandidateEvidenceGapResult {

        const errors:
            string[] = [];


        if (
            input.evaluationGraph.errors.length >
            0
        ) {

            errors.push(
                "Cannot diagnose candidate evidence gaps from an evaluation graph containing errors."
            );

        }


        if (
            input.compatibility.errors.length >
            0
        ) {

            errors.push(
                "Cannot diagnose candidate evidence gaps from compatibility containing errors."
            );

        }


        const graph =
            input.evaluationGraph.graph;


        if (
            graph ===
            null
        ) {

            errors.push(
                "Cannot diagnose candidate evidence gaps from a null evaluation graph."
            );

        }


        if (
            errors.length >
            0 ||
            graph ===
            null
        ) {

            return {

                diagnostics:
                    [],

                errors:
                    errors.sort()

            };

        }


        const edgesByCandidateId =
            new Map<
                string,
                typeof graph.edges
            >();


        for (
            const edge
            of graph.edges
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


            if (
                edge.evaluationStatus !==
                    "EVALUATED"
            ) {

                errors.push(
                    `Candidate evaluation edge ${edge.edgeId} is not evaluated.`
                );

            }

        }


        for (
            const [
                candidateId,
                edges
            ]
            of edgesByCandidateId
        ) {

            if (
                edges.length !==
                1
            ) {

                errors.push(
                    `Candidate ${candidateId} requires exactly one evaluation graph edge.`
                );

            }

        }


        const assessmentsByCandidateId =
            new Map<
                string,
                ScientificCompositionCandidateCompatibilityAssessment[]
            >();


        for (
            const assessment
            of input.compatibility.assessments
        ) {

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


            if (
                !edgesByCandidateId.has(
                    assessment.candidateId
                )
            ) {

                errors.push(
                    `Compatibility assessment ${assessment.assessmentId} references candidate absent from evaluation graph ${assessment.candidateId}.`
                );

            }

        }


        for (
            const edge
            of graph.edges
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
                    `Candidate ${edge.candidateId} requires exactly one compatibility assessment for evidence-gap diagnosis.`
                );

                continue;

            }


            const assessment =
                assessments[0];


            if (
                assessment.assessmentId !==
                    edge.compatibilityAssessmentId
            ) {

                errors.push(
                    `Compatibility assessment identity does not match evaluation edge ${edge.edgeId}.`
                );

            }


            if (
                assessment.candidateKind !==
                    edge.kind
            ) {

                errors.push(
                    `Compatibility assessment ${assessment.assessmentId} candidate kind does not match evaluation edge ${edge.edgeId}.`
                );

            }


            if (
                assessment.sourceParticipantId !==
                    edge.sourceParticipantId ||
                assessment.targetParticipantId !==
                    edge.targetParticipantId
            ) {

                errors.push(
                    `Compatibility assessment ${assessment.assessmentId} participant identities do not match evaluation edge ${edge.edgeId}.`
                );

            }


            if (
                assessment.scientificPolarity !==
                    edge.compatibilityPolarity
            ) {

                errors.push(
                    `Compatibility polarity does not match evaluation edge ${edge.edgeId}.`
                );

            }


            const assessmentBoundaryIds =
                assessment
                    .boundaryEvaluations
                    .map(
                        evaluation =>
                            evaluation.boundaryId
                    );


            if (
                !sameStrings(
                    assessmentBoundaryIds,
                    edge.boundaryIds
                )
            ) {

                errors.push(
                    `Compatibility boundaries do not match evaluation edge ${edge.edgeId}.`
                );

            }


            const assessmentEvidenceIds =
                sortedUnique(
                    assessment
                        .boundaryEvaluations
                        .flatMap(
                            evaluation =>
                                evaluation.evidenceIds
                        )
                );


            if (
                !sameStrings(
                    assessmentEvidenceIds,
                    edge.compatibilityEvidenceIds
                )
            ) {

                errors.push(
                    `Compatibility evidence does not match evaluation edge ${edge.edgeId}.`
                );

            }


            const total =
                assessment.boundaryEvaluations.length;


            const preserved =
                assessment
                    .boundaryEvaluations
                    .filter(
                        evaluation =>
                            evaluation.status ===
                            "PRESERVED"
                    )
                    .length;


            const violated =
                assessment
                    .boundaryEvaluations
                    .filter(
                        evaluation =>
                            evaluation.status ===
                            "VIOLATED"
                    )
                    .length;


            const unevaluated =
                assessment
                    .boundaryEvaluations
                    .filter(
                        evaluation =>
                            evaluation.status ===
                            "UNEVALUATED"
                    )
                    .length;


            if (
                assessment.statistics.total !==
                    total ||
                assessment.statistics.preserved !==
                    preserved ||
                assessment.statistics.violated !==
                    violated ||
                assessment.statistics.unevaluated !==
                    unevaluated
            ) {

                errors.push(
                    `Compatibility statistics are inconsistent for assessment ${assessment.assessmentId}.`
                );

            }


            const expectedPolarity =
                violated >
                    0
                    ? "CHALLENGE"
                    : total ===
                        0 ||
                    unevaluated >
                        0
                        ? "INCONCLUSIVE"
                        : "SUPPORT";


            if (
                assessment.scientificPolarity !==
                    expectedPolarity
            ) {

                errors.push(
                    `Compatibility polarity is inconsistent with boundary evaluations for assessment ${assessment.assessmentId}.`
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                diagnostics:
                    [],

                errors:
                    errors.sort()

            };

        }


        const diagnostics:
            ScientificCompositionCandidateEvidenceDiagnostic[] =
            [];


        for (
            const edge
            of [...graph.edges].sort(
                (a, b) =>
                    a.candidateId.localeCompare(
                        b.candidateId
                    )
            )
        ) {

            const assessment =
                assessmentsByCandidateId.get(
                    edge.candidateId
                )![0];


            const knownBoundaryIds =
                assessment
                    .boundaryEvaluations
                    .map(
                        evaluation =>
                            evaluation.boundaryId
                    )
                    .sort();


            const observedBoundaryIds =
                assessment
                    .boundaryEvaluations
                    .filter(
                        evaluation =>
                            evaluation.observationIds.length >
                            0
                    )
                    .map(
                        evaluation =>
                            evaluation.boundaryId
                    )
                    .sort();


            const unevaluatedBoundaryIds =
                assessment
                    .boundaryEvaluations
                    .filter(
                        evaluation =>
                            evaluation.status ===
                            "UNEVALUATED"
                    )
                    .map(
                        evaluation =>
                            evaluation.boundaryId
                    )
                    .sort();


            const compatibilityObservationIds =
                sortedUnique(
                    assessment
                        .boundaryEvaluations
                        .flatMap(
                            evaluation =>
                                evaluation.observationIds
                        )
                );


            const compatibilityEvidenceIds =
                sortedUnique(
                    assessment
                        .boundaryEvaluations
                        .flatMap(
                            evaluation =>
                                evaluation.evidenceIds
                        )
                );


            const gaps:
                ScientificCompositionCandidateEvidenceGap[] =
                [];


            if (
                knownBoundaryIds.length ===
                0
            ) {

                gaps.push({

                    gapId:
                        encode([
                            "SCIENTIFIC-COMPOSITION-CANDIDATE-EVIDENCE-GAP",
                            edge.candidateId,
                            "NO_KNOWN_BOUNDARIES"
                        ]),

                    kind:
                        "NO_KNOWN_BOUNDARIES",

                    candidateId:
                        edge.candidateId,

                    boundaryIds:
                        []

                });

            }


            if (
                compatibilityObservationIds.length ===
                0
            ) {

                gaps.push({

                    gapId:
                        encode([
                            "SCIENTIFIC-COMPOSITION-CANDIDATE-EVIDENCE-GAP",
                            edge.candidateId,
                            "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS"
                        ]),

                    kind:
                        "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS",

                    candidateId:
                        edge.candidateId,

                    boundaryIds:
                        [...knownBoundaryIds]

                });

            }


            if (
                unevaluatedBoundaryIds.length >
                0
            ) {

                gaps.push({

                    gapId:
                        encode([
                            "SCIENTIFIC-COMPOSITION-CANDIDATE-EVIDENCE-GAP",
                            edge.candidateId,
                            "UNEVALUATED_KNOWN_BOUNDARIES"
                        ]),

                    kind:
                        "UNEVALUATED_KNOWN_BOUNDARIES",

                    candidateId:
                        edge.candidateId,

                    boundaryIds:
                        [...unevaluatedBoundaryIds]

                });

            }


            gaps.sort(
                (a, b) =>
                    a.gapId.localeCompare(
                        b.gapId
                    )
            );


            let resolution:
                ScientificCompositionCandidateEvidenceResolution;


            if (
                assessment.scientificPolarity ===
                "CHALLENGE"
            ) {

                resolution =
                    "BOUNDARY_CHALLENGED";

            }
            else if (
                assessment.scientificPolarity ===
                "SUPPORT"
            ) {

                resolution =
                    "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED";

            }
            else {

                resolution =
                    "REQUIRES_ADDITIONAL_EVIDENCE";

            }


            diagnostics.push({

                diagnosticId:
                    encode([
                        "SCIENTIFIC-COMPOSITION-CANDIDATE-EVIDENCE-DIAGNOSTIC",
                        edge.candidateId,
                        assessment.assessmentId
                    ]),

                candidateId:
                    edge.candidateId,

                candidateKind:
                    edge.kind,

                sourceParticipantId:
                    edge.sourceParticipantId,

                targetParticipantId:
                    edge.targetParticipantId,

                compatibilityAssessmentId:
                    assessment.assessmentId,

                compatibilityPolarity:
                    assessment.scientificPolarity,

                knownBoundaryIds,

                observedBoundaryIds,

                unevaluatedBoundaryIds,

                compatibilityObservationIds,

                compatibilityEvidenceIds,

                gaps,

                resolution

            });

        }


        return {

            diagnostics,

            errors:
                []

        };

    }

}