import type {
    ScientificProtocolAttributedExternalCall
} from "../scientific-protocol-identity/ScientificProtocolAttributedExternalCall.js";

import type {
    ScientificStructuralProtocolRelationEvidence
} from "../scientific-protocol-relation-evidence/ScientificStructuralProtocolRelationEvidence.js";

import type {
    ScientificSolidityInheritanceEdge
} from "../scientific-solidity-inheritance/ScientificSolidityInheritanceEdge.js";

import type {
    ScientificSolidityInheritanceGraphResult
} from "../scientific-solidity-inheritance/ScientificSolidityInheritanceGraphResult.js";

import type {
    ScientificProtocolBehaviorReachability
} from "./ScientificProtocolBehaviorReachability.js";

import type {
    ScientificProtocolBehaviorReachabilityResult
} from "./ScientificProtocolBehaviorReachabilityResult.js";


export interface ScientificProtocolBehaviorReachabilityInput {

    inheritanceGraph:
        ScientificSolidityInheritanceGraphResult;

    structuralRelations:
        ScientificStructuralProtocolRelationEvidence[];

    protocolAttributedExternalCalls:
        ScientificProtocolAttributedExternalCall[];

}


export class ScientificProtocolBehaviorReachabilityEngine {

    evaluate(
        input:
            ScientificProtocolBehaviorReachabilityInput
    ): ScientificProtocolBehaviorReachabilityResult {

        const errors =
            this.boundaryErrors(
                input
            );


        if (
            errors.length >
            0
        ) {

            return {

                reachableBehaviors:
                    [],

                unresolvedProtocolCallAttributionIds:
                    input.protocolAttributedExternalCalls
                        .map(
                            call =>
                                call.protocolCallAttributionId
                        )
                        .sort(),

                errors

            };

        }


        const reachableBehaviors:
            ScientificProtocolBehaviorReachability[] =
            [];

        const unresolvedProtocolCallAttributionIds =
            new Set<string>();


        const calls =
            [
                ...input.protocolAttributedExternalCalls
            ].sort(
                (
                    left,
                    right
                ) =>
                    left.protocolCallAttributionId.localeCompare(
                        right.protocolCallAttributionId
                    )
            );


        const relations =
            [
                ...input.structuralRelations
            ].filter(
                relation =>
                    relation.relation ===
                        "DEPENDS_ON"
            )
            .sort(
                (
                    left,
                    right
                ) =>
                    left.relationEvidenceId.localeCompare(
                        right.relationEvidenceId
                    )
            );


        for (
            const call
            of calls
        ) {

            const targetContainers =
                input.inheritanceGraph.containers
                    .filter(
                        container =>
                            container.observationId ===
                                call.observationId &&
                            container.containerSymbol ===
                                call.containerSymbol
                    );


            if (
                targetContainers.length !==
                    1
            ) {

                unresolvedProtocolCallAttributionIds.add(
                    call.protocolCallAttributionId
                );

                continue;

            }


            const targetContainer =
                targetContainers[0];

            let emitted =
                false;


            for (
                const relation
                of relations
            ) {

                if (
                    relation.objectProtocolId !==
                        call.protocolId ||
                    relation.subjectProtocolId ===
                        call.protocolId
                ) {

                    continue;

                }


                const startContainers =
                    input.inheritanceGraph.containers
                        .filter(
                            container =>
                                container.declarationFactId ===
                                    relation.factId &&
                                container.observationId ===
                                    relation.observationId &&
                                container.containerSymbol ===
                                    relation.subjectContainerSymbol
                        );


                if (
                    startContainers.length !==
                        1
                ) {

                    continue;

                }


                const startContainer =
                    startContainers[0];


                const path =
                    this.findPath(
                        input.inheritanceGraph.edges,
                        startContainer.declarationFactId,
                        targetContainer.declarationFactId
                    );


                if (
                    !path ||
                    path.length ===
                        0
                ) {

                    continue;

                }


                /*
                 * A protocol-family dependency alone is insufficient
                 * to attach arbitrary behavior from that family.
                 *
                 * The exact inherited symbol that established the
                 * dependency must also be the first concrete edge of
                 * the inheritance path used for this reachability
                 * claim.
                 */
                if (
                    path[0].inheritedSymbol !==
                        relation.inheritedSymbol
                ) {

                    continue;

                }


                const inheritanceEdgeIds =
                    path.map(
                        edge =>
                            edge.inheritanceEdgeId
                    );

                const containerPath =
                    [
                        startContainer.containerSymbol,
                        ...path.map(
                            edge =>
                                edge.objectContainerSymbol
                        )
                    ];


                reachableBehaviors.push({

                    behaviorReachabilityId:
                        this.behaviorReachabilityId(
                            relation.subjectProtocolId,
                            call.protocolId,
                            startContainer.declarationFactId,
                            targetContainer.declarationFactId,
                            call.protocolCallAttributionId,
                            inheritanceEdgeIds,
                            relation.relationEvidenceId
                        ),

                    participantProtocolId:
                        relation.subjectProtocolId,

                    originProtocolId:
                        call.protocolId,

                    participantDeclarationFactId:
                        startContainer.declarationFactId,

                    participantObservationId:
                        startContainer.observationId,

                    participantContainerSymbol:
                        startContainer.containerSymbol,

                    originDeclarationFactId:
                        targetContainer.declarationFactId,

                    originObservationId:
                        targetContainer.observationId,

                    originContainerSymbol:
                        targetContainer.containerSymbol,

                    protocolCallAttributionId:
                        call.protocolCallAttributionId,

                    sourceCallFactId:
                        call.sourceFactId,

                    externalCall: {
                        ...call.externalCall
                    },

                    protocolRelationEvidenceIds: [
                        relation.relationEvidenceId
                    ],

                    inheritanceEdgeIds,

                    containerPath,

                    evidenceBasis:
                        "EXACT_SOLIDITY_INHERITANCE_PATH_WITH_PROTOCOL_DEPENDENCY"

                });


                emitted =
                    true;

            }


            if (
                !emitted
            ) {

                unresolvedProtocolCallAttributionIds.add(
                    call.protocolCallAttributionId
                );

            }

        }


        reachableBehaviors.sort(
            (
                left,
                right
            ) =>
                left.behaviorReachabilityId.localeCompare(
                    right.behaviorReachabilityId
                )
        );


        return {

            reachableBehaviors,

            unresolvedProtocolCallAttributionIds:
                [
                    ...unresolvedProtocolCallAttributionIds
                ].sort(),

            errors:
                []

        };

    }


