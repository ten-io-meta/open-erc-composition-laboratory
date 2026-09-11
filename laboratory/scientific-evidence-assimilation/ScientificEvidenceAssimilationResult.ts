import type {
    ScientificEvidenceAssimilation
} from "./ScientificEvidenceAssimilation.js";

import type {
    ScientificKnowledgeState
} from "../scientific-knowledge-evolution/ScientificKnowledgeState.js";

export interface ScientificEvidenceAssimilationResult {

    generatedAt: string;

    campaignId: string;

    assimilations:
        ScientificEvidenceAssimilation[];

    states:
        ScientificKnowledgeState[];

    statistics: {

        total: number;

        assimilated: number;

        unchanged: number;

        supportingEvidenceAdded: number;

        contradictoryEvidenceAdded: number;

    };

    errors: string[];

}