import type { ScientificValidation } from "./ScientificValidation.js";

export interface ScientificValidationResult {

    generatedAt: string;

    validations: ScientificValidation[];

    statistics: {
        total: number;
        validated: number;
        challenged: number;
        rejected: number;
        inconclusive: number;
        averageValidationScore: number;
    };

    errors: string[];

}