import type {
    ScientificKnowledgeState
} from "../scientific-knowledge-evolution/ScientificKnowledgeState.js";

import type {
    ScientificBeliefTransitionAuthorization
} from "../scientific-belief-transition-authorization/ScientificBeliefTransitionAuthorization.js";

import type {
    ScientificBeliefTransitionAuthorizationResult
} from "../scientific-belief-transition-authorization/ScientificBeliefTransitionAuthorizationResult.js";

import type {
    ScientificEvidenceAssimilationResult
} from "../scientific-evidence-assimilation/ScientificEvidenceAssimilationResult.js";

import type {
    ScientificBeliefStateTransition,
    ScientificBeliefStateTransitionAction
} from "./ScientificBeliefStateTransition.js";

import type {
    ScientificBeliefStateTransitionResult
} from "./ScientificBeliefStateTransitionResult.js";

export class ScientificBeliefStateTransitionEngine {

    build(
        authorization:
            ScientificBeliefTransitionAuthorizationResult,
        assimilation:
            ScientificEvidenceAssimilationResult
    ): ScientificBeliefStateTransitionResult {

        try {

            const authorizationByKnowledge =
                new Map(
                    authorization.authorizations.map(
                        item => [
                            item.knowledgeId,
                            item
                        ]
                    )
                );

            const transitions:
                ScientificBeliefStateTransition[] = [];

            const states =
                assimilation.states.map(
                    state => {

                        const beliefAuthorization =
                            authorizationByKnowledge.get(
                                state.knowledgeId
                            );

                        const transition =
                            this.transitionFor(
                                state,
                                beliefAuthorization
                            );

                        transitions.push(
                            transition.transition
                        );

                        return transition.state;
                    }
                );

            return {

                generatedAt:
                    new Date().toISOString(),

                transitions,

                states,

                statistics: {

                    total:
                        transitions.length,

                    preserved:
                        this.countAction(
                            transitions,
                            "PRESERVE"
                        ),

                    strengtheningRecorded:
                        this.countAction(
                            transitions,
                            "RECORD_STRENGTHENING"
                        ),

                    challengesRecorded:
                        this.countAction(
                            transitions,
                            "RECORD_CHALLENGE"
                        ),

                    conflictsRecorded:
                        this.countAction(
                            transitions,
                            "RECORD_CONFLICT"
                        ),

                    confidenceChanges:
                        transitions.filter(
                            transition =>
                                transition.confidenceChanged
                        ).length,

                    independentSourceChanges:
                        transitions.filter(
                            transition =>
                                transition
                                    .independentSourcesChanged
                        ).length,

                    statusChanges:
                        transitions.filter(
                            transition =>
                                transition.statusChanged
                        ).length,

                    lifecyclePromotions:
                        transitions.filter(
                            transition =>
                                transition
                                    .lifecyclePromotionApplied
                        ).length,

                    rejections:
                        transitions.filter(
                            transition =>
                                transition.rejectionApplied
                        ).length,

                    requiringFurtherExperiment:
                        transitions.filter(
                            transition =>
                                transition
                                    .requiresFurtherExperiment
                        ).length
                },

                errors: []
            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                transitions: [],

                states: [],

                statistics: {
                    total: 0,
                    preserved: 0,
                    strengtheningRecorded: 0,
                    challengesRecorded: 0,
                    conflictsRecorded: 0,
                    confidenceChanges: 0,
                    independentSourceChanges: 0,
                    statusChanges: 0,
                    lifecyclePromotions: 0,
                    rejections: 0,
                    requiringFurtherExperiment: 0
                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]
            };
        }
    }

