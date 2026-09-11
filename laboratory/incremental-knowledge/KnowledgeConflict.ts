export interface KnowledgeConflict {

    relation: string;

    existingStatus: string;

    incomingStatus: string;

    existingConfidence: number;

    incomingConfidence: number;

    reason: string;

}