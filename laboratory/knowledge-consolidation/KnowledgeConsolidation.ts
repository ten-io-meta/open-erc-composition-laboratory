export interface KnowledgeConsolidation {

    consolidationId: string;

    knowledgeId: string;

    sourceConclusionId: string;

    sourcePatternId: string;

sourcePatternRelation: string;

    statement: string;

    previousStatus:
        | "EMERGING"
        | "SUPPORTED"
        | "ESTABLISHED"
        | "CANONICAL"
        | "ARCHIVED";

    newStatus:
        | "EMERGING"
        | "SUPPORTED"
        | "ESTABLISHED"
        | "CANONICAL"
        | "ARCHIVED";

    confidenceBefore: number;

    confidenceAfter: number;

    confidenceDelta: number;

    evidenceBefore: number;

evidenceAfter: number;

evidenceDelta: number;

/*
 * Number of scientifically independent sources explicitly
 * established by the source-independence assessment layer.
 *
 * This value is distinct from evidence quantity.
 */
independentSources: number;

campaignsObserved: number;

    action:
        | "PROMOTED"
        | "RETAINED"
        | "DEGRADED"
        | "ARCHIVED";

    explanation: string;

}