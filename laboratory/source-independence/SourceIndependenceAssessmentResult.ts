import type {
    SourceIndependenceAssessment
} from "./SourceIndependenceAssessment.js";

export interface SourceIndependenceAssessmentResult {

    generatedAt:
        string;

    assessments:
        SourceIndependenceAssessment[];

    statistics: {

        total:
            number;

        independent:
            number;

        dependent:
            number;

        inconclusive:
            number;

        notApplicable:
            number;

    };

    errors:
        string[];

}