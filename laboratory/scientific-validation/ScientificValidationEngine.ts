import type { ResearchTheoryResult } from "../theory-engine/ResearchTheoryResult.js";
import type { EvidenceGraphResult } from "../evidence-graph/EvidenceGraphResult.js";
import type { ContradictionResult } from "../contradiction-engine/ContradictionResult.js";
import type {
    SourceIndependenceAssessment
} from "../source-independence/SourceIndependenceAssessment.js";

import {
    SourceIndependenceSetAssessmentEngine
} from "../source-independence/SourceIndependenceSetAssessmentEngine.js";
import type { ScientificValidation } from "./ScientificValidation.js";
import type { ScientificValidationResult } from "./ScientificValidationResult.js";

export class ScientificValidationEngine {

  build(
    theories: ResearchTheoryResult,
    graph: EvidenceGraphResult,
    contradictions: ContradictionResult,
    sourceIndependenceAssessments:
        SourceIndependenceAssessment[] = []
): ScientificValidationResult {

        try {

            const validations: ScientificValidation[] = [];

            let counter = 1;

            for (const theory of theories.theories ?? []) {

                const supportingEdges =
                    graph.edges.filter(edge =>
                        theory.supportingEdges.includes(edge.edgeId)
                    );

                const relatedNodes =
                    new Set(
                        supportingEdges.flatMap(edge => [
                            edge.from,
                            edge.to
                        ])
                    );

                const relatedContradictions =
                    (contradictions.contradictions ?? []).filter(
                        contradiction =>
                            relatedNodes.has(contradiction.subject) ||
                            relatedNodes.has(contradiction.object)
                    );

                const sourceIds =
    [
        ...new Set(
            supportingEdges.flatMap(
                edge =>
                    edge.sources ??
                    []
            )
        )
    ];

const relevantSourceIndependenceAssessments =
    sourceIndependenceAssessments.filter(
        assessment =>
            assessment.sourceIds.every(
                sourceId =>
                    sourceIds.includes(
                        sourceId
                    )
            )
    );

const sourceIndependence =
    new SourceIndependenceSetAssessmentEngine().build(
        sourceIds,
        relevantSourceIndependenceAssessments
    );

const independentSources =
    sourceIndependence
        .establishedIndependentSources;

                const supportingEvidence =
                    supportingEdges.length;

                const supportingEvidenceIds =
                    supportingEdges.map(
                        edge => edge.edgeId
                    );

                const contradictoryEvidence =
                    relatedContradictions.length;

                const contradictoryEvidenceIds =
                    relatedContradictions.map(
                        contradiction =>
                            contradiction.contradictionId
                    );

                const challenges =
                    relatedContradictions.map(
                        contradiction =>
                            `${contradiction.subject} has competing relations ` +
                            `${contradiction.relationA} and ${contradiction.relationB} ` +
                            `toward ${contradiction.object}.`
                    );

                const validationScore =
                    this.calculateScore(
                        theory.confidence,
                        supportingEvidence,
                        contradictoryEvidence,
                        independentSources
                    );

                const status =
                    this.statusFor(
                        validationScore,
                        contradictoryEvidence,
                        independentSources
                    );

                validations.push({

                    validationId:
                        `SCIENTIFIC-VALIDATION-${String(
                            counter++
                        ).padStart(5, "0")}`,

                    theoryId:
                        theory.theoryId,

                    theoryTitle:
                        theory.title,

                    sourcePatternRelation:
                        supportingEdges.length > 0
                            ? [
                                supportingEdges[0].from,
                                this.normalizePatternRelation(
                                    supportingEdges[0].relation
                                ),
                                supportingEdges[0].to
                            ]
                                .join(":")
                                .toUpperCase()
                            : "",

                    theoryConfidence:
                        theory.confidence,

                    supportingEvidence,

                    supportingEvidenceIds,

                    contradictoryEvidence,

                    contradictoryEvidenceIds,

                    independentSources,

                    validationScore,

                    status,

                    challenges,

                    explanation:
                        this.explanationFor(
                            supportingEvidence,
                            contradictoryEvidence,
                            independentSources,
                            validationScore,
                            status
                        )

                });

            }

            return {

                generatedAt:
                    new Date().toISOString(),

                validations,

                statistics: {

                    total:
                        validations.length,

                    validated:
                        validations.filter(
                            item =>
                                item.status === "VALIDATED"
                        ).length,

                    challenged:
                        validations.filter(
                            item =>
                                item.status === "CHALLENGED"
                        ).length,

                    rejected:
                        validations.filter(
                            item =>
                                item.status === "REJECTED"
                        ).length,

                    inconclusive:
                        validations.filter(
                            item =>
                                item.status === "INCONCLUSIVE"
                        ).length,

                    averageValidationScore:
                        this.average(
                            validations.map(
                                item =>
                                    item.validationScore
                            )
                        )

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                validations: [],

                statistics: {
                    total: 0,
                    validated: 0,
                    challenged: 0,
                    rejected: 0,
                    inconclusive: 0,
                    averageValidationScore: 0
                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown scientific validation error"
                ]

            };

        }

    }

    private calculateScore(
        theoryConfidence: number,
        supportingEvidence: number,
        contradictoryEvidence: number,
        independentSources: number
    ): number {

        let score =
            Number(
                theoryConfidence ??
                0
            );

        score +=
            Math.min(
                supportingEvidence * 4,
                24
            );

        score +=
            Math.min(
                independentSources * 5,
                30
            );

        score -=
            contradictoryEvidence * 20;

        return Math.max(
            0,
            Math.min(
                100,
                Math.round(
                    score
                )
            )
        );

    }

    private statusFor(
        validationScore: number,
        contradictoryEvidence: number,
        independentSources: number
    ): ScientificValidation["status"] {

        if (
            contradictoryEvidence >= 2 &&
            validationScore < 40
        ) {
            return "REJECTED";
        }

        if (
            contradictoryEvidence > 0
        ) {
            return "CHALLENGED";
        }

        if (
            validationScore >= 75 &&
            independentSources >= 3
        ) {
            return "VALIDATED";
        }

        return "INCONCLUSIVE";

    }

    private explanationFor(
    supportingEvidence: number,
    contradictoryEvidence: number,
    independentSources: number,
    validationScore: number,
    status:
        ScientificValidation["status"]
): string {

    return (
        `Theory evaluated using ${supportingEvidence} supporting edge(s), ` +
        `${independentSources} explicitly established independent source(s), and ` +
        `${contradictoryEvidence} contradictory finding(s). ` +
        `Validation score: ${validationScore}. ` +
        `Result: ${status}.`
    );

}

    private average(
        values: number[]
    ): number {

        if (
            values.length === 0
        ) {
            return 0;
        }

        return Math.round(
            values.reduce(
                (
                    sum,
                    value
                ) =>
                    sum + value,
                0
            ) /
            values.length
        );

    }

    private normalizePatternRelation(
        relation: string
    ): string {

        const normalized =
            relation
                .trim()
                .toUpperCase();

        switch (
            normalized
        ) {

            case "CONSTRAIN":
                return "CONSTRAINS";

            case "ENABLE":
                return "ENABLES";

            default:
                return normalized;

        }

    }

}