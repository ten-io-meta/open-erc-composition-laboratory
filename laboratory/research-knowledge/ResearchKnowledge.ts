import type { KnowledgeEntry } from "./KnowledgeEntry.js";
import type { KnowledgeStatistics } from "./KnowledgeStatistics.js";

export interface ResearchKnowledge {

    knowledgeBaseId: string;

    generatedAt: string;

    entries: KnowledgeEntry[];

    statistics: KnowledgeStatistics;

}