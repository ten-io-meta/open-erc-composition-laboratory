export interface ResearchTask {

    taskId: string;

    priority: "HIGH" | "MEDIUM" | "LOW";

    reason: string;

    recommendedRepositories: string[];

}