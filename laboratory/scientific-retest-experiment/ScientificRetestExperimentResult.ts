import type {
    AutonomousExperiment
} from "../autonomous-experiment-design/AutonomousExperiment.js";

export interface ScientificRetestExperimentResult {

    generatedAt: string;

    campaignId: string;

    experiments:
        AutonomousExperiment[];

    statistics: {

        experiments: number;

        theoryExperiments: number;

        discoveryExperiments: number;

        knowledgeExperiments: number;

        evidenceHistoryExperiments: number;

        highPriority: number;

        mediumPriority: number;

        lowPriority: number;

        averageExpectedKnowledgeGain: number;

    };

    errors: string[];

}