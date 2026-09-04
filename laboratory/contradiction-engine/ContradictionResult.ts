import type { Contradiction } from "./Contradiction.js";

export interface ContradictionResult {

    generatedAt: string;

    contradictions: Contradiction[];

    statistics: {

        total: number;

        high: number;

        medium: number;

        low: number;

    };

    errors: string[];

}