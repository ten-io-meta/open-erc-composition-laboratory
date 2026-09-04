import type {
    ScientificExecutionPlanResult
} from "../scientific-execution-plan/ScientificExecutionPlanResult.js";

import type {
    ScientificExecutionOutcome
} from "./ScientificExecutionOutcome.js";

import type {
    ScientificExecutionOutcomeResult
} from "./ScientificExecutionOutcomeResult.js";

export class ScientificExecutionOutcomeEngine {

    build(
        campaignId: string,
        executionPlans:
            ScientificExecutionPlanResult
    ): ScientificExecutionOutcomeResult {

        try {

            const outcomes:
                ScientificExecutionOutcome[] = [];

            let counter = 1;

            for (
                const plan
                of executionPlans.plans ?? []
            ) {

                for (
                    const step
                    of plan.steps ?? []
                ) {

                    const status =
                        step.status === "BLOCKED"
                            ? "BLOCKED"
                            : "NOT_EXECUTED";

                    outcomes.push({

                        outcomeId:
                            `SCIENTIFIC-EXECUTION-OUTCOME-${String(
                                counter++
                            ).padStart(5, "0")}`,

                        executionPlanId:
                            plan.executionPlanId,

                        executionTaskId:
                            plan.executionTaskId,

                        experimentId:
                            plan.experimentId,

                        targetType:
                            plan.targetType,

                        targetId:
                            plan.targetId,

                        sourceConclusionId:
    plan.sourceConclusionId,

sourceIds:
    [...(plan.sourceIds ?? [])],

targetEvidenceIds:
    [...(plan.targetEvidenceIds ?? [])],
                        
                        successCriteria:
    [...(plan.successCriteria ?? [])],

failureCriteria:
    [...(plan.failureCriteria ?? [])],

    scientificCriteria:
    plan.scientificCriteria,

                        stepId:
    step.stepId,

stepType:
    step.stepType,

repository:
    null,

selectedExecutableTarget:
    null,

status,

scientificResult:
    "NOT_EVALUATED",

executedAt:
    null,

                        evidence: [],

                        observations: [],

                        errors:
                            status === "BLOCKED"
                                ? [
                                    "Execution step is blocked and cannot be executed."
                                ]
                                : [],

                        explanation:
                            status === "BLOCKED"
                                ? (
                                    "The execution step is blocked and no runtime execution has occurred."
                                )
                                : (
                                    "The execution step is prepared but has not yet been executed by a real runtime."
                                )

                    });

                }

            }

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                outcomes,

                statistics: {

                    total:
                        outcomes.length,

                    notExecuted:
                        this.countStatus(
                            outcomes,
                            "NOT_EXECUTED"
                        ),

                    success:
                        this.countStatus(
                            outcomes,
                            "SUCCESS"
                        ),

                    failure:
                        this.countStatus(
                            outcomes,
                            "FAILURE"
                        ),

                    inconclusive:
                        this.countStatus(
                            outcomes,
                            "INCONCLUSIVE"
                        ),

                    blocked:
                        this.countStatus(
                            outcomes,
                            "BLOCKED"
                        ),

                    executed:
                        outcomes.filter(
                            outcome =>
                                outcome.status === "SUCCESS" ||
                                outcome.status === "FAILURE" ||
                                outcome.status === "INCONCLUSIVE"
                        ).length

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                outcomes: [],

                statistics: {

                    total: 0,

                    notExecuted: 0,

                    success: 0,

                    failure: 0,

                    inconclusive: 0,

                    blocked: 0,

                    executed: 0

                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]

            };

        }

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
