import type { ResearchKnowledge } from "../research-knowledge/ResearchKnowledge.js";

import type { KnowledgeMerge } from "./KnowledgeMerge.js";
import type { KnowledgeConflict } from "./KnowledgeConflict.js";
import type { KnowledgeConflictResolution } from "./KnowledgeConflictResolution.js";
import type { KnowledgeEvolution } from "./KnowledgeEvolution.js";

export interface IncrementalKnowledgeResult {

    generatedAt: string;

    knowledge: ResearchKnowledge;

    merges: KnowledgeMerge[];

    conflicts: KnowledgeConflict[];

    resolutions: KnowledgeConflictResolution[];

    evolution: KnowledgeEvolution[];

    errors: string[];

}