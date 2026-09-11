export interface ProtocolIntelligenceResult {
    protocolId: string;

    observations: number;
    successfulCompositions: number;

    averageCompatibility: number | null;
    averageStability: number | null;
    averageSafety: number | null;

    averageRisk:
        | "Low"
        | "Medium"
        | "High"
        | "Unknown";

    eligibleRelationships: number;

    strongestPartner?: string;
    weakestPartner?: string;

    dominantRiskReason: string;

    supportingEvidence: string[];
}