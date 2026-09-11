export interface ScientificEvidenceAccumulation {

    accumulationId: string;

    knowledgeId: string;

    statement: string;

    campaignId: string;

    previousConfidence: number;

    currentConfidence: number;

    confidenceDelta: number;

    previousSources: number;

    currentSources: number;

    sourceDelta: number;

    previousContradictions: number;

    currentContradictions: number;

    contradictionDelta: number;

    evidenceTrend:
        | "GROWING"
        | "STABLE"
        | "DECLINING"
        | "VOLATILE"
        | "INSUFFICIENT_DATA";

    accumulationStatus:
        | "NEW_EVIDENCE"
        | "EVIDENCE_STRENGTHENED"
        | "EVIDENCE_STABLE"
        | "EVIDENCE_WEAKENED"
        | "EVIDENCE_CONFLICTED";

    explanation: string;

}