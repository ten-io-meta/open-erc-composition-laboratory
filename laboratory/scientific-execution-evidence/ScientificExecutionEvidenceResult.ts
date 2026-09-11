import type {
    ScientificExecutionEvidence
} from "./ScientificExecutionEvidence.js";

export interface ScientificExecutionEvidenceResult {

    generatedAt: string;

    campaignId: string;

    evidence:
        ScientificExecutionEvidence[];

    statistics: {

        total: number;

        supporting: number;

        challenging: number;

        inconclusive: number;

        sourceReingestionEvidence: number;

        staticAnalysisEvidence: number;

        testExecutionEvidence: number;

        invariantValidationEvidence: number;

        evidenceCollectionEvidence: number;

        manualReviewEvidence: number;

    };

    errors: string[];

}