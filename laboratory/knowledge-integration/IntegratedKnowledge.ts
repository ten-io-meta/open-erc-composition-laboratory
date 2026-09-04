export interface IntegratedKnowledge {
    knowledgeId: string;

    subject: string;

    relation: string;

    object: string;

    supportingSources: string[];

    confidence: number;

    evidence: string[];

    generatedBy: string;
}