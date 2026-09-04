export interface InferredRelationship {

    inferenceId: string;

    from: string;

    relation: string;

    to: string;

    inferredFrom: string[];

    confidence: number;

    rationale: string;

}