import type { CompositionMatrixEntry } from "./CompositionMatrixEntry.js";

export class CompositionMatrixEngine {

    build(
        relationships: any[],
        requirements: any[]
    ): CompositionMatrixEntry[] {

        return relationships.map(relationship => {

            const protocolAEligible =
                requirements.find(
                    r => r.protocolId === relationship.from
                )?.eligibility === "Eligible";

            const protocolBEligible =
                requirements.find(
                    r => r.protocolId === relationship.to
                )?.eligibility === "Eligible";

            const confidence = relationship.confidence;

            return {

                protocolA: relationship.from,

                protocolB: relationship.to,

                occurrences: relationship.occurrences,

                successfulCompositions:
                    relationship.successfulCompositions,

                compatibility:
                    confidence,

                eligibility:
                    protocolAEligible &&
                    protocolBEligible,

                relationshipConfidence:
                    confidence,

                evidence:
                    relationship.occurrences,

                stabilityScore:
                    confidence,

                safetyScore:
                    confidence,

                risk:

                    confidence >= 90
                        ? "Low"

                    : confidence >= 70
                        ? "Medium"

                        : "High"

            };

        });

    }

}