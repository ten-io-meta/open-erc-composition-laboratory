import type {
    AutonomousExperiment
} from "../autonomous-experiment-design/AutonomousExperiment.js";

import type {
    AutonomousExperimentResult
} from "../autonomous-experiment-design/AutonomousExperimentResult.js";

import type {
    ScientificRetestExperimentResult
} from "../scientific-retest-experiment/ScientificRetestExperimentResult.js";

import type {
    ScientificExperimentQueueItem,
    ScientificExperimentOrigin
} from "./ScientificExperimentQueueItem.js";

import type {
    ScientificExperimentQueueResult
} from "./ScientificExperimentQueueResult.js";

export class ScientificExperimentQueueEngine {

    build(
        campaignId: string,
        autonomous:
            AutonomousExperimentResult,
        retest:
            ScientificRetestExperimentResult
    ): ScientificExperimentQueueResult {

        try {

            const candidates:
                ScientificExperimentQueueItem[] = [];

            let counter = 1;

            for (
                const experiment
                of autonomous.experiments ?? []
            ) {

                candidates.push(
                    this.toQueueItem(
                        counter++,
                        "AUTONOMOUS",
                        experiment
                    )
                );

            }

            for (
                const experiment
                of retest.experiments ?? []
            ) {

                candidates.push(
                    this.toQueueItem(
                        counter++,
                        "RETEST",
                        experiment
                    )
                );

            }

            const beforeDeduplication =
                candidates.length;

            const queue =
                this.deduplicate(
                    candidates
                )
                    .sort(
                        (a, b) =>
                            b.queueScore -
                            a.queueScore
                    );

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                queue,

                statistics: {

                    total:
                        queue.length,

                    autonomous:
                        queue.filter(
                            item =>
                                item.origin ===
                                "AUTONOMOUS"
                        ).length,

                    retest:
                        queue.filter(
                            item =>
                                item.origin ===
                                "RETEST"
                        ).length,

                    highPriority:
                        queue.filter(
                            item =>
                                item.experiment.priority ===
                                "HIGH"
                        ).length,

                    mediumPriority:
                        queue.filter(
                            item =>
                                item.experiment.priority ===
                                "MEDIUM"
                        ).length,

                    lowPriority:
                        queue.filter(
                            item =>
                                item.experiment.priority ===
                                "LOW"
                        ).length,

                    deduplicated:
                        beforeDeduplication -
                        queue.length,

                    averageQueueScore:
                        this.average(
                            queue.map(
                                item =>
                                    item.queueScore
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

                queue: [],

                statistics: {

                    total: 0,

                    autonomous: 0,

                    retest: 0,

                    highPriority: 0,

                    mediumPriority: 0,

                    lowPriority: 0,

                    deduplicated: 0,

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

    private toQueueItem(
        index: number,
        origin:
            ScientificExperimentOrigin,
        experiment:
            AutonomousExperiment
    ): ScientificExperimentQueueItem {

        const priorityScore =
            this.priorityScoreFor(
                experiment.priority
            );

        const knowledgeGainScore =
            experiment.estimatedKnowledgeGain;

        const originBonus =
            origin === "RETEST"
                ? 10
                : 0;

        const queueScore =
            Math.min(
                100,
                Math.round(
                    priorityScore * 0.45 +
                    knowledgeGainScore * 0.45 +
                    originBonus
                )
            );

        return {

            queueItemId:
                `SCIENTIFIC-EXPERIMENT-QUEUE-${String(
                    index
                ).padStart(5, "0")}`,

            origin,

            experiment,

            priorityScore,

            knowledgeGainScore,

            queueScore

        };

    }

    private deduplicate(
        items:
            ScientificExperimentQueueItem[]
    ): ScientificExperimentQueueItem[] {

        const unique =
            new Map<
                string,
                ScientificExperimentQueueItem
            >();

        for (
            const item
            of items
        ) {

            const key =
                `${item.experiment.targetType}:` +
                `${item.experiment.targetId}`;

            const existing =
                unique.get(
                    key
                );

            if (
                !existing ||
                item.queueScore >
                existing.queueScore
            ) {

                unique.set(
                    key,
                    item
                );

            }

        }

        return [
            ...unique.values()
        ];

    }

    private priorityScoreFor(
        priority:
            AutonomousExperiment[
                "priority"
            ]
    ): number {

        switch (
            priority
        ) {

            case "HIGH":
                return 100;

            case "MEDIUM":
                return 70;

            case "LOW":
                return 40;

        }

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