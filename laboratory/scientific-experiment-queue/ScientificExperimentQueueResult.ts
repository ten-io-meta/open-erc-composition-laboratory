import type {
    ScientificExperimentQueueItem
} from "./ScientificExperimentQueueItem.js";

export interface ScientificExperimentQueueResult {

    generatedAt: string;

    campaignId: string;

    queue:
        ScientificExperimentQueueItem[];

    statistics: {

        total: number;

        autonomous: number;

        retest: number;

        highPriority: number;

        mediumPriority: number;

        lowPriority: number;

        deduplicated: number;

        averageQueueScore: number;

    };

    errors: string[];

}