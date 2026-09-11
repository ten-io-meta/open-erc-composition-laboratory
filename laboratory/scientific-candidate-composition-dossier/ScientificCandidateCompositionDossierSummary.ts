import type {
    ScientificDecisionTraceCandidate
} from "../scientific-decision-trace/ScientificDecisionTrace.js";


export interface ScientificCandidateCompositionDossierSummary {

    dossierId:
        string;

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

    scopedCompatibilityAvailable:
        boolean;

    protocolBoundaryTotal:
        number | null;

    relevantBoundaries:
        number | null;

    outOfScopeBoundaries:
        number | null;

    unresolvedRelevance:
        number | null;

    functionalConfigurationCount:
        number;

    functionalConfigurationIds:
        string[];

    runtimeCandidateIds:
        string[];

    summaryAuthority:
        "DOSSIER_PROJECTION_ONLY";

    summaryStatus:
        "PROJECTED";

}
