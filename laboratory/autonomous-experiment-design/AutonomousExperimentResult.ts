import type {
    AutonomousExperiment
} from "./AutonomousExperiment.js";

export interface AutonomousExperimentResult {

    generatedAt: string;

    experiments: AutonomousExperiment[];

    statistics: {

        experiments: number;

        highPriority: number;

        mediumPriority: number;

        lowPriority: number;

        theoryValidation: number;

        contradictionResolution: number;

        knowledgeGap: number;

        confidenceImprovement: number;

        averageExpectedKnowledgeGain: number;

    };

    errors: string[];

}