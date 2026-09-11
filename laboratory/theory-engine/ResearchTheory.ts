export interface ResearchTheory {

    theoryId: string;

    title: string;

    description: string;

    supportingEdges: string[];

    confidence: number;

    maturity: "EMERGING" | "SUPPORTED" | "ESTABLISHED";

}