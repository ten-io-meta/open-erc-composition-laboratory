import type {
    ScientificCompositionFrameObjective
} from "../scientific-composition-frame/ScientificCompositionFrame.js";

import type {
    ScientificCompositionEnvelope,
    ScientificCompositionEnvelopeResult
} from "../scientific-composition-envelope/ScientificCompositionEnvelope.js";

import type {
    ScientificCompositionCandidateEvaluationGraphEdge,
    ScientificCompositionCandidateEvaluationGraphResult,
    ScientificFunctionalCandidateEvaluationGraphEdge
} from "../scientific-composition-candidate-evaluation-graph/ScientificCompositionCandidateEvaluationGraph.js";

import type {
    ScientificCompositionComplementarityResult
} from "../scientific-composition-complementarity/ScientificCompositionComplementarityResult.js";

import type {
    ScientificNProtocolCompositionConfiguration,
    ScientificNProtocolCompositionSolverObjectiveCoverage,
    ScientificNProtocolCompositionSolverRelation,
    ScientificNProtocolCompositionSolution,
    ScientificNProtocolCompositionSolverResult
} from "./ScientificNProtocolCompositionSolver.js";


export interface ScientificNProtocolCompositionSolverEngineInput {

    objective:
        ScientificCompositionFrameObjective;

    envelopes:
        ScientificCompositionEnvelopeResult;

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


export class ScientificNProtocolCompositionSolverEngine {

