import type { ResearchKnowledge } from "./ResearchKnowledge.js";

export interface KnowledgeResult {

    generatedAt: string;

    knowledge: ResearchKnowledge;

    errors: string[];

}