import type { ResearchQuestion } from "./ResearchQuestion.js";

export interface ResearchQuestionResult {

    generatedAt: string;

    questions: ResearchQuestion[];

    statistics: {
        questions: number;
        high: number;
        medium: number;
        low: number;
    };

    errors: string[];

}