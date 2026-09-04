import type {
    ScientificExecutionOutcome
} from "../scientific-execution-outcome/ScientificExecutionOutcome.js";

import type {
    ScientificExecutionOutcomeResult
} from "../scientific-execution-outcome/ScientificExecutionOutcomeResult.js";

import type {
    ScientificExecutionResultEvaluation
} from "./ScientificExecutionResultEvaluation.js";

import type {
    ScientificExecutionResultEvaluationResult
} from "./ScientificExecutionResultEvaluationResult.js";

export class ScientificExecutionResultEvaluatorEngine {

    build(
        campaignId: string,
        outcomes:
            ScientificExecutionOutcomeResult
    ): ScientificExecutionResultEvaluationResult {

        try {

            const evaluations:
                ScientificExecutionResultEvaluation[] = [];

            let counter = 1;

            const updatedOutcomeEntries =
                outcomes.outcomes.map(
                    outcome => {

                        const evaluation =
                            this.evaluateOutcome(
                                counter++,
                                outcome
                            );

                        evaluations.push(
                            evaluation
                        );

                        return {
                            ...outcome,

                            scientificResult:
                                evaluation.scientificResult
                        };

                    }
                );

            const updatedOutcomes:
                ScientificExecutionOutcomeResult = {

                    generatedAt:
                        new Date().toISOString(),

                    campaignId,

                    outcomes:
                        updatedOutcomeEntries,

                    statistics: {
                        ...outcomes.statistics
                    },

                    errors:
                        [...outcomes.errors]

                };

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                evaluations,

                updatedOutcomes,

                statistics: {

                    total:
                        evaluations.length,

                    supports:
                        this.countResult(
                            evaluations,
                            "SUPPORTS"
                        ),

                    challenges:
                        this.countResult(
                            evaluations,
                            "CHALLENGES"
                        ),

                    inconclusive:
                        this.countResult(
                            evaluations,
                            "INCONCLUSIVE"
                        ),

                    notEvaluated:
                        this.countResult(
                            evaluations,
                            "NOT_EVALUATED"
                        )

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                evaluations: [],

                updatedOutcomes:
                    outcomes,

                statistics: {

                    total: 0,

                    supports: 0,

                    challenges: 0,

                    inconclusive: 0,

                    notEvaluated: 0

                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]

            };

        }

    }

