import type { CrossSourcePattern } from "./CrossSourcePattern.js";
import type { CrossSourcePatternResult } from "./CrossSourcePatternResult.js";

export class CrossSourcePatternEngine {

    discover(mergedKnowledge: any): CrossSourcePatternResult {

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

                if (!grouped.has(normalizedRelation)) {
                    grouped.set(normalizedRelation, []);
                }

                grouped.get(normalizedRelation)?.push(entry);
            }

            const patterns: CrossSourcePattern[] = [];

            Array.from(grouped.entries()).forEach(([normalizedRelation, group], index) => {

                const sources = Array.from(
                    new Set(
                        group.map(entry => this.extractSource(entry))
                    )
                ).filter(source => source !== "UNKNOWN");

                const confidence = Math.round(
                    group.reduce(
                        (sum, entry) =>
                            sum + Number(entry.averageConfidence ?? entry.confidence ?? 0),
                        0
                    ) / Math.max(group.length, 1)
                );

                const status =
                    sources.length >= 3
                        ? "SUPPORTED"
                        : sources.length >= 2
                            ? "EMERGING"
                            : "CANDIDATE";

                patterns.push({
                    patternId: `CROSS-PATTERN-${String(index + 1).padStart(5, "0")}`,
                    relation: String(group[0].relation),
                    normalizedRelation,
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

    private extractSource(entry: any): string {
        return entry.sourceId
            ? String(entry.sourceId)
            : "UNKNOWN";
    }

    private countSources(entries: any[]): number {
        return new Set(
            entries
                .map(entry => this.extractSource(entry))
                .filter(source => source !== "UNKNOWN")
        ).size;
    }

}