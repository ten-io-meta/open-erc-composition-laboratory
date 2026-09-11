import type {
    ScientificNProtocolCompositionSetResult
} from "../scientific-n-protocol-composition-set/ScientificNProtocolCompositionSet.js";

import type {
    ScientificProtocolCompositionProfile
} from "../scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";

import type {
    ScientificCompositionCandidateCompatibilityResult,
    ScientificCompositionCandidateCompatibilityAssessment
} from "../scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityAssessment.js";

import type {
    ScientificCompositionCandidateEvaluationGraphResult,
    ScientificCompositionCandidateEvaluationGraphEdge
} from "../scientific-composition-candidate-evaluation-graph/ScientificCompositionCandidateEvaluationGraph.js";

import type {
    ScientificCompositionComplementarityResult
} from "../scientific-composition-complementarity/ScientificCompositionComplementarityResult.js";

import type {
    ScientificCompositionEnvelope,
    ScientificCompositionEnvelopeBoundaryCandidateEvaluation,
    ScientificCompositionEnvelopeBoundaryEvidenceStatus,
    ScientificCompositionEnvelopeBoundaryRegion,
    ScientificCompositionEnvelopeParticipant,
    ScientificCompositionEnvelopeRelation,
    ScientificCompositionEnvelopeResult
} from "./ScientificCompositionEnvelope.js";


import type {
    ScientificCandidateBoundaryRelevanceAssessment
} from "../scientific-candidate-boundary-relevance/ScientificCandidateBoundaryRelevanceAssessment.js";

export interface ScientificCompositionEnvelopeEngineInput {

    compositionSets:
        ScientificNProtocolCompositionSetResult;

    profiles:
        ScientificProtocolCompositionProfile[];

    candidateCompatibility:
        ScientificCompositionCandidateCompatibilityResult;


    candidateBoundaryRelevanceAssessments?:
        ScientificCandidateBoundaryRelevanceAssessment[];

    candidateEvaluationGraph:
        ScientificCompositionCandidateEvaluationGraphResult;

    complementarity:
        ScientificCompositionComplementarityResult;

}


function encode(
    parts:
        string[]
): string {

    return parts
        .map(
            part =>
                `${part.length}:${part}`
        )
        .join("|");

}


function sortedUnique(
    values:
        string[]
): string[] {

    return [
        ...new Set(
            values
        )
    ].sort();

}


function sameStrings(
    a:
        string[],
    b:
        string[]
): boolean {

    return JSON.stringify(
        sortedUnique(
            a
        )
    ) ===
        JSON.stringify(
            sortedUnique(
                b
            )
        );

}


export class ScientificCompositionEnvelopeEngine {

