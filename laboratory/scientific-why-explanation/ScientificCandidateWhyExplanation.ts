import type {
    ScientificCandidateCompositionDossierSummary
} from "../scientific-candidate-composition-dossier/ScientificCandidateCompositionDossierSummary.js";


export type ScientificCandidateExplanationObservation =
    | "EVIDENCE_GAPS_PRESENT"
    | "UNEVALUATED_BOUNDARIES_PRESENT"
    | "UNRESOLVED_RELEVANCE_PRESENT"
    | "FUNCTIONAL_CONFIGURATION_EVIDENCED";


export interface ScientificCandidateWhyExplanation {

    explanationId:
        string;

    candidateId:
        string;

    candidateKind:
        ScientificCandidateCompositionDossierSummary["candidateKind"];

    compatibilityPolarity:
        ScientificCandidateCompositionDossierSummary["compatibilityPolarity"];

    upstreamReasonCodes:
        ScientificCandidateCompositionDossierSummary["reasonCodes"];

    observations:
        ScientificCandidateExplanationObservation[];

    explanationAuthority:
        "UPSTREAM_DOSSIER_STATE_ONLY";

    explanationStatus:
        "PROJECTED";

}
