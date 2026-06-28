import type { CompositionHypothesis } from "./CompositionHypothesis.js";

export class CompositionHypothesisEngine {
    generate(knowledge: any): CompositionHypothesis[] {
        const hypotheses: CompositionHypothesis[] = [];

        const matrix = knowledge.compositionMatrix ?? [];
        const intelligence = knowledge.protocolIntelligence ?? [];

        const eligibleCompositions = matrix.filter(
            (row: any) => row.eligibility === true
        );

        const highRiskEligible = eligibleCompositions.filter(
            (row: any) => row.risk === "High"
        );

        if (highRiskEligible.length > 0) {
            hypotheses.push({
                hypothesisId: "HYP-0001",
                title: "Eligible compositions can still present high risk",
                confidence: 100,
                evidence: highRiskEligible.length,
                description:
                    "Some compositions meet eligibility requirements but still show high observed risk.",
                recommendation:
                    "Expand scenario coverage for eligible high-risk compositions before treating them as stable.",
                falsifiable: true,
                validationTarget:
                    "Run additional eligible high-risk scenarios and measure whether the observed risk decreases with broader evidence.",
                supportingEvidence: highRiskEligible.map(
                    (row: any) =>
                        `${row.protocolA} + ${row.protocolB}: compatibility ${row.compatibility}%, safety ${row.safetyScore}%, stability ${row.stabilityScore}%, risk ${row.risk}`
                )
            });
        }

        const strongestComposition = [...eligibleCompositions].sort(
            (a: any, b: any) => b.compatibility - a.compatibility
        )[0];

        if (strongestComposition) {
            hypotheses.push({
                hypothesisId: "HYP-0002",
                title: "Strongest eligible composition candidate",
                confidence: strongestComposition.compatibility,
                evidence: strongestComposition.evidence,
                description:
                    `${strongestComposition.protocolA} + ${strongestComposition.protocolB} is currently the strongest eligible observed composition.`,
                recommendation:
                    "Use this pair as a baseline candidate for deeper multi-protocol composition experiments.",
                falsifiable: true,
                validationTarget:
                    "Expand the strongest eligible pair into higher-order compositions and verify whether it remains the strongest baseline.",
                supportingEvidence: [
                    `${strongestComposition.protocolA} + ${strongestComposition.protocolB}: compatibility ${strongestComposition.compatibility}%, safety ${strongestComposition.safetyScore}%, stability ${strongestComposition.stabilityScore}%, risk ${strongestComposition.risk}`
                ]
            });
        }

        const mostObservedProtocol = [...intelligence].sort(
            (a: any, b: any) => b.observations - a.observations
        )[0];

        if (mostObservedProtocol) {
            hypotheses.push({
                hypothesisId: "HYP-0003",
                title: "Most observed protocol candidate",
                confidence: mostObservedProtocol.averageCompatibility,
                evidence: mostObservedProtocol.observations,
                description:
                    `${mostObservedProtocol.protocolId} appears in the largest number of observed protocol relationships.`,
                recommendation:
                    "Prioritize this protocol when expanding higher-order composition experiments.",
                falsifiable: true,
                validationTarget:
                    "Run additional compositions around the most observed protocol and verify whether it remains central as the dataset grows.",
                supportingEvidence: [
                    `Observed relationships: ${mostObservedProtocol.observations}`,
                    `Average compatibility: ${mostObservedProtocol.averageCompatibility}%`,
                    `Average safety: ${mostObservedProtocol.averageSafety}%`,
                    `Average stability: ${mostObservedProtocol.averageStability}%`,
                    `Average risk: ${mostObservedProtocol.averageRisk}`
                ]
            });
        }

        return hypotheses;
    }
}
