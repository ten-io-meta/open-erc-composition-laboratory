import type { SemanticReasoningRelation } from "./SemanticReasoningRelation.js";

export interface SemanticReasoningResult {

    sourceId: string;

    reasonedAt: string;

    relations: SemanticReasoningRelation[];

    errors: string[];

}