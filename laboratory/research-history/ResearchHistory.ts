import type {
    ResearchEvolutionResult
} from "../research-evolution/ResearchEvolutionResult.js";

export interface ResearchHistory {

    generatedAt: string;

    knowledge?: any;

    patterns?: any;

    conclusions?: any;

    researchEvolution?:
        ResearchEvolutionResult;

}