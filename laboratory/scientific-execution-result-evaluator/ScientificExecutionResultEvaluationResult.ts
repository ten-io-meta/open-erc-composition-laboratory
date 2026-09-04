import type {
    ScientificExecutionResultEvaluation
} from "./ScientificExecutionResultEvaluation.js";

import type {
    ScientificExecutionOutcomeResult
} from "../scientific-execution-outcome/ScientificExecutionOutcomeResult.js";

export interface ScientificExecutionResultEvaluationResult {

    generatedAt: string;

    campaignId: string;

    evaluations:
        ScientificExecutionResultEvaluation[];

    updatedOutcomes:
        ScientificExecutionOutcomeResult;

    statistics: {

        total: number;

        supports: number;

        challenges: number;

        inconclusive: number;

        notEvaluated: number;

    };

    errors: string[];

}