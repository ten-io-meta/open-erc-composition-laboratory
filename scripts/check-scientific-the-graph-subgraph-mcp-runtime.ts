import {
    ScientificTheGraphProductDiscoveryEngine
} from "../laboratory/scientific-the-graph-product-discovery/ScientificTheGraphProductDiscoveryEngine.js";

import type {
    ScientificTheGraphSubgraphMcpToolCallResult,
    ScientificTheGraphSubgraphMcpToolClient
} from "../laboratory/scientific-the-graph-subgraph-mcp/ScientificTheGraphSubgraphMcpClient.js";

import {
    ScientificTheGraphSubgraphMcpKeywordProvider
} from "../laboratory/scientific-the-graph-subgraph-mcp/ScientificTheGraphSubgraphMcpKeywordProvider.js";


let pass =
    0;

let fail =
    0;


function check(
    name:
        string,
    condition:
        boolean
): void {

    console.log(
        `${name}: ${condition ? "PASS" : "FAIL"}`
    );

    if (
        condition
    ) {
        pass++;
    }
    else {
        fail++;
    }

}


class FixtureClient
implements ScientificTheGraphSubgraphMcpToolClient {

    constructor(
        private readonly handler:
            (
                name:
                    string,
                args:
                    Record<string, unknown>
            ) =>
                ScientificTheGraphSubgraphMcpToolCallResult
    ) {}


    async callTool(
        name:
            string,
        args:
            Record<string, unknown>
    ): Promise<ScientificTheGraphSubgraphMcpToolCallResult> {

        return this.handler(
            name,
            args
        );

    }


    async close():
        Promise<void> {}

}


const profiles:
    any[] = [

        {
            profileId:
                "PROFILE-ERC-8301",

            protocolId:
                "ERC-8301",

            sourceId:
                "GITHUB-AGENT-ERCS",

            sourceRevision:
                "REV-AGENTS",

            attributedContainerSymbols:
                [],

            contributions:
                [],

            boundaries:
                [],

            needs:
                []
        }

    ];


const plan =
    new ScientificTheGraphProductDiscoveryEngine()
        .plan(
            profiles
        );


const validClient =
    new FixtureClient(
        (
            name,
            args
        ) => {

            if (
                name !==
                "search_subgraphs_by_keyword"
            ) {

                return {
                    isError:
                        true,
                    content:
                        []
                };

            }


            const keyword =
                String(
                    args.keyword
                );


            if (
                keyword ===
                "ERC-8301"
            ) {

                return {

                    isError:
                        false,

                    content: [

                        {
                            type:
                                "text",

                            text:
                                JSON.stringify({

                                    returned:
                                        2,

                                    total:
                                        2,

                                    subgraphs: [

                                        {
                                            id:
                                                "SUBGRAPH-A",

                                            displayName:
                                                "ERC-8301 Alpha",

                                            ipfsHash:
                                                "Qm11111111111111111111111111111111111111111111"
                                        },

                                        {
                                            id:
                                                "SUBGRAPH-B",

                                            displayName:
                                                "ERC-8301 Beta",

                                            ipfsHash:
                                                "Qm22222222222222222222222222222222222222222222"
                                        }

                                    ]

                                })

                        }

                    ]

                };

            }


            return {

                isError:
                    false,

                content: [

                    {
                        type:
                            "text",

                        text:
                            JSON.stringify({

                                returned:
                                    0,

                                total:
                                    0,

                                subgraphs:
                                    []

                            })

                    }

                ]

            };

        }
    );


const provider =
    new ScientificTheGraphSubgraphMcpKeywordProvider(
        validClient,
        "FIXTURE"
    );


const result =
    await provider.discover(
        plan.requests
    );


console.log("");
console.log(
    "SCIENTIFIC THE GRAPH SUBGRAPH MCP"
);
console.log(
    "================================="
);


check(
    "MCP DISCOVERY HAS NO ERRORS",
    result.errors.length ===
        0
);


check(
    "ONE SEARCH IS RECORDED PER SEARCH TERM",
    result.searches.length ===
        2
);


const exactSearch =
    result.searches.find(
        search =>
            search.searchTerm ===
            "ERC-8301"
    )!;


const compactSearch =
    result.searches.find(
        search =>
            search.searchTerm ===
            "ERC8301"
    )!;