    private transitionFor(
        state:
            ScientificKnowledgeState,
        authorization:
            ScientificBeliefTransitionAuthorization | undefined
    ): {
        state: ScientificKnowledgeState;
        transition: ScientificBeliefStateTransition;
    } {

        if (!authorization) {

            return this.preserve(
                state,
                undefined,
                [
                    "No belief-transition authorization was available for this knowledge state."
                ]
            );
        }

        if (
            authorization.decision ===
                "NO_CHANGE_REQUIRED" ||
            authorization.decision ===
                "NOT_AUTHORIZED"
        ) {

            return this.preserve(
                state,
                authorization,
                [
                    authorization.decision ===
                        "NO_CHANGE_REQUIRED"
                        ? "No scientific belief-state change was required."
                        : "Belief-state mutation was not scientifically authorized."
                ]
            );
        }

        if (
            authorization.decision ===
                "INCONCLUSIVE"
        ) {

            return this.recordWithoutMutation(
                state,
                authorization,
                "RECORD_CONFLICT",
                [
                    "Scientific transition direction remains unresolved.",
                    "The existing knowledge state is preserved pending further evidence."
                ]
            );
        }

        if (
            authorization.decision ===
                "AUTHORIZED" &&
            authorization.direction ===
                "STRENGTHEN"
        ) {

            return this.recordWithoutMutation(
                state,
                authorization,
                "RECORD_STRENGTHENING",
                [
                    "Scientifically qualified supporting evidence authorizes a strengthening direction.",
                    "The strengthening event is recorded without inventing numeric confidence or source independence."
                ]
            );
        }

        if (
            authorization.decision ===
                "AUTHORIZED" &&
            authorization.direction ===
                "CHALLENGE"
        ) {

            return this.recordWithoutMutation(
                state,
                authorization,
                "RECORD_CHALLENGE",
                [
                    "Scientifically qualified contradictory evidence authorizes a challenge direction.",
                    "The challenge event is recorded without automatic rejection or lifecycle mutation."
                ]
            );
        }

        return this.preserve(
            state,
            authorization,
            [
                "Authorization state did not justify a belief-state mutation."
            ]
        );
    }

    private preserve(
        state:
            ScientificKnowledgeState,
        authorization:
            ScientificBeliefTransitionAuthorization | undefined,
        rationale:
            string[]
    ): {
        state: ScientificKnowledgeState;
        transition: ScientificBeliefStateTransition;
    } {

        return {

            state,

            transition:
                this.buildTransition(
                    state,
                    authorization,
                    "PRESERVE",
                    rationale
                )
        };
    }

    private recordWithoutMutation(
        state:
            ScientificKnowledgeState,
        authorization:
            ScientificBeliefTransitionAuthorization,
        action:
            ScientificBeliefStateTransitionAction,
        rationale:
            string[]
    ): {
        state: ScientificKnowledgeState;
        transition: ScientificBeliefStateTransition;
    } {

        const extendedRationale =
            [...rationale];

        if (
            !authorization
                .confidenceMutationAuthorized
        ) {
            extendedRationale.push(
                "Numeric confidence mutation was not authorized."
            );
        }

        if (
            !authorization
                .statusMutationAuthorized
        ) {
            extendedRationale.push(
                "Lifecycle-status mutation was not authorized."
            );
        }

        if (
            !authorization
                .sourceIndependenceEstablished
        ) {
            extendedRationale.push(
                "Scientific-source independence was not established."
            );
        }

        return {

            state,

            transition:
                this.buildTransition(
                    state,
                    authorization,
                    action,
                    extendedRationale
                )
        };
    }

    private buildTransition(
        state:
            ScientificKnowledgeState,
        authorization:
            ScientificBeliefTransitionAuthorization | undefined,
        action:
            ScientificBeliefStateTransitionAction,
        rationale:
            string[]
    ): ScientificBeliefStateTransition {

        const authorizationDecision =
            authorization?.decision ??
            "NOT_AUTHORIZED";

        const authorizedDirection =
            authorization?.direction ??
            "NONE";

        const confidenceBefore =
            state.confidence;

        const confidenceAfter =
            state.confidence;

        const independentSourcesBefore =
            state.independentSources;

        const independentSourcesAfter =
            state.independentSources;

        const statusBefore =
            state.status;

        const statusAfter =
            state.status;

        return {

            knowledgeId:
                state.knowledgeId,

            statement:
                state.statement,

            action,

            authorizationDecision,

            authorizedDirection,

            statusBefore,

            statusAfter,

            confidenceBefore,

            confidenceAfter,

            independentSourcesBefore,

            independentSourcesAfter,

            confidenceChanged:
                false,

            independentSourcesChanged:
                false,

            statusChanged:
                false,

            lifecyclePromotionApplied:
                false,

            rejectionApplied:
                false,

            evidenceQualified:
                Boolean(
                    authorization &&
                    authorization.decision ===
                        "AUTHORIZED" &&
                    authorization
                        .scientificEvidenceAssimilated
                ),

            confidenceMutationAuthorized:
                authorization
                    ?.confidenceMutationAuthorized ??
                false,

            statusMutationAuthorized:
                authorization
                    ?.statusMutationAuthorized ??
                false,

            sourceIndependenceEstablished:
                authorization
                    ?.sourceIndependenceEstablished ??
                false,

            requiresFurtherExperiment:
                authorization
                    ?.requiresFurtherExperiment ??
                false,

            rationale
        };
    }

    private countAction(
        transitions:
            ScientificBeliefStateTransition[],
        action:
            ScientificBeliefStateTransitionAction
    ): number {

        return transitions.filter(
            transition =>
                transition.action === action
        ).length;
    }
}