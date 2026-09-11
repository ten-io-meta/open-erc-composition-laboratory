import type { CompositionLearningResult } from "../composition-learning/CompositionLearningResult.js";
import type { HypothesisValidationResult } from "../hypothesis/HypothesisValidationResult.js";

import type { KnowledgeEntry } from "./KnowledgeEntry.js";
import type { ResearchKnowledge } from "./ResearchKnowledge.js";

import { ReasoningKnowledgeAdapter } from "./ReasoningKnowledgeAdapter.js";
import type { MachineReasoningResult } from "../machine-reasoning/MachineReasoningResult.js";

export class KnowledgeBuilder {

    build(
        learning: CompositionLearningResult,
        validation: HypothesisValidationResult,
        machineReasoning?: MachineReasoningResult,
        sourceId = "UNKNOWN"
    ): ResearchKnowledge {

        const timestamp = new Date().toISOString();

        const learningEntries: KnowledgeEntry[] = learning.knowledge.statistics.map(
            (stat, index) => {

                const matchingValidation = validation.validations.find(
                    item => item.relation === stat.relationKey
                );

                const confirmed =
                    matchingValidation?.validationOutcome === "CONFIRMED" ? 1 : 0;

                const partial =
                    matchingValidation?.validationOutcome === "PARTIAL" ? 1 : 0;

                const unsupported =
                    matchingValidation?.validationOutcome === "UNSUPPORTED" ? 1 : 0;

                const averageConfidence =
                    matchingValidation?.confidenceAfter ?? stat.averageConfidence;

                const status =
                    confirmed > 0 && averageConfidence >= 95
                        ? "CANONICAL"
                        : confirmed > 0 && averageConfidence >= 80
                            ? "VALIDATED"
                            : confirmed > 0
                                ? "SUPPORTED"
                                : partial > 0
                                    ? "EMERGING"
                                    : unsupported > 0
                                        ? "REJECTED"
                                        : "EMERGING";

                return {
                    entryId: `KNOW-${String(index + 1).padStart(5, "0")}`,
                    sourceId,
                    relation: stat.relationKey,
                    protocolPair: stat.protocolPair,
                    observations: stat.observations,
                    averageConfidence,
                    confirmed,
                    partial,
                    unsupported,
                    status,
                    evidence: [
                        `learning:${stat.relationKey}`,
                        ...(matchingValidation
                            ? [`validation:${matchingValidation.hypothesisId}`]
                            : [])
                    ],
                    generatedBy: "LEARNING",
                    timestamp
                };

            }
        );

        const reasoningEntries = ReasoningKnowledgeAdapter.toKnowledgeEntries(
            machineReasoning,
            learningEntries.length,
            sourceId
        );

        const entries = [
            ...learningEntries,
            ...reasoningEntries
        ];

        const statistics = {
            entries: entries.length,
            totalObservations: entries.reduce(
                (sum, entry) => sum + entry.observations,
                0
            ),
            emerging: entries.filter(entry => entry.status === "EMERGING").length,
            supported: entries.filter(entry => entry.status === "SUPPORTED").length,
            validated: entries.filter(entry => entry.status === "VALIDATED").length,
            canonical: entries.filter(entry => entry.status === "CANONICAL").length,
            rejected: entries.filter(entry => entry.status === "REJECTED").length
        };

        return {
            knowledgeBaseId: `KB-${timestamp}`,
            generatedAt: timestamp,
            entries,
            statistics
        };

    }

}