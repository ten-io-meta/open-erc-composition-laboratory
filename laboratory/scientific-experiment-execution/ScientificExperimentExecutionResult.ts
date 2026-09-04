import type {
    ScientificExperimentExecutionTask
} from "./ScientificExperimentExecutionTask.js";

export interface ScientificExperimentExecutionResult {

    generatedAt: string;

    campaignId: string;

    tasks:
        ScientificExperimentExecutionTask[];

    statistics: {

        total: number;

        ready: number;

        pending: number;

        blocked: number;

        completed: number;

        failed: number;

        autonomous: number;

        retest: number;

        highPriority: number;

        mediumPriority: number;

        lowPriority: number;

        averageQueueScore: number;

    };

    errors: string[];

}