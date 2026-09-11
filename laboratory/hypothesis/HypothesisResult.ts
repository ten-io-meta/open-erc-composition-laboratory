import type { ResearchHypothesis } from "./ResearchHypothesis.js";

export interface HypothesisResult {

    generatedAt: string;

    hypotheses: ResearchHypothesis[];

    errors: string[];

}