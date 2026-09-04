import type {
    ScientificExecutionOutcome
} from "./ScientificExecutionOutcome.js";

export interface ScientificExecutionOutcomeResult {

    generatedAt: string;

    campaignId: string;

    outcomes:
        ScientificExecutionOutcome[];

    statistics: {

        total: number;

        notExecuted: number;

        success: number;

        failure: number;

        inconclusive: number;

        blocked: number;

        executed: number;

    };

    errors: string[];

}