    private boundaryErrors(
        input:
            ScientificProtocolBehaviorReachabilityInput
    ): string[] {

        const errors:
            string[] =
            [
                ...input.inheritanceGraph.errors
            ];


        const containerIds =
            new Set<string>();


        for (
            const container
            of input.inheritanceGraph.containers
        ) {

            if (
                container.containerOccurrenceId.trim().length ===
                    0
            ) {

                errors.push(
                    "Behavior reachability received an empty inheritance container identity."
                );

                continue;

            }


            if (
                containerIds.has(
                    container.containerOccurrenceId
                )
            ) {

                errors.push(
                    `Duplicate inheritance container identity ${container.containerOccurrenceId}.`
                );

            }

            containerIds.add(
                container.containerOccurrenceId
            );

        }


        const edgeIds =
            new Set<string>();


        for (
            const edge
            of input.inheritanceGraph.edges
        ) {

            if (
                edge.inheritanceEdgeId.trim().length ===
                    0
            ) {

                errors.push(
                    "Behavior reachability received an empty inheritance edge identity."
                );

                continue;

            }


            if (
                edgeIds.has(
                    edge.inheritanceEdgeId
                )
            ) {

                errors.push(
                    `Duplicate inheritance edge identity ${edge.inheritanceEdgeId}.`
                );

            }

            edgeIds.add(
                edge.inheritanceEdgeId
            );

        }


        const relationIds =
            new Set<string>();


        for (
            const relation
            of input.structuralRelations
        ) {

            if (
                relation.relationEvidenceId.trim().length ===
                    0
            ) {

                errors.push(
                    "Behavior reachability received an empty structural relation identity."
                );

                continue;

            }


            if (
                relationIds.has(
                    relation.relationEvidenceId
                )
            ) {

                errors.push(
                    `Duplicate structural relation identity ${relation.relationEvidenceId}.`
                );

            }

            relationIds.add(
                relation.relationEvidenceId
            );


            if (
                relation.relation !==
                    "DEPENDS_ON"
            ) {

                errors.push(
                    `Behavior reachability received unsupported relation ${relation.relation}.`
                );

            }


            if (
                !/^ERC-[1-9][0-9]*$/.test(
                    relation.subjectProtocolId
                ) ||
                !/^ERC-[1-9][0-9]*$/.test(
                    relation.objectProtocolId
                )
            ) {

                errors.push(
                    `Structural relation ${relation.relationEvidenceId} contains an unsupported protocol identity.`
                );

            }


            const subjectMatches =
                input.inheritanceGraph.containers
                    .filter(
                        container =>
                            container.declarationFactId ===
                                relation.factId &&
                            container.observationId ===
                                relation.observationId &&
                            container.containerSymbol ===
                                relation.subjectContainerSymbol
                    );


            if (
                subjectMatches.length !==
                    1
            ) {

                errors.push(
                    `Structural relation ${relation.relationEvidenceId} does not resolve to exactly one participant declaration container.`
                );

            }

        }


        const callIds =
            new Set<string>();


        for (
            const call
            of input.protocolAttributedExternalCalls
        ) {

            if (
                call.protocolCallAttributionId.trim().length ===
                    0
            ) {

                errors.push(
                    "Behavior reachability received an empty protocol call attribution identity."
                );

                continue;

            }


            if (
                callIds.has(
                    call.protocolCallAttributionId
                )
            ) {

                errors.push(
                    `Duplicate protocol call attribution identity ${call.protocolCallAttributionId}.`
                );

            }

            callIds.add(
                call.protocolCallAttributionId
            );


            if (
                !/^ERC-[1-9][0-9]*$/.test(
                    call.protocolId
                )
            ) {

                errors.push(
                    `Protocol call attribution ${call.protocolCallAttributionId} contains an unsupported origin protocol identity ${call.protocolId}.`
                );

            }


            const targetMatches =
                input.inheritanceGraph.containers
                    .filter(
                        container =>
                            container.observationId ===
                                call.observationId &&
                            container.containerSymbol ===
                                call.containerSymbol
                    );


            if (
                targetMatches.length >
                    1
            ) {

                errors.push(
                    `Protocol call attribution ${call.protocolCallAttributionId} maps to multiple origin declaration containers.`
                );

            }

        }


        return errors.sort();

    }


