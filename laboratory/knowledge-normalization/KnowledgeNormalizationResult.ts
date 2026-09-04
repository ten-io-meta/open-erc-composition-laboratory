import { NormalizedConcept } from "./NormalizedConcept.js";

export interface KnowledgeNormalizationResult {

    generatedAt: string;

    concepts: NormalizedConcept[];

    errors: string[];

}