import { IntegratedKnowledge } from "./IntegratedKnowledge.js";

export class KnowledgeMergeEngine {

    merge(
        knowledge: IntegratedKnowledge[]
    ): IntegratedKnowledge[] {

        const merged = new Map<string, IntegratedKnowledge>();

        for (const entry of knowledge) {

            const key =
                `${entry.subject}|${entry.relation}|${entry.object}`;

            const existing = merged.get(key);

            if (!existing) {

                merged.set(key, {

                    ...entry,

                    supportingSources: [
                        ...entry.supportingSources
                    ],

                    evidence: [
                        ...entry.evidence
                    ]

                });

                continue;

            }

            existing.supportingSources = Array.from(

                new Set([
                    ...existing.supportingSources,
                    ...entry.supportingSources
                ])

            );

            existing.evidence = Array.from(

                new Set([
                    ...existing.evidence,
                    ...entry.evidence
                ])

            );

            existing.confidence = Math.max(

                existing.confidence,
                entry.confidence

            );

        }

        return Array.from(merged.values());

    }

}