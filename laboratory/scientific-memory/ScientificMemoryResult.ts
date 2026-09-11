import type {
    ScientificMemory
} from "./ScientificMemory.js";

export interface ScientificMemoryResult {

    previousMemory:
        ScientificMemory | null;

    currentMemory:
        ScientificMemory;

    statistics: {

        trackedKnowledge: number;

        newKnowledge: number;

        recurringKnowledge: number;

        forgottenKnowledge: number;

    };

}