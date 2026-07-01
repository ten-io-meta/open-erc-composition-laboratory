import type { CompositionObservation } from "./CompositionObservation.js";
import type { CompositionKnowledge } from "./CompositionKnowledge.js";

export interface CompositionLearningResult {

    learnedAt: string;

    observations: CompositionObservation[];

    knowledge: CompositionKnowledge;

    errors: string[];

}