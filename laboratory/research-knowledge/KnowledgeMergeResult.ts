import type { ResearchKnowledge } from "./ResearchKnowledge.js";

export interface KnowledgeMergeResult {

    generatedAt: string;

    knowledge: ResearchKnowledge;

    mergedSources: string[];

    mergedEntries: number;

    errors: string[];

}