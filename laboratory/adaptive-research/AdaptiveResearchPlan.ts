export interface AdaptiveResearchPlan {
    id: string;

    protocolA: string;
    protocolB: string;

    target: string;

    sourceHypothesis?: string;
    validationTarget?: string;
    supportingEvidence?: string[];

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
