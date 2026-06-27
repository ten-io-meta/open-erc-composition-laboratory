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
                title: "Eligible compositions can still present high risk",
                confidence: 100,
                evidence: highRiskEligible.length,
                description:
                    "Some compositions meet eligibility requirements but still show high observed risk.",
                recommendation:
                    "Expand scenario coverage for eligible high-risk compositions before treating them as stable."
            });
        }

        const strongestComposition = [...eligibleCompositions].sort(
            (a: any, b: any) => b.compatibility - a.compatibility
        )[0];

        if (strongestComposition) {
            hypotheses.push({
                title: "Strongest eligible composition candidate",
                confidence: strongestComposition.compatibility,
                evidence: strongestComposition.evidence,
                description:
                    `${strongestComposition.protocolA} + ${strongestComposition.protocolB} is currently the strongest eligible observed composition.`,
                recommendation:
                    "Use this pair as a baseline candidate for deeper multi-protocol composition experiments."
            });
        }

        const mostObservedProtocol = [...intelligence].sort(
            (a: any, b: any) => b.observations - a.observations
        )[0];

        if (mostObservedProtocol) {
            hypotheses.push({
                title: "Most observed protocol candidate",
                confidence: mostObservedProtocol.averageCompatibility,
                evidence: mostObservedProtocol.observations,
                description:
                    `${mostObservedProtocol.protocolId} appears in the largest number of observed protocol relationships.`,
                recommendation:
                    "Prioritize this protocol when expanding higher-order composition experiments."
            });
        }

        return hypotheses;
    }
}