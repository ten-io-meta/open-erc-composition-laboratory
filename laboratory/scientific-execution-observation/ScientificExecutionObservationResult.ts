import type {
    ScientificExecutionObservation
} from "./ScientificExecutionObservation.js";

export interface ScientificExecutionObservationResult {

    generatedAt: string;

    campaignId: string;

    observations:
        ScientificExecutionObservation[];

    statistics: {

        total: number;

        supported: number;

        challenged: number;

        inconclusive: number;

        sourceReingestionObservations: number;

        staticAnalysisObservations: number;

        testExecutionObservations: number;

        invariantValidationObservations: number;

        evidenceCollectionObservations: number;

        manualReviewObservations: number;

    };

    errors: string[];

}