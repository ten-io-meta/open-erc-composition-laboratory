export interface ResearchCorpusEntry {

    sourceId: string;

    analysisPath: string;

    protocols: number;

    capabilities: number;

    claims: number;

    supportedClaims: number;

    candidateClaims: number;

    inconclusiveClaims: number;

    status: "ANALYZED" | "PARTIAL" | "FAILED";

}