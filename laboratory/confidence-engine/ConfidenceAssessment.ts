export interface ConfidenceAssessment {

    assessmentId: string;

    sourceConclusionId: string;

    sourcePatternId: string;

sourcePatternRelation: string;

    statement: string;

    originalConfidence: number;

    calculatedConfidence: number;

    independentSources: number;

    evidenceEvents: number;

    evidenceQuality: "LOW" | "MEDIUM" | "HIGH";

    maturity: "PRELIMINARY" | "SUPPORTED" | "ESTABLISHED";

    reasons: string[];

}