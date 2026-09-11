import type {
    ScientificCandidateCompositionDossierSummary
} from "../scientific-candidate-composition-dossier/ScientificCandidateCompositionDossierSummary.js";

import type {
    ScientificCandidateExplanationObservation,
    ScientificCandidateWhyExplanation
} from "./ScientificCandidateWhyExplanation.js";


export interface ScientificCandidateWhyExplanationEngineResult {

    explanation:
        ScientificCandidateWhyExplanation | null;

    errors:
        string[];

}


export class ScientificCandidateWhyExplanationEngine {

    project(
        explanationId:
            string,
        summary:
            ScientificCandidateCompositionDossierSummary
    ): ScientificCandidateWhyExplanationEngineResult {

        if (!explanationId.trim()) {
            return {
                explanation: null,
                errors: ["Candidate explanation requires explanationId."]
            };
        }

        const observations:
            ScientificCandidateExplanationObservation[] = [];

        if (summary.evidenceGaps > 0) {
            observations.push("EVIDENCE_GAPS_PRESENT");
        }

        if (summary.unevaluatedBoundaries > 0) {
            observations.push("UNEVALUATED_BOUNDARIES_PRESENT");
        }

        if (
            summary.unresolvedRelevance !== null &&
            summary.unresolvedRelevance > 0
        ) {
            observations.push("UNRESOLVED_RELEVANCE_PRESENT");
        }

        if (summary.functionalConfigurationCount > 0) {
            observations.push("FUNCTIONAL_CONFIGURATION_EVIDENCED");
        }

        return {
            explanation: {
                explanationId,
                candidateId: summary.candidateId,
                candidateKind: summary.candidateKind,
                compatibilityPolarity: summary.compatibilityPolarity,
                upstreamReasonCodes: [...summary.reasonCodes],
                observations,
                explanationAuthority:
                    "UPSTREAM_DOSSIER_STATE_ONLY",
                explanationStatus:
                    "PROJECTED"
            },
            errors: []
        };

    }

}
