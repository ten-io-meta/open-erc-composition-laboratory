import type {
    ResearchKnowledge
} from "./ResearchKnowledge.js";

import type {
    KnowledgeEntry
} from "./KnowledgeEntry.js";

import type {
    KnowledgeMergeResult
} from "./KnowledgeMergeResult.js";

import type {
    SourceIndependenceAssessment
} from "../source-independence/SourceIndependenceAssessment.js";

import {
    SourceIndependenceSetAssessmentEngine
} from "../source-independence/SourceIndependenceSetAssessmentEngine.js";

export class KnowledgeMergeEngine {

    merge(
    knowledgeBases:
        ResearchKnowledge[],
    sourceIndependenceAssessments:
        SourceIndependenceAssessment[] = []
): KnowledgeMergeResult {

        try {

            const entries =
                new Map<
                    string,
                    KnowledgeEntry
                >();

            const mergedSources =
                new Set<string>();

            for (
                const knowledge
                of knowledgeBases
            ) {

                for (
                    const source
                    of knowledge.processedSources ?? []
                ) {

                    mergedSources.add(
                        source.sourceId
                    );

                }

                for (
                    const entry
                    of knowledge.entries ?? []
                ) {

                    const entrySources =
                        this.sourcesFor(
                            entry
                        );

                    for (
                        const sourceId
                        of entrySources
                    ) {

                        mergedSources.add(
                            sourceId
                        );

                    }

                    const key =
                        this.key(
                            entry
                        );

                    const existing =
                        entries.get(
                            key
                        );

                    if (!existing) {

                        entries.set(
                            key,
                            {

                                ...entry,

                                sourceId:
                                    entrySources[0] ??
                                    entry.sourceId ??
                                    "UNKNOWN",

                                sources:
                                    entrySources,

                                evidence:
                                    [
                                        ...new Set(
                                            entry.evidence ??
                                            []
                                        )
                                    ],

                                derivedFrom:
                                    [
                                        ...new Set(
                                            entry.derivedFrom ??
                                            []
                                        )
                                    ]

                            }
                        );

                        continue;

                    }

                    const existingSources =
                        this.sourcesFor(
                            existing
                        );

                    const combinedSources =
                        [
                            ...new Set([
                                ...existingSources,
                                ...entrySources
                            ])
                        ];

                    const existingObservations =
                        Math.max(
                            0,
                            Number(
                                existing.observations ??
                                0
                            )
                        );

                    const incomingObservations =
                        Math.max(
                            0,
                            Number(
                                entry.observations ??
                                0
                            )
                        );

                    const totalObservations =
                        existingObservations +
                        incomingObservations;

                    const weightedConfidence =
                        totalObservations > 0
                            ? Math.round(
                                (
                                    existing.averageConfidence *
                                    existingObservations +
                                    entry.averageConfidence *
                                    incomingObservations
                                ) /
                                totalObservations
                            )
                            : Math.round(
                                (
                                    existing.averageConfidence +
                                    entry.averageConfidence
                                ) /
                                2
                            );

                    const mergedEntry:
                        KnowledgeEntry = {

                        ...existing,

                        /*
                         * sourceId remains only as the primary/first source
                         * for compatibility with older engines.
                         */

                        sourceId:
                            combinedSources[0] ??
                            existing.sourceId,

                        sources:
                            combinedSources,

                        observations:
                            totalObservations,

                        averageConfidence:
                            weightedConfidence,

                        confirmed:
                            existing.confirmed +
                            entry.confirmed,

                        partial:
                            existing.partial +
                            entry.partial,

                        unsupported:
                            existing.unsupported +
                            entry.unsupported,

                        evidence:
                            [
                                ...new Set([
                                    ...(
                                        existing.evidence ??
                                        []
                                    ),
                                    ...(
                                        entry.evidence ??
                                        []
                                    )
                                ])
                            ],

                        derivedFrom:
                            [
                                ...new Set([
                                    ...(
                                        existing.derivedFrom ??
                                        []
                                    ),
                                    ...(
                                        entry.derivedFrom ??
                                        []
                                    )
                                ])
                            ],

                        timestamp:
                            new Date().toISOString()

                    };

                    entries.set(
                        key,
                        {

                            ...mergedEntry,

                            status:
    this.statusFor(
        mergedEntry,
        sourceIndependenceAssessments
    )

                        }
                    );

                }

            }

            const mergedEntries =
                [...entries.values()]
                    .sort(
                        (a, b) =>
                            (
                                b.sources?.length ??
                                0
                            ) -
                            (
                                a.sources?.length ??
                                0
                            ) ||
                            b.averageConfidence -
                            a.averageConfidence ||
                            a.relation.localeCompare(
                                b.relation
                            )
                    );

            const generatedAt =
                new Date().toISOString();

            const knowledge:
                ResearchKnowledge = {

                knowledgeBaseId:
                    `KB-MERGED-${generatedAt}`,

                generatedAt,

                entries:
                    mergedEntries,

                processedSources:
                    [...mergedSources]
                        .sort()
                        .map(
                            sourceId => ({

                                sourceId,

                                processedAt:
                                    generatedAt

                            })
                        ),

                statistics: {

                    entries:
                        mergedEntries.length,

                    totalObservations:
                        mergedEntries.reduce(
                            (
                                sum,
                                entry
                            ) =>
                                sum +
                                entry.observations,
                            0
                        ),

                    emerging:
                        mergedEntries.filter(
                            entry =>
                                entry.status ===
                                "EMERGING"
                        ).length,

                    supported:
                        mergedEntries.filter(
                            entry =>
                                entry.status ===
                                "SUPPORTED"
                        ).length,

                    validated:
                        mergedEntries.filter(
                            entry =>
                                entry.status ===
                                "VALIDATED"
                        ).length,

                    canonical:
                        mergedEntries.filter(
                            entry =>
                                entry.status ===
                                "CANONICAL"
                        ).length,

                    rejected:
                        mergedEntries.filter(
                            entry =>
                                entry.status ===
                                "REJECTED"
                        ).length

                }

            };

            return {

                generatedAt,

                knowledge,

                mergedSources:
                    [...mergedSources].sort(),

                mergedEntries:
                    mergedEntries.length,

                errors: []

            };

        } catch (error) {

            const generatedAt =
                new Date().toISOString();

            return {

                generatedAt,

                knowledge: {

                    knowledgeBaseId:
                        `KB-MERGED-${generatedAt}`,

                    generatedAt,

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

    /*
     * Scientific identity no longer includes sourceId.
     *
     * The same relation discovered by several repositories
     * becomes one knowledge entry with several sources.
     */

    private key(
        entry:
            KnowledgeEntry
    ): string {

        return [

            this.normalizeRelation(
                entry.relation
            ),

            this.normalizeValue(
                entry.protocolPair
            ),

            entry.generatedBy ??
            "UNKNOWN"

        ].join("|");

    }

    private sourcesFor(
        entry:
            KnowledgeEntry
    ): string[] {

        return [
            ...new Set(
                [
                    ...(
                        Array.isArray(
                            entry.sources
                        )
                            ? entry.sources
                            : []
                    ),

                    entry.sourceId
                ]
                    .filter(
                        (
                            value
                        ): value is string =>
                            typeof value ===
                                "string" &&
                            value.trim().length > 0 &&
                            value !== "UNKNOWN"
                    )
                    .map(
                        value =>
                            value.trim()
                    )
            )
        ].sort();

    }

    private normalizeRelation(
        value: string
    ): string {

        return String(
            value ?? ""
        )
            .replace(
                /\s*->\s*/g,
                ":"
            )
            .replace(
                /\s*:\s*/g,
                ":"
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim()
            .toUpperCase();

    }

    private normalizeValue(
        value: string
    ): string {

        return String(
            value ?? ""
        )
            .replace(
                /\s+/g,
                ""
            )
            .trim()
            .toUpperCase();

    }

    private statusFor(
    entry:
        KnowledgeEntry,
    sourceIndependenceAssessments:
        SourceIndependenceAssessment[]
): KnowledgeEntry["status"] {

    /*
     * sources[] contains observed scientific source identities.
     *
     * Source identity count is not scientific source independence.
     * Independence must be explicitly established by the
     * source-independence assessment layer.
     */
    const sourceIds =
        this.sourcesFor(
            entry
        );

    const sourceIdSet =
        new Set(
            sourceIds
        );

    const relevantAssessments =
        sourceIndependenceAssessments.filter(
            assessment =>
                assessment.sourceIds.every(
                    sourceId =>
                        sourceIdSet.has(
                            sourceId
                        )
                )
        );

    const independence =
        new SourceIndependenceSetAssessmentEngine().build(
            sourceIds,
            relevantAssessments
        );

    const independentSources =
        independence.establishedIndependentSources;

    if (
        entry.unsupported >
        entry.confirmed +
        entry.partial
    ) {
        return "REJECTED";
    }

    if (
        independentSources >= 5 &&
        entry.observations >= 8 &&
        entry.averageConfidence >= 90
    ) {
        return "CANONICAL";
    }

    if (
        independentSources >= 3 &&
        entry.observations >= 3 &&
        entry.averageConfidence >= 80
    ) {
        return "VALIDATED";
    }

    if (
        independentSources >= 2 &&
        entry.averageConfidence >= 65
    ) {
        return "SUPPORTED";
    }

    /*
     * This fallback is intentionally independent of
     * source-independence claims. A confirmed observation
     * with sufficient confidence may still be SUPPORTED,
     * but it is not promoted because multiple source
     * identities were mistaken for independent sources.
     */
    if (
        entry.confirmed > 0 &&
        entry.averageConfidence >= 70
    ) {
        return "SUPPORTED";
    }

    return "EMERGING";

}

}