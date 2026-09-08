import type {
    ScientificProtocolCompositionProfile
} from "../scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";

import type {
    ScientificTheGraphProductDiscoveryCandidate,
    ScientificTheGraphProductDiscoveryObservation,
    ScientificTheGraphProductDiscoveryPlanResult,
    ScientificTheGraphProductDiscoveryRequest,
    ScientificTheGraphProductDiscoveryResult
} from "./ScientificTheGraphProductDiscovery.js";


function nonEmpty(
    value:
        string | undefined
): value is string {

    return (
        value !== undefined &&
        value.trim().length > 0
    );

}


function uniqueSorted(
    values:
        string[]
): string[] {

    return [
        ...new Set(
            values
        )
    ].sort();

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


function protocolAliases(
    protocolId:
        string
): string[] {

    const exact =
        protocolId.trim();

    const compact =
        exact.replace(
            /[^a-zA-Z0-9]/g,
            ""
        );

    return uniqueSorted(
        [
            exact,
            ...(
                compact !== exact
                    ? [compact]
                    : []
            )
        ]
    );

}


function productIdentity(
    observation:
        ScientificTheGraphProductDiscoveryObservation
): string {

    return encode([
        observation.requestId,
        observation.resultProductKind,
        observation.productId,
        observation.network,
        observation.chainId,
        observation.deploymentId ??
            "NO-DEPLOYMENT"
    ]);

}


export class ScientificTheGraphProductDiscoveryEngine {

    plan(
        profiles:
            ScientificProtocolCompositionProfile[],
        excludedProtocolIds:
            string[] = []
    ): ScientificTheGraphProductDiscoveryPlanResult {

        const errors:
            string[] =
            [];

        const requests:
            ScientificTheGraphProductDiscoveryRequest[] =
            [];

        const seenProfileIds =
            new Set<string>();

        const excluded =
            new Set(
                excludedProtocolIds
                    .map(
                        value =>
                            value.trim()
                    )
                    .filter(
                        value =>
                            value.length > 0
                    )
            );


        for (
            const profile
            of profiles
        ) {

            if (
                !nonEmpty(
                    profile.profileId
                )
            ) {

                errors.push(
                    "The Graph discovery profile has no profileId."
                );

                continue;

            }


            if (
                seenProfileIds.has(
                    profile.profileId
                )
            ) {

                errors.push(
                    `Duplicate The Graph discovery profile ${profile.profileId}.`
                );

                continue;

            }


            seenProfileIds.add(
                profile.profileId
            );


            if (
                !nonEmpty(
                    profile.protocolId
                )
            ) {

                errors.push(
                    `Profile ${profile.profileId} has no protocolId.`
                );

                continue;

            }


            if (
                !nonEmpty(
                    profile.sourceId
                )
            ) {

                errors.push(
                    `Profile ${profile.profileId} has no sourceId.`
                );

                continue;

            }


            if (
                excluded.has(
                    profile.protocolId
                )
            ) {

                continue;

            }


            const searchTerms =
                protocolAliases(
                    profile.protocolId
                );


            if (
                searchTerms.length ===
                0
            ) {

                errors.push(
                    `Profile ${profile.profileId} produced no discovery aliases.`
                );

                continue;

            }


            const requestId =
                encode([
                    "SCIENTIFIC-THE-GRAPH-PRODUCT-DISCOVERY-REQUEST",
                    profile.protocolId,
                    profile.profileId,
                    profile.sourceId,
                    profile.sourceRevision ??
                        "NO-REVISION",
                    ...searchTerms
                ]);


            requests.push({

                requestId,

                protocolId:
                    profile.protocolId,

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

                searchTerms,

                searchBasis:
                    "PROTOCOL_IDENTITY_ALIASES",

                targetProductKind:
                    "SUBGRAPH"

            });

        }


        return {

            requests:
                requests.sort(
                    (
                        a,
                        b
                    ) =>
                        a.requestId.localeCompare(
                            b.requestId
                        )
                ),

            excludedProtocolIds:
                [...excluded]
                    .sort(),

            errors:
                uniqueSorted(
                    errors
                )

        };

    }


    assemble(
        profiles:
            ScientificProtocolCompositionProfile[],
        requests:
            ScientificTheGraphProductDiscoveryRequest[],
        observations:
            ScientificTheGraphProductDiscoveryObservation[]
    ): ScientificTheGraphProductDiscoveryResult {

        const errors:
            string[] =
            [];

        const profileById =
            new Map<
                string,
                ScientificProtocolCompositionProfile
            >();

        const requestById =
            new Map<
                string,
                ScientificTheGraphProductDiscoveryRequest
            >();

        const seenObservationIds =
            new Set<string>();


        for (
            const profile
            of profiles
        ) {

            if (
                profileById.has(
                    profile.profileId
                )
            ) {

                errors.push(
                    `Duplicate profile ${profile.profileId} supplied to The Graph discovery assembly.`
                );

                continue;

            }

            profileById.set(
                profile.profileId,
                profile
            );

        }


        for (
            const request
            of requests
        ) {

            if (
                requestById.has(
                    request.requestId
                )
            ) {

                errors.push(
                    `Duplicate The Graph discovery request ${request.requestId}.`
                );

                continue;

            }


            requestById.set(
                request.requestId,
                request
            );


            const profile =
                profileById.get(
                    request.profileId
                );


            if (
                profile ===
                undefined
            ) {

                errors.push(
                    `The Graph discovery request ${request.requestId} references unknown profile ${request.profileId}.`
                );

                continue;

            }


            if (
                request.protocolId !==
                    profile.protocolId ||
                request.sourceId !==
                    profile.sourceId ||
                request.sourceRevision !==
                    profile.sourceRevision
            ) {

                errors.push(
                    `The Graph discovery request ${request.requestId} does not match its exact source-scoped profile identity.`
                );

            }


            if (
                request.searchBasis !==
                "PROTOCOL_IDENTITY_ALIASES"
            ) {

                errors.push(
                    `The Graph discovery request ${request.requestId} has an unsupported search basis.`
                );

            }


            if (
                request.targetProductKind !==
                "SUBGRAPH"
            ) {

                errors.push(
                    `The Graph discovery request ${request.requestId} has an unsupported target product kind.`
                );

            }


            if (
                request.searchTerms.length ===
                    0 ||
                request.searchTerms.some(
                    term =>
                        term.trim().length ===
                        0
                )
            ) {

                errors.push(
                    `The Graph discovery request ${request.requestId} has invalid search terms.`
                );

            }

        }


        const validObservations:
            ScientificTheGraphProductDiscoveryObservation[] =
            [];


        for (
            const observation
            of observations
        ) {

            if (
                seenObservationIds.has(
                    observation.observationId
                )
            ) {

                errors.push(
                    `Duplicate The Graph discovery observation ${observation.observationId}.`
                );

                continue;

            }


            seenObservationIds.add(
                observation.observationId
            );


            const request =
                requestById.get(
                    observation.requestId
                );


            if (
                request ===
                undefined
            ) {

                errors.push(
                    `The Graph discovery observation ${observation.observationId} references unknown request ${observation.requestId}.`
                );

                continue;

            }


            if (
                observation.provider !==
                "THE_GRAPH"
            ) {

                errors.push(
                    `The Graph discovery observation ${observation.observationId} has an invalid provider.`
                );

                continue;

            }


            if (
                observation.discoveryProductKind !==
                "SUBGRAPH_MCP"
            ) {

                errors.push(
                    `The Graph discovery observation ${observation.observationId} did not originate from SUBGRAPH_MCP.`
                );

                continue;

            }


            if (
                observation.resultProductKind !==
                "SUBGRAPH"
            ) {

                errors.push(
                    `The Graph discovery observation ${observation.observationId} did not discover a Subgraph.`
                );

                continue;

            }


            if (
                !nonEmpty(
                    observation.productId
                ) ||
                !nonEmpty(
                    observation.network
                ) ||
                !nonEmpty(
                    observation.chainId
                ) ||
                !nonEmpty(
                    observation.matchedValue
                )
            ) {

                errors.push(
                    `The Graph discovery observation ${observation.observationId} has incomplete product identity.`
                );

                continue;

            }


            if (
                !request.searchTerms.includes(
                    observation.matchedValue
                )
            ) {

                errors.push(
                    `The Graph discovery observation ${observation.observationId} does not match an exact request search term.`
                );

                continue;

            }


            if (
                observation.providerRank !==
                    undefined &&
                (
                    !Number.isInteger(
                        observation.providerRank
                    ) ||
                    observation.providerRank <
                        1
                )
            ) {

                errors.push(
                    `The Graph discovery observation ${observation.observationId} has invalid provider rank.`
                );

                continue;

            }


            validObservations.push(
                observation
            );

        }


        if (
            errors.length >
            0
        ) {

            return {

                candidates:
                    [],

                errors:
                    uniqueSorted(
                        errors
                    )

            };

        }


        const observationsByProduct =
            new Map<
                string,
                ScientificTheGraphProductDiscoveryObservation[]
            >();


        for (
            const observation
            of validObservations
        ) {

            const identity =
                productIdentity(
                    observation
                );

            const existing =
                observationsByProduct.get(
                    identity
                ) ??
                [];

            existing.push(
                observation
            );

            observationsByProduct.set(
                identity,
                existing
            );

        }


        const candidates:
            ScientificTheGraphProductDiscoveryCandidate[] =
            [];


        for (
            const [
                identity,
                groupedObservations
            ]
            of observationsByProduct
        ) {

            const first =
                groupedObservations[0];

            const request =
                requestById.get(
                    first.requestId
                );


            if (
                request ===
                undefined
            ) {

                throw new Error(
                    "Internal The Graph discovery request identity loss."
                );

            }


            const candidateId =
                encode([
                    "SCIENTIFIC-THE-GRAPH-PRODUCT-DISCOVERY-CANDIDATE",
                    identity
                ]);


            candidates.push({

                candidateId,

                requestId:
                    request.requestId,

                protocolId:
                    request.protocolId,

                profileId:
                    request.profileId,

                sourceId:
                    request.sourceId,

                ...(
                    request.sourceRevision !==
                    undefined
                        ? {
                            sourceRevision:
                                request.sourceRevision
                        }
                        : {}
                ),

                productKind:
                    "SUBGRAPH",

                productId:
                    first.productId,

                network:
                    first.network,

                chainId:
                    first.chainId,

                ...(
                    first.deploymentId !==
                    undefined
                        ? {
                            deploymentId:
                                first.deploymentId
                        }
                        : {}
                ),

                ...(
                    first.schemaId !==
                    undefined
                        ? {
                            schemaId:
                                first.schemaId
                        }
                        : {}
                ),

                discoveryObservationIds:
                    groupedObservations
                        .map(
                            observation =>
                                observation.observationId
                        )
                        .sort(),

                matchedValues:
                    uniqueSorted(
                        groupedObservations
                            .map(
                                observation =>
                                    observation.matchedValue
                            )
                    ),

                status:
                    "DISCOVERED",

                nextAction:
                    "INSPECT_SCHEMA_AND_METADATA"

            });

        }


        return {

            candidates:
                candidates.sort(
                    (
                        a,
                        b
                    ) =>
                        a.candidateId.localeCompare(
                            b.candidateId
                        )
                ),

            errors:
                []

        };

    }

}