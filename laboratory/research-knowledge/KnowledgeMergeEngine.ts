import type { ResearchKnowledge } from "./ResearchKnowledge.js";
import type { KnowledgeEntry } from "./KnowledgeEntry.js";
import type { KnowledgeMergeResult } from "./KnowledgeMergeResult.js";

export class KnowledgeMergeEngine {

    merge(
        knowledgeBases: ResearchKnowledge[]
    ): KnowledgeMergeResult {

        try {

            const entries = new Map<string, KnowledgeEntry>();

            const mergedSources = new Set<string>();

            for (const knowledge of knowledgeBases) {

                for (const source of knowledge.processedSources ?? []) {
                    mergedSources.add(source.sourceId);
                }

                for (const entry of knowledge.entries) {

                    const key = this.key(entry);

                    const existing = entries.get(key);

                    if (!existing) {
                        entries.set(key, {
                            ...entry,
                            evidence: [...entry.evidence]
                        });

                        continue;
                    }

                    const totalObservations =
                        existing.observations + entry.observations;

                    const weightedConfidence =
                        Math.round(
                            (
                                existing.averageConfidence * existing.observations +
                                entry.averageConfidence * entry.observations
                            ) / totalObservations
                        );

                    entries.set(key, {
                        ...existing,
                        observations: totalObservations,
                        averageConfidence: weightedConfidence,
                        confirmed: existing.confirmed + entry.confirmed,
                        partial: existing.partial + entry.partial,
                        unsupported: existing.unsupported + entry.unsupported,
                        evidence: [
                            ...new Set([
                                ...existing.evidence,
                                ...entry.evidence
                            ])
                        ],
                        status: this.statusFor({
                            ...existing,
                            observations: totalObservations,
                            averageConfidence: weightedConfidence,
                            confirmed: existing.confirmed + entry.confirmed,
                            partial: existing.partial + entry.partial,
                            unsupported: existing.unsupported + entry.unsupported
                        })
                    });

                }

            }

            const mergedEntries = [...entries.values()];

            const knowledge: ResearchKnowledge = {
                knowledgeBaseId: `KB-MERGED-${new Date().toISOString()}`,
                generatedAt: new Date().toISOString(),
                entries: mergedEntries,
                processedSources: [...mergedSources].map(sourceId => ({
                    sourceId,
                    processedAt: new Date().toISOString()
                })),
                statistics: {
                    entries: mergedEntries.length,
                    totalObservations: mergedEntries.reduce(
                        (sum, entry) => sum + entry.observations,
                        0
                    ),
                    emerging: mergedEntries.filter(entry => entry.status === "EMERGING").length,
                    supported: mergedEntries.filter(entry => entry.status === "SUPPORTED").length,
                    validated: mergedEntries.filter(entry => entry.status === "VALIDATED").length,
                    canonical: mergedEntries.filter(entry => entry.status === "CANONICAL").length,
                    rejected: mergedEntries.filter(entry => entry.status === "REJECTED").length
                }
            };

            return {
                generatedAt: new Date().toISOString(),
                knowledge,
                mergedSources: [...mergedSources],
                mergedEntries: mergedEntries.length,
                errors: []
            };

        } catch (error) {

            return {
                generatedAt: new Date().toISOString(),
                knowledge: {
                    knowledgeBaseId: `KB-MERGED-${new Date().toISOString()}`,
                    generatedAt: new Date().toISOString(),
                    entries: [],
                    processedSources: [],
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
                mergedSources: [],
                mergedEntries: 0,
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown knowledge merge error"
                ]
            };

        }

    }

    private key(entry: KnowledgeEntry): string {
        return `${entry.relation}|${entry.protocolPair}`;
    }

    private statusFor(entry: KnowledgeEntry): KnowledgeEntry["status"] {

        if (entry.unsupported > entry.confirmed + entry.partial) {
            return "REJECTED";
        }

        if (entry.observations >= 8 && entry.averageConfidence >= 95) {
            return "CANONICAL";
        }

        if (entry.observations >= 3 && entry.averageConfidence >= 85) {
            return "VALIDATED";
        }

        if (entry.confirmed > 0 && entry.averageConfidence >= 70) {
            return "SUPPORTED";
        }

        if (entry.partial > 0 || entry.averageConfidence >= 40) {
            return "EMERGING";
        }

        return "EMERGING";

    }

}