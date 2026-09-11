import type { RefinedHypothesis } from "./RefinedHypothesis.js";

export interface HypothesisRefinementResult {

    generatedAt: string;

    refinedHypotheses: RefinedHypothesis[];

    statistics: {
        total: number;
        refine: number;
        split: number;
        strengthen: number;
        investigate: number;
    };

    errors: string[];

}