    private evaluateOutcome(
        index: number,
        outcome:
            ScientificExecutionOutcome
    ): ScientificExecutionResultEvaluation {

        const searchableText =
            this.normalize(
                [
                    ...outcome.evidence,
                    ...outcome.observations,
                    outcome.explanation
                ].join(" ")
            );

        const hasScientificChallengeSignal =
    searchableText.includes(
        "oecl_scientific_challenge:"
    );
    const supportCondition =
    this.supportConditionFor(
        outcome
    );

const challengeCondition =
    this.challengeConditionFor(
        outcome
    );

    const scientificPolarity =
    this.evidenceValueFor(
        outcome,
        "SCIENTIFIC_POLARITY:"
    );
        const matchedSuccessCriteria =
            outcome.successCriteria.filter(
                criterion =>
                    this.matchesCriterion(
                        searchableText,
                        criterion
                    )
            );

        const matchedFailureCriteria =
            outcome.failureCriteria.filter(
                criterion =>
                    this.matchesCriterion(
                        searchableText,
                        criterion
                    )
            );

        let scientificResult:
            ScientificExecutionOutcome[
                "scientificResult"
            ];

                if (
            outcome.status === "NOT_EXECUTED" ||
            outcome.status === "BLOCKED"
        ) {

            scientificResult =
                "NOT_EVALUATED";

        } else if (
            hasScientificChallengeSignal
        ) {

            scientificResult =
                "CHALLENGES";

        } else if (
            outcome.scientificCriteria !== undefined &&
            (
                outcome.stepType === "TEST_EXECUTION" ||
                outcome.stepType === "INVARIANT_VALIDATION"
            ) &&
            outcome.status === "SUCCESS" &&
            scientificPolarity === "CHALLENGE"
        ) {

            scientificResult =
                "CHALLENGES";

        } else if (
            outcome.scientificCriteria !== undefined &&
            (
                outcome.stepType === "TEST_EXECUTION" ||
                outcome.stepType === "INVARIANT_VALIDATION"
            ) &&
            outcome.status === "SUCCESS" &&
            scientificPolarity === "SUPPORT"
        ) {

            scientificResult =
                "SUPPORTS";

        } else if (
            outcome.scientificCriteria !== undefined &&
            (
                outcome.stepType === "TEST_EXECUTION" ||
                outcome.stepType === "INVARIANT_VALIDATION"
            ) &&
            (
                outcome.status === "SUCCESS" ||
                outcome.status === "FAILURE" ||
                outcome.status === "INCONCLUSIVE"
            )
        ) {

            scientificResult =
                "INCONCLUSIVE";

        } else if (
            outcome.scientificCriteria === undefined &&
            matchedFailureCriteria.length > 0 &&
            matchedSuccessCriteria.length === 0
        ) {

            scientificResult =
                "CHALLENGES";

        } else if (
            outcome.scientificCriteria === undefined &&
            matchedSuccessCriteria.length > 0 &&
            matchedFailureCriteria.length === 0
        ) {

            scientificResult =
                "SUPPORTS";

        } else if (
            (
                outcome.stepType === "TEST_EXECUTION" ||
                outcome.stepType === "INVARIANT_VALIDATION"
            ) &&
            outcome.status === "SUCCESS" &&
            scientificPolarity === "CHALLENGE"
        ) {

            scientificResult =
                "CHALLENGES";

        } else if (
            (
                outcome.stepType === "TEST_EXECUTION" ||
                outcome.stepType === "INVARIANT_VALIDATION"
            ) &&
            outcome.status === "SUCCESS" &&
            scientificPolarity === "SUPPORT"
        ) {

            scientificResult =
                "SUPPORTS";

        } else if (
            (
                outcome.stepType === "TEST_EXECUTION" ||
                outcome.stepType === "INVARIANT_VALIDATION"
            ) &&
            outcome.status === "SUCCESS"
        ) {

            scientificResult =
                "INCONCLUSIVE";

        } else if (
            (
                outcome.stepType === "TEST_EXECUTION" ||
                outcome.stepType === "INVARIANT_VALIDATION"
            ) &&
            outcome.status === "FAILURE" &&
            matchedFailureCriteria.length === 0
        ) {

            scientificResult =
                "INCONCLUSIVE";

        } else if (
            outcome.status === "INCONCLUSIVE"
        ) {

            scientificResult =
                "INCONCLUSIVE";

        } else {

            scientificResult =
                "NOT_EVALUATED";

        }

        return {

            evaluationId:
                `SCIENTIFIC-EXECUTION-RESULT-EVALUATION-${String(
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

            scientificResult,

            matchedSuccessCriteria,

            matchedFailureCriteria,

            explanation:
                this.explanationFor(
                    scientificResult,
                    matchedSuccessCriteria,
                    matchedFailureCriteria
                ),

            generatedAt:
                new Date().toISOString()

        };

    }
    private evidenceValueFor(
    outcome:
        ScientificExecutionOutcome,
    prefix:
        string
): string | null {

    const entry =
        (outcome.evidence ?? []).find(
            value =>
                value.startsWith(
                    prefix
                )
        );

    if (!entry) {
        return null;
    }

    const value =
        entry
            .slice(
                prefix.length
            )
            .trim();

    return value.length > 0
        ? value
        : null;

}

private supportConditionFor(
    outcome:
        ScientificExecutionOutcome
): string | null {

    return this.evidenceValueFor(
        outcome,
        "SUPPORT_CONDITION:"
    );

}

private challengeConditionFor(
    outcome:
        ScientificExecutionOutcome
): string | null {

    return this.evidenceValueFor(
        outcome,
        "CHALLENGE_CONDITION:"
    );

}

    private matchesCriterion(
        searchableText: string,
        criterion: string
    ): boolean {

        const normalizedCriterion =
            this.normalize(
                criterion
            );

        if (!normalizedCriterion) {
            return false;
        }

        return searchableText.includes(
            normalizedCriterion
        );

    }

    private explanationFor(
        scientificResult:
            ScientificExecutionOutcome[
                "scientificResult"
            ],
        matchedSuccessCriteria:
            string[],
        matchedFailureCriteria:
            string[]
    ): string {

        return (
            `Scientific result ${scientificResult}. ` +
            `Matched success criteria: ` +
            `${matchedSuccessCriteria.length}. ` +
            `Matched failure criteria: ` +
            `${matchedFailureCriteria.length}.`
        );

    }

    private countResult(
        evaluations:
            ScientificExecutionResultEvaluation[],
        result:
            ScientificExecutionOutcome[
                "scientificResult"
            ]
    ): number {

        return evaluations.filter(
            evaluation =>
                evaluation.scientificResult ===
                result
        ).length;

    }

    private normalize(
        value: string
    ): string {

        return value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

    }

}