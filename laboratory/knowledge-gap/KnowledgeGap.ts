export interface KnowledgeGap {

    gapId: string;

    sourceConclusionId?: string;

    gapType:
        | "LOW_CONFIDENCE"
        | "INFERRED_ONLY"
        | "WEAK_EVIDENCE"
        | "UNDERCONNECTED_NODE";

    statement: string;

    relatedNodes: string[];

    relatedEdges: string[];

    priority: "HIGH" | "MEDIUM" | "LOW";

    recommendation: string;

}