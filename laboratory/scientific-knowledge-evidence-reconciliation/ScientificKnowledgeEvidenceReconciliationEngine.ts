import type {
    ScientificKnowledgeEvolution
} from "../scientific-knowledge-evolution/ScientificKnowledgeEvolution.js";

import type {
    ScientificKnowledgeEvolutionResult
} from "../scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificEvidenceAssimilationResult
} from "../scientific-evidence-assimilation/ScientificEvidenceAssimilationResult.js";


export class ScientificKnowledgeEvidenceReconciliationEngine {

    build(
        evolution:
            ScientificKnowledgeEvolutionResult,

        assimilation:
            ScientificEvidenceAssimilationResult

    ): ScientificKnowledgeEvolutionResult {

        const assimilationsByKnowledge =
            new Map<
                string,
                ScientificEvidenceAssimilationResult[
                    "assimilations"
                ]
            >();


        for (
            const assimilationEntry
            of assimilation.assimilations ?? []
        ) {

            const existing =
                assimilationsByKnowledge.get(
                    assimilationEntry.knowledgeId
                ) ?? [];

            existing.push(
                assimilationEntry
            );

            assimilationsByKnowledge.set(
                assimilationEntry.knowledgeId,
                existing
            );

        }


        const reconciledEvolutions:
            ScientificKnowledgeEvolution[] =
            evolution.evolutions.map(
                knowledgeEvolution => {

                    const knowledgeAssimilations =
                        assimilationsByKnowledge.get(
                            knowledgeEvolution.knowledgeId
                        ) ?? [];


                    /*
                     * Observed scientific pressure.
                     *
                     * These collections include both newly
                     * assimilated evidence and observations
                     * that were not assimilated, such as
                     * duplicates or HOLD decisions.
                     */
                    const strengthened =
                        knowledgeAssimilations.filter(
                            item =>
                                item.action ===
                                "STRENGTHEN"
                        );


                    const challenged =
                        knowledgeAssimilations.filter(
                            item =>
                                item.action ===
                                "CHALLENGE"
                        );


                    const held =
                        knowledgeAssimilations.filter(
                            item =>
                                item.action ===
                                "HOLD"
                        );


                    /*
                     * Only evidence explicitly accepted by
                     * assimilation is allowed to produce an
                     * epistemic evidence transition.
                     */
                    const newlyAssimilated =
                        knowledgeAssimilations.filter(
                            item =>
                                item.assimilated === true
                        );


                    const newlyStrengthened =
                        strengthened.filter(
                            item =>
                                item.assimilated === true
                        );


                    const newlyChallenged =
                        challenged.filter(
                            item =>
                                item.assimilated === true
                        );


                    const supportingEvidenceIds =
                        newlyStrengthened.map(
                            item =>
                                item.evidenceId
                        );


                    const contradictoryEvidenceIds =
                        newlyChallenged.map(
                            item =>
                                item.evidenceId
                        );


                    /*
                     * Replication/provenance classifications
                     * describe execution-evidence provenance.
                     *
                     * They do not establish scientific source
                     * independence and must not directly alter
                     * confidence, maturity or knowledge status.
                     */
                    const duplicates =
                        knowledgeAssimilations.filter(
                            item =>
                                item.replicationClassification ===
                                "DUPLICATE"
                        );
const firstRepositoryObservations =
    knowledgeAssimilations.filter(
        item =>
            item.replicationClassification ===
            "FIRST_REPOSITORY_OBSERVATION"
    );

                    const sameRepositoryReplications =
                        knowledgeAssimilations.filter(
                            item =>
                                item.replicationClassification ===
                                "SAME_REPOSITORY_REPLICATION"
                        );


                    const crossRepositoryEvidence =
                        knowledgeAssimilations.filter(
                            item =>
                                item.replicationClassification ===
                                "CROSS_REPOSITORY_EVIDENCE"
                        );


                    const sourceProvenanceUnknown =
                        knowledgeAssimilations.filter(
                            item =>
                                item.replicationClassification ===
                                "SOURCE_PROVENANCE_UNKNOWN"
                        );


                    const notApplicable =
                        knowledgeAssimilations.filter(
                            item =>
                                item.replicationClassification ===
                                "NOT_APPLICABLE"
                        );


                    /*
                     * Repository diversity is observable
                     * execution provenance only.
                     *
                     * It must not be interpreted as an
                     * independent scientific source count.
                     */
                    const repositoriesObserved =
                        this.uniqueIds(
                            knowledgeAssimilations
                                .map(
                                    item =>
                                        item.repository
                                )
                                .filter(
                                    (
                                        repository
                                    ): repository is string =>
                                        typeof repository ===
                                            "string" &&
                                        repository.trim().length > 0
                                )
                        );


                    const scientificEvidenceTransition =
                        this.evidenceTransitionFor(
                            newlyStrengthened.length,
                            newlyChallenged.length,
                            held.length,
                            newlyAssimilated.length
                        );


                    return {

                        ...knowledgeEvolution,

                        scientificEvidencePressure: {

                            strengthened:
                                strengthened.length,

                            challenged:
                                challenged.length,

                            held:
                                held.length,

                            newlyAssimilated:
                                newlyAssimilated.length,

                            supportingEvidenceIds:
                                this.uniqueIds(
                                    supportingEvidenceIds
                                ),

                            contradictoryEvidenceIds:
                                this.uniqueIds(
                                    contradictoryEvidenceIds
                                )

                        },

                        scientificEvidenceTransition,

                        scientificReplicationPressure: {

                            duplicates:
    duplicates.length,

firstRepositoryObservations:
    firstRepositoryObservations.length,

sameRepositoryReplications:
    sameRepositoryReplications.length,

                            crossRepositoryEvidence:
                                crossRepositoryEvidence.length,

                            sourceProvenanceUnknown:
                                sourceProvenanceUnknown.length,

                            notApplicable:
                                notApplicable.length,

                            repositoriesObserved

                        }

                    };

                }
            );


        return {

            ...evolution,

            generatedAt:
                new Date().toISOString(),

            evolutions:
                reconciledEvolutions,

            /*
             * Assimilation owns the most recent knowledge
             * states because it has already registered the
             * execution evidence into them.
             *
             * Reconciliation records the epistemic direction
             * and replication/provenance characteristics of
             * execution evidence but does not invent
             * confidence, source-independence, maturity or
             * knowledge-status changes.
             */
            states:
                assimilation.states.map(
                    state => ({
                        ...state
                    })
                )

        };

    }


