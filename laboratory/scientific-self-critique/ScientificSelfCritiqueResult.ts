import type {
    ScientificCritique
} from "./ScientificCritique.js";

export interface ScientificSelfCritiqueResult {

    generatedAt: string;

    campaignId: string;

    critiques: ScientificCritique[];

    statistics: {

        critiques: number;

        critical: number;

        high: number;

        medium: number;

        low: number;

        theoriesCritiqued: number;

        knowledgeCritiqued: number;

        evidenceHistoriesCritiqued: number;

        discoveriesCritiqued: number;

        averageRobustnessScore: number;

        veryHighFalsificationRisk: number;

        highFalsificationRisk: number;

        moderateFalsificationRisk: number;

        lowFalsificationRisk: number;

    };

    errors: string[];

}