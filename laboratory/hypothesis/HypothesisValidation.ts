export interface HypothesisValidation {

    hypothesisId: string;

    relation: string;

    statusBefore: string;

    statusAfter: string;

    confidenceBefore: number;

    confidenceAfter: number;

    evidenceMatched: number;

    validationOutcome: "CONFIRMED" | "PARTIAL" | "UNSUPPORTED";

    observations: string[];

}