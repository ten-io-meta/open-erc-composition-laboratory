import {
    readFile
} from "fs/promises";

import type {
    ScientificKnowledgeEvolutionResult
} from "../scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificMemory
} from "./ScientificMemory.js";

import type {
    ScientificMemoryEntry
} from "./ScientificMemoryEntry.js";

import type {
    ScientificMemoryResult
} from "./ScientificMemoryResult.js";

export class ScientificMemoryEngine {

    async build(
        campaignId: string,
        evolution:
            ScientificKnowledgeEvolutionResult
    ): Promise<ScientificMemoryResult> {

        const observedAt =
            new Date().toISOString();

        const previous =
            await this.loadPrevious();

        const map =
            new Map<
                string,
                ScientificMemoryEntry
            >();

        if (previous) {

            for (
                const entry
                of previous.entries ?? []
            ) {

                map.set(
                    entry.knowledgeId,
                    structuredClone(entry)
                );

            }

        }

        const observedKnowledgeIds =
            new Set<string>();

        let newKnowledge = 0;
        let recurringKnowledge = 0;

        for (
            const state
            of evolution.states ?? []
        ) {

            observedKnowledgeIds.add(
                state.knowledgeId
            );

            const existing =
                map.get(
                    state.knowledgeId
                );

            if (!existing) {

                map.set(
                    state.knowledgeId,
                    {

                        knowledgeId:
                            state.knowledgeId,

                        firstCampaign:
                            campaignId,

                        lastCampaign:
                            campaignId,

                        campaignsObserved:
                            1,

                        firstObserved:
                            observedAt,

                        lastObserved:
                            observedAt,

                        confidenceHistory: [
                            state.confidence
                        ],

                        evidenceHistory: [
                            state.independentSources
                        ],

                        statusHistory: [
                            state.status
                        ]

                    }
                );

                newKnowledge++;

                continue;

            }

            /*
             * Do not duplicate the same campaign
             * if the pipeline is rerun using an
             * identical campaign identifier.
             */

            if (
                existing.lastCampaign !==
                campaignId
            ) {

                existing.campaignsObserved++;

                existing.confidenceHistory.push(
                    state.confidence
                );

                existing.evidenceHistory.push(
                    state.independentSources
                );

                existing.statusHistory.push(
                    state.status
                );

            }

            existing.lastCampaign =
                campaignId;

            existing.lastObserved =
                observedAt;

            recurringKnowledge++;

        }

        const forgottenKnowledge =
            previous
                ? previous.entries.filter(
                    entry =>
                        !observedKnowledgeIds.has(
                            entry.knowledgeId
                        )
                ).length
                : 0;

        const currentMemory:
            ScientificMemory = {

            generatedAt:
                observedAt,

            campaignId,

            entries:
                [...map.values()].sort(
                    (a, b) =>
                        b.campaignsObserved -
                        a.campaignsObserved ||
                        a.knowledgeId.localeCompare(
                            b.knowledgeId
                        )
                )

        };

        return {

            previousMemory:
                previous,

            currentMemory,

            statistics: {

                trackedKnowledge:
                    currentMemory.entries.length,

                newKnowledge,

                recurringKnowledge,

                forgottenKnowledge

            }

        };

    }

    private async loadPrevious():
        Promise<ScientificMemory | null> {

        try {

            const json =
                await readFile(
                    "./scientific-memory-results/" +
                    "OECL-V2-SCIENTIFIC-MEMORY.json",
                    "utf8"
                );

            const parsed =
                JSON.parse(
                    json
                ) as
                    | ScientificMemory
                    | ScientificMemoryResult;

            /*
             * Current persisted format:
             * ScientificMemoryResult
             */

            if (
                "currentMemory" in parsed &&
                parsed.currentMemory &&
                Array.isArray(
                    parsed.currentMemory.entries
                )
            ) {

                return parsed.currentMemory;

            }

            /*
             * Backward-compatible format:
             * direct ScientificMemory
             */

            if (
                "entries" in parsed &&
                Array.isArray(
                    parsed.entries
                )
            ) {

                return parsed;

            }

            return null;

        } catch (error) {

            if (
                error instanceof Error &&
                "code" in error &&
                error.code === "ENOENT"
            ) {

                return null;

            }

            /*
             * A malformed historic memory should not
             * crash the whole scientific pipeline.
             */

            console.warn(
                "Scientific memory could not be loaded. " +
                "A new memory will be initialized."
            );

            return null;

        }

    }

}