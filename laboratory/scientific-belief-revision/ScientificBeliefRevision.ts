export type ScientificBeliefRevisionDecision =
    | "PRESERVE"
    | "REVIEW_SUPPORT"
    | "REVIEW_CHALLENGE"
    | "REVIEW_CONFLICT"
    | "DEFER";

export interface ScientificBeliefRevision {

    knowledgeId: string;

    statement: string;

    decision:
        ScientificBeliefRevisionDecision;

    evidenceTransition:
        | "STRENGTHENED"
        | "CHALLENGED"
        | "CONFLICTED"
        | "HELD"
        | "UNCHANGED";

    newlyAssimilatedEvidence: number;

    supportingEvidenceAdded: number;

    contradictoryEvidenceAdded: number;

    repositoryDiversityObserved: boolean;

    repositoriesObserved: string[];

    duplicateEvidenceObserved: boolean;

    sameRepositoryReplicationObserved: boolean;

    crossRepositoryEvidenceObserved: boolean;

    sourceProvenanceUnknown: boolean;

    sourceIndependenceEstablished: false;

    automaticConfidenceChange: false;

    automaticStatusChange: false;

    requiresScientificReview: boolean;

    requiresFurtherExperiment:
        boolean;

    rationale: string[];
}