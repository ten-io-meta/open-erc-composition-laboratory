import type {
    ScientificCandidateCompositionDossierSummary
} from "./ScientificCandidateCompositionDossierSummary.js";


export interface ScientificCandidateCompositionDossierRenderedOutput {

    text:
        string;

    json:
        string;

    renderAuthority:
        "DOSSIER_SUMMARY_PROJECTION_ONLY";

}


export class ScientificCandidateCompositionDossierRenderer {

    render(
        summary:
            ScientificCandidateCompositionDossierSummary
    ): ScientificCandidateCompositionDossierRenderedOutput {

        const lines = [
            "OECL CANDIDATE COMPOSITION DOSSIER",
            `Dossier: ${summary.dossierId}`,
            `Candidate: ${summary.candidateId}`,
            `Kind: ${summary.candidateKind}`,
            `Participants: ${summary.sourceParticipantId} -> ${summary.targetParticipantId}`,
            `Compatibility: ${summary.compatibilityPolarity}`,
            "",
            "Boundaries:",
            `  known: ${summary.knownBoundaries}`,
            `  observed: ${summary.observedBoundaries}`,
            `  unevaluated: ${summary.unevaluatedBoundaries}`,
            `  evidence gaps: ${summary.evidenceGaps}`,
            "",
            "Scoped relevance:",
            `  available: ${summary.scopedCompatibilityAvailable}`,
            `  total: ${summary.protocolBoundaryTotal ?? "n/a"}`,
            `  relevant: ${summary.relevantBoundaries ?? "n/a"}`,
            `  out of scope: ${summary.outOfScopeBoundaries ?? "n/a"}`,
            `  unresolved: ${summary.unresolvedRelevance ?? "n/a"}`,
            "",
            "Functional evidence:",
            `  configurations: ${summary.functionalConfigurationCount}`,
            `  configuration ids: ${summary.functionalConfigurationIds.join(", ") || "(none)"}`,
            `  runtime candidate ids: ${summary.runtimeCandidateIds.join(", ") || "(none)"}`,
            "",
            `Reasons: ${summary.reasonCodes.join(", ") || "(none)"}`
        ];

        return {
            text:
                lines.join("\n"),

            json:
                JSON.stringify(summary, null, 2),

            renderAuthority:
                "DOSSIER_SUMMARY_PROJECTION_ONLY"
        };

    }

}
