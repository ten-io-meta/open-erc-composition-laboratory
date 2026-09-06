import type { ResearchKnowledge } from "../research-knowledge/ResearchKnowledge.js";
import type { KnowledgeEntry } from "../research-knowledge/KnowledgeEntry.js";

import type { KnowledgeMerge } from "./KnowledgeMerge.js";

export class IncrementalKnowledgeBuilder {

    merge(
        previous: ResearchKnowledge | null,
        incoming: ResearchKnowledge
    ): {
        knowledge: ResearchKnowledge;
        merges: KnowledgeMerge[];
    } {

        if (!previous) {
            return {
                knowledge: incoming,
                merges: incoming.entries.map(entry => ({
                    relation: entry.relation,
                    previousObservations: 0,
                    newObservations: entry.observations,
                    mergedObservations: entry.observations,
                    previousConfidence: 0,
                    newConfidence: entry.averageConfidence,
                    mergedConfidence: entry.averageConfidence
                }))
            };
        }

        const mergedEntries = new Map<string, KnowledgeEntry>();
        const merges: KnowledgeMerge[] = [];

        for (const entry of previous.entries) {
            mergedEntries.set(this.key(entry), { ...entry });
        }

        for (const incomingEntry of incoming.entries) {
            const key = this.key(incomingEntry);
            const existingEntry = mergedEntries.get(key);

            if (!existingEntry) {
                mergedEntries.set(key, incomingEntry);

                merges.push({
                    relation: incomingEntry.relation,
                    previousObservations: 0,
                    newObservations: incomingEntry.observations,
                    mergedObservations: incomingEntry.observations,
                    previousConfidence: 0,
                    newConfidence: incomingEntry.averageConfidence,
                    mergedConfidence: incomingEntry.averageConfidence
                });

                continue;
            }

            const mergedObservations =
                existingEntry.observations + incomingEntry.observations;

            const mergedConfidence = Math.round(
                (
                    existingEntry.averageConfidence * existingEntry.observations +
                    incomingEntry.averageConfidence * incomingEntry.observations
                ) / mergedObservations
            );

            merges.push({
                relation: incomingEntry.relation,
                previousObservations: existingEntry.observations,
                newObservations: incomingEntry.observations,
                mergedObservations,
                previousConfidence: existingEntry.averageConfidence,
                newConfidence: incomingEntry.averageConfidence,
                mergedConfidence
            });

            mergedEntries.set(key, {
                ...existingEntry,
                observations: mergedObservations,
                averageConfidence: mergedConfidence,
                confirmed: existingEntry.confirmed + incomingEntry.confirmed,
                partial: existingEntry.partial + incomingEntry.partial,
                unsupported: existingEntry.unsupported + incomingEntry.unsupported,
                evidence: [
                    ...new Set([
                        ...existingEntry.evidence,
                        ...incomingEntry.evidence
                    ])
                ]
            });
        }

        const entries = [...mergedEntries.values()];

        return {
            knowledge: {
                knowledgeBaseId: `KB-INCREMENTAL-${new Date().toISOString()}`,
                generatedAt: new Date().toISOString(),
                entries,
                statistics: {
                    entries: entries.length,
                    totalObservations: entries.reduce((sum, entry) => sum + entry.observations, 0),
                    emerging: entries.filter(entry => entry.status === "EMERGING").length,
                    supported: entries.filter(entry => entry.status === "SUPPORTED").length,
                    validated: entries.filter(entry => entry.status === "VALIDATED").length,
                    canonical: entries.filter(entry => entry.status === "CANONICAL").length,
                    rejected: entries.filter(entry => entry.status === "REJECTED").length
                }
            },
            merges
        };
    }

    private key(entry: KnowledgeEntry): string {
        return [
            entry.relation,
            `PROTOCOL:${entry.protocolPair ?? ""}`,
            `CAPABILITY:${entry.capabilityPair ?? ""}`
        ].join("|");
    }

}