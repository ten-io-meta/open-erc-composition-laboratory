import type {
    ScientificCompositionCandidateGraphResult
} from "../scientific-composition-candidate-graph/ScientificCompositionCandidateGraph.js";

import type {
    ScientificNProtocolCompositionSet,
    ScientificNProtocolCompositionSetParticipant,
    ScientificNProtocolCompositionSetRelation,
    ScientificNProtocolCompositionSetResult
} from "./ScientificNProtocolCompositionSet.js";


export interface ScientificNProtocolCompositionSetEngineInput {

    candidateGraph:
        ScientificCompositionCandidateGraphResult;

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


export class ScientificNProtocolCompositionSetEngine {

    build(
        input:
            ScientificNProtocolCompositionSetEngineInput
    ): ScientificNProtocolCompositionSetResult {

        const errors:
            string[] = [];


        if (
            input.candidateGraph.errors.length >
            0
        ) {

            errors.push(
                "Cannot build N-protocol composition sets from a candidate graph containing errors."
            );

        }


        const graph =
            input.candidateGraph.graph;


        if (
            graph ===
            null
        ) {

            errors.push(
                "Cannot build N-protocol composition sets from a null candidate graph."
            );

        }


        if (
            errors.length >
            0 ||
            graph ===
            null
        ) {

            return {

                candidateGraphId:
                    graph?.graphId ?? null,

                objectiveId:
                    graph?.objectiveId ?? null,

                sets:
                    [],

                isolatedParticipantIds:
                    [],

                statistics: {

                    candidateGraphParticipants:
                        graph?.nodes.length ?? 0,

                    candidateGraphRelations:
                        graph?.edges.length ?? 0,

                    compositionSets:
                        0,

                    participantsInCompositionSets:
                        0,

                    isolatedParticipants:
                        0,

                    largestCompositionSet:
                        0

                },

                errors:
                    errors.sort()

            };

        }


        const participantsById =
            new Map<
                string,
                ScientificNProtocolCompositionSetParticipant
            >();


        for (
            const node
            of graph.nodes
        ) {

            if (
                participantsById.has(
                    node.participantId
                )
            ) {

                errors.push(
                    `Duplicate candidate graph participant ${node.participantId}.`
                );

                continue;

            }


            if (
                !/^ERC-[1-9][0-9]*$/.test(
                    node.participantId
                )
            ) {

                errors.push(
                    `Unsupported candidate graph participant identity ${node.participantId}.`
                );

            }


            participantsById.set(
                node.participantId,
                {

                    participantId:
                        node.participantId,

                    profileId:
                        node.profileId,

                    sourceId:
                        node.sourceId,

                    ...(
                        node.sourceRevision !==
                            undefined
                            ? {
                                sourceRevision:
                                    node.sourceRevision
                            }
                            : {}
                    )

                }
            );

        }


        const edgeIds =
            new Set<string>();

        const candidateIds =
            new Set<string>();

        const relations:
            ScientificNProtocolCompositionSetRelation[] =
            [];


        for (
            const edge
            of graph.edges
        ) {

            if (
                edgeIds.has(
                    edge.edgeId
                )
            ) {

                errors.push(
                    `Duplicate candidate graph edge ${edge.edgeId}.`
                );

            }


            edgeIds.add(
                edge.edgeId
            );


            if (
                candidateIds.has(
                    edge.candidateId
                )
            ) {

                errors.push(
                    `Duplicate candidate identity ${edge.candidateId}.`
                );

            }


            candidateIds.add(
                edge.candidateId
            );


            if (
                !participantsById.has(
                    edge.sourceParticipantId
                )
            ) {

                errors.push(
                    `Candidate ${edge.candidateId} references unknown source participant ${edge.sourceParticipantId}.`
                );

            }


            if (
                !participantsById.has(
                    edge.targetParticipantId
                )
            ) {

                errors.push(
                    `Candidate ${edge.candidateId} references unknown target participant ${edge.targetParticipantId}.`
                );

            }


            if (
                edge.sourceParticipantId ===
                edge.targetParticipantId
            ) {

                errors.push(
                    `Candidate ${edge.candidateId} is not cross-protocol.`
                );

            }


            if (
                edge.evaluationStatus !==
                "UNEVALUATED"
            ) {

                errors.push(
                    `Candidate graph edge ${edge.edgeId} has unexpected evaluation status.`
                );

            }


            relations.push({

                relationId:
                    encode([
                        "SCIENTIFIC-N-PROTOCOL-COMPOSITION-SET-RELATION",
                        edge.candidateId
                    ]),

                candidateGraphEdgeId:
                    edge.edgeId,

                candidateId:
                    edge.candidateId,

                kind:
                    edge.kind,

                sourceParticipantId:
                    edge.sourceParticipantId,

                targetParticipantId:
                    edge.targetParticipantId,

                evidenceIds:
                    sortedUnique(
                        edge.evidenceIds
                    ),

                evaluationStatus:
                    "UNEVALUATED"

            });

        }


        if (
            errors.length >
            0
        ) {

            return {

                candidateGraphId:
                    graph.graphId,

                objectiveId:
                    graph.objectiveId,

                sets:
                    [],

                isolatedParticipantIds:
                    [],

                statistics: {

                    candidateGraphParticipants:
                        graph.nodes.length,

                    candidateGraphRelations:
                        graph.edges.length,

                    compositionSets:
                        0,

                    participantsInCompositionSets:
                        0,

                    isolatedParticipants:
                        0,

                    largestCompositionSet:
                        0

                },

                errors:
                    errors.sort()

            };

        }


        /*
         * Candidate direction is scientifically preserved in
         * relations, but connected-component membership is
         * intentionally undirected:
         *
         * A -> B and B -> A both mean A and B belong to the same
         * candidate topology.
         */
        const adjacency =
            new Map<
                string,
                Set<string>
            >();


        for (
            const participantId
            of participantsById.keys()
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

            adjacency
                .get(
                    relation.sourceParticipantId
                )!
                .add(
                    relation.targetParticipantId
                );


            adjacency
                .get(
                    relation.targetParticipantId
                )!
                .add(
                    relation.sourceParticipantId
                );

        }


        const visited =
            new Set<string>();

        const sets:
            ScientificNProtocolCompositionSet[] =
            [];

        const isolatedParticipantIds:
            string[] =
            [];


        for (
            const startParticipantId
            of [...participantsById.keys()].sort()
        ) {

            if (
                visited.has(
                    startParticipantId
                )
            ) {

                continue;

            }


            const queue:
                string[] = [
                    startParticipantId
                ];

            const componentParticipantIds:
                string[] =
                [];


            while (
                queue.length >
                0
            ) {

                const participantId =
                    queue.shift()!;


                if (
                    visited.has(
                        participantId
                    )
                ) {

                    continue;

                }


                visited.add(
                    participantId
                );


                componentParticipantIds.push(
                    participantId
                );


                const neighbors =
                    [
                        ...(
                            adjacency.get(
                                participantId
                            ) ??
                            []
                        )
                    ].sort();


                for (
                    const neighbor
                    of neighbors
                ) {

                    if (
                        !visited.has(
                            neighbor
                        )
                    ) {

                        queue.push(
                            neighbor
                        );

                    }

                }

            }


            componentParticipantIds.sort();


            if (
                componentParticipantIds.length ===
                1
            ) {

                isolatedParticipantIds.push(
                    componentParticipantIds[0]
                );

                continue;

            }


            const componentParticipantIdSet =
                new Set(
                    componentParticipantIds
                );


            const componentRelations =
                relations
                    .filter(
                        relation =>
                            componentParticipantIdSet.has(
                                relation.sourceParticipantId
                            ) &&
                            componentParticipantIdSet.has(
                                relation.targetParticipantId
                            )
                    )
                    .sort(
                        (a, b) =>
                            a.candidateId.localeCompare(
                                b.candidateId
                            )
                    );


            if (
                componentRelations.length ===
                0
            ) {

                errors.push(
                    `Connected component ${componentParticipantIds.join(",")} contains no candidate relation.`
                );

                continue;

            }


            const participants =
                componentParticipantIds
                    .map(
                        participantId =>
                            participantsById.get(
                                participantId
                            )!
                    );


            const componentCandidateIds =
                componentRelations
                    .map(
                        relation =>
                            relation.candidateId
                    )
                    .sort();


            sets.push({

                setId:
                    encode([
                        "SCIENTIFIC-N-PROTOCOL-COMPOSITION-SET",
                        graph.objectiveId,
                        ...componentParticipantIds,
                        ...componentCandidateIds
                    ]),

                candidateGraphId:
                    graph.graphId,

                objectiveId:
                    graph.objectiveId,

                participants,

                participantIds:
                    [...componentParticipantIds],

                relations:
                    componentRelations,

                candidateIds:
                    componentCandidateIds,

                status:
                    "DISCOVERED"

            });

        }


        if (
            errors.length >
            0
        ) {

            return {

                candidateGraphId:
                    graph.graphId,

                objectiveId:
                    graph.objectiveId,

                sets:
                    [],

                isolatedParticipantIds:
                    [],

                statistics: {

                    candidateGraphParticipants:
                        graph.nodes.length,

                    candidateGraphRelations:
                        graph.edges.length,

                    compositionSets:
                        0,

                    participantsInCompositionSets:
                        0,

                    isolatedParticipants:
                        0,

                    largestCompositionSet:
                        0

                },

                errors:
                    errors.sort()

            };

        }


        sets.sort(
            (a, b) =>
                a.setId.localeCompare(
                    b.setId
                )
        );


        isolatedParticipantIds.sort();


        const participantsInCompositionSets =
            sets.reduce(
                (
                    total,
                    set
                ) =>
                    total +
                    set.participants.length,
                0
            );


        const largestCompositionSet =
            sets.reduce(
                (
                    largest,
                    set
                ) =>
                    Math.max(
                        largest,
                        set.participants.length
                    ),
                0
            );


        return {

            candidateGraphId:
                graph.graphId,

            objectiveId:
                graph.objectiveId,

            sets,

            isolatedParticipantIds,

            statistics: {

                candidateGraphParticipants:
                    graph.nodes.length,

                candidateGraphRelations:
                    graph.edges.length,

                compositionSets:
                    sets.length,

                participantsInCompositionSets,

                isolatedParticipants:
                    isolatedParticipantIds.length,

                largestCompositionSet

            },

            errors:
                []

        };

    }

}