import type { ResearchConclusion } from "./ResearchConclusion.js";

export interface ResearchConclusionResult {

    generatedAt: string;

    conclusions: ResearchConclusion[];

    errors: string[];

}