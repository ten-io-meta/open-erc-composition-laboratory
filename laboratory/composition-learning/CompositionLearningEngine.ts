import type { ComposabilityEvidenceClaim } from "../composability-evidence/ComposabilityEvidenceClaim.js";

import type { CompositionObservation } from "./CompositionObservation.js";
import type { CompositionKnowledge } from "./CompositionKnowledge.js";
import type { CompositionLearningResult } from "./CompositionLearningResult.js";
import type { CompositionStatistics } from "./CompositionStatistics.js";

export class CompositionLearningEngine {

    learn(claims: ComposabilityEvidenceClaim[]): CompositionLearningResult {

        try {

            const observations: CompositionObservation[] = claims.map(
                (claim, index) => ({
                    observationId: `OBS-${String(index + 1).padStart(5, "0")}`,
                    claimId: claim.claimId,
                    protocolA: claim.protocolA,
                    protocolB: claim.protocolB,
                    capabilityA: claim.capabilityA,
                    capabilityB: claim.capabilityB,
                    relation: claim.relation,
                    status: claim.status,
                    overallConfidence: claim.overallConfidence,
                    evidence: claim.evidence
                })
            );

            const groups = new Map<string, CompositionObservation[]>();

            for (const observation of observations) {

                const relationKey =
                    `${observation.capabilityA}->${observation.relation}->${observation.capabilityB}`;

                const protocolPair =
                    [observation.protocolA, observation.protocolB]
                        .sort()
                        .join("+");

                const key = `${relationKey}|${protocolPair}`;

                const existing = groups.get(key) ?? [];

                existing.push(observation);

                groups.set(key, existing);

            }

            const statistics: CompositionStatistics[] = [];

            for (const [key, group] of groups.entries()) {

                const [relationKey, protocolPair] = key.split("|");

                const supported = group.filter(
                    observation => observation.status === "SUPPORTED"
                ).length;

                const candidates = group.filter(
                    observation => observation.status === "CANDIDATE"
                ).length;

                const inconclusive = group.filter(
                    observation => observation.status === "INCONCLUSIVE"
                ).length;

                const averageConfidence = Math.round(
                    group.reduce(
                        (sum, observation) => sum + observation.overallConfidence,
                        0
                    ) / group.length
                );

                const status =
                    supported > 0 && averageConfidence >= 80
                        ? "STABLE"
                        : candidates > 0 && averageConfidence >= 60
                            ? "EMERGING"
                            : inconclusive === group.length
                                ? "UNKNOWN"
                                : "WEAK";

                statistics.push({
                    relationKey,
                    protocolPair,
                    observations: group.length,
                    supported,
                    candidates,
                    inconclusive,
                    averageConfidence,
                    status
                });

            }

            const knowledge: CompositionKnowledge = {
                generatedAt: new Date().toISOString(),
                totalObservations: observations.length,
                statistics
            };

            return {
                learnedAt: new Date().toISOString(),
                observations,
                knowledge,
                errors: []
            };

        } catch (error) {

            return {
                learnedAt: new Date().toISOString(),
                observations: [],
                knowledge: {
                    generatedAt: new Date().toISOString(),
                    totalObservations: 0,
                    statistics: []
                },
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown composition learning error"
                ]
            };

        }

    }

}