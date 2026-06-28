export interface HypothesisValidationPlan {
    hypothesisId: string;
    hypothesisTitle: string;
    validationTarget: string;
    validationStrategy: string;
    recommendedScenarios: string[];
    priority: "Low" | "Medium" | "High";
}
