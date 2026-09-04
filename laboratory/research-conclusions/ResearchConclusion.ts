export interface ResearchConclusion {

    conclusionId: string;

    sourcePatternId: string;

    sourcePatternRelation: string;

    subject: string;

    relation: string;

    object: string;

    statement: string;

    supportedBy: string[];

    confidence: number;

    status: "PRELIMINARY" | "SUPPORTED" | "ESTABLISHED";

    evidence: string[];

}