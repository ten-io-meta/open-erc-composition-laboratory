export interface KnowledgeEntry {

    entryId: string;

    relation: string;

    protocolPair: string;

    observations: number;

    averageConfidence: number;

    confirmed: number;

    partial: number;

    unsupported: number;

    status: "EMERGING" | "SUPPORTED" | "VALIDATED" | "CANONICAL" | "REJECTED";

    evidence: string[];

}