export interface KnowledgeEntry {

    entryId: string;

    /*
     * Primary source retained for backward compatibility.
     * Aggregated knowledge should use sources[].
     */

    sourceId: string;

    sources?: string[];

    relation: string;

    protocolPair: string;

    observations: number;

    averageConfidence: number;

    confirmed: number;

    partial: number;

    unsupported: number;

    status:
        | "EMERGING"
        | "SUPPORTED"
        | "VALIDATED"
        | "CANONICAL"
        | "REJECTED";

    evidence: string[];

    derivedFrom?: string[];

    generatedBy?:
        | "LEARNING"
        | "MACHINE_REASONING"
        | "HYPOTHESIS"
        | "VALIDATION"
        | "MEMORY";

    timestamp: string;

}