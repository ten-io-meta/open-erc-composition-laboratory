import type { ResearchKnowledge } from "../research-knowledge/ResearchKnowledge.js";
import type { KnowledgeEntry } from "../research-knowledge/KnowledgeEntry.js";

import type { KnowledgeEvolution } from "./KnowledgeEvolution.js";

export class KnowledgeEvolutionEngine {

    evolve(
        knowledge: ResearchKnowledge
    ): {
        knowledge: ResearchKnowledge;
        evolution: KnowledgeEvolution[];
    } {

        const evolution: KnowledgeEvolution[] = [];

        const entries = knowledge.entries.map(entry => {
            const nextStatus = this.statusFor(entry);

            if (nextStatus !== entry.status) {
                evolution.push({
                    relation: entry.relation,
                    previousStatus: entry.status,
                    newStatus: nextStatus,
                    previousConfidence: entry.averageConfidence,
                    newConfidence: entry.averageConfidence,
                    observations: entry.observations
                });
            }

            return {
                ...entry,
                status: nextStatus
            };
        });

        return {
            knowledge: {
                ...knowledge,
                generatedAt: new Date().toISOString(),
                entries,
                statistics: this.statistics(entries)
            },
            evolution
        };

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

    private statistics(entries: KnowledgeEntry[]) {
        return {
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
    }

}