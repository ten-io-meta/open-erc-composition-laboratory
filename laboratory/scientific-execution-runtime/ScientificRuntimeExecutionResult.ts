import type {
    ScientificRuntimeExecution
} from "./ScientificRuntimeExecution.js";

export interface ScientificRuntimeExecutionResult {

    generatedAt: string;

    campaignId: string;

    executions:
        ScientificRuntimeExecution[];

    statistics: {

        total: number;

        success: number;

        failure: number;

        inconclusive: number;

        unsupported: number;

        skipped: number;

        sourceReingestionExecuted: number;

        staticAnalysisExecuted: number;

        testExecutionExecuted: number;

        invariantValidationExecuted: number;

        evidenceCollectionExecuted: number;

        manualReviewExecuted: number;

    };

    errors: string[];

}