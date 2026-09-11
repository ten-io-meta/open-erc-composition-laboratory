import type { KnowledgeGainResult } from "../knowledge-gain/KnowledgeGainResult.js";

import type { RepositoryIntelligence } from "./RepositoryIntelligence.js";
import type { RepositoryIntelligenceResult } from "./RepositoryIntelligenceResult.js";

export class RepositoryIntelligenceEngine {

    build(
        knowledgeGain: KnowledgeGainResult
    ): RepositoryIntelligenceResult {

        const repositories: RepositoryIntelligence[] =
            knowledgeGain.sources.map(source => ({

                sourceId: source.sourceId,

                totalKnowledgeGain:
                    source.knowledgeGainScore,

                totalPatterns:
                    source.newPatterns +
                    source.strengthenedPatterns,

                totalConclusions:
                    source.newConclusions +
                    source.strengthenedConclusions,

                totalEvidenceEvents:
                    source.evidenceEvents,

                executions: 1,

                averageKnowledgeGain:
                    source.knowledgeGainScore

            }));

        repositories.sort(
            (a, b) =>
                b.averageKnowledgeGain -
                a.averageKnowledgeGain
        );

        return {

            generatedAt:
                new Date().toISOString(),

            repositories,

            statistics: {

                repositories:
                    repositories.length,

                bestRepository:
                    repositories[0]?.sourceId ?? null,

                bestAverageGain:
                    repositories[0]?.averageKnowledgeGain ?? 0

            },

            errors: []

        };

    }

}