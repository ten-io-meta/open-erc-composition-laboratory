import type { CompositionLearningResult } from "../composition-learning/CompositionLearningResult.js";
import type { HypothesisValidationResult } from "../hypothesis/HypothesisValidationResult.js";

import type { KnowledgeResult } from "./KnowledgeResult.js";

import { KnowledgeBuilder } from "./KnowledgeBuilder.js";

import type { MachineReasoningResult } from "../machine-reasoning/MachineReasoningResult.js";

export class KnowledgeEngine {

    build(
        learning: CompositionLearningResult,
        validation: HypothesisValidationResult,
        machineReasoning?: MachineReasoningResult,
        sourceId = "UNKNOWN"
    ): KnowledgeResult {

        try {

            const builder = new KnowledgeBuilder();

            const knowledge = builder.build(
                learning,
                validation,
                machineReasoning,
                sourceId
            );

            return {
                generatedAt: new Date().toISOString(),
                knowledge,
                errors: []
            };

        } catch (error) {

            return {
                generatedAt: new Date().toISOString(),
                knowledge: {
                    knowledgeBaseId: `KB-${new Date().toISOString()}`,
                    generatedAt: new Date().toISOString(),
                    entries: [],
                    statistics: {
                        entries: 0,
                        totalObservations: 0,
                        emerging: 0,
                        supported: 0,
                        validated: 0,
                        canonical: 0,
                        rejected: 0
                    }
                },
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown research knowledge error"
                ]
            };

        }

    }

}