check(
    "EXACT SEARCH NORMALIZES TWO HITS",
    exactSearch.returned ===
        2 &&
    exactSearch.total ===
        2 &&
    exactSearch.hits.length ===
        2
);


check(
    "ZERO RESULT SEARCH IS PRESERVED",
    compactSearch.returned ===
        0 &&
    compactSearch.total ===
        0 &&
    compactSearch.hits.length ===
        0
);


check(
    "SUBGRAPH IDENTITY IS PRESERVED",
    exactSearch.hits[0]
        .subgraphId ===
        "SUBGRAPH-A"
);


check(
    "CURRENT DEPLOYMENT IPFS HASH IS PRESERVED",
    exactSearch.hits[0]
        .ipfsHash ===
        "Qm11111111111111111111111111111111111111111111"
);


check(
    "PROVIDER RANK IS PRESERVED",
    exactSearch.hits[0]
        .providerRank ===
        1 &&
    exactSearch.hits[1]
        .providerRank ===
        2
);


check(
    "RAW PROVIDER FRAGMENT IS HASHED",
    exactSearch.hits.every(
        hit =>
            hit.fragmentHash.length ===
            64 &&
            hit.rawFragment.length >
            0
    )
);


check(
    "FIXTURE MODE IS EXPLICIT",
    result.searches.every(
        search =>
            search.providerMode ===
            "FIXTURE"
    )
);


check(
    "SEARCH STATUS IS OPERATIONAL ONLY",
    result.searches.every(
        search =>
            search.status ===
            "OBSERVED"
    )
);


const repeated =
    await new ScientificTheGraphSubgraphMcpKeywordProvider(
        validClient,
        "FIXTURE"
    )
        .discover(
            JSON.parse(
                JSON.stringify(
                    plan.requests
                )
            )
        );


check(
    "MCP NORMALIZATION IS DETERMINISTIC",
    JSON.stringify(
        repeated
    ) ===
        JSON.stringify(
            result
        )
);


const errorClient =
    new FixtureClient(
        () => ({
            isError:
                true,
            content:
                []
        })
    );


const errorResult =
    await new ScientificTheGraphSubgraphMcpKeywordProvider(
        errorClient,
        "FIXTURE"
    )
        .discover(
            [
                plan.requests[0]
            ]
        );


check(
    "MCP TOOL ERROR FAILS CLOSED",
    errorResult.errors.length >
        0 &&
    errorResult.searches.length ===
        0
);


const malformedClient =
    new FixtureClient(
        () => ({
            isError:
                false,
            content: [
                {
                    type:
                        "text",
                    text:
                        "{invalid-json"
                }
            ]
        })
    );


const malformedResult =
    await new ScientificTheGraphSubgraphMcpKeywordProvider(
        malformedClient,
        "FIXTURE"
    )
        .discover(
            [
                plan.requests[0]
            ]
        );


check(
    "MALFORMED MCP JSON FAILS CLOSED",
    malformedResult.errors.length >
        0
);


const mismatchClient =
    new FixtureClient(
        () => ({
            isError:
                false,
            content: [
                {
                    type:
                        "text",
                    text:
                        JSON.stringify({
                            returned:
                                2,
                            total:
                                2,
                            subgraphs:
                                []
                        })
                }
            ]
        })
    );


const mismatchResult =
    await new ScientificTheGraphSubgraphMcpKeywordProvider(
        mismatchClient,
        "FIXTURE"
    )
        .discover(
            [
                plan.requests[0]
            ]
        );


check(
    "RETURNED COUNT MISMATCH FAILS CLOSED",
    mismatchResult.errors.length >
        0
);


const serialized =
    JSON.stringify(
        result
    );


check(
    "MCP DISCOVERY CONTAINS NO SCIENTIFIC POLARITY",
    !serialized.includes(
        "scientificPolarity"
    ) &&
    !serialized.includes(
        "compatibilityPolarity"
    ) &&
    !serialized.includes(
        '"SUPPORT"'
    ) &&
    !serialized.includes(
        '"CHALLENGE"'
    ) &&
    !serialized.includes(
        '"FULL"'
    ) &&
    !serialized.includes(
        '"PARTIAL"'
    )
);


console.log("");
console.log(
    `PASS: ${pass}`
);
console.log(
    `FAIL: ${fail}`
);
console.log(
    `RESULT: ${fail === 0 ? "PASS" : "FAIL"}`
);


if (
    fail >
    0
) {
    process.exitCode =
        1;
}