import type {
    ScientificCompositionCandidateEvidenceRequirementPlan
} from "./ScientificCompositionCandidateEvidenceRequirement.js";


export interface ScientificCompositionCandidateEvidenceRequirementResult {

    plans:
        ScientificCompositionCandidateEvidenceRequirementPlan[];

    errors:
        string[];

}