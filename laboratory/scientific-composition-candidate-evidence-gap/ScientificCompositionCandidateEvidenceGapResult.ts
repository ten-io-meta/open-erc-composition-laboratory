import type {
    ScientificCompositionCandidateEvidenceDiagnostic
} from "./ScientificCompositionCandidateEvidenceGap.js";


export interface ScientificCompositionCandidateEvidenceGapResult {

    diagnostics:
        ScientificCompositionCandidateEvidenceDiagnostic[];

    errors:
        string[];

}