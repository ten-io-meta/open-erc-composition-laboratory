import type { ResearchKnowledge } from "../research-knowledge/ResearchKnowledge.js";
import type { KnowledgeEntry } from "../research-knowledge/KnowledgeEntry.js";

import type { KnowledgeConflict } from "./KnowledgeConflict.js";

export class KnowledgeConflictDetector {

    detect(
        previous: ResearchKnowledge | null,
        incoming: ResearchKnowledge
    ): KnowledgeConflict[] {

        if (!previous) {
            return [];
        }

        const conflicts: KnowledgeConflict[] = [];

        for (const incomingEntry of incoming.entries) {

            const existingEntry = previous.entries.find(
                entry => this.sameRelation(entry, incomingEntry)
            );

            if (!existingEntry) {
                continue;
            }

            const statusConflict =
                this.isPositive(existingEntry.status) &&
                this.isNegative(incomingEntry.status);

            const reverseStatusConflict =
                this.isNegative(existingEntry.status) &&
                this.isPositive(incomingEntry.status);

            const confidenceDrop =
                existingEntry.averageConfidence >= 70 &&
                incomingEntry.averageConfidence <= 40;

            if (
                statusConflict ||
                reverseStatusConflict ||
                confidenceDrop
            ) {
                conflicts.push({
                    relation: incomingEntry.relation,
                    existingStatus: existingEntry.status,
                    incomingStatus: incomingEntry.status,
                    existingConfidence: existingEntry.averageConfidence,
                    incomingConfidence: incomingEntry.averageConfidence,
                    reason: this.reason(
                        existingEntry,
                        incomingEntry,
                        statusConflict,
                        reverseStatusConflict,
                        confidenceDrop
                    )
                });
            }

        }

        return conflicts;

    }

    private sameRelation(
        a: KnowledgeEntry,
        b: KnowledgeEntry
    ): boolean {
        return a.relation === b.relation &&
            a.protocolPair === b.protocolPair;
    }

    private isPositive(status: string): boolean {
        return status === "SUPPORTED" ||
            status === "VALIDATED" ||
            status === "CANONICAL";
    }

    private isNegative(status: string): boolean {
        return status === "REJECTED";
    }

    private reason(
        existingEntry: KnowledgeEntry,
        incomingEntry: KnowledgeEntry,
        statusConflict: boolean,
        reverseStatusConflict: boolean,
        confidenceDrop: boolean
    ): string {

        if (statusConflict) {
            return "Existing knowledge is positive, but incoming knowledge rejects the relation.";
        }

        if (reverseStatusConflict) {
            return "Existing knowledge rejects the relation, but incoming knowledge supports it.";
        }

        if (confidenceDrop) {
            return `Incoming confidence is significantly lower (${incomingEntry.averageConfidence}%) than existing confidence (${existingEntry.averageConfidence}%).`;
        }

        return "Potential knowledge conflict detected.";

    }

}