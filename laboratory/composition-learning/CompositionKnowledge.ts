import type { CompositionStatistics } from "./CompositionStatistics.js";

export interface CompositionKnowledge {

    generatedAt: string;

    totalObservations: number;

    statistics: CompositionStatistics[];

}