    private evidenceTransitionFor(
        newlyStrengthened: number,
        newlyChallenged: number,
        held: number,
        newlyAssimilated: number
    ):
        | "STRENGTHENED"
        | "CHALLENGED"
        | "CONFLICTED"
        | "HELD"
        | "UNCHANGED" {

        /*
         * Simultaneous newly assimilated support and
         * challenge means that the evidence is scientifically
         * conflicted. It must not be collapsed into either
         * direction.
         */
        if (
            newlyStrengthened > 0 &&
            newlyChallenged > 0
        ) {
            return "CONFLICTED";
        }


        /*
         * A new scientific challenge records negative
         * epistemic pressure. It does not automatically
         * change ScientificKnowledgeStatus or confidence.
         */
        if (
            newlyChallenged > 0
        ) {
            return "CHALLENGED";
        }


        /*
         * A new scientific support records positive
         * epistemic pressure. Replication is not assumed to
         * represent an additional independent source.
         */
        if (
            newlyStrengthened > 0
        ) {
            return "STRENGTHENED";
        }


        /*
         * HOLD represents observed evidence for which no
         * scientific SUPPORT/CHALLENGE polarity was
         * assimilated.
         */
        if (
            newlyAssimilated === 0 &&
            held > 0
        ) {
            return "HELD";
        }


        /*
         * No newly assimilated scientific evidence affected
         * this knowledge item. This also covers duplicate
         * SUPPORT/CHALLENGE observations.
         */
        return "UNCHANGED";

    }


    private uniqueIds(
        values: string[]
    ): string[] {

        return Array.from(
            new Set(
                values
                    .filter(
                        value =>
                            typeof value ===
                            "string"
                    )
                    .map(
                        value =>
                            value.trim()
                    )
                    .filter(
                        value =>
                            value.length > 0
                    )
            )
        );

    }

}