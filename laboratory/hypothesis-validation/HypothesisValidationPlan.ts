export interface HypothesisValidationPlan {
    hypothesisTitle: string;
    validationStrategy: string;
    recommendedScenarios: string[];
    priority: "Low" | "Medium" | "High";
}