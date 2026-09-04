import type {
    ScientificEvidenceFeedback
} from "./ScientificEvidenceFeedback.js";

export interface ScientificEvidenceFeedbackResult {

    generatedAt: string;

    campaignId: string;

    feedback:
        ScientificEvidenceFeedback[];

    statistics: {

        total: number;

        strengthen: number;

        challenge: number;

        hold: number;

    };

    errors: string[];

}