    build(
        input:
            ScientificCompositionEnvelopeEngineInput
    ): ScientificCompositionEnvelopeResult {

        const errors:
            string[] = [];


        if (
            input.compositionSets.errors.length >
            0
        ) {

            errors.push(
                "Cannot build composition envelopes from composition sets containing errors."
            );

        }


        if (
            input.candidateCompatibility.errors.length >
            0
        ) {

            errors.push(
                "Cannot build composition envelopes from candidate compatibility containing errors."
            );

        }


        if (
            input.candidateEvaluationGraph.errors.length >
            0
        ) {

            errors.push(
                "Cannot build composition envelopes from a candidate evaluation graph containing errors."
            );

        }


        if (
            input.complementarity.errors.length >
            0
        ) {

            errors.push(
                "Cannot build composition envelopes from complementarity evidence containing errors."
            );

        }


        const evaluationGraph =
            input.candidateEvaluationGraph.graph;


        if (
            evaluationGraph ===
            null
        ) {

            errors.push(
                "Cannot build composition envelopes from a null candidate evaluation graph."
            );

        }


        if (
            evaluationGraph !==
                null &&
            input.compositionSets.candidateGraphId !==
                null &&
            evaluationGraph.candidateGraphId !==
                input.compositionSets.candidateGraphId
        ) {

            errors.push(
                "Composition sets and candidate evaluation graph do not share the same candidate graph."
            );

        }


        if (
            evaluationGraph !==
                null &&
            input.compositionSets.objectiveId !==
                null &&
            evaluationGraph.objectiveId !==
                input.compositionSets.objectiveId
        ) {

            errors.push(
                "Composition sets and candidate evaluation graph do not share the same objective."
            );

        }


        const profilesByProtocol =
            new Map<
                string,
                ScientificProtocolCompositionProfile
            >();


        for (
            const profile
            of input.profiles
        ) {

            if (
                profilesByProtocol.has(
                    profile.protocolId
                )
            ) {

                errors.push(
                    `Duplicate composition profile for ${profile.protocolId}.`
                );

                continue;

            }


            profilesByProtocol.set(
                profile.protocolId,
                profile
            );

        }


        const assessmentsByCandidate =
            new Map<
                string,
                ScientificCompositionCandidateCompatibilityAssessment
            >();


        for (
            const assessment
            of input.candidateCompatibility.assessments
        ) {

            if (
                assessmentsByCandidate.has(
                    assessment.candidateId
                )
            ) {

                errors.push(
                    `Duplicate candidate compatibility assessment for ${assessment.candidateId}.`
                );

                continue;

            }


            assessmentsByCandidate.set(
                assessment.candidateId,
                assessment
            );

        }


        const evaluationEdgesByCandidate =
            new Map<
                string,
                ScientificCompositionCandidateEvaluationGraphEdge
            >();


        if (
            evaluationGraph !==
            null
        ) {

            for (
                const edge
                of evaluationGraph.edges
            ) {

                if (
                    evaluationEdgesByCandidate.has(
                        edge.candidateId
                    )
                ) {

                    errors.push(
                        `Duplicate candidate evaluation edge for ${edge.candidateId}.`
                    );

                    continue;

                }


                evaluationEdgesByCandidate.set(
                    edge.candidateId,
                    edge
                );

            }

        }


        const setIds =
            new Set<string>();


        for (
            const set
            of input.compositionSets.sets
        ) {

            if (
                setIds.has(
                    set.setId
                )
            ) {

                errors.push(
                    `Duplicate N-protocol composition set ${set.setId}.`
                );

            }


            setIds.add(
                set.setId
            );

        }


        if (
            errors.length >
                0 ||
            evaluationGraph ===
                null
        ) {

            return {

                envelopes:
                    [],

                isolatedParticipantIds:
                    [...input.compositionSets.isolatedParticipantIds]
                        .sort(),

                errors:
                    errors.sort()

            };

        }


        const envelopes:
            ScientificCompositionEnvelope[] =
            [];


        for (
            const set
            of [...input.compositionSets.sets].sort(
                (a, b) =>
                    a.setId.localeCompare(
                        b.setId
                    )
            )
        ) {

            const participantIdSet =
                new Set(
                    set.participantIds
                );


            if (
                participantIdSet.size !==
                set.participantIds.length
            ) {

                errors.push(
                    `Composition set ${set.setId} contains duplicate participant identities.`
                );

                continue;

            }


            if (
                set.participantIds.length <
                2
            ) {

                errors.push(
                    `Composition set ${set.setId} is not N-protocol compositional evidence.`
                );

                continue;

            }


            const envelopeParticipants:
                ScientificCompositionEnvelopeParticipant[] =
                [];


            const boundaryOwnerById =
                new Map<
                    string,
                    string
                >();


            const allNeedIds:
                string[] =
                [];


            for (
                const participant
                of [...set.participants].sort(
                    (a, b) =>
                        a.participantId.localeCompare(
                            b.participantId
                        )
                )
            ) {

                if (
                    !participantIdSet.has(
                        participant.participantId
                    )
                ) {

                    errors.push(
                        `Composition set ${set.setId} has inconsistent participant collections.`
                    );

                    continue;

                }


                const profile =
                    profilesByProtocol.get(
                        participant.participantId
                    );


                if (
                    profile ===
                    undefined
                ) {

                    errors.push(
                        `Composition set ${set.setId} has no profile for ${participant.participantId}.`
                    );

                    continue;

                }


                if (
                    profile.profileId !==
                        participant.profileId ||
                    profile.sourceId !==
                        participant.sourceId ||
                    (
                        profile.sourceRevision ??
                        undefined
                    ) !==
                    (
                        participant.sourceRevision ??
                        undefined
                    )
                ) {

                    errors.push(
                        `Composition set ${set.setId} profile provenance does not match ${participant.participantId}.`
                    );

                }


                for (
                    const contribution
                    of profile.contributions
                ) {

                    if (
                        contribution.participantId !==
                        participant.participantId
                    ) {

                        errors.push(
                            `Contribution ${contribution.contributionId} has foreign participant ownership.`
                        );

                    }

                }


                for (
                    const boundary
                    of profile.boundaries
                ) {

                    if (
                        boundary.participantId !==
                        participant.participantId
                    ) {

                        errors.push(
                            `Boundary ${boundary.boundaryId} has foreign participant ownership.`
                        );

                    }


                    if (
                        boundaryOwnerById.has(
                            boundary.boundaryId
                        )
                    ) {

                        errors.push(
                            `Duplicate boundary identity ${boundary.boundaryId}.`
                        );

                    }


                    boundaryOwnerById.set(
                        boundary.boundaryId,
                        participant.participantId
                    );

                }


                for (
                    const need
                    of profile.needs
                ) {

                    if (
                        need.participantId !==
                        participant.participantId
                    ) {

                        errors.push(
                            `Need ${need.needId} has foreign participant ownership.`
                        );

                    }


                    allNeedIds.push(
                        need.needId
                    );

                }


                envelopeParticipants.push({

                    participantId:
                        participant.participantId,

                    profileId:
                        profile.profileId,

                    sourceId:
                        profile.sourceId,

                    ...(
                        profile.sourceRevision !==
                            undefined
                            ? {
                                sourceRevision:
                                    profile.sourceRevision
                            }
                            : {}
                    ),

                    contributions:
                        [...profile.contributions]
                            .sort(
                                (a, b) =>
                                    a.contributionId.localeCompare(
                                        b.contributionId
                                    )
                            ),

                    boundaries:
                        [...profile.boundaries]
                            .sort(
                                (a, b) =>
                                    a.boundaryId.localeCompare(
                                        b.boundaryId
                                    )
                            ),

                    needs:
                        [...profile.needs]
                            .sort(
                                (a, b) =>
                                    a.needId.localeCompare(
                                        b.needId
                                    )
                            )

                });

            }


            const envelopeRelations:
                ScientificCompositionEnvelopeRelation[] =
                [];


            for (
                const relation
                of [...set.relations].sort(
                    (a, b) =>
                        a.candidateId.localeCompare(
                            b.candidateId
                        )
                )
            ) {

                const edge =
                    evaluationEdgesByCandidate.get(
                        relation.candidateId
                    );


                const assessment =
                    assessmentsByCandidate.get(
                        relation.candidateId
                    );


                if (
                    edge ===
                    undefined
                ) {

                    errors.push(
                        `Composition set ${set.setId} candidate ${relation.candidateId} has no evaluation edge.`
                    );

                    continue;

                }


                if (
                    assessment ===
                    undefined
                ) {

                    errors.push(
                        `Composition set ${set.setId} candidate ${relation.candidateId} has no compatibility assessment.`
                    );

                    continue;

                }


                if (
                    edge.kind !==
                        relation.kind ||
                    edge.sourceParticipantId !==
                        relation.sourceParticipantId ||
                    edge.targetParticipantId !==
                        relation.targetParticipantId
                ) {

                    errors.push(
                        `Composition set ${set.setId} candidate ${relation.candidateId} evaluation identity mismatch.`
                    );

                }


                if (
                    assessment.candidateKind !==
                        relation.kind ||
                    assessment.sourceParticipantId !==
                        relation.sourceParticipantId ||
                    assessment.targetParticipantId !==
                        relation.targetParticipantId
                ) {

                    errors.push(
                        `Composition set ${set.setId} candidate ${relation.candidateId} compatibility identity mismatch.`
                    );

                }


                if (
                    edge.compatibilityAssessmentId !==
                    assessment.assessmentId
                ) {

                    errors.push(
                        `Composition set ${set.setId} candidate ${relation.candidateId} assessment identity mismatch.`
                    );

                }


                if (
                    edge.compatibilityPolarity !==
                    assessment.scientificPolarity
                ) {

                    errors.push(
                        `Composition set ${set.setId} candidate ${relation.candidateId} compatibility polarity mismatch.`
                    );

                }


                if (
                    !sameStrings(
                        relation.evidenceIds,
                        edge.discoveryEvidenceIds
                    )
                ) {

                    errors.push(
                        `Composition set ${set.setId} candidate ${relation.candidateId} discovery evidence mismatch.`
                    );

                }


                const assessmentBoundaryIds =
                    assessment
                        .boundaryEvaluations
                        .map(
                            evaluation =>
                                evaluation.boundaryId
                        );


                if (
                    !sameStrings(
                        edge.boundaryIds,
                        assessmentBoundaryIds
                    )
                ) {

                    errors.push(
                        `Composition set ${set.setId} candidate ${relation.candidateId} boundary identity mismatch.`
                    );

                }


                for (
                    const boundaryEvaluation
                    of assessment.boundaryEvaluations
                ) {

                    const owner =
                        boundaryOwnerById.get(
                            boundaryEvaluation.boundaryId
                        );


                    if (
                        owner ===
                        undefined
                    ) {

                        errors.push(
                            `Candidate ${relation.candidateId} evaluates unknown boundary ${boundaryEvaluation.boundaryId}.`
                        );

                        continue;

                    }


                    if (
                        boundaryEvaluation.participantId !==
                        owner
                    ) {

                        errors.push(
                            `Candidate ${relation.candidateId} boundary ${boundaryEvaluation.boundaryId} has inconsistent ownership.`
                        );

                    }


                    if (
                        owner !==
                            relation.sourceParticipantId &&
                        owner !==
                            relation.targetParticipantId
                    ) {

                        errors.push(
                            `Candidate ${relation.candidateId} evaluates a boundary outside its participants.`
                        );

                    }

                }


                envelopeRelations.push({

                    candidateId:
                        relation.candidateId,

                    candidateKind:
                        relation.kind,

                    sourceParticipantId:
                        relation.sourceParticipantId,

                    targetParticipantId:
                        relation.targetParticipantId,

                    discoveryEvidenceIds:
                        sortedUnique(
                            edge.discoveryEvidenceIds
                        ),

                    compatibilityAssessmentId:
                        assessment.assessmentId,

                    boundaryIds:
                        sortedUnique(
                            edge.boundaryIds
                        ),

                    compatibilityEvidenceIds:
                        sortedUnique(
                            edge.compatibilityEvidenceIds
                        ),

                    compatibilityPolarity:
                        edge.compatibilityPolarity,

                    boundaryCoverage:
                        edge.boundaryIds.length ===
                            0
                            ? "NO_CANDIDATE_SCOPED_BOUNDARIES"
                            : "CANDIDATE_SCOPED_BOUNDARIES_PRESENT",

                    ...(
                        edge.kind ===
                            "FUNCTIONAL_COMPLEMENTARITY"
                            ? {

                                functionalNeedId:
                                    edge.needId,

                                functionalContributionId:
                                    edge.contributionId

                            }
                            : edge.kind ===
                                "DOCUMENTARY_COMPOSITION"
                                ? {

                                    documentaryRelation:
                                        edge.relation

                                }
                                : {

                                    structuralFoundationCandidateId:
                                        edge.structuralFoundationCandidateId,

                                    structuralFoundationDirectionality:
                                        "UNDIRECTED" as const,

                                    foundationProtocolId:
                                        edge.foundationProtocolId

                                }
                    ),

                    evaluationStatus:
                        "EVALUATED"

                });

            }


            /*
             * Each known participant boundary is now projected into
             * the candidate topology of the whole set.
             *
             * This remains candidate-scoped evidence and must not be
             * interpreted as simultaneous global preservation.
             */
            const boundaryRegions:
                ScientificCompositionEnvelopeBoundaryRegion[] =
                [];


            for (
                const participant
                of envelopeParticipants
            ) {

                for (
                    const boundary
                    of participant.boundaries
                ) {

                    const incidentRelations =
                        envelopeRelations.filter(
                            relation =>
                                relation.sourceParticipantId ===
                                    participant.participantId ||
                                relation.targetParticipantId ===
                                    participant.participantId
                        );


                    const candidateEvaluations:
                        ScientificCompositionEnvelopeBoundaryCandidateEvaluation[] =
                        [];


                    for (
                        const relation
                        of incidentRelations
                    ) {

                        const assessment =
                            assessmentsByCandidate.get(
                                relation.candidateId
                            )!;


                        const evaluation =
                            assessment
                                .boundaryEvaluations
                                .find(
                                    item =>
                                        item.boundaryId ===
                                        boundary.boundaryId
                                );


                        if (
                        evaluation ===
                            undefined
                    ) {

                        const relevanceAssessments =
                            input.candidateBoundaryRelevanceAssessments ===
                                undefined
                                ? []
                                : input.candidateBoundaryRelevanceAssessments
                                    .filter(
                                        relevance =>
                                            relevance.candidateId ===
                                                relation.candidateId &&
                                            relevance.participantId ===
                                                participant.participantId &&
                                            relevance.boundaryId ===
                                                boundary.boundaryId
                                    );


                        const relevance =
                            relevanceAssessments.length ===
                                1
                                ? relevanceAssessments[0]
                                : undefined;


                        /*
                         * Legacy callers preserve the original invariant.
                         */
                        if (
                            input.candidateBoundaryRelevanceAssessments ===
                                undefined
                        ) {

                            errors.push(
                                `Known boundary ${boundary.boundaryId} is missing from incident candidate ${relation.candidateId}.`
                            );

                            continue;

                        }


                        /*
                         * Relevance-aware callers fail closed when the
                         * candidate/boundary relevance identity is absent
                         * or duplicated.
                         */
                        if (
                            relevanceAssessments.length !==
                                1 ||
                            relevance ===
                                undefined
                        ) {

                            errors.push(
                                `Known boundary ${boundary.boundaryId} must have exactly one relevance assessment for incident candidate ${relation.candidateId}.`
                            );

                            continue;

                        }


                        /*
                         * A RELEVANT boundary belongs to candidate
                         * compatibility and may not disappear.
                         */
                        if (
                            relevance.relevance ===
                                "RELEVANT"
                        ) {

                            errors.push(
                                `Relevant boundary ${boundary.boundaryId} is missing from incident candidate ${relation.candidateId}.`
                            );

                            continue;

                        }


                        /*
                         * OUT_OF_SCOPE and UNRESOLVED are not candidate
                         * compatibility evaluations. The protocol boundary
                         * remains present in the Envelope, with zero
                         * candidate evaluations.
                         */
                        continue;

                    }


                    /*
                     * If an evaluation DOES exist and relevance ingress is
                     * present, it must be RELEVANT.
                     */
                    if (
                        input.candidateBoundaryRelevanceAssessments !==
                            undefined
                    ) {

                        const relevanceAssessments =
                            input.candidateBoundaryRelevanceAssessments
                                .filter(
                                    relevance =>
                                        relevance.candidateId ===
                                            relation.candidateId &&
                                        relevance.participantId ===
                                            participant.participantId &&
                                        relevance.boundaryId ===
                                            boundary.boundaryId
                                );


                        if (
                            relevanceAssessments.length !==
                                1
                        ) {

                            errors.push(
                                `Evaluated boundary ${boundary.boundaryId} must have exactly one relevance assessment for incident candidate ${relation.candidateId}.`
                            );

                            continue;

                        }


                        if (
                            relevanceAssessments[0].relevance !==
                                "RELEVANT"
                        ) {

                            errors.push(
                                `Candidate ${relation.candidateId} evaluates boundary ${boundary.boundaryId} despite relevance ${relevanceAssessments[0].relevance}.`
                            );

                            continue;

                        }

                    }


                        candidateEvaluations.push({

                            candidateId:
                                relation.candidateId,

                            assessmentId:
                                assessment.assessmentId,

                            status:
                                evaluation.status,

                            observationIds:
                                sortedUnique(
                                    evaluation.observationIds
                                ),

                            evidenceIds:
                                sortedUnique(
                                    evaluation.evidenceIds
                                )

                        });

                    }


                    let candidateEvidenceStatus:
                        ScientificCompositionEnvelopeBoundaryEvidenceStatus;


                    if (
                        candidateEvaluations.some(
                            evaluation =>
                                evaluation.status ===
                                "VIOLATED"
                        )
                    ) {

                        candidateEvidenceStatus =
                            "VIOLATED_IN_CANDIDATE_EVIDENCE";

                    }
                    else if (
                        candidateEvaluations.length ===
                            0 ||
                        candidateEvaluations.some(
                            evaluation =>
                                evaluation.status ===
                                "UNEVALUATED"
                        )
                    ) {

                        candidateEvidenceStatus =
                            "UNEVALUATED_IN_CANDIDATE_EVIDENCE";

                    }
                    else {

                        candidateEvidenceStatus =
                            "PRESERVED_IN_CANDIDATE_EVIDENCE";

                    }


                    boundaryRegions.push({

                        boundaryId:
                            boundary.boundaryId,

                        participantId:
                            participant.participantId,

                        candidateIds:
                            candidateEvaluations
                                .map(
                                    evaluation =>
                                        evaluation.candidateId
                                )
                                .sort(),

                        candidateEvaluations:
                            candidateEvaluations.sort(
                                (a, b) =>
                                    a.candidateId.localeCompare(
                                        b.candidateId
                                    )
                            ),

                        candidateEvidenceStatus,

                        evidenceIds:
                            sortedUnique(
                                candidateEvaluations.flatMap(
                                    evaluation =>
                                        evaluation.evidenceIds
                                )
                            )

                    });

                }

            }


            boundaryRegions.sort(
                (a, b) =>
                    a.boundaryId.localeCompare(
                        b.boundaryId
                    )
            );


            const unresolvedNeedIdSet =
                new Set(
                    input.complementarity.unresolvedNeedIds
                );


            const unresolvedNeedIds =
                sortedUnique(
                    allNeedIds.filter(
                        needId =>
                            unresolvedNeedIdSet.has(
                                needId
                            )
                    )
                );


            const contributions =
                envelopeParticipants.reduce(
                    (
                        total,
                        participant
                    ) =>
                        total +
                        participant.contributions.length,
                    0
                );


            const knownBoundaries =
                envelopeParticipants.reduce(
                    (
                        total,
                        participant
                    ) =>
                        total +
                        participant.boundaries.length,
                    0
                );


            const needs =
                envelopeParticipants.reduce(
                    (
                        total,
                        participant
                    ) =>
                        total +
                        participant.needs.length,
                    0
                );


            envelopes.push({

                envelopeId:
                    encode([
                        "SCIENTIFIC-COMPOSITION-ENVELOPE",
                        set.setId,
                        evaluationGraph.graphId
                    ]),

                setId:
                    set.setId,

                candidateGraphId:
                    set.candidateGraphId,

                candidateEvaluationGraphId:
                    evaluationGraph.graphId,

                objectiveId:
                    set.objectiveId,

                participants:
                    envelopeParticipants.sort(
                        (a, b) =>
                            a.participantId.localeCompare(
                                b.participantId
                            )
                    ),

                participantIds:
                    [...set.participantIds]
                        .sort(),

                relations:
                    envelopeRelations.sort(
                        (a, b) =>
                            a.candidateId.localeCompare(
                                b.candidateId
                            )
                    ),

                boundaryRegions,

                unresolvedNeedIds,

                statistics: {

                    participants:
                        envelopeParticipants.length,

                    relations:
                        envelopeRelations.length,

                    contributions,

                    knownBoundaries,

                    needs,

                    unresolvedNeeds:
                        unresolvedNeedIds.length,

                    preservedBoundaryRegions:
                        boundaryRegions.filter(
                            region =>
                                region.candidateEvidenceStatus ===
                                "PRESERVED_IN_CANDIDATE_EVIDENCE"
                        ).length,

                    violatedBoundaryRegions:
                        boundaryRegions.filter(
                            region =>
                                region.candidateEvidenceStatus ===
                                "VIOLATED_IN_CANDIDATE_EVIDENCE"
                        ).length,

                    unevaluatedBoundaryRegions:
                        boundaryRegions.filter(
                            region =>
                                region.candidateEvidenceStatus ===
                                "UNEVALUATED_IN_CANDIDATE_EVIDENCE"
                        ).length,

                    supportedRelations:
                        envelopeRelations.filter(
                            relation =>
                                relation.compatibilityPolarity ===
                                "SUPPORT"
                        ).length,

                    challengedRelations:
                        envelopeRelations.filter(
                            relation =>
                                relation.compatibilityPolarity ===
                                "CHALLENGE"
                        ).length,

                    inconclusiveRelations:
                        envelopeRelations.filter(
                            relation =>
                                relation.compatibilityPolarity ===
                                "INCONCLUSIVE"
                        ).length,

                    relationsWithoutCandidateScopedBoundaries:
                        envelopeRelations.filter(
                            relation =>
                                relation.boundaryCoverage ===
                                "NO_CANDIDATE_SCOPED_BOUNDARIES"
                        ).length

                },

                assemblyStatus:
                    "ASSEMBLED"

            });

        }


        if (
            errors.length >
            0
        ) {

            return {

                envelopes:
                    [],

                isolatedParticipantIds:
                    [...input.compositionSets.isolatedParticipantIds]
                        .sort(),

                errors:
                    errors.sort()

            };

        }


        envelopes.sort(
            (a, b) =>
                a.envelopeId.localeCompare(
                    b.envelopeId
                )
        );


        return {

            envelopes,

            isolatedParticipantIds:
                [...input.compositionSets.isolatedParticipantIds]
                    .sort(),

            errors:
                []

        };

    }

}