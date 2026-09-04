import type { KnowledgeGap } from "./KnowledgeGap.js";

export interface KnowledgeGapResult {

    generatedAt: string;

    gaps: KnowledgeGap[];

    statistics: {
        gaps: number;
        high: number;
        medium: number;
        low: number;
    };

    errors: string[];

}