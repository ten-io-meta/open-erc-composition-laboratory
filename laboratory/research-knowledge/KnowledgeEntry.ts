export interface KnowledgeEntry {

    entryId: string;

    /*
     * Primary source retained for backward compatibility.
     * Aggregated knowledge should use sources[].
     */

    sourceId: string;

    sources?: string[];

    relation: string;

    /*
     * Real protocol identity only.
     *
     * Absence means this knowledge entry does not carry
     * attributable protocol-pair information.
     */
    protocolPair?: string;

    /*
     * Semantic capability identity.
     *
     * This must never be promoted into protocolPair.
     */
    capabilityPair?: string;

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