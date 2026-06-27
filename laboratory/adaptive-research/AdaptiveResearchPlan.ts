export interface AdaptiveResearchPlan {
    id: string;
    target: string;
    reason: string;
    priority: "Low" | "Medium" | "High";
    recommendedScenarioTypes: string[];
    parameters: {
        authority: number;
        reserve: number;
        consume: number;
        settle: number;
    };
}