    private findPath(
        edges:
            ScientificSolidityInheritanceEdge[],
        startDeclarationFactId:
            string,
        targetDeclarationFactId:
            string
    ): ScientificSolidityInheritanceEdge[] | undefined {

        if (
            startDeclarationFactId ===
                targetDeclarationFactId
        ) {

            return [];

        }


        const adjacency =
            new Map<
                string,
                ScientificSolidityInheritanceEdge[]
            >();


        for (
            const edge
            of edges
        ) {

            const existing =
                adjacency.get(
                    edge.subjectDeclarationFactId
                ) ??
                [];

            existing.push(
                edge
            );

            adjacency.set(
                edge.subjectDeclarationFactId,
                existing
            );

        }


        for (
            const outgoing
            of adjacency.values()
        ) {

            outgoing.sort(
                (
                    left,
                    right
                ) =>
                    left.inheritanceEdgeId.localeCompare(
                        right.inheritanceEdgeId
                    )
            );

        }


        const queue:
            Array<{
                declarationFactId: string;
                path: ScientificSolidityInheritanceEdge[];
            }> =
            [
                {
                    declarationFactId:
                        startDeclarationFactId,

                    path:
                        []
                }
            ];

        const visited =
            new Set<string>([
                startDeclarationFactId
            ]);


        while (
            queue.length >
                0
        ) {

            const current =
                queue.shift()!;

            const outgoing =
                adjacency.get(
                    current.declarationFactId
                ) ??
                [];


            for (
                const edge
                of outgoing
            ) {

                const nextPath =
                    [
                        ...current.path,
                        edge
                    ];


                if (
                    edge.objectDeclarationFactId ===
                        targetDeclarationFactId
                ) {

                    return nextPath;

                }


                if (
                    visited.has(
                        edge.objectDeclarationFactId
                    )
                ) {

                    continue;

                }


                visited.add(
                    edge.objectDeclarationFactId
                );

                queue.push({

                    declarationFactId:
                        edge.objectDeclarationFactId,

                    path:
                        nextPath

                });

            }

        }


        return undefined;

    }


    private behaviorReachabilityId(
        participantProtocolId:
            string,
        originProtocolId:
            string,
        participantDeclarationFactId:
            string,
        originDeclarationFactId:
            string,
        protocolCallAttributionId:
            string,
        inheritanceEdgeIds:
            string[],
        relationEvidenceId:
            string
    ): string {

        return this.tupleId([
            "SCIENTIFIC-PROTOCOL-BEHAVIOR-REACHABILITY",
            participantProtocolId,
            originProtocolId,
            participantDeclarationFactId,
            originDeclarationFactId,
            protocolCallAttributionId,
            relationEvidenceId,
            ...inheritanceEdgeIds
        ]);

    }


    private tupleId(
        components:
            string[]
    ): string {

        return components
            .map(
                component =>
                    `${component.length}:${component}`
            )
            .join(
                "|"
            );

    }

}
