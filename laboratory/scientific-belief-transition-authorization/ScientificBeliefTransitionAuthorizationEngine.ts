import type {
    ScientificBeliefRevision
} from "../scientific-belief-revision/ScientificBeliefRevision.js";

import type {
    ScientificBeliefRevisionResult
} from "../scientific-belief-revision/ScientificBeliefRevisionResult.js";

import type {
    ScientificBeliefTransitionAuthorization,
    ScientificBeliefTransitionAuthorizationDecision,
    ScientificBeliefTransitionDirection
} from "./ScientificBeliefTransitionAuthorization.js";

import type {
    ScientificBeliefTransitionAuthorizationResult
} from "./ScientificBeliefTransitionAuthorizationResult.js";

export class ScientificBeliefTransitionAuthorizationEngine {

    build(
        beliefRevision:
            ScientificBeliefRevisionResult
    ): ScientificBeliefTransitionAuthorizationResult {

        try {

            const authorizations =
                beliefRevision.revisions.map(
                    revision =>
                        this.authorize(
                            revision
                        )
                );

            return {

                generatedAt:
                    new Date().toISOString(),

                authorizations,

                statistics: {

                    total:
                        authorizations.length,

                    authorized:
                        this.countDecision(
                            authorizations,
                            "AUTHORIZED"
                        ),

                    notAuthorized:
                        this.countDecision(
                            authorizations,
                            "NOT_AUTHORIZED"
                        ),

                    inconclusive:
                        this.countDecision(
                            authorizations,
                            "INCONCLUSIVE"
                        ),

                    noChangeRequired:
                        this.countDecision(
                            authorizations,
                            "NO_CHANGE_REQUIRED"
                        ),

                    strengthenAuthorized:
                        authorizations.filter(
                            authorization =>
                                authorization.decision ===
                                    "AUTHORIZED" &&
                                authorization.direction ===
                                    "STRENGTHEN"
                        ).length,

                    challengeAuthorized:
                        authorizations.filter(
                            authorization =>
                                authorization.decision ===
                                    "AUTHORIZED" &&
                                authorization.direction ===
                                    "CHALLENGE"
                        ).length,

                    confidenceMutationAuthorized:
                        authorizations.filter(
                            authorization =>
                                authorization
                                    .confidenceMutationAuthorized
                        ).length,

                    statusMutationAuthorized:
                        authorizations.filter(
                            authorization =>
                                authorization
                                    .statusMutationAuthorized
                        ).length,

                    requiringFurtherExperiment:
                        authorizations.filter(
                            authorization =>
                                authorization
                                    .requiresFurtherExperiment
                        ).length
                },

                errors: []
            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                authorizations: [],

                statistics: {
                    total: 0,
                    authorized: 0,
                    notAuthorized: 0,
                    inconclusive: 0,
                    noChangeRequired: 0,
                    strengthenAuthorized: 0,
                    challengeAuthorized: 0,
                    confidenceMutationAuthorized: 0,
                    statusMutationAuthorized: 0,
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

    private authorize(
        revision:
            ScientificBeliefRevision
    ): ScientificBeliefTransitionAuthorization {

        const scientificEvidenceAssimilated =
            revision.newlyAssimilatedEvidence > 0;

        const supportingEvidencePresent =
            revision.supportingEvidenceAdded > 0;

        const contradictoryEvidencePresent =
            revision.contradictoryEvidenceAdded > 0;

        const repositoryReplicationObserved =
            revision
                .sameRepositoryReplicationObserved ||
            revision
                .crossRepositoryEvidenceObserved;

        /*
         * Phase 9.7 cannot establish scientific-source
         * independence because structured source identity
         * is not yet propagated through this path.
         */
        const sourceIndependenceEstablished =
            false;

        let decision:
            ScientificBeliefTransitionAuthorizationDecision;

        let direction:
            ScientificBeliefTransitionDirection;

        let requiresFurtherExperiment =
            false;

        const rationale: string[] = [];

        switch (revision.decision) {

            case "PRESERVE":

                decision =
                    "NO_CHANGE_REQUIRED";

                direction =
                    "NONE";

                rationale.push(
                    "No newly assimilated scientific evidence requires a belief transition."
                );

                break;

            case "DEFER":

                decision =
                    "NOT_AUTHORIZED";

                direction =
                    "NONE";

                requiresFurtherExperiment =
                    true;

                rationale.push(
                    "Scientific polarity was not established, so belief transition is not authorized."
                );

                break;

            case "REVIEW_SUPPORT":

                direction =
                    "STRENGTHEN";

                if (
                    scientificEvidenceAssimilated &&
                    supportingEvidencePresent &&
                    !contradictoryEvidencePresent
                ) {

                    decision =
                        "AUTHORIZED";

                    rationale.push(
                        "New supporting scientific evidence was assimilated without contradictory evidence in the same reconciliation cycle."
                    );

                } else {

                    decision =
                        "NOT_AUTHORIZED";

                    requiresFurtherExperiment =
                        true;

                    rationale.push(
                        "Supporting belief transition lacks unambiguous newly assimilated scientific support."
                    );

                }

                break;

            case "REVIEW_CHALLENGE":

                direction =
                    "CHALLENGE";

                if (
                    scientificEvidenceAssimilated &&
                    contradictoryEvidencePresent &&
                    !supportingEvidencePresent
                ) {

                    decision =
                        "AUTHORIZED";

                    rationale.push(
                        "New contradictory scientific evidence was assimilated without supporting evidence in the same reconciliation cycle."
                    );

                } else {

                    decision =
                        "NOT_AUTHORIZED";

                    requiresFurtherExperiment =
                        true;

                    rationale.push(
                        "Challenging belief transition lacks unambiguous newly assimilated contradictory evidence."
                    );

                }

                break;

            case "REVIEW_CONFLICT":

                decision =
                    "INCONCLUSIVE";

                direction =
                    "UNRESOLVED";

                requiresFurtherExperiment =
                    true;

                rationale.push(
                    "Supporting and contradictory scientific evidence coexist, so transition direction is unresolved."
                );

                break;

        }

        if (
            revision
                .sameRepositoryReplicationObserved
        ) {

            rationale.push(
                "Same-repository replication does not establish scientific-source independence."
            );

        }

        if (
            revision
                .crossRepositoryEvidenceObserved
        ) {

            rationale.push(
                "Cross-repository evidence establishes repository diversity but not scientific-source independence."
            );

        }

        if (
            revision
                .sourceProvenanceUnknown
        ) {

            rationale.push(
                "Incomplete provenance prevents any claim of scientific-source independence."
            );

        }

        /*
         * Authorization concerns the scientific direction
         * of possible belief revision only.
         *
         * Numeric confidence mutation and lifecycle-status
         * mutation require separate transition semantics.
         */
        const confidenceMutationAuthorized =
            false;

        const statusMutationAuthorized =
            false;

        rationale.push(
            "No numeric confidence mutation is authorized by this assessment."
        );

        rationale.push(
            "No lifecycle-status mutation is authorized by this assessment."
        );

        return {

            knowledgeId:
                revision.knowledgeId,

            statement:
                revision.statement,

            revisionDecision:
                revision.decision,

            decision,

            direction,

            scientificEvidenceAssimilated,

            supportingEvidencePresent,

            contradictoryEvidencePresent,

            repositoryReplicationObserved,

sameRepositoryReplicationObserved:
    revision.sameRepositoryReplicationObserved,

crossRepositoryEvidenceObserved:
    revision.crossRepositoryEvidenceObserved,

repositoryDiversityObserved:
    revision.repositoryDiversityObserved,

sourceIndependenceEstablished,

            confidenceMutationAuthorized,

            statusMutationAuthorized,

            requiresFurtherExperiment,

            rationale
        };

    }

    private countDecision(
        authorizations:
            ScientificBeliefTransitionAuthorization[],
        decision:
            ScientificBeliefTransitionAuthorizationDecision
    ): number {

        return authorizations.filter(
            authorization =>
                authorization.decision ===
                decision
        ).length;

    }

}