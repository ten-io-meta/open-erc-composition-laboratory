export interface ResearchPipelineResult {

    pipelineId: string;

    executedAt: string;

    historicalStateMode:
        | "ISOLATED"
        | "PERSISTENT";

    partialKnowledgePath: string;

    sourceId: string;

    /*
     * Exact source revision when available.
     *
     * For GitHub sources this is propagated from commitSha.
     */
    sourceRevision?: string;

    analysisPath: string;

    corpusPath: string;

    learningPath: string;

    knowledgePath: string;

    protocols: number;

    capabilities: number;

    claims: number;

    candidateClaims: number;

    inconclusiveClaims: number;

    knowledgeEntries: number;

    supportedKnowledge: number;

    memoryPath: string;

    memoryEvents: number;

    emergingKnowledge: number;

    incrementalKnowledgePath: string;

    incrementalObservations: number;

    errors: string[];

}
