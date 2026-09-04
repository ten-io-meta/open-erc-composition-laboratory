import type {
    ScientificExecutionPlan
} from "./ScientificExecutionPlan.js";

export interface ScientificExecutionPlanResult {

    generatedAt: string;

    campaignId: string;

    plans:
        ScientificExecutionPlan[];

    statistics: {

        plans: number;

        totalSteps: number;

        readyPlans: number;

        blockedPlans: number;

        sourceReingestionSteps: number;

        staticAnalysisSteps: number;

        testExecutionSteps: number;

        invariantValidationSteps: number;

        evidenceCollectionSteps: number;

        manualReviewSteps: number;

        averageStepsPerPlan: number;

    };

    errors: string[];

}