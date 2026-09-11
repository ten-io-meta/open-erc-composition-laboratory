import type {
    ScientificExecutionEvidence
} from "../scientific-execution-evidence/ScientificExecutionEvidence.js";

import type {
    ScientificExecutionEvidenceResult
} from "../scientific-execution-evidence/ScientificExecutionEvidenceResult.js";

import type {
    ScientificEvidenceFeedback,
    ScientificEvidenceFeedbackAction
} from "./ScientificEvidenceFeedback.js";

import type {
    ScientificEvidenceFeedbackResult
} from "./ScientificEvidenceFeedbackResult.js";

export class ScientificEvidenceFeedbackEngine {

    build(
        campaignId: string,
        executionEvidence:
            ScientificExecutionEvidenceResult
    ): ScientificEvidenceFeedbackResult {

        try {

            const feedback:
                ScientificEvidenceFeedback[] = [];

            let counter = 1;

            for (
                const evidence
                of executionEvidence.evidence ?? []
            ) {

                const action =
                    this.actionFor(
                        evidence
                    );

                feedback.push({

                    feedbackId:
                        `SCIENTIFIC-EVIDENCE-FEEDBACK-${String(
                            counter++
                        ).padStart(5, "0")}`,

                    campaignId,

                    evidenceId:
                        evidence.evidenceId,

                    observationId:
                        evidence.observationId,

                    outcomeId:
                        evidence.outcomeId,

                    experimentId:
                        evidence.experimentId,

                    targetType:
                        evidence.targetType,

                    targetId:
                        evidence.targetId,

                    sourceConclusionId:
                        evidence.sourceConclusionId,

                    sourceIds:
                        [
                            ...(
                                evidence.sourceIds ??
                                []
                            )
                        ],

                    targetEvidenceIds:
                        [
                            ...(
                                evidence.targetEvidenceIds ??
                                []
                            )
                        ],

                    executionPlanId:
                        evidence.executionPlanId,

                    executionTaskId:
                        evidence.executionTaskId,

                    stepId:
                        evidence.stepId,

                    stepType:
                        evidence.stepType,

                    repository:
                        evidence.repository,

                    action,

                    statement:
                        evidence.statement,

                    sourceEvidence:
                        [
                            ...evidence.sourceEvidence
                        ],

                    sourceObservations:
                        [
                            ...evidence.sourceObservations
                        ],

                    generatedAt:
                        new Date().toISOString(),

                    explanation:
                        this.explanationFor(
                            evidence,
                            action
                        )

                });

            }

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                feedback,

                statistics: {

                    total:
                        feedback.length,

                    strengthen:
                        this.countAction(
                            feedback,
                            "STRENGTHEN"
                        ),

                    challenge:
                        this.countAction(
                            feedback,
                            "CHALLENGE"
                        ),

                    hold:
                        this.countAction(
                            feedback,
                            "HOLD"
                        )

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                feedback: [],

                statistics: {

                    total: 0,

                    strengthen: 0,

                    challenge: 0,

                    hold: 0

                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]

            };

        }

    }

    private actionFor(
        evidence:
            ScientificExecutionEvidence
    ): ScientificEvidenceFeedbackAction {

        switch (
            evidence.status
        ) {

            case "SUPPORTING":
                return "STRENGTHEN";

            case "CHALLENGING":
                return "CHALLENGE";

            case "INCONCLUSIVE":
                return "HOLD";

        }

    }

    private explanationFor(
        evidence:
            ScientificExecutionEvidence,
        action:
            ScientificEvidenceFeedbackAction
    ): string {

        switch (action) {

            case "STRENGTHEN":

                return (
                    `Execution evidence ${evidence.evidenceId} ` +
                    `provides supporting feedback. The evidence is ` +
                    `eligible to strengthen matching scientific knowledge, ` +
                    `subject to provenance matching and independence checks.`
                );

            case "CHALLENGE":

                return (
                    `Execution evidence ${evidence.evidenceId} ` +
                    `provides challenging feedback. The evidence is ` +
                    `eligible to increase contradiction pressure on matching ` +
                    `scientific knowledge, subject to provenance matching.`
                );

            case "HOLD":

                return (
                    `Execution evidence ${evidence.evidenceId} ` +
                    `is inconclusive. It is preserved for future analysis ` +
                    `but must not strengthen or challenge scientific knowledge.`
                );

        }

    }

    private countAction(
        feedback:
            ScientificEvidenceFeedback[],
        action:
            ScientificEvidenceFeedbackAction
    ): number {

        return feedback.filter(
            item =>
                item.action === action
        ).length;

    }

}