import type {
    ScientificKnowledgeState
} from "../scientific-knowledge-evolution/ScientificKnowledgeState.js";

import type {
    ScientificBeliefStateTransition
} from "./ScientificBeliefStateTransition.js";

export interface ScientificBeliefStateTransitionResult {

    generatedAt:
        string;

    transitions:
        ScientificBeliefStateTransition[];

    states:
        ScientificKnowledgeState[];

    statistics: {

        total:
            number;

        preserved:
            number;

        strengtheningRecorded:
            number;

        challengesRecorded:
            number;

        conflictsRecorded:
            number;

        confidenceChanges:
            number;

        independentSourceChanges:
            number;

        statusChanges:
            number;

        lifecyclePromotions:
            number;

        rejections:
            number;

        requiringFurtherExperiment:
            number;
    };

    errors:
        string[];
}