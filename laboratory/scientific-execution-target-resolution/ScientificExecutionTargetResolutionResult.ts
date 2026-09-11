import type {
    ScientificExecutionTargetResolution
} from "./ScientificExecutionTargetResolution.js";

export interface ScientificExecutionTargetResolutionResult {

    generatedAt: string;

    campaignId: string;

    resolutions:
        ScientificExecutionTargetResolution[];

    statistics: {

        total: number;

        resolved: number;

        unresolved: number;

        tests: number;

        invariants: number;

        staticAnalysis: number;

    };

    errors: string[];

}