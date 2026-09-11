export type ScientificCandidateBoundaryRelevance =
    | "RELEVANT"
    | "OUT_OF_SCOPE"
    | "UNRESOLVED";


export type ScientificCandidateBoundaryRelevanceReason =
    | "EXPLICIT_CANDIDATE_REACHABILITY_EVIDENCE"
    | "EXPLICIT_CANDIDATE_EXCLUSION_EVIDENCE"
    | "NO_RELEVANCE_EVIDENCE"
    | "CONFLICTING_RELEVANCE_EVIDENCE";


export type ScientificCandidateBoundaryRelevanceEvidenceKind =
    | "CANDIDATE_REACHABILITY"
    | "CANDIDATE_EXCLUSION";


export interface ScientificCandidateBoundaryRelevanceEvidence {

    evidenceId:
        string;

    candidateId:
        string;

    participantId:
        string;

    boundaryId:
        string;

    kind:
        ScientificCandidateBoundaryRelevanceEvidenceKind;

}


export interface ScientificCandidateBoundaryRelevanceAssessment {

    assessmentId:
        string;

    candidateId:
        string;

    participantId:
        string;

    boundaryId:
        string;

    relevance:
        ScientificCandidateBoundaryRelevance;

    reason:
        ScientificCandidateBoundaryRelevanceReason;

    evidenceIds:
        string[];

}


export interface ScientificCandidateBoundaryRelevanceResult {

    assessments:
        ScientificCandidateBoundaryRelevanceAssessment[];

    statistics: {

        total:
            number;

        relevant:
            number;

        outOfScope:
            number;

        unresolved:
            number;

    };

    errors:
        string[];

}