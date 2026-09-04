import type { InferredRelationship } from "./InferredRelationship.js";

export interface InferenceResult {

    generatedAt: string;

    inferredRelationships: InferredRelationship[];

    statistics: {

        inferred: number;

    };

    errors: string[];

}