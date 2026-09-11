import type { ResearchStrategy } from "./ResearchStrategy.js";

export interface ResearchStrategyResult {

    generatedAt: string;

    strategies: ResearchStrategy[];

    statistics: {
        strategies: number;
        high: number;
        medium: number;
        low: number;
    };

    errors: string[];

}