import type {
    AutonomousExperiment
} from "../autonomous-experiment-design/AutonomousExperiment.js";

export type ScientificExperimentOrigin =
    | "AUTONOMOUS"
    | "RETEST";

export interface ScientificExperimentQueueItem {

    queueItemId: string;

    origin:
        ScientificExperimentOrigin;

    experiment:
        AutonomousExperiment;

    priorityScore: number;

    knowledgeGainScore: number;

    queueScore: number;

}