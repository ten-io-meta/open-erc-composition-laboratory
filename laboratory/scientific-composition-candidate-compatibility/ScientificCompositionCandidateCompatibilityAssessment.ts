import type {
    ScientificCompositionCandidateKind
} from "../scientific-composition-candidate-set/ScientificCompositionCandidate.js";


export type ScientificCompositionCandidateBoundaryEvaluationStatus =
    | "PRESERVED"
    | "VIOLATED"
    | "UNEVALUATED";


export type ScientificCompositionCandidateCompatibilityPolarity =
    | "SUPPORT"
    | "CHALLENGE"
    | "INCONCLUSIVE";


export interface ScientificCompositionCandidateBoundaryEvaluation {

    boundaryId:
        string;

    participantId:
        string;

    status:
        ScientificCompositionCandidateBoundaryEvaluationStatus;

    observationIds:
        string[];

    evidenceIds:
        string[];

}


export interface ScientificCompositionCandidateCompatibilityStatistics {

    total:
        number;

    preserved:
        number;

    violated:
        number;

    unevaluated:
        number;

}


export interface ScientificCompositionCandidateCompatibilityAssessment {

    assessmentId:
        string;

    candidateId:
        string;

    candidateKind:
        ScientificCompositionCandidateKind;

    sourceParticipantId:
        string;

    targetParticipantId:
        string;

    /*
     * SUPPORT at this layer means only that every known boundary
     * included in this assessment was observed and preserved.
     *
     * It does not establish functional fit, runtime success,
     * emergent behavior, or global composition.
     */
    assessmentBasis:
        "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS";

    boundaryEvaluations:
        ScientificCompositionCandidateBoundaryEvaluation[];

    statistics:
        ScientificCompositionCandidateCompatibilityStatistics;

    scientificPolarity:
        ScientificCompositionCandidateCompatibilityPolarity;

}


export interface ScientificCompositionCandidateCompatibilityResult {

    assessments:
        ScientificCompositionCandidateCompatibilityAssessment[];

    errors:
        string[];

}