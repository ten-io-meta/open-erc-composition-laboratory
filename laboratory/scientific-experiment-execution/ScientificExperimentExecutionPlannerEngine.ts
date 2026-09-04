import type {
    ScientificExperimentQueueResult
} from "../scientific-experiment-queue/ScientificExperimentQueueResult.js";

import type {
    ScientificExperimentQueueItem
} from "../scientific-experiment-queue/ScientificExperimentQueueItem.js";

import type {
    ScientificExperimentExecutionTask
} from "./ScientificExperimentExecutionTask.js";

import type {
    ScientificExperimentExecutionResult
} from "./ScientificExperimentExecutionResult.js";

export class ScientificExperimentExecutionPlannerEngine {

    build(
        campaignId: string,
        experimentQueue:
            ScientificExperimentQueueResult
    ): ScientificExperimentExecutionResult {

        try {

            const tasks:
                ScientificExperimentExecutionTask[] = [];

            let counter = 1;

            for (
                const item
                of experimentQueue.queue ?? []
            ) {

                tasks.push(
                    this.buildTask(
                        counter++,
                        item
                    )
                );

            }

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                tasks,

                statistics: {

                    total:
                        tasks.length,

                    ready:
                        this.countStatus(
                            tasks,
                            "READY"
                        ),

                    pending:
                        this.countStatus(
                            tasks,
                            "PENDING"
                        ),

                    blocked:
                        this.countStatus(
                            tasks,
                            "BLOCKED"
                        ),

                    completed:
                        this.countStatus(
                            tasks,
                            "COMPLETED"
                        ),

                    failed:
                        this.countStatus(
                            tasks,
                            "FAILED"
                        ),

                    autonomous:
                        tasks.filter(
                            task =>
                                task.origin ===
                                "AUTONOMOUS"
                        ).length,

                    retest:
                        tasks.filter(
                            task =>
                                task.origin ===
                                "RETEST"
                        ).length,

                    highPriority:
                        tasks.filter(
                            task =>
                                task.priority ===
                                "HIGH"
                        ).length,

                    mediumPriority:
                        tasks.filter(
                            task =>
                                task.priority ===
                                "MEDIUM"
                        ).length,

                    lowPriority:
                        tasks.filter(
                            task =>
                                task.priority ===
                                "LOW"
                        ).length,

                    averageQueueScore:
                        this.average(
                            tasks.map(
                                task =>
                                    task.queueScore
                            )
                        )

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                tasks: [],

                statistics: {

                    total: 0,

                    ready: 0,

                    pending: 0,

                    blocked: 0,

                    completed: 0,

                    failed: 0,

                    autonomous: 0,

                    retest: 0,

                    highPriority: 0,

                    mediumPriority: 0,

                    lowPriority: 0,

                    averageQueueScore: 0

                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]

            };

        }

    }

    private buildTask(
        index: number,
        item:
            ScientificExperimentQueueItem
    ): ScientificExperimentExecutionTask {

        const experiment =
            item.experiment;

        const blockReasons:
            string[] = [];

        if (
            experiment.recommendedRepositories.length === 0
        ) {

            blockReasons.push(
                "No recommended repositories were provided."
            );

        }

        if (
            experiment.procedure.length === 0
        ) {

            blockReasons.push(
                "No experimental procedure was defined."
            );

        }

        if (
            experiment.requiredEvidence.length === 0
        ) {

            blockReasons.push(
                "No required evidence was defined."
            );

        }

        const executionStatus =
            blockReasons.length > 0
                ? "BLOCKED"
                : "READY";

        return {

            executionTaskId:
                `SCIENTIFIC-EXECUTION-TASK-${String(
                    index
                ).padStart(5, "0")}`,

            queueItemId:
                item.queueItemId,

            experimentId:
                experiment.experimentId,

            origin:
                item.origin,

           targetType:
    experiment.targetType,

targetId:
    experiment.targetId,

sourcePatternRelation:
    experiment.sourcePatternRelation,

sourceConclusionId:
    experiment.sourceConclusionId,

sourceIds:
    [...(experiment.sourceIds ?? [])],

targetEvidenceIds:
    [...(experiment.targetEvidenceIds ?? [])],

title:
    experiment.title,

    objective:
    experiment.objective,

hypothesis:
    experiment.hypothesis,

supportCondition:
    experiment.supportCondition,

challengeCondition:
    experiment.challengeCondition,

    scientificCriteria:
    experiment.scientificCriteria,

            priority:
                experiment.priority,

            queueScore:
                item.queueScore,

            recommendedRepositories:
                experiment.recommendedRepositories,

            procedure:
                experiment.procedure,

            requiredEvidence:
                experiment.requiredEvidence,

            successCriteria:
                experiment.successCriteria,

            failureCriteria:
                experiment.failureCriteria,

            executionStatus,

            blockReasons,

            explanation:
                executionStatus === "READY"
                    ? (
                        "The experiment has sufficient planning metadata " +
                        "to be handed to a future execution runtime."
                    )
                    : (
                        "The experiment cannot yet be handed to an execution runtime."
                    )

        };

    }

    private countStatus(
        tasks:
            ScientificExperimentExecutionTask[],
        status:
            ScientificExperimentExecutionTask[
                "executionStatus"
            ]
    ): number {

        return tasks.filter(
            task =>
                task.executionStatus === status
        ).length;

    }

    private average(
        values:
            number[]
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

}