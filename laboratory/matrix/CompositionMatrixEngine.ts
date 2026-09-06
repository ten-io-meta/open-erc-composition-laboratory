import type { ProtocolRelationship } from "../relationships/ProtocolRelationship.js";
import type { CompositionMatrixEntry } from "./CompositionMatrixEntry.js";

export class CompositionMatrixEngine {
    build(
        relationships: ProtocolRelationship[],
        requirements: any[]
    ): CompositionMatrixEntry[] {
        return relationships.map(relationship => {
            const protocolAEligible =
                requirements.find(
                    (requirement: any) =>
                        requirement.protocolId === relationship.from
                )?.eligibility === "Eligible";

            const protocolBEligible =
                requirements.find(
                    (requirement: any) =>
                        requirement.protocolId === relationship.to
                )?.eligibility === "Eligible";

            const experimentIds = Array.from(
                new Set<string>(
                    (relationship.experimentIds ?? [])
                        .map(experimentId =>
                            String(experimentId).trim()
                        )
                        .filter(Boolean)
                )
            );

            return {
                protocolA: relationship.from,
                protocolB: relationship.to,
                occurrences: relationship.occurrences,
                successfulCompositions:
                    relationship.successfulCompositions,
                experimentIds,

                relationshipConfidence:
                    relationship.confidence,

                compatibility: null,
                stabilityScore: null,
                safetyScore: null,
                risk: "Unknown",

                eligibility:
                    protocolAEligible &&
                    protocolBEligible,

                evidence:
                    relationship.occurrences
            };
        });
    }
}