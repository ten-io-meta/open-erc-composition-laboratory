export interface KnowledgeRelationship {
    relationshipId: string;

    sourceKnowledgeId: string;

    targetKnowledgeId: string;

    relationship: string;

    confidence: number;

    reason: string;
}