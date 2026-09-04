import type {
    ScientificRetestPlan
} from "./ScientificRetestPlan.js";

export interface ScientificRetestPlannerResult {

    generatedAt: string;

    campaignId: string;

    plans:
        ScientificRetestPlan[];

    statistics: {

        plans: number;

        criticalPriority: number;

        highPriority: number;

        mediumPriority: number;

        lowPriority: number;

        theoryRetests: number;

        discoveryRetests: number;

        knowledgeRetests: number;

        evidenceHistoryRetests: number;

        experimentRequired: number;

    };

    errors: string[];

}