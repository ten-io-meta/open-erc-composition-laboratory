import {
    AGENT0_BASE_MAINNET_SUBGRAPH_ID
} from "../laboratory/scientific-the-graph-agent0/ScientificAgent0Erc8004Adapter.js";

import {
    ScientificTheGraphSubgraphMcpLiveClient
} from "../laboratory/scientific-the-graph-subgraph-mcp/ScientificTheGraphSubgraphMcpClient.js";

import {
    ScientificTheGraphSubgraphInspectionEngine
} from "../laboratory/scientific-the-graph-subgraph-inspection/ScientificTheGraphSubgraphInspectionEngine.js";


const AGENT0_DEPLOYMENT_IPFS =
    "QmcLwgyKn3RnyhkkSwLYscP9dL1Fc6omvfC9bFRgcK1e7u";


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


const client =
    new ScientificTheGraphSubgraphMcpLiveClient(
        apiKey
    );


try {

    const result =
        await new ScientificTheGraphSubgraphInspectionEngine(
            client,
            "LIVE"
        )
            .inspect([
                {
                    requestId:
                        "LIVE-AGENT0-ERC8004-INSPECTION",

                    subgraphId:
                        AGENT0_BASE_MAINNET_SUBGRAPH_ID,

                    ipfsHash:
                        AGENT0_DEPLOYMENT_IPFS
                }
            ]);


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


    if (
        result.inspections.length !==
        1
    ) {

        throw new Error(
            `Expected one LIVE Agent0 inspection, found ${result.inspections.length}.`
        );

    }


    const inspection =
        result.inspections[0];


    if (
        inspection.providerMode !==
        "LIVE"
    ) {

        throw new Error(
            "Agent0 inspection is not LIVE."
        );

    }


    if (
        inspection.subgraphId !==
        AGENT0_BASE_MAINNET_SUBGRAPH_ID
    ) {

        throw new Error(
            "Agent0 inspection changed subgraph identity."
        );

    }


    if (
        inspection.ipfsHash !==
        AGENT0_DEPLOYMENT_IPFS
    ) {

        throw new Error(
            "Agent0 inspection changed deployment identity."
        );

    }


    if (
        !inspection.schemaObservation.schemaText.includes(
            "type Agent "
        )
    ) {

        throw new Error(
            "Agent0 deployment schema does not expose Agent entity."
        );

    }


    if (
        !inspection.schemaObservation.schemaText.includes(
            "ERC-8004"
        )
    ) {

        throw new Error(
            "Agent0 deployment schema does not contain explicit ERC-8004 text."
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
            "API key leaked into subgraph inspection output."
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
            "Subgraph inspection manufactured scientific polarity."
        );

    }


    console.log("");
    console.log(
        "LIVE THE GRAPH SUBGRAPH INSPECTION"
    );
    console.log(
        "=================================="
    );

    console.log(
        `status:              ${inspection.status}`
    );

    console.log(
        `provider mode:       ${inspection.providerMode}`
    );

    console.log(
        `subgraph:            ${inspection.subgraphId}`
    );

    console.log(
        `deployment IPFS:     ${inspection.ipfsHash}`
    );

    console.log(
        `schema hash:         ${inspection.schemaObservation.schemaHash}`
    );

    console.log(
        `schema bytes:        ${Buffer.byteLength(inspection.schemaObservation.schemaText, "utf8")}`
    );

    console.log(
        `30d data points:     ${inspection.queryActivityObservation.dataPointsCount}`
    );

    console.log(
        `30d query count:     ${inspection.queryActivityObservation.totalQueryCount}`
    );

    console.log(
        `activity status:     ${inspection.queryActivityObservation.activityStatus}`
    );

    console.log(
        `next action:         ${inspection.nextAction}`
    );


    console.log("");
    console.log(
        "SCIENTIFIC INTERPRETATION"
    );
    console.log(
        "-------------------------"
    );

    console.log(
        "The exact Agent0 deployment has a retrievable schema and query-activity observation."
    );

    console.log(
        "Zero recent query volume, if observed, does not invalidate the data source."
    );

    console.log(
        "INSPECTED does not establish protocol attribution, compatibility or composition."
    );


    console.log("");
    console.log(
        "RESULT: PASS"
    );

}
finally {

    await client.close();

}