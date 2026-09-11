import {
    ScientificTheGraphProductDiscoveryEngine
} from "../laboratory/scientific-the-graph-product-discovery/ScientificTheGraphProductDiscoveryEngine.js";

import {
    ScientificTheGraphSubgraphMcpLiveClient
} from "../laboratory/scientific-the-graph-subgraph-mcp/ScientificTheGraphSubgraphMcpClient.js";

import {
    ScientificTheGraphSubgraphMcpKeywordProvider
} from "../laboratory/scientific-the-graph-subgraph-mcp/ScientificTheGraphSubgraphMcpKeywordProvider.js";


const apiKey =
    process.env.THE_GRAPH_API_KEY
        ?.trim();


if (
    apiKey ===
        undefined ||
    apiKey.length ===
        0
) {

    throw new Error(
        "THE_GRAPH_API_KEY is required."
    );

}


const trustlessRevision =
    "01283ca57305f915afb560d23359a27fd748eb5a";

const erc8060Revision =
    "c7eed906835ab39fbc8439eb0493e5a5371b23a2";


const profiles:
    any[] = [

        {
            profileId:
                "LIVE-DISCOVERY-ERC-8060",
            protocolId:
                "ERC-8060",
            sourceId:
                "GITHUB-TEN-IO-META-ERC8060-NATIVE-ETH-VALUE",
            sourceRevision:
                erc8060Revision,
            attributedContainerSymbols:
                [],
            contributions:
                [],
            boundaries:
                [],
            needs:
                []
        },

        ...[
            "ERC-8263",
            "ERC-8274",
            "ERC-8275",
            "ERC-8301",
            "ERC-8312",
            "ERC-8354"
        ].map(
            protocolId => ({
                profileId:
                    `LIVE-DISCOVERY-${protocolId}`,
                protocolId,
                sourceId:
                    "GITHUB-TRUSTLESS-AI-AGENT-ERCS",
                sourceRevision:
                    trustlessRevision,
                attributedContainerSymbols:
                    [],
                contributions:
                    [],
                boundaries:
                    [],
                needs:
                    []
            })
        )

    ];


const plan =
    new ScientificTheGraphProductDiscoveryEngine()
        .plan(
            profiles
        );


if (
    plan.errors.length >
    0
) {

    throw new Error(
        plan.errors.join(
            "\n"
        )
    );

}


const client =
    new ScientificTheGraphSubgraphMcpLiveClient(
        apiKey
    );


try {

    const result =
        await new ScientificTheGraphSubgraphMcpKeywordProvider(
            client,
            "LIVE"
        )
            .discover(
                plan.requests
            );


    if (
        result.errors.length >
        0
    ) {

        throw new Error(
            result.errors.join(
                "\n"
            )
        );

    }


    console.log("");
    console.log(
        "LIVE THE GRAPH — GENERIC ERC PRODUCT DISCOVERY"
    );
    console.log(
        "================================================"
    );


    const protocolIds =
        profiles
            .map(
                profile =>
                    profile.protocolId
            )
            .sort();


    let totalHits =
        0;


    for (
        const protocolId
        of protocolIds
    ) {

        const searches =
            result.searches
                .filter(
                    search =>
                        search.protocolId ===
                        protocolId
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        a.searchTerm.localeCompare(
                            b.searchTerm
                        )
                );


        console.log("");
        console.log(
            protocolId
        );


        const distinctSubgraphs =
            new Set<string>();


        for (
            const search
            of searches
        ) {

            console.log(
                `  ${search.searchTerm}: returned=${search.returned} total=${search.total} mode=${search.providerMode}`
            );


            for (
                const hit
                of search.hits
            ) {

                totalHits++;

                distinctSubgraphs.add(
                    hit.subgraphId
                );


                console.log(
                    `    rank=${hit.providerRank} name=${hit.displayName}`
                );

                console.log(
                    `    subgraph=${hit.subgraphId}`
                );

                console.log(
                    `    ipfs=${hit.ipfsHash}`
                );

            }

        }


        console.log(
            `  distinct discovered subgraphs: ${distinctSubgraphs.size}`
        );

    }


    const serialized =
        JSON.stringify(
            result
        );


    if (
        serialized.includes(
            apiKey
        )
    ) {

        throw new Error(
            "API key leaked into scientific MCP output."
        );

    }


    if (
        serialized.includes(
            "scientificPolarity"
        ) ||
        serialized.includes(
            "compatibilityPolarity"
        ) ||
        serialized.includes(
            '"SUPPORT"'
        ) ||
        serialized.includes(
            '"CHALLENGE"'
        )
    ) {

        throw new Error(
            "MCP discovery attempted to manufacture scientific polarity."
        );

    }


    console.log("");
    console.log(
        "SUMMARY"
    );
    console.log(
        "-------"
    );

    console.log(
        `protocols searched: ${protocolIds.length}`
    );

    console.log(
        `keyword searches:   ${result.searches.length}`
    );

    console.log(
        `raw search hits:    ${totalHits}`
    );

    console.log("");
    console.log(
        "Zero results mean only that no Subgraph display name matched the requested protocol alias."
    );

    console.log(
        "Any returned hit remains a discovery observation only and must pass query-volume and schema inspection before selection."
    );

    console.log("");
    console.log(
        "RESULT: PASS"
    );

}
finally {

    await client.close();

}