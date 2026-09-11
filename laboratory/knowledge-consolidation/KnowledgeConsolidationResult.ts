import type { KnowledgeConsolidation } from "./KnowledgeConsolidation.js";

export interface KnowledgeConsolidationResult {

    generatedAt: string;

    consolidations: KnowledgeConsolidation[];

    statistics: {

        promoted: number;

        retained: number;

        degraded: number;

        archived: number;

        canonical: number;

    };

    errors: string[];

}