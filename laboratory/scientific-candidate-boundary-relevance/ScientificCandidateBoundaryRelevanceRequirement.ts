import type {
    ScientificCandidateBoundaryRelevanceReason
} from "./ScientificCandidateBoundaryRelevanceAssessment.js";


export type ScientificCandidateBoundaryRelevanceRequirementKind =
    | "ACQUIRE_CANDIDATE_RELEVANCE_EVIDENCE"
    | "RESOLVE_CONFLICTING_CANDIDATE_RELEVANCE_EVIDENCE";


export interface ScientificCandidateBoundaryRelevanceRequirement {

    requirementId: string;

    assessmentId: string;

    candidateId: string;

    participantId: string;

    boundaryId: string;

    kind:
        ScientificCandidateBoundaryRelevanceRequirementKind;

    triggeringReason:
        ScientificCandidateBoundaryRelevanceReason;

    /*
     * Evidence already attached to the unresolved relevance
     * assessment.
     *
     * Empty for NO_RELEVANCE_EVIDENCE.
     */
    currentEvidenceIds:
        string[];

    readiness:
        "READY";

}
