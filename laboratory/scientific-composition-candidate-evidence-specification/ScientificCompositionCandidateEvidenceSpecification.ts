import type {
    ScientificCompositionCandidateKind
} from "../scientific-composition-candidate-set/ScientificCompositionCandidate.js";

import type {
    ScientificCompositionCandidateEvidenceRequirementKind
} from "../scientific-composition-candidate-evidence-requirement/ScientificCompositionCandidateEvidenceRequirement.js";


export type ScientificCompositionCandidateEvidenceSpecificationKind =
    | "BOUNDARY_EVIDENCE_ACQUISITION"
    | "CANDIDATE_BOUNDARY_OBSERVATION";


export interface ScientificCompositionCandidateEvidenceSpecification {

    specificationId:
        string;

    planId:
        string;

    diagnosticId:
        string;

    requirementId:
        string;

    candidateId:
        string;

    candidateKind:
        ScientificCompositionCandidateKind;

    sourceParticipantId:
        string;

    targetParticipantId:
        string;

    requirementKind:
        ScientificCompositionCandidateEvidenceRequirementKind;

    specificationKind:
        ScientificCompositionCandidateEvidenceSpecificationKind;

    triggeringGapIds:
        string[];

    /*
     * Exact known boundaries to evaluate when available.
     *
     * Boundary acquisition intentionally carries an empty list:
     * those identities have not yet been established.
     */
    targetBoundaryIds:
        string[];

    /*
     * READY means only that the upstream evidence prerequisite
     * permits this specification to proceed to a later execution
     * planning stage.
     */
    status:
        "READY";

}


export interface ScientificCompositionCandidateBlockedEvidenceRequirement {

    planId:
        string;

    diagnosticId:
        string;

    requirementId:
        string;

    candidateId:
        string;

    candidateKind:
        ScientificCompositionCandidateKind;

    sourceParticipantId:
        string;

    targetParticipantId:
        string;

    requirementKind:
        ScientificCompositionCandidateEvidenceRequirementKind;

    triggeringGapIds:
        string[];

    targetBoundaryIds:
        string[];

    blockingGapIds:
        string[];

    status:
        "BLOCKED_BY_PREREQUISITE";

}