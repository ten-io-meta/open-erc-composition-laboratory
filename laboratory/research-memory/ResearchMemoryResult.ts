import type { ResearchMemory } from "./ResearchMemory.js";

export interface ResearchMemoryResult {

    generatedAt: string;

    memory: ResearchMemory;

    errors: string[];

}