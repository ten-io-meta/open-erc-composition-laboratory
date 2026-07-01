export interface ResearchPipelineResult {

    pipelineId: string;

    executedAt: string;

    sourceId: string;

    analysisPath: string;

    corpusPath: string;

    learningPath: string;

    protocols: number;

    capabilities: number;

    claims: number;

    candidateClaims: number;

    inconclusiveClaims: number;

    knowledgeEntries: number;

    errors: string[];

}