import type { KnowledgeGain } from "./KnowledgeGain.js";

export interface KnowledgeGainResult {

    generatedAt: string;

    sources: KnowledgeGain[];

    statistics: {
        sources: number;
        totalKnowledgeGain: number;
        highestGainSource: string | null;
        highestGainScore: number;
    };

    errors: string[];

}