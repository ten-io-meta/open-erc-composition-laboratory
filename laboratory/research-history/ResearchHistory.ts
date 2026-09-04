import type {
    ResearchEvolutionResult
} from "../research-evolution/ResearchEvolutionResult.js";

import type { ResearchStrategyResult } from "../research-strategy/ResearchStrategyResult.js";

export interface ResearchHistory {

    generatedAt: string;

    knowledge?: any;

    patterns?: any;

    conclusions?: any;

    researchEvolution?:
        ResearchEvolutionResult;


    researchStrategy?: ResearchStrategyResult;
}
