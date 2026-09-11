import type {
    ScientificDecisionTraceCandidate,
    ScientificDecisionTraceComposition
} from "../scientific-decision-trace/ScientificDecisionTrace.js";

import type {
    ScientificCompositionGlobalPolarity
} from "../scientific-composition-global-evaluation/ScientificCompositionGlobalAssessment.js";


export interface ScientificFinalReportCandidateSummary {

    candidateId:
        string;

    candidateKind:
        ScientificDecisionTraceCandidate["candidateKind"];

    sourceParticipantId:
        string;

    targetParticipantId:
        string;

    compatibilityPolarity:
        ScientificDecisionTraceCandidate["compatibilityPolarity"];

    knownBoundaries:
        number;

    observedBoundaries:
        number;

    unevaluatedBoundaries:
        number;

    evidenceGaps:
        number;

    reasonCodes:
        ScientificDecisionTraceCandidate["reasonCodes"];

}


export interface ScientificFinalReportCompositionSummary {

    envelopeId:
        string;

    participantIds:
        string[];

    harmonyStatus:
        ScientificDecisionTraceComposition["harmonyStatus"];

    solverResolutionStatus:
        string;

    reasonCodes:
        ScientificDecisionTraceComposition["reasonCodes"];

}


export interface ScientificFinalReportSummary {

    reportId:
        string;

    scientificPolarity:
        ScientificCompositionGlobalPolarity;

    participantIds:
        string[];

    candidates:
        ScientificFinalReportCandidateSummary[];

    compositions:
        ScientificFinalReportCompositionSummary[];

    globalRunCount:
        number;

    terminalEvidenceCount:
        number;

    evidenceLinkCount:
        number;

    evidenceResolutionCount:
        number;

    unresolvedEvidenceCount:
        number;

    lineageErrorCount:
        number;

    summaryAuthority:
        "FINAL_REPORT_PROJECTION_ONLY";

    summaryStatus:
        "PROJECTED";

}
