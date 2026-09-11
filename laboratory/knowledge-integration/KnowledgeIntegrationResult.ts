import { IntegratedKnowledge } from "./IntegratedKnowledge.js";
import { KnowledgeRelationship } from "./KnowledgeRelationship.js";
import { KnowledgeCluster } from "./KnowledgeCluster.js";
import { KnowledgeConflict } from "./KnowledgeConflict.js";

export interface KnowledgeIntegrationResult {
    generatedAt: string;

    integratedKnowledge: IntegratedKnowledge[];

    relationships: KnowledgeRelationship[];

    clusters: KnowledgeCluster[];

    conflicts: KnowledgeConflict[];

    errors: string[];
}