    solve(
        input:
            ScientificNProtocolCompositionSolverEngineInput
    ): ScientificNProtocolCompositionSolverResult {

        const errors:
            string[] = [];


        if (
            input.envelopes.errors.length >
            0
        ) {

            errors.push(
                "Cannot solve N-protocol composition from envelopes containing errors."
            );

        }


        if (
            input.candidateEvaluationGraph.errors.length >
            0
        ) {

            errors.push(
                "Cannot solve N-protocol composition from a candidate evaluation graph containing errors."
            );

        }


        if (
            input.complementarity.errors.length >
            0
        ) {

            errors.push(
                "Cannot solve N-protocol composition from complementarity evidence containing errors."
            );

        }


        const evaluationGraph =
            input.candidateEvaluationGraph.graph;


        if (
            evaluationGraph ===
            null
        ) {

            errors.push(
                "Cannot solve N-protocol composition from a null candidate evaluation graph."
            );

        }


        if (
            input.objective.objectiveId.trim().length ===
            0
        ) {

            errors.push(
                "Composition objective identity is empty."
            );

        }


        if (
            sortedUnique(
                input.objective.requiredSubjects
            ).length !==
            input.objective.requiredSubjects.length
        ) {

            errors.push(
                "Composition objective contains duplicate required subjects."
            );

        }


        const coverageBySubject =
            new Map(
                input.complementarity.objectiveCoverage.map(
                    coverage => [
                        coverage.requiredSubject,
                        coverage
                    ] as const
                )
            );


        if (
            coverageBySubject.size !==
            input.complementarity.objectiveCoverage.length
        ) {

            errors.push(
                "Complementarity objective coverage contains duplicate subjects."
            );

        }


        if (
            !sameStrings(
                input.objective.requiredSubjects,
                input.complementarity.objectiveCoverage.map(
                    coverage =>
                        coverage.requiredSubject
                )
            )
        ) {

            errors.push(
                "Complementarity objective coverage does not exactly match the composition objective."
            );

        }


        const edgesByCandidate =
            new Map<
                string,
                ScientificCompositionCandidateEvaluationGraphEdge
            >();


        if (
            evaluationGraph !==
            null
        ) {

            if (
                evaluationGraph.objectiveId !==
                input.objective.objectiveId
            ) {

                errors.push(
                    "Candidate evaluation graph objective does not match the solver objective."
                );

            }


            for (
                const edge
                of evaluationGraph.edges
            ) {

                if (
                    edgesByCandidate.has(
                        edge.candidateId
                    )
                ) {

                    errors.push(
                        `Duplicate candidate evaluation edge ${edge.candidateId}.`
                    );

                    continue;

                }


                edgesByCandidate.set(
                    edge.candidateId,
                    edge
                );

            }

        }


        if (
            errors.length >
                0 ||
            evaluationGraph ===
                null
        ) {

            return {

                solutions:
                    [],

                errors:
                    errors.sort()

            };

        }


        const solutions:
            ScientificNProtocolCompositionSolution[] =
            [];


        for (
            const envelope
            of [...input.envelopes.envelopes].sort(
                (a, b) =>
                    a.envelopeId.localeCompare(
                        b.envelopeId
                    )
            )
        ) {

            const envelopeErrors:
                string[] = [];


            if (
                envelope.assemblyStatus !==
                "ASSEMBLED"
            ) {

                envelopeErrors.push(
                    `Envelope ${envelope.envelopeId} is not assembled.`
                );

            }


            if (
                envelope.objectiveId !==
                input.objective.objectiveId
            ) {

                envelopeErrors.push(
                    `Envelope ${envelope.envelopeId} objective does not match the solver objective.`
                );

            }


            if (
                envelope.candidateEvaluationGraphId !==
                evaluationGraph.graphId
            ) {

                envelopeErrors.push(
                    `Envelope ${envelope.envelopeId} does not reference the supplied candidate evaluation graph.`
                );

            }


            const participantIds =
                sortedUnique(
                    envelope.participantIds
                );


            if (
                participantIds.length !==
                envelope.participantIds.length
            ) {

                envelopeErrors.push(
                    `Envelope ${envelope.envelopeId} contains duplicate participant identities.`
                );

            }


            const envelopeParticipantIds =
                envelope.participants.map(
                    participant =>
                        participant.participantId
                );


            if (
                !sameStrings(
                    participantIds,
                    envelopeParticipantIds
                )
            ) {

                envelopeErrors.push(
                    `Envelope ${envelope.envelopeId} participant collections disagree.`
                );

            }


            const participantIdSet =
                new Set(
                    participantIds
                );


            const needOwnerById =
                new Map<
                    string,
                    string
                >();


            const contributionOwnerById =
                new Map<
                    string,
                    string
                >();


            const boundaryOwnerById =
                new Map<
                    string,
                    string
                >();


            for (
                const participant
                of envelope.participants
            ) {

                for (
                    const need
                    of participant.needs
                ) {

                    if (
                        needOwnerById.has(
                            need.needId
                        )
                    ) {

                        envelopeErrors.push(
                            `Duplicate need identity ${need.needId}.`
                        );

                        continue;

                    }


                    if (
                        need.participantId !==
                        participant.participantId
                    ) {

                        envelopeErrors.push(
                            `Need ${need.needId} has foreign participant ownership.`
                        );

                    }


                    needOwnerById.set(
                        need.needId,
                        participant.participantId
                    );

                }


                for (
                    const contribution
                    of participant.contributions
                ) {

                    if (
                        contributionOwnerById.has(
                            contribution.contributionId
                        )
                    ) {

                        envelopeErrors.push(
                            `Duplicate contribution identity ${contribution.contributionId}.`
                        );

                        continue;

                    }


                    if (
                        contribution.participantId !==
                        participant.participantId
                    ) {

                        envelopeErrors.push(
                            `Contribution ${contribution.contributionId} has foreign participant ownership.`
                        );

                    }


                    contributionOwnerById.set(
                        contribution.contributionId,
                        participant.participantId
                    );

                }


                for (
                    const boundary
                    of participant.boundaries
                ) {

                    if (
                        boundaryOwnerById.has(
                            boundary.boundaryId
                        )
                    ) {

                        envelopeErrors.push(
                            `Duplicate boundary identity ${boundary.boundaryId}.`
                        );

                        continue;

                    }


                    if (
                        boundary.participantId !==
                        participant.participantId
                    ) {

                        envelopeErrors.push(
                            `Boundary ${boundary.boundaryId} has foreign participant ownership.`
                        );

                    }


                    boundaryOwnerById.set(
                        boundary.boundaryId,
                        participant.participantId
                    );

                }

            }


            /*
             * Validate global objective-coverage provenance before
             * filtering it into route/subset-specific configurations.
             */
            for (
                const coverage
                of input.complementarity.objectiveCoverage
            ) {

                if (
                    coverage.status ===
                        "COVERED" &&
                    (
                        coverage.providerParticipantIds.length ===
                            0 ||
                        coverage.contributionIds.length ===
                            0
                    )
                ) {

                    envelopeErrors.push(
                        `Covered objective subject ${coverage.requiredSubject} has incomplete provider evidence.`
                    );

                }


                for (
                    const contributionId
                    of coverage.contributionIds
                ) {

                    const owner =
                        contributionOwnerById.get(
                            contributionId
                        );


                    if (
                        owner ===
                        undefined
                    ) {

                        /*
                         * The supplied complementarity result may
                         * cover the larger global frame. Contributions
                         * outside this envelope are allowed here.
                         */
                        continue;

                    }


                    if (
                        !coverage.providerParticipantIds.includes(
                            owner
                        )
                    ) {

                        envelopeErrors.push(
                            `Objective coverage contribution ${contributionId} is inconsistent with its provider participant.`
                        );

                    }

                }

            }


            const envelopeRelationsByCandidate =
                new Map(
                    envelope.relations.map(
                        relation => [
                            relation.candidateId,
                            relation
                        ] as const
                    )
                );


            if (
                envelopeRelationsByCandidate.size !==
                envelope.relations.length
            ) {

                envelopeErrors.push(
                    `Envelope ${envelope.envelopeId} contains duplicate candidate relations.`
                );

            }


            for (
                const relation
                of envelope.relations
            ) {

                const edge =
                    edgesByCandidate.get(
                        relation.candidateId
                    );


                if (
                    edge ===
                    undefined
                ) {

                    envelopeErrors.push(
                        `Envelope candidate ${relation.candidateId} has no evaluation edge.`
                    );

                    continue;

                }


                if (
                    edge.kind !==
                        relation.candidateKind ||
                    edge.sourceParticipantId !==
                        relation.sourceParticipantId ||
                    edge.targetParticipantId !==
                        relation.targetParticipantId ||
                    edge.compatibilityPolarity !==
                        relation.compatibilityPolarity
                ) {

                    envelopeErrors.push(
                        `Envelope candidate ${relation.candidateId} disagrees with its evaluation edge.`
                    );

                    continue;

                }


                if (
                    !participantIdSet.has(
                        edge.sourceParticipantId
                    ) ||
                    !participantIdSet.has(
                        edge.targetParticipantId
                    )
                ) {

                    envelopeErrors.push(
                        `Envelope candidate ${relation.candidateId} references a participant outside its envelope.`
                    );

                }


                if (
                    edge.sourceParticipantId ===
                    edge.targetParticipantId
                ) {

                    envelopeErrors.push(
                        `Envelope candidate ${relation.candidateId} is a self relation.`
                    );

                }


                if (
                    edge.kind ===
                    "FUNCTIONAL_COMPLEMENTARITY"
                ) {

                    if (
                        relation.functionalNeedId !==
                            edge.needId ||
                        relation.functionalContributionId !==
                            edge.contributionId
                    ) {

                        envelopeErrors.push(
                            `Functional candidate ${relation.candidateId} does not preserve its exact need/contribution identity.`
                        );

                    }


                    const needOwner =
                        needOwnerById.get(
                            edge.needId
                        );


                    const contributionOwner =
                        contributionOwnerById.get(
                            edge.contributionId
                        );


                    if (
                        needOwner !==
                        edge.sourceParticipantId
                    ) {

                        envelopeErrors.push(
                            `Functional candidate ${relation.candidateId} need ownership does not match its source participant.`
                        );

                    }


                    if (
                        contributionOwner !==
                        edge.targetParticipantId
                    ) {

                        envelopeErrors.push(
                            `Functional candidate ${relation.candidateId} contribution ownership does not match its target participant.`
                        );

                    }

                }

            }


            if (
                envelopeErrors.length >
                0
            ) {

                errors.push(
                    ...envelopeErrors
                );

                continue;

            }


            /*
             * Only exact functional candidates with candidate-level
             * boundary SUPPORT may open the solver topology.
             *
             * Documentary, CHALLENGE and INCONCLUSIVE relations are
             * preserved separately and never promoted into a route.
             */
            const supportedFunctionalEdges =
                envelope.relations
                    .filter(
                        relation =>
                            relation.candidateKind ===
                                "FUNCTIONAL_COMPLEMENTARITY" &&
                            relation.compatibilityPolarity ===
                                "SUPPORT"
                    )
                    .map(
                        relation =>
                            edgesByCandidate.get(
                                relation.candidateId
                            )!
                    )
                    .filter(
                        (
                            edge
                        ): edge is ScientificFunctionalCandidateEvaluationGraphEdge =>
                            edge.kind ===
                            "FUNCTIONAL_COMPLEMENTARITY" &&
                            edge.compatibilityPolarity ===
                            "SUPPORT"
                    )
                    .sort(
                        (a, b) =>
                            a.candidateId.localeCompare(
                                b.candidateId
                            )
                    );


            const adjacency =
                new Map<
                    string,
                    Set<string>
                >();


            for (
                const participantId
                of participantIds
            ) {

                adjacency.set(
                    participantId,
                    new Set<string>()
                );

            }


            for (
                const edge
                of supportedFunctionalEdges
            ) {

                adjacency.get(
                    edge.sourceParticipantId
                )!.add(
                    edge.targetParticipantId
                );

                adjacency.get(
                    edge.targetParticipantId
                )!.add(
                    edge.sourceParticipantId
                );

            }


            const components:
                string[][] = [];


            const visited =
                new Set<string>();


            for (
                const start
                of participantIds
            ) {

                if (
                    visited.has(
                        start
                    ) ||
                    adjacency.get(
                        start
                    )!.size ===
                        0
                ) {

                    continue;

                }


                const queue =
                    [
                        start
                    ];


                const component:
                    string[] = [];


                visited.add(
                    start
                );


                while (
                    queue.length >
                    0
                ) {

                    const current =
                        queue.shift()!;


                    component.push(
                        current
                    );


                    for (
                        const neighbor
                        of [...adjacency.get(
                            current
                        )!].sort()
                    ) {

                        if (
                            visited.has(
                                neighbor
                            )
                        ) {

                            continue;

                        }


                        visited.add(
                            neighbor
                        );

                        queue.push(
                            neighbor
                        );

                    }

                }


                if (
                    component.length >=
                    2
                ) {

                    components.push(
                        component.sort()
                    );

                }

            }


            components.sort(
                (a, b) =>
                    a.join("|").localeCompare(
                        b.join("|")
                    )
            );


            const fullConfigurations:
                ScientificNProtocolCompositionConfiguration[] =
                [];


            const subsetConfigurations:
                ScientificNProtocolCompositionConfiguration[] =
                [];


            for (
                const componentParticipantIds
                of components
            ) {

                const configuration =
                    this.buildConfiguration(
                        envelope,
                        componentParticipantIds,
                        supportedFunctionalEdges,
                        input,
                        needOwnerById,
                        contributionOwnerById
                    );


                if (
                    sameStrings(
                        componentParticipantIds,
                        participantIds
                    )
                ) {

                    fullConfigurations.push(
                        configuration
                    );

                }
                else {

                    subsetConfigurations.push(
                        configuration
                    );

                }

            }


            fullConfigurations.sort(
                (a, b) =>
                    a.configurationId.localeCompare(
                        b.configurationId
                    )
            );


            subsetConfigurations.sort(
                (a, b) =>
                    a.configurationId.localeCompare(
                        b.configurationId
                    )
            );


            const readyFull =
                fullConfigurations.some(
                    configuration =>
                        configuration.readiness ===
                        "READY_FOR_GLOBAL_EVALUATION"
                );


            let resolutionStatus:
                ScientificNProtocolCompositionSolution["resolutionStatus"];


            if (
                readyFull
            ) {

                resolutionStatus =
                    "READY_FULL_CONFIGURATION";

            }
            else if (
                fullConfigurations.length >
                0
            ) {

                resolutionStatus =
                    "FULL_CONFIGURATION_BLOCKED";

            }
            else if (
                subsetConfigurations.length >
                0
            ) {

                resolutionStatus =
                    "PARTIAL_CONFIGURATION_ONLY";

            }
            else {

                resolutionStatus =
                    "UNRESOLVED_CANDIDATE_TOPOLOGY";

            }


            const allConfigurations = [
                ...fullConfigurations,
                ...subsetConfigurations
            ];


            solutions.push({

                solutionId:
                    encode([
                        "SCIENTIFIC-N-PROTOCOL-COMPOSITION-SOLUTION",
                        envelope.envelopeId
                    ]),

                envelopeId:
                    envelope.envelopeId,

                setId:
                    envelope.setId,

                objectiveId:
                    envelope.objectiveId,

                participantIds,

                fullConfigurations,

                subsetConfigurations,

                supportedFunctionalCandidateIds:
                    supportedFunctionalEdges
                        .map(
                            edge =>
                                edge.candidateId
                        )
                        .sort(),

                documentaryCandidateIds:
                    envelope.relations
                        .filter(
                            relation =>
                                relation.candidateKind ===
                                "DOCUMENTARY_COMPOSITION"
                        )
                        .map(
                            relation =>
                                relation.candidateId
                        )
                        .sort(),

                challengedCandidateIds:
                    envelope.relations
                        .filter(
                            relation =>
                                relation.compatibilityPolarity ===
                                "CHALLENGE"
                        )
                        .map(
                            relation =>
                                relation.candidateId
                        )
                        .sort(),

                inconclusiveCandidateIds:
                    envelope.relations
                        .filter(
                            relation =>
                                relation.compatibilityPolarity ===
                                "INCONCLUSIVE"
                        )
                        .map(
                            relation =>
                                relation.candidateId
                        )
                        .sort(),

                statistics: {

                    participants:
                        participantIds.length,

                    supportedFunctionalCandidates:
                        supportedFunctionalEdges.length,

                    documentaryCandidates:
                        envelope.relations.filter(
                            relation =>
                                relation.candidateKind ===
                                "DOCUMENTARY_COMPOSITION"
                        ).length,

                    challengedCandidates:
                        envelope.relations.filter(
                            relation =>
                                relation.compatibilityPolarity ===
                                "CHALLENGE"
                        ).length,

                    inconclusiveCandidates:
                        envelope.relations.filter(
                            relation =>
                                relation.compatibilityPolarity ===
                                "INCONCLUSIVE"
                        ).length,

                    fullConfigurations:
                        fullConfigurations.length,

                    subsetConfigurations:
                        subsetConfigurations.length,

                    readyConfigurations:
                        allConfigurations.filter(
                            configuration =>
                                configuration.readiness ===
                                "READY_FOR_GLOBAL_EVALUATION"
                        ).length,

                    blockedConfigurations:
                        allConfigurations.filter(
                            configuration =>
                                configuration.readiness ===
                                "BLOCKED"
                        ).length

                },

                resolutionStatus

            });

        }


        if (
            errors.length >
            0
        ) {

            return {

                solutions:
                    [],

                errors:
                    errors.sort()

            };

        }


        solutions.sort(
            (a, b) =>
                a.solutionId.localeCompare(
                    b.solutionId
                )
        );


        return {

            solutions,

            errors:
                []

        };

    }


