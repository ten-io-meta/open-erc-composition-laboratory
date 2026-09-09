import type {
    ScientificFinalReport
} from "./ScientificFinalReport.js";

import type {
    ScientificFinalReportSummary
} from "./ScientificFinalReportSummary.js";


export class ScientificFinalReportSummaryEngine {

    project(
        report:
            ScientificFinalReport
    ): ScientificFinalReportSummary {

        const participantIds =
            new Set<string>();

        for (const candidate of report.decisionTrace.candidateTraces) {
            participantIds.add(candidate.sourceParticipantId);
            participantIds.add(candidate.targetParticipantId);
        }

        for (const composition of report.decisionTrace.compositionTraces) {
            for (const participantId of composition.participantIds) {
                participantIds.add(participantId);
            }
        }

        return {
            reportId:
                report.reportId,

            scientificPolarity:
                report.scientificPolarity,

            participantIds:
                [...participantIds].sort(),

            candidates:
                report.decisionTrace.candidateTraces.map(
                    candidate => ({
                        candidateId: candidate.candidateId,
                        candidateKind: candidate.candidateKind,
                        sourceParticipantId: candidate.sourceParticipantId,
                        targetParticipantId: candidate.targetParticipantId,
                        compatibilityPolarity: candidate.compatibilityPolarity,
                        knownBoundaries: candidate.knownBoundaryIds.length,
                        observedBoundaries: candidate.observedBoundaryIds.length,
                        unevaluatedBoundaries: candidate.unevaluatedBoundaryIds.length,
                        evidenceGaps: candidate.gapIds.length,
                        reasonCodes: [...candidate.reasonCodes]
                    })
                ),

            compositions:
                report.decisionTrace.compositionTraces.map(
                    composition => ({
                        envelopeId: composition.envelopeId,
                        participantIds: [...composition.participantIds],
                        harmonyStatus: composition.harmonyStatus,
                        solverResolutionStatus: composition.solverResolutionStatus,
                        reasonCodes: [...composition.reasonCodes]
                    })
                ),

            globalRunCount:
                report.globalAssessment.runAssessments.length,

            terminalEvidenceCount:
                report.evidenceLineage.terminalEvidenceCatalog.length,

            evidenceLinkCount:
                report.evidenceLineage.links.length,

            evidenceResolutionCount:
                report.evidenceLineage.resolutions.length,

            unresolvedEvidenceCount:
                report.decisionTrace.unresolvedEvidenceIds.length,

            lineageErrorCount:
                report.evidenceLineage.errors.length,

            summaryAuthority:
                "FINAL_REPORT_PROJECTION_ONLY",

            summaryStatus:
                "PROJECTED"
        };

    }

}
