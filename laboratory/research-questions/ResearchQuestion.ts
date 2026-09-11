export interface ResearchQuestion {

    questionId: string;

    question: string;

    sourceType: "THEORY" | "CONTRADICTION" | "LOW_CONFIDENCE";

    relatedId: string;

    priority: "HIGH" | "MEDIUM" | "LOW";

    rationale: string;

}