    private buildConfiguration(
        envelope:
            ScientificCompositionEnvelope,
        participantIds:
            string[],
        supportedFunctionalEdges:
            ScientificFunctionalCandidateEvaluationGraphEdge[],
        input:
            ScientificNProtocolCompositionSolverEngineInput,
        needOwnerById:
            Map<string, string>,
        contributionOwnerById:
            Map<string, string>
    ): ScientificNProtocolCompositionConfiguration {

        const participantIdSet =
            new Set(
                participantIds
            );


        const selectedEdges =
            supportedFunctionalEdges
                .filter(
                    edge =>
                        participantIdSet.has(
                            edge.sourceParticipantId
                        ) &&
                        participantIdSet.has(
                            edge.targetParticipantId
                        )
                )
                .sort(
                    (a, b) =>
                        a.candidateId.localeCompare(
                            b.candidateId
                        )
                );


        const relations:
            ScientificNProtocolCompositionSolverRelation[] =
            selectedEdges.map(
                edge => ({

                    candidateId:
                        edge.candidateId,

                    candidateEvaluationEdgeId:
                        edge.edgeId,

                    functionalMatchId:
                        edge.functionalMatchId,

                    sourceParticipantId:
                        edge.sourceParticipantId,

                    targetParticipantId:
                        edge.targetParticipantId,

                    needId:
                        edge.needId,

                    contributionId:
                        edge.contributionId,

                    compatibilityAssessmentId:
                        edge.compatibilityAssessmentId,

                    boundaryIds:
                        sortedUnique(
                            edge.boundaryIds
                        ),

                    discoveryEvidenceIds:
                        sortedUnique(
                            edge.discoveryEvidenceIds
                        ),

                    compatibilityEvidenceIds:
                        sortedUnique(
                            edge.compatibilityEvidenceIds
                        ),

                    compatibilityPolarity:
                        "SUPPORT"

                })
            );


        const allNeedIds =
            sortedUnique(
                [...needOwnerById.entries()]
                    .filter(
                        ([
                            ,
                            owner
                        ]) =>
                            participantIdSet.has(
                                owner
                            )
                    )
                    .map(
                        ([
                            needId
                        ]) =>
                            needId
                    )
            );


        const fulfilledNeedIds =
            sortedUnique(
                relations.map(
                    relation =>
                        relation.needId
                )
            );


        const fulfilledNeedIdSet =
            new Set(
                fulfilledNeedIds
            );


        const unresolvedNeedIds =
            allNeedIds.filter(
                needId =>
                    !fulfilledNeedIdSet.has(
                        needId
                    )
            );


        const objectiveCoverage:
            ScientificNProtocolCompositionSolverObjectiveCoverage[] =
            input.objective.requiredSubjects
                .map(
                    requiredSubject => {

                        const coverage =
                            input.complementarity
                                .objectiveCoverage
                                .find(
                                    item =>
                                        item.requiredSubject ===
                                        requiredSubject
                                )!;


                        const providerParticipantIds =
                            sortedUnique(
                                coverage
                                    .providerParticipantIds
                                    .filter(
                                        participantId =>
                                            participantIdSet.has(
                                                participantId
                                            )
                                    )
                            );


                        const providerParticipantIdSet =
                            new Set(
                                providerParticipantIds
                            );


                        const contributionIds =
                            sortedUnique(
                                coverage
                                    .contributionIds
                                    .filter(
                                        contributionId => {

                                            const owner =
                                                contributionOwnerById.get(
                                                    contributionId
                                                );


                                            return (
                                                owner !==
                                                    undefined &&
                                                participantIdSet.has(
                                                    owner
                                                ) &&
                                                providerParticipantIdSet.has(
                                                    owner
                                                )
                                            );

                                        }
                                    )
                            );


                        return {

                            requiredSubject,

                            status:
                                providerParticipantIds.length >
                                    0 &&
                                contributionIds.length >
                                    0
                                    ? "COVERED"
                                    : "UNRESOLVED",

                            providerParticipantIds,

                            contributionIds

                        };

                    }
                );


        const unresolvedObjectiveSubjects =
            objectiveCoverage
                .filter(
                    coverage =>
                        coverage.status ===
                        "UNRESOLVED"
                )
                .map(
                    coverage =>
                        coverage.requiredSubject
                )
                .sort();


        const knownBoundaryIds =
            sortedUnique(
                envelope.participants
                    .filter(
                        participant =>
                            participantIdSet.has(
                                participant.participantId
                            )
                    )
                    .flatMap(
                        participant =>
                            participant.boundaries.map(
                                boundary =>
                                    boundary.boundaryId
                            )
                    )
            );


        const blockers:
            ScientificNProtocolCompositionConfiguration["blockers"] =
            [];


        if (
            unresolvedNeedIds.length >
            0
        ) {

            blockers.push(
                "UNRESOLVED_NEEDS"
            );

        }


        if (
            unresolvedObjectiveSubjects.length >
            0
        ) {

            blockers.push(
                "UNRESOLVED_OBJECTIVE_SUBJECTS"
            );

        }


        return {

            configurationId:
                encode([
                    "SCIENTIFIC-N-PROTOCOL-COMPOSITION-CONFIGURATION",
                    envelope.envelopeId,
                    ...participantIds,
                    ...relations.map(
                        relation =>
                            relation.candidateId
                    )
                ]),

            envelopeId:
                envelope.envelopeId,

            setId:
                envelope.setId,

            objectiveId:
                envelope.objectiveId,

            kind:
                sameStrings(
                    participantIds,
                    envelope.participantIds
                )
                    ? "FULL_SET"
                    : "STRICT_SUBSET",

            participantIds:
                [...participantIds]
                    .sort(),

            relations,

            selectedFunctionalCandidateIds:
                relations
                    .map(
                        relation =>
                            relation.candidateId
                    )
                    .sort(),

            fulfilledNeedIds,

            unresolvedNeedIds,

            objectiveCoverage,

            unresolvedObjectiveSubjects,

            knownBoundaryIds,

            blockers,

            readiness:
                blockers.length ===
                    0
                    ? "READY_FOR_GLOBAL_EVALUATION"
                    : "BLOCKED",

            globalEvaluationStatus:
                "UNEVALUATED"

        };

    }

}