import type { ScientificConsensus } from "./ScientificConsensus.js";

export interface ScientificConsensusResult {

    generatedAt: string;

    consensus: ScientificConsensus[];

    statistics: {
        total: number;
        weak: number;
        moderate: number;
        strong: number;
    };

    errors: string[];

}