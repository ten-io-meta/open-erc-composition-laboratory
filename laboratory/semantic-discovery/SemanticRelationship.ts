export interface SemanticRelationship {

    fromCapability: string;

    toCapability: string;

    relation: "CO_OCCURS_WITH" | "POTENTIAL_COMPOSITION";

    evidence: string[];

    confidence: number;

}