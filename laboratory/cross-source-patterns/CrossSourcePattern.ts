export interface CrossSourcePattern {

    patternId: string;

    relation: string;

    normalizedRelation: string;

    protocolPair?: string;

    sources: string[];

    occurrences: number;

    confidence: number;

    status: "CANDIDATE" | "EMERGING" | "SUPPORTED";

    evidence: string[];

}