import type {
    ScientificExecutionOutcome
} from "../scientific-execution-outcome/ScientificExecutionOutcome.js";

import type {
    ScientificExecutionOutcomeResult
} from "../scientific-execution-outcome/ScientificExecutionOutcomeResult.js";

import type {
    ScientificExecutionObservation
} from "./ScientificExecutionObservation.js";

import type {
    ScientificExecutionObservationResult
} from "./ScientificExecutionObservationResult.js";

export class ScientificExecutionObservationEngine {

    build(
        campaignId: string,
        executionOutcomes:
            ScientificExecutionOutcomeResult
    ): ScientificExecutionObservationResult {

        try {

            const observations:
                ScientificExecutionObservation[] = [];

            let counter = 1;

            for (
                const outcome
                of executionOutcomes.outcomes ?? []
            ) {

                if (
                    outcome.status === "NOT_EXECUTED" ||
                    outcome.status === "BLOCKED"
                ) {
                    continue;
                }

                observations.push(
                    this.buildObservation(
                        counter++,
                        outcome
                    )
                );

            }

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                observations,

                statistics: {

                    total:
                        observations.length,

                    supported:
                        observations.filter(
                            observation =>
                                observation.status ===
                                "SUPPORTED"
                        ).length,

                    challenged:
                        observations.filter(
                            observation =>
                                observation.status ===
                                "CHALLENGED"
                        ).length,

                    inconclusive:
                        observations.filter(
                            observation =>
                                observation.status ===
                                "INCONCLUSIVE"
                        ).length,

                    sourceReingestionObservations:
                        this.countStepType(
                            observations,
                            "SOURCE_REINGESTION"
                        ),

                    staticAnalysisObservations:
                        this.countStepType(
                            observations,
                            "STATIC_ANALYSIS"
                        ),

                    testExecutionObservations:
                        this.countStepType(
                            observations,
                            "TEST_EXECUTION"
                        ),

                    invariantValidationObservations:
                        this.countStepType(
                            observations,
                            "INVARIANT_VALIDATION"
                        ),

                    evidenceCollectionObservations:
                        this.countStepType(
                            observations,
                            "EVIDENCE_COLLECTION"
                        ),

                    manualReviewObservations:
                        this.countStepType(
                            observations,
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

                observations: [],

                statistics: {

                    total: 0,

                    supported: 0,

                    challenged: 0,

                    inconclusive: 0,

                    sourceReingestionObservations: 0,

                    staticAnalysisObservations: 0,

                    testExecutionObservations: 0,

                    invariantValidationObservations: 0,

                    evidenceCollectionObservations: 0,

                    manualReviewObservations: 0

                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]

            };

        }

    }

    private buildObservation(
        index: number,
        outcome:
            ScientificExecutionOutcome
    ): ScientificExecutionObservation {

        const status =
            this.statusFor(
                outcome
            );

        return {

            observationId:
                `SCIENTIFIC-EXECUTION-OBSERVATION-${String(
                    index
                ).padStart(5, "0")}`,

            outcomeId:
                outcome.outcomeId,

            executionPlanId:
                outcome.executionPlanId,

            executionTaskId:
                outcome.executionTaskId,

            experimentId:
    outcome.experimentId,

targetType:
    outcome.targetType,

targetId:
    outcome.targetId,

sourceConclusionId:
    outcome.sourceConclusionId,

sourceIds:
    [...(outcome.sourceIds ?? [])],

targetEvidenceIds:
    [...(outcome.targetEvidenceIds ?? [])],

stepId:
    outcome.stepId,

stepType:
    outcome.stepType,

repository:
    outcome.repository,

selectedExecutableTarget:
    outcome.selectedExecutableTarget,

status,

            statement:
                this.statementFor(
                    outcome,
                    status
                ),

            evidence:
                [
                    ...outcome.evidence
                ],

            observations:
                [
                    ...outcome.observations
                ],

            generatedAt:
                new Date().toISOString(),

            explanation:
                this.explanationFor(
                    outcome,
                    status
                )

        };

    }

    private statusFor(
    outcome:
        ScientificExecutionOutcome
): ScientificExecutionObservation[
    "status"
] {

    switch (
        outcome.scientificResult
    ) {

        case "SUPPORTS":
            return "SUPPORTED";

        case "CHALLENGES":
            return "CHALLENGED";

        case "INCONCLUSIVE":
        case "NOT_EVALUATED":
            return "INCONCLUSIVE";

    }

}

    private statementFor(
        outcome:
            ScientificExecutionOutcome,
        status:
            ScientificExecutionObservation[
                "status"
            ]
    ): string {

        switch (
            status
        ) {

            case "SUPPORTED":

                return (
                    `Execution step ${outcome.stepId} produced ` +
                    `supporting experimental evidence.`
                );

            case "CHALLENGED":

                return (
                    `Execution step ${outcome.stepId} produced ` +
                    `evidence that challenges the experimental target.`
                );

            case "INCONCLUSIVE":

                return (
                    `Execution step ${outcome.stepId} produced ` +
                    `an inconclusive experimental result.`
                );

        }

    }

    private explanationFor(
    outcome:
        ScientificExecutionOutcome,
    status:
        ScientificExecutionObservation[
            "status"
        ]
): string {

    return (
        `Scientific observation generated from execution outcome ` +
        `${outcome.outcomeId}. Scientific result ` +
        `${outcome.scientificResult} was mapped to ` +
        `observation status ${status}.`
    );

}

    private countStepType(
        observations:
            ScientificExecutionObservation[],
        stepType:
            string
    ): number {

        return observations.filter(
            observation =>
                observation.stepType ===
                stepType
        ).length;

    }

}
