import type {
    ScientificKnowledgeEvolution
} from "./ScientificKnowledgeEvolution.js";

import type {
    ScientificKnowledgeState
} from "./ScientificKnowledgeState.js";

export interface ScientificKnowledgeEvolutionResult {

    generatedAt: string;

    campaignId: string;

    evolutions: ScientificKnowledgeEvolution[];

    states: ScientificKnowledgeState[];

    statistics: {

        totalKnowledge: number;

        evolutions: number;

        discovered: number;

        promoted: number;

        degraded: number;

        stabilized: number;

        challenged: number;

        refuted: number;

        recovered: number;

        unchanged: number;

        archived: number;

        averageConfidence: number;

    };

    errors: string[];

}