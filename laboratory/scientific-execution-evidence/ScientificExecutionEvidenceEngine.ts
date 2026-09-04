import type {
    ScientificExecutionObservation
} from "../scientific-execution-observation/ScientificExecutionObservation.js";

import type {
    ScientificExecutionObservationResult
} from "../scientific-execution-observation/ScientificExecutionObservationResult.js";

import type {
    ScientificExecutionEvidence,
    ScientificExecutionEvidenceStatus
} from "./ScientificExecutionEvidence.js";

import type {
    ScientificExecutionEvidenceResult
} from "./ScientificExecutionEvidenceResult.js";

export class ScientificExecutionEvidenceEngine {

    build(
        campaignId: string,
        observationResult:
            ScientificExecutionObservationResult
    ): ScientificExecutionEvidenceResult {

        try {

            const evidence:
                ScientificExecutionEvidence[] = [];

            let counter = 1;

            for (
                const observation
                of observationResult.observations ?? []
            ) {

                evidence.push(
                    this.buildEvidence(
                        counter++,
                        campaignId,
                        observation
                    )
                );

            }

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                evidence,

                statistics: {

                    total:
                        evidence.length,

                    supporting:
                        evidence.filter(
                            item =>
                                item.status ===
                                "SUPPORTING"
                        ).length,

                    challenging:
                        evidence.filter(
                            item =>
                                item.status ===
                                "CHALLENGING"
                        ).length,

                    inconclusive:
                        evidence.filter(
                            item =>
                                item.status ===
                                "INCONCLUSIVE"
                        ).length,

                    sourceReingestionEvidence:
                        this.countStepType(
                            evidence,
                            "SOURCE_REINGESTION"
                        ),

                    staticAnalysisEvidence:
                        this.countStepType(
                            evidence,
                            "STATIC_ANALYSIS"
                        ),

                    testExecutionEvidence:
                        this.countStepType(
                            evidence,
                            "TEST_EXECUTION"
                        ),

                    invariantValidationEvidence:
                        this.countStepType(
                            evidence,
                            "INVARIANT_VALIDATION"
                        ),

                    evidenceCollectionEvidence:
                        this.countStepType(
                            evidence,
                            "EVIDENCE_COLLECTION"
                        ),

                    manualReviewEvidence:
                        this.countStepType(
                            evidence,
                            "MANUAL_REVIEW"
                        )

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                evidence: [],

                statistics: {

                    total: 0,

                    supporting: 0,

                    challenging: 0,

                    inconclusive: 0,

                    sourceReingestionEvidence: 0,

                    staticAnalysisEvidence: 0,

                    testExecutionEvidence: 0,

                    invariantValidationEvidence: 0,

                    evidenceCollectionEvidence: 0,

                    manualReviewEvidence: 0

                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]

            };

        }

    }

    private buildEvidence(
        index: number,
        campaignId: string,
        observation:
            ScientificExecutionObservation
    ): ScientificExecutionEvidence {

        const status =
            this.statusFor(
                observation
            );

        return {

            evidenceId:
                `SCIENTIFIC-EXECUTION-EVIDENCE-${campaignId}-${String(
    index
).padStart(5, "0")}`,

            campaignId,

            observationId:
                observation.observationId,

            outcomeId:
                observation.outcomeId,

            executionPlanId:
                observation.executionPlanId,

            executionTaskId:
                observation.executionTaskId,

            experimentId:
    observation.experimentId,

targetType:
    observation.targetType,

targetId:
    observation.targetId,

sourceConclusionId:
    observation.sourceConclusionId,

sourceIds:
    [...(observation.sourceIds ?? [])],

targetEvidenceIds:
    [...(observation.targetEvidenceIds ?? [])],

stepId:
    observation.stepId,

stepType:
    observation.stepType,

repository:
    observation.repository,

selectedExecutableTarget:
    observation.selectedExecutableTarget,

status,

statement:
    observation.statement,

sourceEvidence:
    [
        ...observation.evidence
    ],

sourceObservations:
    [
        ...observation.observations
    ],

generatedAt:
    new Date().toISOString(),

explanation:
    this.explanationFor(
        observation,
        status
    )

        };

    }

    private statusFor(
        observation:
            ScientificExecutionObservation
    ): ScientificExecutionEvidenceStatus {

        switch (
            observation.status
        ) {

            case "SUPPORTED":
                return "SUPPORTING";

            case "CHALLENGED":
                return "CHALLENGING";

            case "INCONCLUSIVE":
                return "INCONCLUSIVE";

        }

    }

    private explanationFor(
        observation:
            ScientificExecutionObservation,
        status:
            ScientificExecutionEvidenceStatus
    ): string {

        return (
            `Scientific execution evidence generated from observation ` +
            `${observation.observationId}. Observation status ` +
            `${observation.status} was classified as ${status}. ` +
            `This evidence preserves execution provenance and does not ` +
            `independently establish scientific truth.`
        );

    }

    private countStepType(
        evidence:
            ScientificExecutionEvidence[],
        stepType: string
    ): number {

        return evidence.filter(
            item =>
                item.stepType ===
                stepType
        ).length;

    }

}
