import type {
    ScientificExecutionCapability
} from "./ScientificExecutionCapability.js";

export interface ScientificExecutionCapabilityResult {

    generatedAt: string;

    campaignId: string;

    capabilities:
        ScientificExecutionCapability[];

    statistics: {

        total: number;

        staticAnalysis: number;

        testExecution: number;

        invariantValidation: number;

        sourceReingestion: number;

        manualReview: number;

        averageConfidence: number;

    };

    errors: string[];

}