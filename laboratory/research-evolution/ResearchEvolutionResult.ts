import type {
    ResearchEvolution
} from "./ResearchEvolution.js";

export type ResearchMaturity =
    | "INITIAL"
    | "DEVELOPING"
    | "ESTABLISHED"
    | "MATURE";

export type ResearchVelocity =
    | "DECLINING"
    | "STAGNANT"
    | "SLOW"
    | "NORMAL"
    | "RAPID";

export type ResearchAcceleration =
    | "DECELERATING"
    | "STABLE"
    | "ACCELERATING";

export interface ResearchEvolutionResult {

    generatedAt: string;

    evolutions:
        ResearchEvolution[];

    statistics: {

        evolutions: number;

        newKnowledge: number;

        strengthenedKnowledge: number;

        weakenedKnowledge: number;

        removedKnowledge: number;

        newPatterns: number;

        strengthenedPatterns: number;

        weakenedPatterns: number;

        removedPatterns: number;

        newConclusions: number;

        strengthenedConclusions: number;

        weakenedConclusions: number;

        removedConclusions: number;

        positiveEvolutions: number;

        negativeEvolutions: number;

        unchangedEntities: number;

        stagnantCycle: boolean;

        knowledgeDecay: number;

        campaignProductivity: number;

        researchMaturityScore: number;

        researchMaturity:
            ResearchMaturity;

        researchVelocityScore: number;

        researchVelocity:
            ResearchVelocity;

        researchAccelerationScore: number;

        researchAcceleration:
            ResearchAcceleration;

    };

    errors: string[];

}