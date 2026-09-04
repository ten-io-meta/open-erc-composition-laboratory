export interface ResearchStrategy {

    strategyId: string;

    objective: string;

    recommendedAction: string;

    targetRepositories: string[];

    expectedKnowledgeGain: number;

    priority: "HIGH" | "MEDIUM" | "LOW";

    rationale: string;

}