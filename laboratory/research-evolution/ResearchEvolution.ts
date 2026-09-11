export type ResearchEvolutionType =
    | "NEW_KNOWLEDGE"
    | "STRENGTHENED_KNOWLEDGE"
    | "WEAKENED_KNOWLEDGE"
    | "REMOVED_KNOWLEDGE"
    | "NEW_PATTERN"
    | "STRENGTHENED_PATTERN"
    | "WEAKENED_PATTERN"
    | "REMOVED_PATTERN"
    | "NEW_CONCLUSION"
    | "STRENGTHENED_CONCLUSION"
    | "WEAKENED_CONCLUSION"
    | "REMOVED_CONCLUSION";

export type ResearchEvolutionDimension =
    | "KNOWLEDGE"
    | "PATTERN"
    | "CONCLUSION";

export interface ResearchEvolution {

    evolutionId: string;

    type:
        ResearchEvolutionType;

    dimension:
        ResearchEvolutionDimension;

    entityId: string;

    statement: string;

    before?: string;

    after?: string;

    scoreBefore: number;

    scoreAfter: number;

    scoreDelta: number;

    sources: string[];

    evidence: string[];

    explanation: string;

}