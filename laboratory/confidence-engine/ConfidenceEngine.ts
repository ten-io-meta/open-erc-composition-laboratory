import type {
    ResearchConclusionResult
} from "../research-conclusions/ResearchConclusionResult.js";

import type {
    ConfidenceAssessment
} from "./ConfidenceAssessment.js";

import type {
    ConfidenceAssessmentResult
} from "./ConfidenceAssessmentResult.js";

import type {
    SourceIndependenceAssessment
} from "../source-independence/SourceIndependenceAssessment.js";

import {
    SourceIndependenceSetAssessmentEngine
} from "../source-independence/SourceIndependenceSetAssessmentEngine.js";

export class ConfidenceEngine {

    build(
        conclusions: ResearchConclusionResult,
        sourceIndependenceAssessments:
            SourceIndependenceAssessment[] = []
    ): ConfidenceAssessmentResult {

        try {

            const assessments: ConfidenceAssessment[] =
                conclusions.conclusions.map(
                    (conclusion, index) => {

                        /*
                         * Source identities observed for this conclusion.
                         *
                         * These identities represent provenance only.
                         * Their count must never be interpreted directly
                         * as scientific source independence.
                         */

                        const sourceIds =
                            [
                                ...new Set(
                                    conclusion.supportedBy ??
                                    []
                                )
                            ];

                        /*
                         * Only pair assessments whose source identities
                         * belong to this conclusion may participate in
                         * its independence assessment.
                         */

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

                        /*
                         * Convert explicit pairwise independence
                         * assessments into a conservative set-level
                         * independence assessment.
                         *
                         * Missing or inconclusive relationships do not
                         * establish scientific independence.
                         */

                        const sourceIndependence =
                            new SourceIndependenceSetAssessmentEngine().build(
                                sourceIds,
                                relevantSourceIndependenceAssessments
                            );

                        const independentSources =
                            sourceIndependence
                                .establishedIndependentSources;

                        const evidenceEvents =
                            conclusion.evidence?.length ??
                            0;

                        const evidenceQuality =
                            this.qualityFor(
                                conclusion.evidence ??
                                []
                            );

                        const calculatedConfidence =
                            this.calculateConfidence(
                                Number(
                                    conclusion.confidence ??
                                    0
                                ),
                                independentSources,
                                evidenceEvents,
                                evidenceQuality
                            );

                        const maturity =
                            this.maturityFor(
                                calculatedConfidence,
                                independentSources
                            );

                        return {
                            assessmentId:
                                `CONFIDENCE-${String(
                                    index + 1
                                ).padStart(
                                    5,
                                    "0"
                                )}`,

                            sourceConclusionId:
                                conclusion.conclusionId,

                            statement:
                                conclusion.statement,

                            sourcePatternId:
                                conclusion.sourcePatternId,

                            sourcePatternRelation:
                                conclusion.sourcePatternRelation,

                            originalConfidence:
                                Number(
                                    conclusion.confidence ??
                                    0
                                ),

                            calculatedConfidence,

                            independentSources,

                            evidenceEvents,

                            evidenceQuality,

                            maturity,

                            reasons:
                                this.reasonsFor(
                                    independentSources,
                                    evidenceEvents,
                                    evidenceQuality,
                                    calculatedConfidence
                                )
                        };

                    }
                );

            return {
                generatedAt:
                    new Date().toISOString(),

                assessments,

                statistics: {
                    assessments:
                        assessments.length,

                    preliminary:
                        assessments.filter(
                            item =>
                                item.maturity ===
                                "PRELIMINARY"
                        ).length,

                    supported:
                        assessments.filter(
                            item =>
                                item.maturity ===
                                "SUPPORTED"
                        ).length,

                    established:
                        assessments.filter(
                            item =>
                                item.maturity ===
                                "ESTABLISHED"
                        ).length,

                    averageConfidence:
                        this.average(
                            assessments.map(
                                item =>
                                    item.calculatedConfidence
                            )
                        )
                },

                errors:
                    []
            };

        } catch (error) {

            return {
                generatedAt:
                    new Date().toISOString(),

                assessments:
                    [],

                statistics: {
                    assessments: 0,
                    preliminary: 0,
                    supported: 0,
                    established: 0,
                    averageConfidence: 0
                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown confidence engine error"
                ]
            };

        }

    }

    private calculateConfidence(
        originalConfidence: number,
        independentSources: number,
        evidenceEvents: number,
        evidenceQuality:
            "LOW" |
            "MEDIUM" |
            "HIGH"
    ): number {

        let score =
            originalConfidence;

        /*
         * Only scientifically established independent
         * sources may contribute this confidence bonus.
         *
         * Observed source identity count, repository count,
         * evidence count and execution count must never be
         * substituted for independentSources.
         */

        score +=
            Math.min(
                independentSources * 7,
                28
            );

        score +=
            Math.min(
                evidenceEvents * 2,
                20
            );

        if (
            evidenceQuality ===
            "HIGH"
        ) {

            score +=
                15;

        }

        if (
            evidenceQuality ===
            "MEDIUM"
        ) {

            score +=
                8;

        }

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

    private qualityFor(
        evidence: string[]
    ):
        "LOW" |
        "MEDIUM" |
        "HIGH" {

        const high =
            evidence.some(
                item =>
                    item.includes(
                        ":HIGH"
                    )
            );

        if (
            high
        ) {

            return "HIGH";

        }

        const medium =
            evidence.some(
                item =>
                    item.includes(
                        ":MEDIUM"
                    )
            );

        if (
            medium
        ) {

            return "MEDIUM";

        }

        return "LOW";

    }

    private maturityFor(
        confidence: number,
        independentSources: number
    ):
        "PRELIMINARY" |
        "SUPPORTED" |
        "ESTABLISHED" {

        if (
            confidence >= 90 &&
            independentSources >= 4
        ) {

            return "ESTABLISHED";

        }

        if (
            confidence >= 70 &&
            independentSources >= 2
        ) {

            return "SUPPORTED";

        }

        return "PRELIMINARY";

    }

    private reasonsFor(
        independentSources: number,
        evidenceEvents: number,
        evidenceQuality:
            "LOW" |
            "MEDIUM" |
            "HIGH",
        confidence: number
    ): string[] {

        const reasons:
            string[] = [];

        reasons.push(
            independentSources > 0
                ? `${independentSources} scientifically independent sources were explicitly established for this conclusion.`
                : "No scientifically independent source set was explicitly established for this conclusion."
        );

        reasons.push(
            `${evidenceEvents} evidence events were linked to this conclusion.`
        );

        reasons.push(
            `Evidence quality assessed as ${evidenceQuality}.`
        );

        reasons.push(
            `Calculated confidence is ${confidence}.`
        );

        return reasons;

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
                    sum +
                    value,
                0
            ) /
            values.length
        );

    }

}