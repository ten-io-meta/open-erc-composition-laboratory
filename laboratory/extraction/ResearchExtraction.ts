export interface ResearchExtraction {

    sourceId: string;

    extractedAt: string;

    protocols: string[];

    capabilities: string[];

    invariants: string[];

    relationships: {
        from: string;
        to: string;
        relation: string;
        evidence: string;
    }[];

    claims: {
        claimId: string;
        text: string;
        evidence: string;
        confidence: number;
    }[];

}