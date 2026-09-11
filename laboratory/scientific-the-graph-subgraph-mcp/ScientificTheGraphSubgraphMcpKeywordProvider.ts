import {
    createHash
} from "node:crypto";

import type {
    ScientificTheGraphProviderMode
} from "../scientific-the-graph-evidence/ScientificTheGraphEvidence.js";

import type {
    ScientificTheGraphProductDiscoveryRequest
} from "../scientific-the-graph-product-discovery/ScientificTheGraphProductDiscovery.js";

import type {
    ScientificTheGraphSubgraphMcpToolClient
} from "./ScientificTheGraphSubgraphMcpClient.js";

import type {
    ScientificTheGraphSubgraphMcpKeywordDiscoveryResult,
    ScientificTheGraphSubgraphMcpKeywordHit,
    ScientificTheGraphSubgraphMcpKeywordSearch
} from "./ScientificTheGraphSubgraphMcp.js";


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


interface ParsedSearchPayload {

    returned:
        number;

    total:
        number;

    subgraphs:
        Record<string, unknown>[];

}


export class ScientificTheGraphSubgraphMcpKeywordProvider {

    constructor(
        private readonly client:
            ScientificTheGraphSubgraphMcpToolClient,
        private readonly providerMode:
            ScientificTheGraphProviderMode
    ) {}


