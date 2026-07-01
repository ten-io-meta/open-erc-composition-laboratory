import type { ResearchKnowledge } from "../research-knowledge/ResearchKnowledge.js";
import type { IncrementalKnowledgeResult } from "./IncrementalKnowledgeResult.js";

import { IncrementalKnowledgeBuilder } from "./IncrementalKnowledgeBuilder.js";
import { KnowledgeConflictDetector } from "./KnowledgeConflictDetector.js";
import { KnowledgeEvolutionEngine } from "./KnowledgeEvolutionEngine.js";

export class IncrementalKnowledgeEngine {

    build(
        previous: ResearchKnowledge | null,
        incoming: ResearchKnowledge,
        sourceId = "UNKNOWN"
    ): IncrementalKnowledgeResult {

        try {

            const alreadyProcessed = previous?.processedSources?.some(
                source => source.sourceId === sourceId
            ) ?? false;

            if (previous && alreadyProcessed) {
                return {
                    generatedAt: new Date().toISOString(),
                    knowledge: previous,
                    merges: [],
                    conflicts: [],
                    resolutions: [],
                    evolution: [],
                    errors: []
                };
            }

            const conflictDetector = new KnowledgeConflictDetector();
            const builder = new IncrementalKnowledgeBuilder();
            const evolutionEngine = new KnowledgeEvolutionEngine();

            const conflicts = conflictDetector.detect(previous, incoming);

            const merged = builder.merge(
                previous,
                incoming
            );

            const evolved = evolutionEngine.evolve(
                {
                    ...merged.knowledge,
                    processedSources: [
                        ...(previous?.processedSources ?? []),
                        {
                            sourceId,
                            processedAt: new Date().toISOString()
                        }
                    ]
                }
            );

            return {
                generatedAt: new Date().toISOString(),
                knowledge: evolved.knowledge,
                merges: merged.merges,
                conflicts,
                resolutions: [],
                evolution: evolved.evolution,
                errors: []
            };

        } catch (error) {

            return {
                generatedAt: new Date().toISOString(),
                knowledge: incoming,
                merges: [],
                conflicts: [],
                resolutions: [],
                evolution: [],
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown incremental knowledge error"
                ]
            };

        }

    }

}