export interface ProtocolIntelligenceResult {
    protocolId: string;
    observations: number;
    successfulCompositions: number;
    averageCompatibility: number;
    averageStability: number;
    averageSafety: number;
    averageRisk: "Low" | "Medium" | "High";
    eligibleRelationships: number;
}