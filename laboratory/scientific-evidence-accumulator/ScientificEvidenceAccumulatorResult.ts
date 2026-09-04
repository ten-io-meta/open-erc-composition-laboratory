import type {
    ScientificEvidenceAccumulation
} from "./ScientificEvidenceAccumulation.js";

import type {
    ScientificEvidenceHistory
} from "./ScientificEvidenceHistory.js";

export interface ScientificEvidenceAccumulatorResult {

    generatedAt: string;

    campaignId: string;

    accumulations: ScientificEvidenceAccumulation[];

    histories: ScientificEvidenceHistory[];

    statistics: {

        knowledgeTracked: number;

        accumulations: number;

        newEvidence: number;

        strengthened: number;

        stable: number;

        weakened: number;

        conflicted: number;

        growingTrends: number;

        stableTrends: number;

        decliningTrends: number;

        volatileTrends: number;

        averageStabilityScore: number;

    };

    errors: string[];

}