import type {
    ScientificFinalReportSummary
} from "./ScientificFinalReportSummary.js";


export interface ScientificFinalReportRenderedOutput {

    text:
        string;

    json:
        string;

    renderAuthority:
        "SUMMARY_PROJECTION_ONLY";

}


export class ScientificFinalReportRenderer {

    render(
        summary:
            ScientificFinalReportSummary
    ): ScientificFinalReportRenderedOutput {

        const lines:
            string[] = [
                "OECL FINAL SCIENTIFIC REPORT",
                `Report: ${summary.reportId}`,
                `Scientific polarity: ${summary.scientificPolarity}`,
                `Participants: ${summary.participantIds.join(", ") || "(none)"}`,
                `Global runs: ${summary.globalRunCount}`,
                "",
                "Evidence lineage:",
                `  terminal evidence: ${summary.terminalEvidenceCount}`,
                `  links: ${summary.evidenceLinkCount}`,
                `  resolutions: ${summary.evidenceResolutionCount}`,
                `  unresolved evidence: ${summary.unresolvedEvidenceCount}`,
                `  lineage errors: ${summary.lineageErrorCount}`,
                "",
                "Candidates:"
            ];

        if (summary.candidates.length === 0) {
            lines.push("  (none)");
        }

        for (const candidate of summary.candidates) {
            lines.push(
                `  ${candidate.candidateId}: ` +
                `${candidate.sourceParticipantId} -> ${candidate.targetParticipantId}`
            );

            lines.push(
                `    kind=${candidate.candidateKind} ` +
                `compatibility=${candidate.compatibilityPolarity}`
            );

            lines.push(
                `    boundaries known=${candidate.knownBoundaries} ` +
                `observed=${candidate.observedBoundaries} ` +
                `unevaluated=${candidate.unevaluatedBoundaries} ` +
                `gaps=${candidate.evidenceGaps}`
            );

            lines.push(
                `    reasons=${candidate.reasonCodes.join(", ") || "(none)"}`
            );
        }

        lines.push("", "Compositions:");

        if (summary.compositions.length === 0) {
            lines.push("  (none)");
        }

        for (const composition of summary.compositions) {
            lines.push(
                `  ${composition.envelopeId}: ` +
                `${composition.participantIds.join(", ")}`
            );

            lines.push(
                `    harmony=${composition.harmonyStatus} ` +
                `solver=${composition.solverResolutionStatus}`
            );

            lines.push(
                `    reasons=${composition.reasonCodes.join(", ") || "(none)"}`
            );
        }

        return {
            text:
                lines.join("\n"),

            json:
                JSON.stringify(summary, null, 2),

            renderAuthority:
                "SUMMARY_PROJECTION_ONLY"
        };

    }

}
