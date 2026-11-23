export interface HypothesisValidation {
    hypothesisId: string;
    relation: string;
    statusBefore: string;
    statusAfter: string;
    confidenceBefore: number;
    confidenceAfter: number;
    evidenceMatched: number;
    /**
     * PARTIAL is only correlation with previously available source claims.
     * UNSUPPORTED is lack of a match, NOT a demonstrated refutation.
     * CONFIRMED is retained for legacy reading but this engine never emits it.
     */
    validationOutcome: "CONFIRMED" | "PARTIAL" | "UNSUPPORTED";
    observations: string[];
    matchedPriorClaimIds?: string[];
    verificationScope?: "PRIOR_SOURCE_CLAIM_CORRELATION_ONLY";
    independentlyValidated?: false;
    evmExecuted?: false;
    compatibilityVerdict?: "NOT_EVALUATED";
}
