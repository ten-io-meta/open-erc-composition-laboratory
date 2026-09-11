import type { ResearchExtraction } from "./ResearchExtraction.js";

export interface ResearchExtractionResult {

    sourceId: string;

    success: boolean;

    extraction?: ResearchExtraction;

    errors: string[];

}