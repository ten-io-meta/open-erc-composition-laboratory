import type { RepositoryIntelligence } from "./RepositoryIntelligence.js";

export interface RepositoryIntelligenceResult {

    generatedAt: string;

    repositories: RepositoryIntelligence[];

    statistics: {

        repositories: number;

        bestRepository: string | null;

        bestAverageGain: number;

    };

    errors: string[];

}