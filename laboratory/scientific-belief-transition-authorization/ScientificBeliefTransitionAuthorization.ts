import type {
    ScientificBeliefRevisionDecision
} from "../scientific-belief-revision/ScientificBeliefRevision.js";

export type ScientificBeliefTransitionAuthorizationDecision =
    | "AUTHORIZED"
    | "NOT_AUTHORIZED"
    | "INCONCLUSIVE"
    | "NO_CHANGE_REQUIRED";

export type ScientificBeliefTransitionDirection =
    | "STRENGTHEN"
    | "CHALLENGE"
    | "NONE"
    | "UNRESOLVED";

export interface ScientificBeliefTransitionAuthorization {

    knowledgeId: string;

    statement: string;

    revisionDecision:
        ScientificBeliefRevisionDecision;

    decision:
        ScientificBeliefTransitionAuthorizationDecision;

    direction:
        ScientificBeliefTransitionDirection;

    scientificEvidenceAssimilated:
        boolean;

    supportingEvidencePresent:
        boolean;

    contradictoryEvidencePresent:
        boolean;

    repositoryReplicationObserved:
    boolean;

sameRepositoryReplicationObserved:
    boolean;

crossRepositoryEvidenceObserved:
    boolean;

repositoryDiversityObserved:
    boolean;

    sourceIndependenceEstablished:
        boolean;

    confidenceMutationAuthorized:
        boolean;

    statusMutationAuthorized:
        boolean;

    requiresFurtherExperiment:
        boolean;

    rationale: string[];
}