import type {
    ScientificKnowledgeEvolutionResult
} from "../scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificKnowledgeEvolution
} from "../scientific-knowledge-evolution/ScientificKnowledgeEvolution.js";

import type {
    ScientificBeliefRevision,
    ScientificBeliefRevisionDecision
} from "./ScientificBeliefRevision.js";

import type {
    ScientificBeliefRevisionResult
} from "./ScientificBeliefRevisionResult.js";

export class ScientificBeliefRevisionEngine {

    build(
        reconciliation:
            ScientificKnowledgeEvolutionResult
    ): ScientificBeliefRevisionResult {

        try {

            const revisions =
                (reconciliation.evolutions ?? [])
                    .map(
                        evolution =>
                            this.buildRevision(
                                evolution
                            )
                    );

            return {

                generatedAt:
                    new Date().toISOString(),

                revisions,

                statistics: {

                    total:
                        revisions.length,

                    preserve:
                        this.countDecision(
                            revisions,
                            "PRESERVE"
                        ),

                    reviewSupport:
                        this.countDecision(
                            revisions,
                            "REVIEW_SUPPORT"
                        ),

                    reviewChallenge:
                        this.countDecision(
                            revisions,
                            "REVIEW_CHALLENGE"
                        ),

                    reviewConflict:
                        this.countDecision(
                            revisions,
                            "REVIEW_CONFLICT"
                        ),

                    defer:
                        this.countDecision(
                            revisions,
                            "DEFER"
                        ),

                    requiringScientificReview:
                        revisions.filter(
                            revision =>
                                revision
                                    .requiresScientificReview
                        ).length,

                    requiringFurtherExperiment:
                        revisions.filter(
                            revision =>
                                revision
                                    .requiresFurtherExperiment
                        ).length,

                    repositoryDiversityObserved:
                        revisions.filter(
                            revision =>
                                revision
                                    .repositoryDiversityObserved
                        ).length,

                    sourceIndependenceEstablished:
                        revisions.filter(
                            revision =>
                                revision
                                    .sourceIndependenceEstablished
                        ).length,

                    automaticConfidenceChanges:
                        revisions.filter(
                            revision =>
                                revision
                                    .automaticConfidenceChange
                        ).length,

                    automaticStatusChanges:
                        revisions.filter(
                            revision =>
                                revision
                                    .automaticStatusChange
                        ).length
                },

                errors: []
            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                revisions: [],

                statistics: {

                    total: 0,

                    preserve: 0,

                    reviewSupport: 0,

                    reviewChallenge: 0,

                    reviewConflict: 0,

                    defer: 0,

                    requiringScientificReview: 0,

                    requiringFurtherExperiment: 0,

                    repositoryDiversityObserved: 0,

                    sourceIndependenceEstablished: 0,

                    automaticConfidenceChanges: 0,

                    automaticStatusChanges: 0
                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]
            };

        }

    }

    private buildRevision(
        evolution:
            ScientificKnowledgeEvolution
    ): ScientificBeliefRevision {

        const evidenceTransition =
            evolution
                .scientificEvidenceTransition ??
            "UNCHANGED";

        const evidencePressure =
            evolution
                .scientificEvidencePressure;

        const replicationPressure =
            evolution
                .scientificReplicationPressure;

        const decision =
            this.decisionFor(
                evidenceTransition
            );

        const repositoriesObserved =
            Array.from(
                new Set(
                    replicationPressure
                        ?.repositoriesObserved ??
                    []
                )
            );

        const crossRepositoryEvidenceObserved =
            (
                replicationPressure
                    ?.crossRepositoryEvidence ??
                0
            ) > 0;

        const sameRepositoryReplicationObserved =
            (
                replicationPressure
                    ?.sameRepositoryReplications ??
                0
            ) > 0;

        const duplicateEvidenceObserved =
            (
                replicationPressure
                    ?.duplicates ??
                0
            ) > 0;

        const sourceProvenanceUnknown =
            (
                replicationPressure
                    ?.sourceProvenanceUnknown ??
                0
            ) > 0;

        const repositoryDiversityObserved =
            repositoriesObserved.length > 1 ||
            crossRepositoryEvidenceObserved;

        const requiresScientificReview =
            decision === "REVIEW_SUPPORT" ||
            decision === "REVIEW_CHALLENGE" ||
            decision === "REVIEW_CONFLICT";

        const requiresFurtherExperiment =
            decision === "REVIEW_CHALLENGE" ||
            decision === "REVIEW_CONFLICT" ||
            decision === "DEFER";

        return {

            knowledgeId:
                evolution.knowledgeId,

            statement:
                evolution.statement,

            decision,

            evidenceTransition,

            newlyAssimilatedEvidence:
                evidencePressure
                    ?.newlyAssimilated ??
                0,

            supportingEvidenceAdded:
                evidencePressure
                    ?.strengthened ??
                0,

            contradictoryEvidenceAdded:
                evidencePressure
                    ?.challenged ??
                0,

            repositoryDiversityObserved,

            repositoriesObserved,

            duplicateEvidenceObserved,

            sameRepositoryReplicationObserved,

            crossRepositoryEvidenceObserved,

            sourceProvenanceUnknown,

            /*
             * Repository diversity is execution provenance.
             *
             * It must not be interpreted as independent
             * scientific-source provenance.
             */
            sourceIndependenceEstablished:
                false,

            /*
             * Phase 9.6 performs assessment only.
             *
             * No arbitrary confidence mutation is permitted.
             */
            automaticConfidenceChange:
                false,

            /*
             * Evidence pressure does not automatically
             * promote, challenge, reject or recover
             * a scientific knowledge state.
             */
            automaticStatusChange:
                false,

            requiresScientificReview,

            requiresFurtherExperiment,

            rationale:
                this.rationaleFor(
                    decision,
                    {
                        repositoryDiversityObserved,
                        sameRepositoryReplicationObserved,
                        crossRepositoryEvidenceObserved,
                        duplicateEvidenceObserved,
                        sourceProvenanceUnknown
                    }
                )
        };

    }

