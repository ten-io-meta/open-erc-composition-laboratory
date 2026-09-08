import {
    ScientificTheGraphEvidenceEngine
} from "../scientific-the-graph-evidence/ScientificTheGraphEvidenceEngine.js";

import type {
    ScientificTheGraphEvidenceResult
} from "../scientific-the-graph-evidence/ScientificTheGraphEvidence.js";

import type {
    ScientificTheGraphSubgraphQueryResult
} from "../scientific-the-graph-provider/ScientificTheGraphProvider.js";


export const AGENT0_BASE_MAINNET_SUBGRAPH_ID =
    "43s9hQRurMGjuYnC1r2ZwS6xSQktbFyXMPMqGKUFJojb";


export interface ScientificAgent0Erc8004AdapterResult {

    graphEvidence:
        ScientificTheGraphEvidenceResult | null;

    agentIds:
        string[];

    errors:
        string[];

}


function nonEmpty(
    value:
        unknown
): value is string {

    return (
        typeof value ===
            "string" &&
        value.trim().length >
            0
    );

}


function validAddress(
    value:
        unknown
): value is string {

    return (
        typeof value ===
            "string" &&
        /^0x[0-9a-fA-F]{40}$/
            .test(
                value
            )
    );

}


function unique(
    values:
        string[]
): string[] {

    return [
        ...new Set(
            values
        )
    ].sort();

}


export class ScientificAgent0Erc8004Adapter {

    adapt(
        input:
            ScientificTheGraphSubgraphQueryResult
    ): ScientificAgent0Erc8004AdapterResult {

        const errors:
            string[] =
            [];


        if (
            input.errors.length >
            0
        ) {

            errors.push(
                ...input.errors.map(
                    error =>
                        `Provider error: ${error}`
                )
            );

        }


        if (
            input.provider !==
            "THE_GRAPH"
        ) {

            errors.push(
                "Agent0 adapter requires The Graph provider."
            );

        }


        if (
            input.productKind !==
            "SUBGRAPH"
        ) {

            errors.push(
                "Agent0 adapter requires a Subgraph product."
            );

        }


        if (
            input.productId !==
            AGENT0_BASE_MAINNET_SUBGRAPH_ID
        ) {

            errors.push(
                "Agent0 Base adapter received an unexpected subgraph ID."
            );

        }


        if (
            input.network !==
            "base" ||
            input.chainId !==
            "8453"
        ) {

            errors.push(
                "Agent0 Base adapter requires Base mainnet chainId 8453."
            );

        }


        if (
            input.query ===
            null
        ) {

            errors.push(
                "Agent0 adapter received no successful Graph query."
            );

        }


        const response =
            input.query
                ?.response as any;

        const agents =
            response
                ?.data
                ?.agents;


        if (
            input.query !==
                null &&
            !Array.isArray(
                agents
            )
        ) {

            errors.push(
                "Agent0 Graph response does not contain an agents array."
            );

        }


        const seenAgentIds =
            new Set<string>();


        if (
            Array.isArray(
                agents
            )
        ) {

            for (
                const agent
                of agents
            ) {

                if (
                    agent ===
                        null ||
                    typeof agent !==
                        "object" ||
                    Array.isArray(
                        agent
                    )
                ) {

                    errors.push(
                        "Agent0 returned a non-object Agent entity."
                    );

                    continue;

                }


                if (
                    !nonEmpty(
                        agent.id
                    )
                ) {

                    errors.push(
                        "Agent0 Agent entity has no valid id."
                    );

                    continue;

                }


                if (
                    seenAgentIds.has(
                        agent.id
                    )
                ) {

                    errors.push(
                        `Agent0 returned duplicate Agent entity ${agent.id}.`
                    );

                    continue;

                }


                seenAgentIds.add(
                    agent.id
                );


                if (
                    String(
                        agent.chainId
                    ) !==
                    "8453"
                ) {

                    errors.push(
                        `Agent0 Agent ${agent.id} does not belong to Base chainId 8453.`
                    );

                }


                if (
                    !agent.id.startsWith(
                        "8453:"
                    )
                ) {

                    errors.push(
                        `Agent0 Agent ${agent.id} does not use the expected chain-scoped identity.`
                    );

                }


                if (
                    !validAddress(
                        agent.owner
                    )
                ) {

                    errors.push(
                        `Agent0 Agent ${agent.id} has invalid owner provenance.`
                    );

                }

            }

        }


        if (
            errors.length >
            0 ||
            input.query ===
            null ||
            !Array.isArray(
                agents
            )
        ) {

            return {

                graphEvidence:
                    null,

                agentIds:
                    [],

                errors:
                    unique(
                        errors
                    )

            };

        }


        const graphEvidence =
            new ScientificTheGraphEvidenceEngine()
                .build({

                    source: {

                        productKind:
                            input.productKind,

                        productId:
                            input.productId,

                        network:
                            input.network,

                        chainId:
                            input.chainId,

                        ...(
                            input.deploymentId !==
                            undefined
                                ? {
                                    deploymentId:
                                        input.deploymentId
                                }
                                : {}
                        ),

                        ...(
                            input.schemaId !==
                            undefined
                                ? {
                                    schemaId:
                                        input.schemaId
                                }
                                : {}
                        ),

                        providerMode:
                            input.providerMode

                    },

                    query:
                        input.query,

                    observations:
                        agents.map(
                            agent => ({

                                observationKind:
                                    "ENTITY" as const,

                                entityType:
                                    "Agent",

                                entityId:
                                    agent.id,

                                fragment:
                                    agent

                            })
                        )

                });


        if (
            graphEvidence.errors.length >
            0
        ) {

            return {

                graphEvidence:
                    null,

                agentIds:
                    [],

                errors:
                    graphEvidence.errors

            };

        }


        return {

            graphEvidence,

            agentIds:
                [...seenAgentIds]
                    .sort(),

            errors:
                []

        };

    }

}