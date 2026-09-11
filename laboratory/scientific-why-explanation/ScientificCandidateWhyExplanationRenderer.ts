import type {
    ScientificCandidateWhyExplanation,
    ScientificCandidateExplanationObservation
} from "./ScientificCandidateWhyExplanation.js";

import type {
    ScientificDecisionTraceCandidateReason
} from "../scientific-decision-trace/ScientificDecisionTrace.js";


const reasonText:
    Record<ScientificDecisionTraceCandidateReason, string> = {

    FUNCTIONAL_MATCH_OPENED_CANDIDATE:
        "A functional match opened this candidate.",

    DOCUMENTARY_RELATION_OPENED_CANDIDATE:
        "Documentary relation evidence opened this candidate.",

    KNOWN_BOUNDARY_PRESERVATION_SUPPORTED:
        "Observed evidence preserved the evaluated known boundaries.",

    BOUNDARY_CHALLENGED:
        "Observed evidence challenged at least one relevant boundary.",

    CANDIDATE_COMPATIBILITY_INCONCLUSIVE:
        "Candidate compatibility remains scientifically inconclusive.",

    NO_KNOWN_BOUNDARIES:
        "No known candidate boundaries are available for evaluation.",

    NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS:
        "No candidate compatibility observations are available.",

    UNEVALUATED_KNOWN_BOUNDARIES:
        "Known boundaries remain unevaluated."
};


const observationText:
    Record<ScientificCandidateExplanationObservation, string> = {

    EVIDENCE_GAPS_PRESENT:
        "Evidence gaps remain.",

    UNEVALUATED_BOUNDARIES_PRESENT:
        "Some candidate boundaries remain unevaluated.",

    UNRESOLVED_RELEVANCE_PRESENT:
        "Some boundary relevance remains unresolved.",

    FUNCTIONAL_CONFIGURATION_EVIDENCED:
        "An observed runtime functional configuration is evidenced."
};


export class ScientificCandidateWhyExplanationRenderer {

    render(
        explanation:
            ScientificCandidateWhyExplanation
    ): string {

        const lines = [
            "OECL WHY / WHY NOT",
            `Candidate: ${explanation.candidateId}`,
            `Kind: ${explanation.candidateKind}`,
            `Compatibility: ${explanation.compatibilityPolarity}`,
            "",
            "WHY:"
        ];

        if (explanation.upstreamReasonCodes.length === 0) {
            lines.push("  (no upstream reason codes)");
        }

        for (const reason of explanation.upstreamReasonCodes) {
            lines.push(`  - ${reasonText[reason]}`);
        }

        lines.push("", "OBSERVED CONDITIONS:");

        if (explanation.observations.length === 0) {
            lines.push("  (none)");
        }

        for (const observation of explanation.observations) {
            lines.push(`  - ${observationText[observation]}`);
        }

        lines.push(
            "",
            "Authority: UPSTREAM_DOSSIER_STATE_ONLY"
        );

        return lines.join("\n");

    }

}
