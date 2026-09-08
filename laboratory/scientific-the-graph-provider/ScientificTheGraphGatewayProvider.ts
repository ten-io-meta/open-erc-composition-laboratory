import {
    ScientificTheGraphFetchTransport
} from "./ScientificTheGraphFetchTransport.js";

import type {
    ScientificTheGraphSubgraphQueryRequest,
    ScientificTheGraphSubgraphQueryResult,
    ScientificTheGraphTransport
} from "./ScientificTheGraphProvider.js";


function nonEmpty(
    value:
        string
): boolean {

    return value
        .trim()
        .length >
        0;

}


function validHash(
    value:
        string
): boolean {

    return /^0x[0-9a-fA-F]{64}$/
        .test(
            value
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


function blockNumber(
    value:
        unknown
): number | undefined {

    const number =
        typeof value ===
            "number"
            ? value
            : typeof value ===
                "string" &&
              /^[0-9]+$/.test(
                  value
              )
                ? Number(
                    value
                )
                : Number.NaN;


    if (
        !Number.isSafeInteger(
            number
        ) ||
        number <
            0
    ) {

        return undefined;

    }


    return number;

}


export class ScientificTheGraphGatewayProvider {

    private readonly transport:
        ScientificTheGraphTransport;


    constructor(
        transport?:
            ScientificTheGraphTransport
    ) {

        this.transport =
            transport ??
            new ScientificTheGraphFetchTransport();

    }


    async query(
        request:
            ScientificTheGraphSubgraphQueryRequest
    ): Promise<ScientificTheGraphSubgraphQueryResult> {

        const errors:
            string[] =
            [];


        const subgraphId =
            request.subgraphId.trim();

        const network =
            request.network.trim();

        const chainId =
            request.chainId.trim();

        const apiKey =
            request.apiKey.trim();

        const document =
            request.document.trim();

        const deploymentId =
            request.deploymentId
                ?.trim();

        const schemaId =
            request.schemaId
                ?.trim();

        const timeoutMs =
            request.timeoutMs ??
            20_000;

        const gatewayBaseUrl =
            (
                request.gatewayBaseUrl ??
                "https://gateway.thegraph.com/api"
            )
                .trim()
                .replace(
                    /\/+$/,
                    ""
                );


        if (!nonEmpty(subgraphId)) {
            errors.push(
                "The Graph subgraphId is required."
            );
        }

        if (!nonEmpty(network)) {
            errors.push(
                "The Graph network is required."
            );
        }

        if (!nonEmpty(chainId)) {
            errors.push(
                "The Graph chainId is required."
            );
        }

        if (!nonEmpty(apiKey)) {
            errors.push(
                "The Graph API key is required."
            );
        }

        if (!nonEmpty(document)) {
            errors.push(
                "The Graph GraphQL document is required."
            );
        }

        if (
            !Number.isSafeInteger(
                timeoutMs
            ) ||
            timeoutMs <
                1_000 ||
            timeoutMs >
                120_000
        ) {

            errors.push(
                "The Graph timeout must be between 1000 and 120000 milliseconds."
            );

        }


        let parsedGateway:
            URL | undefined;


        try {

            parsedGateway =
                new URL(
                    gatewayBaseUrl
                );

        }
        catch {

            errors.push(
                "The Graph gateway base URL is invalid."
            );

        }


        if (
            parsedGateway !==
            undefined
        ) {

            if (
                parsedGateway.protocol !==
                "https:"
            ) {

                errors.push(
                    "The Graph gateway must use HTTPS."
                );

            }


            if (
                parsedGateway.username ||
                parsedGateway.password ||
                parsedGateway.search ||
                parsedGateway.hash
            ) {

                errors.push(
                    "The Graph gateway URL must not contain credentials, query parameters, or fragments."
                );

            }

        }


        const endpoint =
            `${gatewayBaseUrl}/subgraphs/id/${encodeURIComponent(
                subgraphId
            )}`;


        if (
            errors.length >
            0
        ) {

            return this.failed(
                subgraphId,
                network,
                chainId,
                deploymentId,
                schemaId,
                endpoint,
                null,
                errors
            );

        }


        const body =
            JSON.stringify({

                query:
                    document,

                variables:
                    request.variables

            });


        let response;


        try {

            response =
                await this.transport.post({

                    url:
                        endpoint,

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${apiKey}`

                    },

                    body,

                    timeoutMs

                });

        }
        catch (
            error
        ) {

            const message =
                error instanceof Error
                    ? error.message
                    : String(
                        error
                    );


            return this.failed(
                subgraphId,
                network,
                chainId,
                deploymentId,
                schemaId,
                endpoint,
                null,
                [
                    `The Graph transport failed: ${message}`
                ]
            );

        }


        if (
            response.status <
                200 ||
            response.status >=
                300
        ) {

            return this.failed(
                subgraphId,
                network,
                chainId,
                deploymentId,
                schemaId,
                endpoint,
                response.status,
                [
                    `The Graph gateway returned HTTP ${response.status}.`
                ]
            );

        }


        let parsed:
            any;


        try {

            parsed =
                JSON.parse(
                    response.body
                );

        }
        catch {

            return this.failed(
                subgraphId,
                network,
                chainId,
                deploymentId,
                schemaId,
                endpoint,
                response.status,
                [
                    "The Graph gateway response is not valid JSON."
                ]
            );

        }


        if (
            parsed ===
                null ||
            typeof parsed !==
                "object" ||
            Array.isArray(
                parsed
            )
        ) {

            errors.push(
                "The Graph gateway response must be a JSON object."
            );

        }


        if (
            Array.isArray(
                parsed?.errors
            ) &&
            parsed.errors.length >
                0
        ) {

            for (
                const graphError
                of parsed.errors
            ) {

                errors.push(
                    `The Graph GraphQL error: ${
                        typeof graphError?.message ===
                            "string"
                            ? graphError.message
                            : "UNKNOWN_GRAPHQL_ERROR"
                    }`
                );

            }

        }


        const data =
            parsed?.data;


        if (
            data ===
                null ||
            typeof data !==
                "object" ||
            Array.isArray(
                data
            )
        ) {

            errors.push(
                "The Graph response has no valid data object."
            );

        }


        const meta =
            data?._meta;


        if (
            meta ===
                null ||
            typeof meta !==
                "object" ||
            Array.isArray(
                meta
            )
        ) {

            errors.push(
                "The Graph response must include _meta provenance."
            );

        }


        if (
            meta?.hasIndexingErrors ===
            true
        ) {

            errors.push(
                "The Graph subgraph reports indexing errors."
            );

        }


        const indexedBlockNumber =
            blockNumber(
                meta?.block?.number
            );


        if (
            indexedBlockNumber ===
            undefined
        ) {

            errors.push(
                "The Graph _meta block number is missing or invalid."
            );

        }


        const indexedBlockHash =
            typeof meta?.block?.hash ===
                "string"
                ? meta.block.hash
                : undefined;


        if (
            indexedBlockHash !==
                undefined &&
            !validHash(
                indexedBlockHash
            )
        ) {

            errors.push(
                "The Graph _meta block hash is invalid."
            );

        }


        const observedDeploymentId =
            typeof meta?.deployment ===
                "string" &&
            nonEmpty(
                meta.deployment
            )
                ? meta.deployment.trim()
                : undefined;


        if (
            deploymentId !==
                undefined &&
            observedDeploymentId !==
                undefined &&
            deploymentId !==
                observedDeploymentId
        ) {

            errors.push(
                "The Graph response deployment does not match the requested deployment."
            );

        }


        if (
            errors.length >
            0 ||
            indexedBlockNumber ===
            undefined
        ) {

            return this.failed(
                subgraphId,
                network,
                chainId,
                deploymentId,
                schemaId,
                endpoint,
                response.status,
                errors
            );

        }


        const providerMode =
            this.transport instanceof
                ScientificTheGraphFetchTransport
                ? "LIVE"
                : "FIXTURE";


        return {

            provider:
                "THE_GRAPH",

            providerMode,

            productKind:
                "SUBGRAPH",

            productId:
                subgraphId,

            network,

            chainId,

            ...(
                (
                    observedDeploymentId ??
                    deploymentId
                ) !==
                undefined
                    ? {
                        deploymentId:
                            observedDeploymentId ??
                            deploymentId
                    }
                    : {}
            ),

            ...(
                schemaId !==
                undefined
                    ? {
                        schemaId
                    }
                    : {}
            ),

            endpoint,

            httpStatus:
                response.status,

            query: {

                document,

                variables:
                    request.variables,

                response:
                    parsed,

                fetchedAt:
                    new Date()
                        .toISOString(),

                indexedBlock: {

                    number:
                        indexedBlockNumber,

                    ...(
                        indexedBlockHash !==
                        undefined
                            ? {
                                hash:
                                    indexedBlockHash
                            }
                            : {}
                    )

                }

            },

            errors:
                []

        };

    }


    private failed(
        productId:
            string,
        network:
            string,
        chainId:
            string,
        deploymentId:
            string | undefined,
        schemaId:
            string | undefined,
        endpoint:
            string,
        httpStatus:
            number | null,
        errors:
            string[]
    ): ScientificTheGraphSubgraphQueryResult {

        return {

            provider:
                "THE_GRAPH",

            providerMode:
                this.transport instanceof
                    ScientificTheGraphFetchTransport
                    ? "LIVE"
                    : "FIXTURE",

            productKind:
                "SUBGRAPH",

            productId,

            network,

            chainId,

            ...(
                deploymentId !==
                undefined
                    ? {
                        deploymentId
                    }
                    : {}
            ),

            ...(
                schemaId !==
                undefined
                    ? {
                        schemaId
                    }
                    : {}
            ),

            endpoint,

            httpStatus,

            query:
                null,

            errors:
                unique(
                    errors
                )

        };

    }

}