import type {
    ScientificExecutionOutcomeResult
} from "../scientific-execution-outcome/ScientificExecutionOutcomeResult.js";

export interface ScientificRuntimeOutcomeAdapterResult {

    generatedAt: string;

    campaignId: string;

    updatedOutcomes:
        ScientificExecutionOutcomeResult;

    statistics: {

        total: number;

        updated: number;

        unchanged: number;

        successMapped: number;

        failureMapped: number;

        inconclusiveMapped: number;

        unsupportedIgnored: number;

        skippedIgnored: number;

    };

    errors: string[];

}