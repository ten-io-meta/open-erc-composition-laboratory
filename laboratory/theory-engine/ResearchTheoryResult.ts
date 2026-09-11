import type { ResearchTheory } from "./ResearchTheory.js";

export interface ResearchTheoryResult {

    generatedAt: string;

    theories: ResearchTheory[];

    statistics: {
        theories: number;
        emerging: number;
        supported: number;
        established: number;
    };

    errors: string[];

}