    async discover(
        requests:
            ScientificTheGraphProductDiscoveryRequest[]
    ): Promise<ScientificTheGraphSubgraphMcpKeywordDiscoveryResult> {

        const errors:
            string[] =
            [];

        const searches:
            ScientificTheGraphSubgraphMcpKeywordSearch[] =
            [];

        const requestIds =
            new Set<string>();


        for (
            const request
            of requests
        ) {

            if (
                requestIds.has(
                    request.requestId
                )
            ) {

                errors.push(
                    `Duplicate MCP discovery request ${request.requestId}.`
                );

                continue;

            }


            requestIds.add(
                request.requestId
            );


            for (
                const searchTerm
                of request.searchTerms
            ) {

                try {

                    const search =
                        await this.search(
                            request,
                            searchTerm
                        );

                    searches.push(
                        search
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

        }


        if (
            errors.length >
            0
        ) {

            return {

                searches:
                    [],

                errors:
                    uniqueSorted(
                        errors
                    )

            };

        }


        return {

            searches:
                searches.sort(
                    (
                        a,
                        b
                    ) =>
                        a.searchId.localeCompare(
                            b.searchId
                        )
                ),

            errors:
                []

        };

    }


    private async search(
        request:
            ScientificTheGraphProductDiscoveryRequest,
        searchTerm:
            string
    ): Promise<ScientificTheGraphSubgraphMcpKeywordSearch> {

        if (
            searchTerm.trim().length ===
            0
        ) {

            throw new Error(
                `MCP discovery request ${request.requestId} contains an empty search term.`
            );

        }


        const result =
            await this.client.callTool(

                "search_subgraphs_by_keyword",

                {

                    keyword:
                        searchTerm

                }

            );


        if (
            result.isError ===
            true
        ) {

            throw new Error(
                `Subgraph MCP keyword search failed for ${request.protocolId} term ${searchTerm}.`
            );

        }


        const payload =
            this.parsePayload(
                result.content,
                request.protocolId,
                searchTerm
            );


        const seenSubgraphIds =
            new Set<string>();

        const hits:
            ScientificTheGraphSubgraphMcpKeywordHit[] =
            [];


        for (
            let index =
                0;
            index <
                payload.subgraphs.length;
            index++
        ) {

            const subgraph =
                payload.subgraphs[index];


            const subgraphId =
                subgraph.id;


            const metadata =
                subgraph.metadata;

            const metadataRecord =
                (
                    metadata !==
                        null &&
                    typeof metadata ===
                        "object" &&
                    !Array.isArray(
                        metadata
                    )
                )
                    ? metadata as
                        Record<string, unknown>
                    : null;


            const currentVersion =
                subgraph.currentVersion;

            const currentVersionRecord =
                (
                    currentVersion !==
                        null &&
                    typeof currentVersion ===
                        "object" &&
                    !Array.isArray(
                        currentVersion
                    )
                )
                    ? currentVersion as
                        Record<string, unknown>
                    : null;


            const subgraphDeployment =
                currentVersionRecord
                    ?.subgraphDeployment;

            const deploymentRecord =
                (
                    subgraphDeployment !==
                        null &&
                    typeof subgraphDeployment ===
                        "object" &&
                    !Array.isArray(
                        subgraphDeployment
                    )
                )
                    ? subgraphDeployment as
                        Record<string, unknown>
                    : null;


            const displayName =
                metadataRecord
                    ?.displayName;

            const ipfsHash =
                deploymentRecord
                    ?.ipfsHash;


            if (
                !nonEmpty(
                    subgraphId
                )
            ) {

                throw new Error(
                    `Subgraph MCP result for ${request.protocolId} term ${searchTerm} has no valid subgraph id.`
                );

            }


            if (
                seenSubgraphIds.has(
                    subgraphId
                )
            ) {

                throw new Error(
                    `Subgraph MCP returned duplicate subgraph ${subgraphId} for ${request.protocolId} term ${searchTerm}.`
                );

            }


            seenSubgraphIds.add(
                subgraphId
            );


            if (
                !nonEmpty(
                    displayName
                )
            ) {

                throw new Error(
                    `Subgraph MCP result ${subgraphId} has no displayName.`
                );

            }


            if (
                !nonEmpty(
                    ipfsHash
                ) ||
                !ipfsHash.startsWith(
                    "Qm"
                )
            ) {

                throw new Error(
                    `Subgraph MCP result ${subgraphId} has no valid current IPFS hash.`
                );

            }


            const rawFragment =
                canonicalize(
                    subgraph
                );

            const fragmentHash =
                sha256(
                    rawFragment
                );

            const providerRank =
                index +
                1;


            const hitId =
                encode([
                    "SCIENTIFIC-THE-GRAPH-SUBGRAPH-MCP-KEYWORD-HIT",
                    request.requestId,
                    searchTerm,
                    subgraphId,
                    ipfsHash,
                    String(
                        providerRank
                    ),
                    fragmentHash
                ]);


            hits.push({

                hitId,

                subgraphId,

                displayName,

                ipfsHash,

                providerRank,

                rawFragment,

                fragmentHash

            });

        }


        const searchId =
            encode([
                "SCIENTIFIC-THE-GRAPH-SUBGRAPH-MCP-KEYWORD-SEARCH",
                request.requestId,
                request.protocolId,
                searchTerm,
                this.providerMode,
                String(
                    payload.returned
                ),
                String(
                    payload.total
                ),
                ...hits.map(
                    hit =>
                        hit.hitId
                )
            ]);


        return {

            searchId,

            requestId:
                request.requestId,

            protocolId:
                request.protocolId,

            searchTerm,

            provider:
                "THE_GRAPH",

            providerMode:
                this.providerMode,

            discoveryProductKind:
                "SUBGRAPH_MCP",

            toolName:
                "search_subgraphs_by_keyword",

            returned:
                payload.returned,

            total:
                payload.total,

            hits,

            status:
                "OBSERVED"

        };

    }


    private parsePayload(
        content:
            unknown,
        protocolId:
            string,
        searchTerm:
            string
    ): ParsedSearchPayload {

        if (
            !Array.isArray(
                content
            )
        ) {

            throw new Error(
                `Subgraph MCP search for ${protocolId} term ${searchTerm} returned no content array.`
            );

        }


        const textItems =
            content.filter(
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
                `Subgraph MCP search for ${protocolId} term ${searchTerm} returned ${textItems.length} text payloads instead of exactly one.`
            );

        }


        const text =
            (
                textItems[0] as
                    Record<string, unknown>
            ).text as
                string;


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
                `Subgraph MCP search for ${protocolId} term ${searchTerm} returned invalid JSON.`
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
                `Subgraph MCP search for ${protocolId} term ${searchTerm} returned an invalid payload object.`
            );

        }


        const record =
            parsed as
                Record<string, unknown>;


        if (
            !Number.isInteger(
                record.returned
            ) ||
            (
                record.returned as
                    number
            ) <
                0
        ) {

            throw new Error(
                `Subgraph MCP search for ${protocolId} term ${searchTerm} returned an invalid returned count.`
            );

        }


        if (
            !Number.isInteger(
                record.total
            ) ||
            (
                record.total as
                    number
            ) <
                0
        ) {

            throw new Error(
                `Subgraph MCP search for ${protocolId} term ${searchTerm} returned an invalid total count.`
            );

        }


        if (
            !Array.isArray(
                record.subgraphs
            )
        ) {

            throw new Error(
                `Subgraph MCP search for ${protocolId} term ${searchTerm} returned no subgraphs array.`
            );

        }


        const subgraphs =
            record.subgraphs;


        if (
            record.returned !==
            subgraphs.length
        ) {

            throw new Error(
                `Subgraph MCP search for ${protocolId} term ${searchTerm} returned count does not match subgraph array length.`
            );

        }


        if (
            (
                record.total as
                    number
            ) <
            (
                record.returned as
                    number
            )
        ) {

            throw new Error(
                `Subgraph MCP search for ${protocolId} term ${searchTerm} has total smaller than returned.`
            );

        }


        if (
            !subgraphs.every(
                subgraph =>
                    subgraph !==
                        null &&
                    typeof subgraph ===
                        "object" &&
                    !Array.isArray(
                        subgraph
                    )
            )
        ) {

            throw new Error(
                `Subgraph MCP search for ${protocolId} term ${searchTerm} contains a non-object subgraph.`
            );

        }


        return {

            returned:
                record.returned as
                    number,

            total:
                record.total as
                    number,

            subgraphs:
                subgraphs as
                    Record<string, unknown>[]

        };

    }

}