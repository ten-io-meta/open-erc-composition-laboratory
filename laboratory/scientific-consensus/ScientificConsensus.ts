export interface ScientificConsensus {

    consensusId: string;

    statement: string;

    consensusLevel: "WEAK" | "MODERATE" | "STRONG";

    confidence: number;

    supportingSources: number;

    maturity: "PRELIMINARY" | "SUPPORTED" | "ESTABLISHED";

}