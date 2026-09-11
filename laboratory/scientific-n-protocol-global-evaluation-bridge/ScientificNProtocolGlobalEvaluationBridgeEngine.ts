import type {
    ScientificCompositionEnvelopeResult
} from "../scientific-composition-envelope/ScientificCompositionEnvelope.js";

import type {
    ScientificCompositionGraph,
    ScientificCompositionGraphEdge,
    ScientificCompositionGraphNode
} from "../scientific-composition-graph/ScientificCompositionGraph.js";

import type {
    ScientificNProtocolCompositionConfiguration,
    ScientificNProtocolCompositionSolverResult
} from "../scientific-n-protocol-composition-solver/ScientificNProtocolCompositionSolver.js";

import type {
    ScientificNProtocolGlobalEvaluationBridgeResult,
    ScientificNProtocolGlobalEvaluationTarget
} from "./ScientificNProtocolGlobalEvaluationBridge.js";


export interface ScientificNProtocolGlobalEvaluationBridgeEngineInput {

    solver:
        ScientificNProtocolCompositionSolverResult;

    envelopes:
        ScientificCompositionEnvelopeResult;

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


export class ScientificNProtocolGlobalEvaluationBridgeEngine {

    build(
        input:
            ScientificNProtocolGlobalEvaluationBridgeEngineInput
    ): ScientificNProtocolGlobalEvaluationBridgeResult {

        const errors:
            string[] = [];


        if (
            input.solver.errors.length >
            0
        ) {

            errors.push(
                "Cannot build global evaluation targets from a solver result containing errors."
            );

        }


        if (
            input.envelopes.errors.length >
            0
        ) {

            errors.push(
                "Cannot build global evaluation targets from envelopes containing errors."
            );

        }


        const envelopesById =
            new Map(
                input.envelopes.envelopes.map(
                    envelope => [
                        envelope.envelopeId,
                        envelope
                    ] as const
                )
            );


        if (
            envelopesById.size !==
            input.envelopes.envelopes.length
        ) {

            errors.push(
                "Duplicate composition envelope identity."
            );

        }


        const solutionEnvelopeIds =
            input.solver.solutions.map(
                solution =>
                    solution.envelopeId
            );


        if (
            sortedUnique(
                solutionEnvelopeIds
            ).length !==
            solutionEnvelopeIds.length
        ) {

            errors.push(
                "Multiple solver solutions reference the same envelope."
            );

        }


        if (
            errors.length >
            0
        ) {

            return {

                targets:
                    [],

                blockedConfigurationIds:
                    [],

                errors:
                    errors.sort()

            };

        }


        const targets:
            ScientificNProtocolGlobalEvaluationTarget[] =
            [];

        const blockedConfigurationIds:
            string[] = [];

        const configurationIds =
            new Set<string>();

        const graphIds =
            new Set<string>();


        for (
            const solution
            of [...input.solver.solutions].sort(
                (a, b) =>
                    a.solutionId.localeCompare(
                        b.solutionId
                    )
            )
        ) {

            const envelope =
                envelopesById.get(
                    solution.envelopeId
                );


            if (
                envelope ===
                undefined
            ) {

                errors.push(
                    `Solver solution ${solution.solutionId} references unknown envelope ${solution.envelopeId}.`
                );

                continue;

            }


            if (
                solution.setId !==
                    envelope.setId ||
                solution.objectiveId !==
                    envelope.objectiveId ||
                !sameStrings(
                    solution.participantIds,
                    envelope.participantIds
                )
            ) {

                errors.push(
                    `Solver solution ${solution.solutionId} disagrees with envelope ${envelope.envelopeId}.`
                );

                continue;

            }


            const participantsById =
                new Map(
                    envelope.participants.map(
                        participant => [
                            participant.participantId,
                            participant
                        ] as const
                    )
                );


            if (
                participantsById.size !==
                envelope.participants.length
            ) {

                errors.push(
                    `Envelope ${envelope.envelopeId} contains duplicate participant identities.`
                );

                continue;

            }


            const allConfigurations = [
                ...solution.fullConfigurations,
                ...solution.subsetConfigurations
            ];


            for (
                const configuration
                of [...allConfigurations].sort(
                    (a, b) =>
                        a.configurationId.localeCompare(
                            b.configurationId
                        )
                )
            ) {

                if (
                    configurationIds.has(
                        configuration.configurationId
                    )
                ) {

                    errors.push(
                        `Duplicate solver configuration ${configuration.configurationId}.`
                    );

                    continue;

                }


                configurationIds.add(
                    configuration.configurationId
                );


                if (
                    configuration.readiness !==
                    "READY_FOR_GLOBAL_EVALUATION"
                ) {

                    blockedConfigurationIds.push(
                        configuration.configurationId
                    );

                    continue;

                }


                const configurationErrors =
                    this.validateReadyConfiguration(
                        configuration,
                        envelope,
                        participantsById
                    );


                if (
                    configurationErrors.length >
                    0
                ) {

                    errors.push(
                        ...configurationErrors
                    );

                    continue;

                }


                const graph =
                    this.buildGraph(
                        configuration,
                        participantsById
                    );


                if (
                    graphIds.has(
                        graph.graphId
                    )
                ) {

                    errors.push(
                        `Duplicate global evaluation graph ${graph.graphId}.`
                    );

                    continue;

                }


                graphIds.add(
                    graph.graphId
                );


                targets.push({

                    targetId:
                        encode([
                            "SCIENTIFIC-N-PROTOCOL-GLOBAL-EVALUATION-TARGET",
                            configuration.configurationId,
                            graph.graphId
                        ]),

                    configurationId:
                        configuration.configurationId,

                    envelopeId:
                        configuration.envelopeId,

                    setId:
                        configuration.setId,

                    objectiveId:
                        configuration.objectiveId,

                    graph,

                    status:
                        "READY_FOR_GLOBAL_EVALUATION"

                });

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                targets:
                    [],

                blockedConfigurationIds:
                    sortedUnique(
                        blockedConfigurationIds
                    ),

                errors:
                    errors.sort()

            };

        }


        targets.sort(
            (a, b) =>
                a.targetId.localeCompare(
                    b.targetId
                )
        );


        return {

            targets,

            blockedConfigurationIds:
                sortedUnique(
                    blockedConfigurationIds
                ),

            errors:
                []

        };

    }


