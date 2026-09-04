export interface ScientificEvidenceSnapshot {

    campaignId: string;

    observedAt: string;

    status: string;

    confidence: number;

    independentSources: number;

    contradictionCount: number;

    validationStatus: string;

}

export type ScientificEvidenceMomentum =
    | "VERY_STRONG"
    | "STRONG"
    | "NORMAL"
    | "WEAK"
    | "DECLINING";

export interface ScientificEvidenceHistory {

    knowledgeId: string;

    statement: string;

    firstObservedAt: string;

    lastObservedAt: string;

    snapshots: ScientificEvidenceSnapshot[];

    totalCampaignsObserved: number;

    highestConfidence: number;

    lowestConfidence: number;

    highestSourceCount: number;

    totalConfidenceGain: number;

    totalSourceGain: number;

    evidenceTrend:
        | "GROWING"
        | "STABLE"
        | "DECLINING"
        | "VOLATILE"
        | "INSUFFICIENT_DATA";

    stabilityScore: number;

    /*
     * Long-term scientific metrics
     */

    longTermConfidenceGain: number;

    longTermSourceGain: number;

    longTermContradictionGrowth: number;

    evidenceMomentum:
        ScientificEvidenceMomentum;

    reliabilityScore: number;

    predictionReady: boolean;

}