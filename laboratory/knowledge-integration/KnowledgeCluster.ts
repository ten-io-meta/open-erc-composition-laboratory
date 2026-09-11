export interface KnowledgeCluster {
    clusterId: string;

    name: string;

    knowledgeIds: string[];

    commonConcepts: string[];

    confidence: number;
}