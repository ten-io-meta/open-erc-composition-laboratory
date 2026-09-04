import type {
    ScientificKnowledgeStatus
} from "../scientific-knowledge-evolution/ScientificKnowledgeState.js";

import type {
    ScientificBeliefTransitionAuthorizationDecision,
    ScientificBeliefTransitionDirection
} from "../scientific-belief-transition-authorization/ScientificBeliefTransitionAuthorization.js";

export type ScientificBeliefStateTransitionAction =
    | "PRESERVE"
    | "RECORD_STRENGTHENING"
    | "RECORD_CHALLENGE"
    | "RECORD_CONFLICT";

export interface ScientificBeliefStateTransition {

    knowledgeId: string;

    statement: string;

    action:
        ScientificBeliefStateTransitionAction;

    authorizationDecision:
        ScientificBeliefTransitionAuthorizationDecision;

    authorizedDirection:
        ScientificBeliefTransitionDirection;

    statusBefore:
        ScientificKnowledgeStatus;

    statusAfter:
        ScientificKnowledgeStatus;

    confidenceBefore:
        number;

    confidenceAfter:
        number;

    independentSourcesBefore:
        number;

    independentSourcesAfter:
        number;

    confidenceChanged:
        boolean;

    independentSourcesChanged:
        boolean;

    statusChanged:
        boolean;

    lifecyclePromotionApplied:
        boolean;

    rejectionApplied:
        boolean;

    evidenceQualified:
        boolean;

    confidenceMutationAuthorized:
        boolean;

    statusMutationAuthorized:
        boolean;

    sourceIndependenceEstablished:
        boolean;

    requiresFurtherExperiment:
        boolean;

    rationale:
        string[];
}