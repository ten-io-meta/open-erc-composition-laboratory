export interface RefinedHypothesis {

    refinedHypothesisId: string;

    sourceQuestionId: string;

    sourceType: string;

    originalQuestion: string;

    refinedStatement: string;

    action: "REFINE" | "SPLIT" | "STRENGTHEN" | "INVESTIGATE";

    priority: "HIGH" | "MEDIUM" | "LOW";

    rationale: string;

}