    private validateReadyConfiguration(
        configuration:
            ScientificNProtocolCompositionConfiguration,
        envelope:
            ScientificCompositionEnvelopeResult["envelopes"][number],
        participantsById:
            Map<
                string,
                ScientificCompositionEnvelopeResult["envelopes"][number]["participants"][number]
            >
    ): string[] {

        const errors:
            string[] = [];


        if (
            configuration.envelopeId !==
                envelope.envelopeId ||
            configuration.setId !==
                envelope.setId ||
            configuration.objectiveId !==
                envelope.objectiveId
        ) {

            errors.push(
                `Configuration ${configuration.configurationId} disagrees with its envelope provenance.`
            );

        }


        if (
            configuration.globalEvaluationStatus !==
            "UNEVALUATED"
        ) {

            errors.push(
                `Configuration ${configuration.configurationId} is already globally evaluated.`
            );

        }


        const participantIds =
            sortedUnique(
                configuration.participantIds
            );


        if (
            participantIds.length !==
                configuration.participantIds.length ||
            participantIds.length <
                2
        ) {

            errors.push(
                `Configuration ${configuration.configurationId} has an invalid participant set.`
            );

        }


        for (
            const participantId
            of participantIds
        ) {

            if (
                !participantsById.has(
                    participantId
                )
            ) {

                errors.push(
                    `Configuration ${configuration.configurationId} references participant ${participantId} outside its envelope.`
                );

            }

        }


        if (
            configuration.kind ===
                "FULL_SET" &&
            !sameStrings(
                participantIds,
                envelope.participantIds
            )
        ) {

            errors.push(
                `FULL_SET configuration ${configuration.configurationId} does not contain the complete envelope participant set.`
            );

        }


        if (
            configuration.kind ===
                "STRICT_SUBSET" &&
            sameStrings(
                participantIds,
                envelope.participantIds
            )
        ) {

            errors.push(
                `STRICT_SUBSET configuration ${configuration.configurationId} equals the full envelope participant set.`
            );

        }


        if (
            configuration.blockers.length >
                0 ||
            configuration.unresolvedNeedIds.length >
                0 ||
            configuration.unresolvedObjectiveSubjects.length >
                0
        ) {

            errors.push(
                `Ready configuration ${configuration.configurationId} still contains unresolved prerequisites.`
            );

        }


        if (
            configuration.objectiveCoverage.some(
                coverage =>
                    coverage.status !==
                    "COVERED"
            )
        ) {

            errors.push(
                `Ready configuration ${configuration.configurationId} contains unresolved objective coverage.`
            );

        }


        if (
            configuration.relations.length ===
            0
        ) {

            errors.push(
                `Ready configuration ${configuration.configurationId} contains no functional relations.`
            );

        }


        const selectedCandidateIds =
            configuration.relations.map(
                relation =>
                    relation.candidateId
            );


        if (
            sortedUnique(
                selectedCandidateIds
            ).length !==
            selectedCandidateIds.length
        ) {

            errors.push(
                `Configuration ${configuration.configurationId} contains duplicate functional candidates.`
            );

        }


        if (
            !sameStrings(
                selectedCandidateIds,
                configuration.selectedFunctionalCandidateIds
            )
        ) {

            errors.push(
                `Configuration ${configuration.configurationId} selected candidate identities disagree with its relations.`
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


        const knownBoundaryIds =
            sortedUnique(
                participantIds.flatMap(
                    participantId => {

                        const participant =
                            participantsById.get(
                                participantId
                            );


                        return participant ===
                            undefined
                            ? []
                            : participant.boundaries.map(
                                boundary =>
                                    boundary.boundaryId
                            );

                    }
                )
            );


        if (
            !sameStrings(
                knownBoundaryIds,
                configuration.knownBoundaryIds
            )
        ) {

            errors.push(
                `Configuration ${configuration.configurationId} known boundaries do not match its participant profiles.`
            );

        }


        for (
            const participantId
            of participantIds
        ) {

            const participant =
                participantsById.get(
                    participantId
                );


            if (
                participant ===
                undefined
            ) {

                continue;

            }


            for (
                const need
                of participant.needs
            ) {

                if (
                    needOwnerById.has(
                        need.needId
                    )
                ) {

                    errors.push(
                        `Duplicate need identity ${need.needId} in configuration ${configuration.configurationId}.`
                    );

                    continue;

                }


                needOwnerById.set(
                    need.needId,
                    participantId
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

                    errors.push(
                        `Duplicate contribution identity ${contribution.contributionId} in configuration ${configuration.configurationId}.`
                    );

                    continue;

                }


                contributionOwnerById.set(
                    contribution.contributionId,
                    participantId
                );

            }

        }


        const knownBoundaryIdSet =
            new Set(
                knownBoundaryIds
            );


        for (
            const relation
            of configuration.relations
        ) {

            if (
                relation.compatibilityPolarity !==
                "SUPPORT"
            ) {

                errors.push(
                    `Configuration ${configuration.configurationId} contains non-supporting functional candidate ${relation.candidateId}.`
                );

            }


            if (
                !participantIdSet.has(
                    relation.sourceParticipantId
                ) ||
                !participantIdSet.has(
                    relation.targetParticipantId
                )
            ) {

                errors.push(
                    `Configuration relation ${relation.candidateId} references a participant outside the configuration.`
                );

            }


            if (
                relation.sourceParticipantId ===
                relation.targetParticipantId
            ) {

                errors.push(
                    `Configuration relation ${relation.candidateId} is a self relation.`
                );

            }


            if (
                needOwnerById.get(
                    relation.needId
                ) !==
                relation.sourceParticipantId
            ) {

                errors.push(
                    `Configuration relation ${relation.candidateId} does not preserve exact need ownership.`
                );

            }


            if (
                contributionOwnerById.get(
                    relation.contributionId
                ) !==
                relation.targetParticipantId
            ) {

                errors.push(
                    `Configuration relation ${relation.candidateId} does not preserve exact contribution ownership.`
                );

            }


            for (
                const boundaryId
                of relation.boundaryIds
            ) {

                if (
                    !knownBoundaryIdSet.has(
                        boundaryId
                    )
                ) {

                    errors.push(
                        `Configuration relation ${relation.candidateId} references unknown boundary ${boundaryId}.`
                    );

                }

            }

        }


        const relationNeedIds =
            sortedUnique(
                configuration.relations.map(
                    relation =>
                        relation.needId
                )
            );


        if (
            !sameStrings(
                relationNeedIds,
                configuration.fulfilledNeedIds
            )
        ) {

            errors.push(
                `Configuration ${configuration.configurationId} fulfilled needs disagree with its functional relations.`
            );

        }


        if (
            !sameStrings(
                [...needOwnerById.keys()],
                configuration.fulfilledNeedIds
            )
        ) {

            errors.push(
                `Ready configuration ${configuration.configurationId} does not fulfill every participant need.`
            );

        }


        if (
            !this.isConnected(
                participantIds,
                configuration.relations.map(
                    relation => ({
                        source:
                            relation.sourceParticipantId,

                        target:
                            relation.targetParticipantId
                    })
                )
            )
        ) {

            errors.push(
                `Ready configuration ${configuration.configurationId} is not connected by its selected functional relations.`
            );

        }


        return errors;

    }


    private buildGraph(
        configuration:
            ScientificNProtocolCompositionConfiguration,
        participantsById:
            Map<
                string,
                ScientificCompositionEnvelopeResult["envelopes"][number]["participants"][number]
            >
    ): ScientificCompositionGraph {

        const nodes:
            ScientificCompositionGraphNode[] =
            [...configuration.participantIds]
                .sort()
                .map(
                    participantId => {

                        const participant =
                            participantsById.get(
                                participantId
                            )!;


                        return {

                            participantId,

                            profileId:
                                participant.profileId,

                            sourceId:
                                participant.sourceId,

                            ...(
                                participant.sourceRevision !==
                                    undefined
                                    ? {
                                        sourceRevision:
                                            participant.sourceRevision
                                    }
                                    : {}
                            ),

                            contributionIds:
                                participant.contributions
                                    .map(
                                        contribution =>
                                            contribution.contributionId
                                    )
                                    .sort(),

                            boundaryIds:
                                participant.boundaries
                                    .map(
                                        boundary =>
                                            boundary.boundaryId
                                    )
                                    .sort(),

                            needIds:
                                participant.needs
                                    .map(
                                        need =>
                                            need.needId
                                    )
                                    .sort()

                        };

                    }
                );


        const edges:
            ScientificCompositionGraphEdge[] =
            [...configuration.relations]
                .sort(
                    (a, b) =>
                        a.candidateId.localeCompare(
                            b.candidateId
                        )
                )
                .map(
                    relation => ({

                        edgeId:
                            encode([
                                "SCIENTIFIC-N-PROTOCOL-CONFIGURATION-EDGE",
                                configuration.configurationId,
                                relation.candidateId
                            ]),

                        matchId:
                            relation.functionalMatchId,

                        consumerParticipantId:
                            relation.sourceParticipantId,

                        providerParticipantId:
                            relation.targetParticipantId,

                        needId:
                            relation.needId,

                        contributionId:
                            relation.contributionId,

                        compatibilityAssessmentId:
                            relation.compatibilityAssessmentId,

                        compatibilityPolarity:
                            "SUPPORT",

                        boundaryIds:
                            sortedUnique(
                                relation.boundaryIds
                            ),

                        evidenceIds:
                            sortedUnique([
                                ...relation.discoveryEvidenceIds,
                                ...relation.compatibilityEvidenceIds
                            ])

                    })
                );


        const objectiveCoverage =
            [...configuration.objectiveCoverage]
                .sort(
                    (a, b) =>
                        a.requiredSubject.localeCompare(
                            b.requiredSubject
                        )
                )
                .map(
                    coverage => ({

                        requiredSubject:
                            coverage.requiredSubject,

                        status:
                            coverage.status,

                        providerParticipantIds:
                            sortedUnique(
                                coverage.providerParticipantIds
                            ),

                        contributionIds:
                            sortedUnique(
                                coverage.contributionIds
                            )

                    })
                );


        return {

            graphId:
                encode([
                    "SCIENTIFIC-N-PROTOCOL-CONFIGURATION-GRAPH",
                    configuration.configurationId
                ]),

            objectiveId:
                configuration.objectiveId,

            nodes,

            edges,

            unresolvedNeedIds:
                [...configuration.unresolvedNeedIds]
                    .sort(),

            objectiveCoverage,

            statistics: {

                nodes:
                    nodes.length,

                edges:
                    edges.length,

                supportedEdges:
                    edges.length,

                challengedEdges:
                    0,

                inconclusiveEdges:
                    0,

                unresolvedNeeds:
                    configuration.unresolvedNeedIds.length,

                unresolvedObjectiveSubjects:
                    configuration.unresolvedObjectiveSubjects.length

            },

            /*
             * Candidate-level SUPPORT does not establish simultaneous
             * N-protocol boundary preservation.
             *
             * Only ScientificCompositionGlobalEvaluationEngine may
             * promote this graph after same-run global evidence.
             */
            scientificPolarity:
                "INCONCLUSIVE"

        };

    }


    private isConnected(
        participantIds:
            string[],
        relations:
            {
                source:
                    string;

                target:
                    string;
            }[]
    ): boolean {

        if (
            participantIds.length <
            2
        ) {

            return false;

        }


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
            const relation
            of relations
        ) {

            adjacency.get(
                relation.source
            )?.add(
                relation.target
            );

            adjacency.get(
                relation.target
            )?.add(
                relation.source
            );

        }


        const visited =
            new Set<string>();

        const queue =
            [
                participantIds[0]
            ];


        visited.add(
            participantIds[0]
        );


        while (
            queue.length >
            0
        ) {

            const current =
                queue.shift()!;


            for (
                const neighbor
                of adjacency.get(
                    current
                ) ?? []
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


        return visited.size ===
            participantIds.length;

    }

}