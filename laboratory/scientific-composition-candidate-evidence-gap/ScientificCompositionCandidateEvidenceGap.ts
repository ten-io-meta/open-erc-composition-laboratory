import type {
    ScientificCompositionCandidateKind
} from "../scientific-composition-candidate-set/ScientificCompositionCandidate.js";

import type {
    ScientificCompositionCandidateCompatibilityPolarity
} from "../scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityAssessment.js";


export type ScientificCompositionCandidateEvidenceGapKind =
    | "UNRESOLVED_CANDIDATE_BOUNDARY_RELEVANCE"
    | "NO_KNOWN_BOUNDARIES"
    | "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS"
    | "UNEVALUATED_KNOWN_BOUNDARIES";


export interface ScientificCompositionCandidateEvidenceGap {

    gapId:
        string;

    kind:
        ScientificCompositionCandidateEvidenceGapKind;

    candidateId:
        string;

    boundaryIds:
        string[];

}


export type ScientificCompositionCandidateEvidenceResolution =
    | "REQUIRES_ADDITIONAL_EVIDENCE"
    | "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED"
    | "BOUNDARY_CHALLENGED";


export interface ScientificCompositionCandidateEvidenceDiagnostic {

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

    compatibilityAssessmentId:
        string;

    compatibilityPolarity:
        ScientificCompositionCandidateCompatibilityPolarity;

    knownBoundaryIds:
        string[];

    observedBoundaryIds:
        string[];

    unevaluatedBoundaryIds:
        string[];

    compatibilityObservationIds:
        string[];

    compatibilityEvidenceIds:
        string[];

    gaps:
        ScientificCompositionCandidateEvidenceGap[];

    /*
     * This resolution concerns only candidate-boundary evidence.
     *
     * KNOWN_BOUNDARY_PRESERVATION_SUPPORTED does not establish
     * runtime success, functional composition, emergent behavior,
     * or global N-protocol composition.
     */
    resolution:
        ScientificCompositionCandidateEvidenceResolution;

}