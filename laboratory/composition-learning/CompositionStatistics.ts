export interface CompositionStatistics {

    relationKey: string;

    protocolPair: string;

    observations: number;

    supported: number;

    candidates: number;

    inconclusive: number;

    averageConfidence: number;

    status: "STABLE" | "EMERGING" | "WEAK" | "UNKNOWN";

}