import type {
    SourceIndependenceAssessment
} from "../source-independence/SourceIndependenceAssessment.js";

import {
    SourceIndependenceSetAssessmentEngine
} from "../source-independence/SourceIndependenceSetAssessmentEngine.js";

import type { CrossSourcePattern } from "./CrossSourcePattern.js";
import type { CrossSourcePatternResult } from "./CrossSourcePatternResult.js";

export class CrossSourcePatternEngine {

    discover(
        mergedKnowledge: any,
        sourceIndependenceAssessments:
            SourceIndependenceAssessment[] = []
    ): CrossSourcePatternResult {

        try {

            const entries = mergedKnowledge.knowledge?.entries
                ?? mergedKnowledge.entries
                ?? [];

            const grouped = new Map<string, any[]>();

            for (const entry of entries) {
                const relation = String(entry.relation ?? "");

                if (!relation) {
                    continue;
                }

                const normalizedRelation = this.normalizeRelation(relation);
                const protocolPair = this.extractProtocolPair(entry);

                const identity = this.patternIdentity(
                    normalizedRelation,
                    protocolPair
                );

                if (!grouped.has(identity)) {
                    grouped.set(identity, []);
                }

                grouped.get(identity)?.push(entry);
            }

            const patterns: CrossSourcePattern[] = [];
            const independenceEngine =
                new SourceIndependenceSetAssessmentEngine();

            Array.from(grouped.values()).forEach((group, index) => {

                const firstEntry = group[0];

                const normalizedRelation =
                    this.normalizeRelation(
                        String(firstEntry?.relation ?? "")
                    );

                const protocolPair =
                    this.extractProtocolPair(firstEntry);

                const sources = Array.from(
                    new Set(
                        group.flatMap(entry =>
                            this.extractSources(entry)
                        )
                    )
                ).filter(source => source !== "UNKNOWN");

                const confidence = Math.round(
                    group.reduce(
                        (sum, entry) =>
                            sum + Number(
                                entry.averageConfidence
                                ?? entry.confidence
                                ?? 0
                            ),
                        0
                    ) / Math.max(group.length, 1)
                );

                const independence =
                    independenceEngine.build(
                        sources,
                        sourceIndependenceAssessments
                    );

                const independentSources =
                    independence.establishedIndependentSources;

                const status: CrossSourcePattern["status"] =
                    independentSources >= 3
                        ? "SUPPORTED"
                        : independentSources >= 2
                            ? "EMERGING"
                            : "CANDIDATE";

                patterns.push({
                    patternId: `CROSS-PATTERN-${String(index + 1).padStart(5, "0")}`,
                    relation: String(firstEntry?.relation ?? ""),
                    normalizedRelation,
                    protocolPair:
                        protocolPair === "UNKNOWN_PROTOCOL_PAIR"
                            ? undefined
                            : protocolPair,
                    sources,
                    occurrences: group.length,
                    confidence,
                    status,
                    evidence: Array.from(
                        new Set(
                            group.flatMap(entry =>
                                Array.isArray(entry.evidence)
                                    ? entry.evidence.map(String)
                                    : []
                            )
                        )
                    )
                });

            });

            const filteredPatterns = patterns.filter(pattern =>
                pattern.sources.length >= 2
            );

            return {
                generatedAt: new Date().toISOString(),
                patterns: filteredPatterns,
                statistics: {
                    patterns: filteredPatterns.length,
                    candidate: filteredPatterns.filter(pattern => pattern.status === "CANDIDATE").length,
                    emerging: filteredPatterns.filter(pattern => pattern.status === "EMERGING").length,
                    supported: filteredPatterns.filter(pattern => pattern.status === "SUPPORTED").length,
                    sources: this.countSources(entries)
                },
                errors: []
            };

        } catch (error) {

            return {
                generatedAt: new Date().toISOString(),
                patterns: [],
                statistics: {
                    patterns: 0,
                    candidate: 0,
                    emerging: 0,
                    supported: 0,
                    sources: 0
                },
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown cross-source pattern discovery error"
                ]
            };

        }

    }

    private normalizeRelation(relation: string): string {
        return relation
            .replace(/->/g, ":")
            .trim()
            .toUpperCase();
    }

    private extractProtocolPair(entry: any): string {
        const protocolPair =
            String(entry?.protocolPair ?? "").trim();

        return protocolPair || "UNKNOWN_PROTOCOL_PAIR";
    }

    private patternIdentity(
        normalizedRelation: string,
        protocolPair: string
    ): string {
        return `${normalizedRelation}|${protocolPair}`;
    }

    private extractSources(entry: any): string[] {
        const sources = new Set<string>();

        if (Array.isArray(entry?.sources)) {
            for (const source of entry.sources) {
                const normalized =
                    String(source ?? "").trim();

                if (normalized) {
                    sources.add(normalized);
                }
            }
        }

        if (entry?.sourceId) {
            const primarySource =
                String(entry.sourceId).trim();

            if (primarySource) {
                sources.add(primarySource);
            }
        }

        return sources.size > 0
            ? [...sources]
            : ["UNKNOWN"];
    }

    private countSources(entries: any[]): number {
        return new Set(
            entries
                .flatMap(entry => this.extractSources(entry))
                .filter(source => source !== "UNKNOWN")
        ).size;
    }

}