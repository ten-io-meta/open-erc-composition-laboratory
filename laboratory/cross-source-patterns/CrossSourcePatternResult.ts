import type { CrossSourcePattern } from "./CrossSourcePattern.js";

export interface CrossSourcePatternResult {

    generatedAt: string;

    patterns: CrossSourcePattern[];

    statistics: {
        patterns: number;
        candidate: number;
        emerging: number;
        supported: number;
        sources: number;
    };

    errors: string[];

}