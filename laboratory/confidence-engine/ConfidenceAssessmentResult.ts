import type { ConfidenceAssessment } from "./ConfidenceAssessment.js";

export interface ConfidenceAssessmentResult {

    generatedAt: string;

    assessments: ConfidenceAssessment[];

    statistics: {
        assessments: number;
        preliminary: number;
        supported: number;
        established: number;
        averageConfidence: number;
    };

    errors: string[];

}