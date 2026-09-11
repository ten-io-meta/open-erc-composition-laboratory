import type {
    ScientificCompositionCandidateKind
} from "../scientific-composition-candidate-set/ScientificCompositionCandidate.js";

import type {
    ScientificCompositionCandidateEvidenceResolution
} from "../scientific-composition-candidate-evidence-gap/ScientificCompositionCandidateEvidenceGap.js";


export type ScientificCompositionCandidateEvidenceRequirementKind =
    | "ACQUIRE_ADDITIONAL_BOUNDARY_EVIDENCE"
    | "COLLECT_CANDIDATE_BOUNDARY_OBSERVATIONS";


export type ScientificCompositionCandidateEvidenceRequirementReadiness =
    | "READY"
    | "BLOCKED_BY_PREREQUISITE";


export interface ScientificCompositionCandidateEvidenceRequirement {

    requirementId:
        string;

    candidateId:
        string;

    kind:
        ScientificCompositionCandidateEvidenceRequirementKind;

    /*
     * Evidence gaps which caused this requirement to exist.
     */
    triggeringGapIds:
        string[];

    /*
     * Known boundaries to which this requirement applies.
     *
     * Empty for boundary discovery because those identities have
     * not yet been established.
     */
    targetBoundaryIds:
        string[];

    readiness:
        ScientificCompositionCandidateEvidenceRequirementReadiness;

    /*
     * Exact gaps preventing this requirement from becoming ready.
     */
    blockingGapIds:
        string[];

}


export type ScientificCompositionCandidateEvidenceRequirementPlanStatus =
    | "ADDITIONAL_EVIDENCE_REQUIRED"
    | "BOUNDARY_EVIDENCE_RESOLVED";


export interface ScientificCompositionCandidateEvidenceRequirementPlan {

    planId:
        string;

    diagnosticId:
        string;

    candidateId:
        string;

    candidateKind:
        ScientificCompositionCandidateKind;

    sourceParticipantId:
        string;

    targetParticipantId:
        string;

    evidenceResolution:
        ScientificCompositionCandidateEvidenceResolution;

    status:
        ScientificCompositionCandidateEvidenceRequirementPlanStatus;

    requirements:
        ScientificCompositionCandidateEvidenceRequirement[];

}