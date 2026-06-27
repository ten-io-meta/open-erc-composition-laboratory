export interface GeneratedScenario {
    id: string;
    sourceHypothesis: string;
    protocols: string[];
    scenarioType: string;
    priority: "Low" | "Medium" | "High";
    reason: string;
}