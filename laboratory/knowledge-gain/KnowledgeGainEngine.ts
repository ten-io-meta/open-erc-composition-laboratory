import type { ResearchEvolutionResult } from "../research-evolution/ResearchEvolutionResult.js";
import type { KnowledgeGain } from "./KnowledgeGain.js";
import type { KnowledgeGainResult } from "./KnowledgeGainResult.js";

export class KnowledgeGainEngine {

    build(
        evolution: ResearchEvolutionResult
    ): KnowledgeGainResult {

        try {

            const gains = new Map<string, KnowledgeGain>();

            for (const event of evolution.evolutions) {

                for (const sourceId of event.sources ?? []) {

                    const gain = gains.get(sourceId) ?? {
                        sourceId,
                        knowledgeGainScore: 0,
                        newPatterns: 0,
                        strengthenedPatterns: 0,
                        newConclusions: 0,
                        strengthenedConclusions: 0,
                        evidenceEvents: 0
                    };

                    switch (event.type) {

                        case "NEW_PATTERN":
                            gain.newPatterns++;
                            gain.knowledgeGainScore += 5;
                            break;

                        case "STRENGTHENED_PATTERN":
                            gain.strengthenedPatterns++;
                            gain.knowledgeGainScore += 3;
                            break;

                        case "NEW_CONCLUSION":
                            gain.newConclusions++;
                            gain.knowledgeGainScore += 6;
                            break;

                        case "STRENGTHENED_CONCLUSION":
                            gain.strengthenedConclusions++;
                            gain.knowledgeGainScore += 4;
                            break;

                        case "NEW_KNOWLEDGE":
                            gain.knowledgeGainScore += 2;
                            break;

                    }

                    gain.evidenceEvents++;

                    gains.set(sourceId, gain);

                }

            }

            const sources = [...gains.values()].sort(
                (a, b) => b.knowledgeGainScore - a.knowledgeGainScore
            );

            const highest = sources[0];

            return {
                generatedAt: new Date().toISOString(),
                sources,
                statistics: {
                    sources: sources.length,
                    totalKnowledgeGain: sources.reduce(
                        (sum, item) => sum + item.knowledgeGainScore,
                        0
                    ),
                    highestGainSource: highest?.sourceId ?? null,
                    highestGainScore: highest?.knowledgeGainScore ?? 0
                },
                errors: []
            };

        } catch (error) {

            return {
                generatedAt: new Date().toISOString(),
                sources: [],
                statistics: {
                    sources: 0,
                    totalKnowledgeGain: 0,
                    highestGainSource: null,
                    highestGainScore: 0
                },
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown knowledge gain error"
                ]
            };

        }

    }

}