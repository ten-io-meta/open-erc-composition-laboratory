import { IntegratedKnowledge } from "./IntegratedKnowledge.js";

export interface ResearchKnowledgeAggregationResult {

    generatedAt: string;

    sourceCount: number;

    integratedKnowledge: IntegratedKnowledge[];

    errors: string[];

}