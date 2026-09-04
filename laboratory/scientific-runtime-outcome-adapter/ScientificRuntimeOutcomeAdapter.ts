import type {
    ScientificExecutionOutcome
} from "../scientific-execution-outcome/ScientificExecutionOutcome.js";

import type {
    ScientificExecutionOutcomeResult
} from "../scientific-execution-outcome/ScientificExecutionOutcomeResult.js";

import type {
    ScientificRuntimeExecution
} from "../scientific-execution-runtime/ScientificRuntimeExecution.js";

import type {
    ScientificRuntimeExecutionResult
} from "../scientific-execution-runtime/ScientificRuntimeExecutionResult.js";

import type {
    ScientificRuntimeOutcomeAdapterResult
} from "./ScientificRuntimeOutcomeAdapterResult.js";

export class ScientificRuntimeOutcomeAdapter {

    build(
        campaignId: string,
        outcomes:
            ScientificExecutionOutcomeResult,
        runtime:
            ScientificRuntimeExecutionResult
    ): ScientificRuntimeOutcomeAdapterResult {

        try {

            const runtimeByStep =
                new Map<
                    string,
                    ScientificRuntimeExecution
                >();

            for (
                const execution
                of runtime.executions ?? []
            ) {

                runtimeByStep.set(
                    execution.stepId,
                    execution
                );

            }

            let updated = 0;

            let unchanged = 0;

            let successMapped = 0;

            let failureMapped = 0;

            let inconclusiveMapped = 0;

            let unsupportedIgnored = 0;

            let skippedIgnored = 0;

            const updatedOutcomeEntries:
                ScientificExecutionOutcome[] =
                outcomes.outcomes.map(
                    outcome => {

                        const execution =
                            runtimeByStep.get(
                                outcome.stepId
                            );

                        if (
                            !execution
                        ) {

                            unchanged++;

                            return outcome;

                        }

                        switch (
                            execution.status
                        ) {

                            case "SUCCESS":

                                updated++;
                                successMapped++;

                                return this.mapExecution(
                                    outcome,
                                    execution,
                                    "SUCCESS"
                                );

                            case "FAILURE":

                                updated++;
                                failureMapped++;

                                return this.mapExecution(
                                    outcome,
                                    execution,
                                    "FAILURE"
                                );

                            case "INCONCLUSIVE":

                                updated++;
                                inconclusiveMapped++;

                                return this.mapExecution(
                                    outcome,
                                    execution,
                                    "INCONCLUSIVE"
                                );

                            case "UNSUPPORTED":

                                unchanged++;
                                unsupportedIgnored++;

                                return outcome;

                            case "SKIPPED":

                                unchanged++;
                                skippedIgnored++;

                                return outcome;

                        }

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

                        total:
                            updatedOutcomeEntries.length,

                        notExecuted:
                            this.countStatus(
                                updatedOutcomeEntries,
                                "NOT_EXECUTED"
                            ),

                        success:
                            this.countStatus(
                                updatedOutcomeEntries,
                                "SUCCESS"
                            ),

                        failure:
                            this.countStatus(
                                updatedOutcomeEntries,
                                "FAILURE"
                            ),

                        inconclusive:
                            this.countStatus(
                                updatedOutcomeEntries,
                                "INCONCLUSIVE"
                            ),

                        blocked:
                            this.countStatus(
                                updatedOutcomeEntries,
                                "BLOCKED"
                            ),

                        executed:
                            updatedOutcomeEntries.filter(
                                outcome =>
                                    outcome.status === "SUCCESS" ||
                                    outcome.status === "FAILURE" ||
                                    outcome.status === "INCONCLUSIVE"
                            ).length

                    },

                    errors:
                        [
                            ...outcomes.errors
                        ]

                };

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                updatedOutcomes,

                statistics: {

                    total:
                        updatedOutcomeEntries.length,

                    updated,

                    unchanged,

                    successMapped,

                    failureMapped,

                    inconclusiveMapped,

                    unsupportedIgnored,

                    skippedIgnored

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                updatedOutcomes:
                    outcomes,

                statistics: {

                    total:
                        outcomes.outcomes.length,

                    updated: 0,

                    unchanged:
                        outcomes.outcomes.length,

                    successMapped: 0,

                    failureMapped: 0,

                    inconclusiveMapped: 0,

                    unsupportedIgnored: 0,

                    skippedIgnored: 0

                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]

            };

        }

    }

    private mapExecution(
        outcome:
            ScientificExecutionOutcome,
        execution:
            ScientificRuntimeExecution,
        status:
            "SUCCESS" |
            "FAILURE" |
            "INCONCLUSIVE"
    ): ScientificExecutionOutcome {

        return {

    ...outcome,

    sourceConclusionId:
        execution.sourceConclusionId ??
        outcome.sourceConclusionId,

    targetEvidenceIds:
    execution.targetEvidenceIds.length > 0
        ? [...execution.targetEvidenceIds]
        : [...(outcome.targetEvidenceIds ?? [])],

repository:
    execution.repository,

selectedExecutableTarget:
    execution.selectedExecutableTarget,

successCriteria:
    [...(outcome.successCriteria ?? [])],

failureCriteria:
    [...(outcome.failureCriteria ?? [])],

    status,

scientificResult:
    status === "INCONCLUSIVE"
        ? "INCONCLUSIVE"
        : "NOT_EVALUATED",

    executedAt:
        execution.finishedAt ??
        execution.startedAt ??
        new Date().toISOString(),

            evidence:
                [
                    ...execution.evidence
                ],

            observations:
                [
                    ...execution.observations
                ],

            errors:
                [
                    ...execution.errors
                ],

            explanation:
                (
                    `Execution outcome updated from runtime execution ` +
                    `${execution.runtimeExecutionId}. ` +
                    `Runtime status ${execution.status} was mapped ` +
                    `to scientific execution outcome status ${status}.`
                )

        };

    }

    private countStatus(
        outcomes:
            ScientificExecutionOutcome[],
        status:
            ScientificExecutionOutcome[
                "status"
            ]
    ): number {

        return outcomes.filter(
            outcome =>
                outcome.status === status
        ).length;

    }

}
