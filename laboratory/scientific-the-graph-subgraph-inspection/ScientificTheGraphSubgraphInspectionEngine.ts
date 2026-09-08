import {
    createHash
} from "node:crypto";

import type {
    ScientificTheGraphProviderMode
} from "../scientific-the-graph-evidence/ScientificTheGraphEvidence.js";

import type {
    ScientificTheGraphSubgraphMcpToolCallResult,
    ScientificTheGraphSubgraphMcpToolClient
} from "../scientific-the-graph-subgraph-mcp/ScientificTheGraphSubgraphMcpClient.js";

import type {
    ScientificTheGraphSubgraphInspection,
    ScientificTheGraphSubgraphInspectionRequest,
    ScientificTheGraphSubgraphInspectionResult,
    ScientificTheGraphSubgraphQueryActivityObservation,
    ScientificTheGraphSubgraphSchemaObservation
} from "./ScientificTheGraphSubgraphInspection.js";


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


function sha256(
    value:
        string
): string {

    return createHash(
        "sha256"
    )
        .update(
            value,
            "utf8"
        )
        .digest(
            "hex"
        );

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


function safeNonNegativeInteger(
    value:
        unknown
): value is number {

    return (
        typeof value ===
            "number" &&
        Number.isSafeInteger(
            value
        ) &&
        value >=
            0
    );

}


function canonicalize(
    value:
        unknown
): string {

    if (
        value ===
        null
    ) {

        return "null";

    }


    if (
        typeof value ===
            "string" ||
        typeof value ===
            "boolean"
    ) {

        return JSON.stringify(
            value
        );

    }


    if (
        typeof value ===
        "number"
    ) {

        if (
            !Number.isFinite(
                value
            )
        ) {

            throw new Error(
                "Non-finite value cannot be canonicalized."
            );

        }

        return JSON.stringify(
            value
        );

    }


    if (
        Array.isArray(
            value
        )
    ) {

        return (
            "[" +
            value
                .map(
                    item =>
                        canonicalize(
                            item
                        )
                )
                .join(",") +
            "]"
        );

    }


    if (
        typeof value ===
        "object"
    ) {

        const record =
            value as
                Record<string, unknown>;

        const keys =
            Object.keys(
                record
            )
                .sort();


        return (
            "{" +
            keys
                .map(
                    key =>
                        JSON.stringify(
                            key
                        ) +
                        ":" +
                        canonicalize(
                            record[key]
                        )
                )
                .join(",") +
            "}"
        );

    }


    throw new Error(
        "Unsupported value in canonical JSON."
    );

}


interface ParsedActivity {

    ipfsHash:
        string;

    dataPointsCount:
        number;

    totalQueryCount:
        number;

    rawFragment:
        string;

    fragmentHash:
        string;

}


export class ScientificTheGraphSubgraphInspectionEngine {

    constructor(
        private readonly client:
            ScientificTheGraphSubgraphMcpToolClient,
        private readonly providerMode:
            ScientificTheGraphProviderMode
    ) {}


    async inspect(
        requests:
            ScientificTheGraphSubgraphInspectionRequest[]
    ): Promise<ScientificTheGraphSubgraphInspectionResult> {

        const errors:
            string[] =
            [];

        const seenRequestIds =
            new Set<string>();

        const seenDeploymentScopes =
            new Set<string>();


        for (
            const request
            of requests
        ) {

            if (
                !nonEmpty(
                    request.requestId
                )
            ) {

                errors.push(
                    "Subgraph inspection request has no requestId."
                );

                continue;

            }


            if (
                seenRequestIds.has(
                    request.requestId
                )
            ) {

                errors.push(
                    `Duplicate subgraph inspection request ${request.requestId}.`
                );

                continue;

            }


            seenRequestIds.add(
                request.requestId
            );


            if (
                !nonEmpty(
                    request.subgraphId
                )
            ) {

                errors.push(
                    `Subgraph inspection request ${request.requestId} has no subgraphId.`
                );

            }


            if (
                !nonEmpty(
                    request.ipfsHash
                ) ||
                !request.ipfsHash.startsWith(
                    "Qm"
                )
            ) {

                errors.push(
                    `Subgraph inspection request ${request.requestId} has no valid deployment IPFS hash.`
                );

            }


            const deploymentScope =
                encode([
                    request.subgraphId,
                    request.ipfsHash
                ]);


            if (
                seenDeploymentScopes.has(
                    deploymentScope
                )
            ) {

                errors.push(
                    `Duplicate subgraph deployment scope ${request.subgraphId} ${request.ipfsHash}.`
                );

            }


            seenDeploymentScopes.add(
                deploymentScope
            );

        }


        if (
            errors.length >
            0
        ) {

            return {

                inspections:
                    [],

                errors:
                    uniqueSorted(
                        errors
                    )

            };

        }


        if (
            requests.length ===
            0
        ) {

            return {

                inspections:
                    [],

                errors:
                    []

            };

        }


        const schemaByRequestId =
            new Map<
                string,
                ScientificTheGraphSubgraphSchemaObservation
            >();


        for (
            const request
            of requests
        ) {

            try {

                const result =
                    await this.client.callTool(

                        "get_schema_by_ipfs_hash",

                        {

                            ipfs_hash:
                                request.ipfsHash

                        }

                    );


                const schemaText =
                    this.readSingleText(
                        result,
                        "get_schema_by_ipfs_hash",
                        request.ipfsHash
                    );


                if (
                    schemaText.trim().length ===
                    0
                ) {

                    throw new Error(
                        `The Graph returned an empty schema for deployment ${request.ipfsHash}.`
                    );

                }


                const schemaHash =
                    sha256(
                        schemaText
                    );


                const observationId =
                    encode([
                        "SCIENTIFIC-THE-GRAPH-SUBGRAPH-SCHEMA-OBSERVATION",
                        request.requestId,
                        request.subgraphId,
                        request.ipfsHash,
                        this.providerMode,
                        schemaHash
                    ]);


                schemaByRequestId.set(

                    request.requestId,

                    {

                        observationId,

                        requestId:
                            request.requestId,

                        provider:
                            "THE_GRAPH",

                        providerMode:
                            this.providerMode,

                        productKind:
                            "SUBGRAPH",

                        subgraphId:
                            request.subgraphId,

                        ipfsHash:
                            request.ipfsHash,

                        toolName:
                            "get_schema_by_ipfs_hash",

                        schemaText,

                        schemaHash,

                        status:
                            "SCHEMA_OBSERVED"

                    }

                );

            }
            catch (
                error
            ) {

                errors.push(
                    error instanceof Error
                        ? error.message
                        : String(
                            error
                        )
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                inspections:
                    [],

                errors:
                    uniqueSorted(
                        errors
                    )

            };

        }


        let activityByIpfsHash:
            Map<
                string,
                ParsedActivity
            >;


        try {

            activityByIpfsHash =
                await this.readActivity(
                    requests.map(
                        request =>
                            request.ipfsHash
                    )
                );

        }
        catch (
            error
        ) {

            return {

                inspections:
                    [],

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(
                            error
                        )
                ]

            };

        }


        const inspections:
            ScientificTheGraphSubgraphInspection[] =
            [];


        for (
            const request
            of requests
        ) {

            const schemaObservation =
                schemaByRequestId.get(
                    request.requestId
                );

            const activity =
                activityByIpfsHash.get(
                    request.ipfsHash
                );


            if (
                schemaObservation ===
                undefined
            ) {

                errors.push(
                    `Missing schema observation for request ${request.requestId}.`
                );

                continue;

            }


            if (
                activity ===
                undefined
            ) {

                errors.push(
                    `Missing query activity observation for deployment ${request.ipfsHash}.`
                );

                continue;

            }


            const activityStatus =
                activity.totalQueryCount >
                    0
                        ? "ACTIVITY_OBSERVED" as const
                        : "NO_RECENT_ACTIVITY_OBSERVED" as const;


            const activityObservationId =
                encode([
                    "SCIENTIFIC-THE-GRAPH-SUBGRAPH-QUERY-ACTIVITY-OBSERVATION",
                    request.requestId,
                    request.subgraphId,
                    request.ipfsHash,
                    this.providerMode,
                    String(
                        activity.dataPointsCount
                    ),
                    String(
                        activity.totalQueryCount
                    ),
                    activity.fragmentHash
                ]);


            const queryActivityObservation:
                ScientificTheGraphSubgraphQueryActivityObservation =
                {

                    observationId:
                        activityObservationId,

                    requestId:
                        request.requestId,

                    provider:
                        "THE_GRAPH",

                    providerMode:
                        this.providerMode,

                    productKind:
                        "SUBGRAPH",

                    subgraphId:
                        request.subgraphId,

                    ipfsHash:
                        request.ipfsHash,

                    toolName:
                        "get_deployment_30day_query_counts",

                    dataPointsCount:
                        activity.dataPointsCount,

                    totalQueryCount:
                        activity.totalQueryCount,

                    activityStatus,

                    rawFragment:
                        activity.rawFragment,

                    fragmentHash:
                        activity.fragmentHash

                };


            const inspectionId =
                encode([
                    "SCIENTIFIC-THE-GRAPH-SUBGRAPH-INSPECTION",
                    request.requestId,
                    schemaObservation.observationId,
                    queryActivityObservation.observationId
                ]);


            inspections.push({

                inspectionId,

                requestId:
                    request.requestId,

                subgraphId:
                    request.subgraphId,

                ipfsHash:
                    request.ipfsHash,

                providerMode:
                    this.providerMode,

                schemaObservation,

                queryActivityObservation,

                status:
                    "INSPECTED",

                nextAction:
                    "ASSESS_PROTOCOL_ATTRIBUTION"

            });

        }


        if (
            errors.length >
            0
        ) {

            return {

                inspections:
                    [],

                errors:
                    uniqueSorted(
                        errors
                    )

            };

        }


        return {

            inspections:
                inspections.sort(
                    (
                        a,
                        b
                    ) =>
                        a.inspectionId.localeCompare(
                            b.inspectionId
                        )
                ),

            errors:
                []

        };

    }


    private readSingleText(
        result:
            ScientificTheGraphSubgraphMcpToolCallResult,
        toolName:
            string,
        subject:
            string
    ): string {

        if (
            result.isError ===
            true
        ) {

            throw new Error(
                `${toolName} failed for ${subject}.`
            );

        }


        if (
            !Array.isArray(
                result.content
            )
        ) {

            throw new Error(
                `${toolName} returned no content array for ${subject}.`
            );

        }


        const textItems =
            result.content.filter(
                item =>
                    item !==
                        null &&
                    typeof item ===
                        "object" &&
                    !Array.isArray(
                        item
                    ) &&
                    (
                        item as
                            Record<string, unknown>
                    ).type ===
                        "text" &&
                    typeof (
                        item as
                            Record<string, unknown>
                    ).text ===
                        "string"
            );


        if (
            textItems.length !==
            1
        ) {

            throw new Error(
                `${toolName} returned ${textItems.length} text payloads for ${subject} instead of exactly one.`
            );

        }


        return (
            textItems[0] as
                Record<string, unknown>
        ).text as string;

    }


    private async readActivity(
        requestedIpfsHashes:
            string[]
    ): Promise<Map<string, ParsedActivity>> {

        const uniqueIpfsHashes =
            uniqueSorted(
                requestedIpfsHashes
            );


        const result =
            await this.client.callTool(

                "get_deployment_30day_query_counts",

                {

                    ipfs_hashes:
                        uniqueIpfsHashes

                }

            );


        const text =
            this.readSingleText(
                result,
                "get_deployment_30day_query_counts",
                uniqueIpfsHashes.join(
                    ","
                )
            );


        let parsed:
            unknown;


        try {

            parsed =
                JSON.parse(
                    text
                );

        }
        catch {

            throw new Error(
                "The Graph query-activity response is not valid JSON."
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

            throw new Error(
                "The Graph query-activity response is not an object."
            );

        }


        const record =
            parsed as
                Record<string, unknown>;


        if (
            !Array.isArray(
                record.deployments
            )
        ) {

            throw new Error(
                "The Graph query-activity response has no deployments array."
            );

        }


        if (
            !safeNonNegativeInteger(
                record.total_deployments_processed
            )
        ) {

            throw new Error(
                "The Graph query-activity response has invalid total_deployments_processed."
            );

        }


        if (
            record.total_deployments_processed !==
            record.deployments.length
        ) {

            throw new Error(
                "The Graph query-activity processed count does not match returned deployments."
            );

        }


        const requestedSet =
            new Set(
                uniqueIpfsHashes
            );

        const seen =
            new Set<string>();

        const activityByIpfsHash =
            new Map<
                string,
                ParsedActivity
            >();


        for (
            const deployment
            of record.deployments
        ) {

            if (
                deployment ===
                    null ||
                typeof deployment !==
                    "object" ||
                Array.isArray(
                    deployment
                )
            ) {

                throw new Error(
                    "The Graph query-activity response contains a non-object deployment."
                );

            }


            const deploymentRecord =
                deployment as
                    Record<string, unknown>;


            const ipfsHash =
                deploymentRecord.ipfs_hash;


            if (
                !nonEmpty(
                    ipfsHash
                )
            ) {

                throw new Error(
                    "The Graph query-activity deployment has no IPFS hash."
                );

            }


            if (
                !requestedSet.has(
                    ipfsHash
                )
            ) {

                throw new Error(
                    `The Graph query-activity response returned unexpected deployment ${ipfsHash}.`
                );

            }


            if (
                seen.has(
                    ipfsHash
                )
            ) {

                throw new Error(
                    `The Graph query-activity response returned duplicate deployment ${ipfsHash}.`
                );

            }


            seen.add(
                ipfsHash
            );


            if (
                !safeNonNegativeInteger(
                    deploymentRecord.data_points_count
                )
            ) {

                throw new Error(
                    `The Graph query-activity deployment ${ipfsHash} has invalid data_points_count.`
                );

            }


            if (
                !safeNonNegativeInteger(
                    deploymentRecord.total_query_count
                )
            ) {

                throw new Error(
                    `The Graph query-activity deployment ${ipfsHash} has invalid total_query_count.`
                );

            }


            const rawFragment =
                canonicalize(
                    deploymentRecord
                );

            const fragmentHash =
                sha256(
                    rawFragment
                );


            activityByIpfsHash.set(

                ipfsHash,

                {

                    ipfsHash,

                    dataPointsCount:
                        deploymentRecord.data_points_count,

                    totalQueryCount:
                        deploymentRecord.total_query_count,

                    rawFragment,

                    fragmentHash

                }

            );

        }


        if (
            seen.size !==
            requestedSet.size
        ) {

            const missing =
                uniqueIpfsHashes.filter(
                    ipfsHash =>
                        !seen.has(
                            ipfsHash
                        )
                );


            throw new Error(
                `The Graph query-activity response omitted requested deployments: ${missing.join(", ")}.`
            );

        }


        return activityByIpfsHash;

    }

}