    private decisionFor(
        transition:
            ScientificBeliefRevision[
                "evidenceTransition"
            ]
    ): ScientificBeliefRevisionDecision {

        switch (transition) {

            case "STRENGTHENED":
                return "REVIEW_SUPPORT";

            case "CHALLENGED":
                return "REVIEW_CHALLENGE";

            case "CONFLICTED":
                return "REVIEW_CONFLICT";

            case "HELD":
                return "DEFER";

            case "UNCHANGED":
                return "PRESERVE";

        }

    }

    private rationaleFor(
        decision:
            ScientificBeliefRevisionDecision,
        context: {
            repositoryDiversityObserved:
                boolean;
            sameRepositoryReplicationObserved:
                boolean;
            crossRepositoryEvidenceObserved:
                boolean;
            duplicateEvidenceObserved:
                boolean;
            sourceProvenanceUnknown:
                boolean;
        }
    ): string[] {

        const rationale: string[] = [];

        switch (decision) {

            case "PRESERVE":

                rationale.push(
                    "No newly assimilated scientific evidence requires belief revision."
                );

                break;

            case "DEFER":

                rationale.push(
                    "Observed evidence did not establish scientific support or challenge polarity."
                );

                break;

            case "REVIEW_SUPPORT":

                rationale.push(
                    "New supporting scientific evidence was assimilated and should be reviewed before any belief promotion."
                );

                break;

            case "REVIEW_CHALLENGE":

                rationale.push(
                    "New contradictory scientific evidence was assimilated and should be reviewed without automatically rejecting prior knowledge."
                );

                break;

            case "REVIEW_CONFLICT":

                rationale.push(
                    "Supporting and contradictory scientific evidence were assimilated in the same reconciliation cycle."
                );

                rationale.push(
                    "The conflict requires additional scientific resolution before belief-state mutation."
                );

                break;

        }

        if (
            context.sameRepositoryReplicationObserved
        ) {

            rationale.push(
                "Same-repository replication was observed but does not establish an independent scientific source."
            );

        }

        if (
            context.crossRepositoryEvidenceObserved
        ) {

            rationale.push(
                "Cross-repository evidence was observed, establishing repository diversity but not scientific-source independence."
            );

        }

        if (
            context.repositoryDiversityObserved &&
            !context.crossRepositoryEvidenceObserved
        ) {

            rationale.push(
                "Repository diversity was observed but cannot be interpreted as scientific-source independence."
            );

        }

        if (
            context.sourceProvenanceUnknown
        ) {

            rationale.push(
                "At least one evidence item lacks repository provenance, so replication provenance remains incomplete."
            );

        }

        if (
            context.duplicateEvidenceObserved
        ) {

            rationale.push(
                "Duplicate evidence was observed and was not treated as newly assimilated scientific evidence."
            );

        }

        rationale.push(
            "No automatic confidence change was applied."
        );

        rationale.push(
            "No automatic knowledge-status change was applied."
        );

        return rationale;

    }

    private countDecision(
        revisions:
            ScientificBeliefRevision[],
        decision:
            ScientificBeliefRevisionDecision
    ): number {

        return revisions.filter(
            revision =>
                revision.decision ===
                decision
        ).length;

    }

}