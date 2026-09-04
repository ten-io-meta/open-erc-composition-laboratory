import type { ResearchTask } from "./ResearchTask.js";

export interface ResearchPlan {

    generatedAt: string;

    tasks: ResearchTask[];

    errors: string[];

}