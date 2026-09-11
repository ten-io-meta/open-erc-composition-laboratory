import {
    AGENT0_BASE_MAINNET_SUBGRAPH_ID
} from "../laboratory/scientific-the-graph-agent0/ScientificAgent0Erc8004Adapter.js";

import {
    ScientificTheGraphSubgraphMcpLiveClient
} from "../laboratory/scientific-the-graph-subgraph-mcp/ScientificTheGraphSubgraphMcpClient.js";

import {
    ScientificTheGraphSubgraphInspectionEngine
} from "../laboratory/scientific-the-graph-subgraph-inspection/ScientificTheGraphSubgraphInspectionEngine.js";

import {
    ScientificTheGraphProtocolAttributionEngine
} from "../laboratory/scientific-the-graph-protocol-attribution/ScientificTheGraphProtocolAttributionEngine.js";


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


const realErc8004Profile:
    any =
    {

        profileId:
            "REAL-GITHUB-ERC8004-PROFILE",

        protocolId:
            "ERC-8004",

        sourceId:
            "GITHUB-ERC-8004-ERC-8004-CONTRACTS",

        sourceRevision:
            "b9e466c250744a7e06b13dff9d3c2844ed64f825",

        attributedContainerSymbols:
            [],

        contributions:
            [],

        boundaries:
            [],

        needs:
            []

    };


const client =
    new ScientificTheGraphSubgraphMcpLiveClient(
        apiKey
    );


try {

    const inspectionResult =
        await new ScientificTheGraphSubgraphInspectionEngine(
            client,
            "LIVE"
        )
            .inspect([
                {
                    requestId:
                        "LIVE-AGENT0-ERC8004-ATTRIBUTION-INSPECTION",

                    subgraphId:
                        AGENT0_BASE_MAINNET_SUBGRAPH_ID,

                    ipfsHash:
                        AGENT0_DEPLOYMENT_IPFS
                }
            ]);


    if (
        inspectionResult.errors.length >
        0
    ) {

        throw new Error(
            inspectionResult.errors.join(
                "\n"
            )
        );

    }


    if (
        inspectionResult.inspections.length !==
        1
    ) {

        throw new Error(
            `Expected one Agent0 inspection, found ${inspectionResult.inspections.length}.`
        );

    }


    const attributionResult =
        new ScientificTheGraphProtocolAttributionEngine()
            .assess([
                {
                    profile:
                        realErc8004Profile,

                    inspection:
                        inspectionResult.inspections[0]
                }
            ]);


    if (
        attributionResult.errors.length >
        0
    ) {

        throw new Error(
            attributionResult.errors.join(
                "\n"
            )
        );

    }


    if (
        attributionResult.assessments.length !==
        1
    ) {

        throw new Error(
            `Expected one Agent0 attribution assessment, found ${attributionResult.assessments.length}.`
        );

    }


    const assessment =
        attributionResult.assessments[0];


    if (
        assessment.status !==
        "ATTRIBUTED"
    ) {

        throw new Error(
            "Agent0 schema was not explicitly attributed to ERC-8004."
        );

    }


    if (
        !assessment.matchedIdentifiers.some(
            match =>
                match.identifier ===
                "ERC-8004"
        )
    ) {

        throw new Error(
            "Agent0 attribution did not preserve exact ERC-8004 schema evidence."
        );

    }


    if (
        assessment.providerMode !==
        "LIVE"
    ) {

        throw new Error(
            "Agent0 protocol attribution is not LIVE."
        );

    }


    const inspection =
        inspectionResult.inspections[0];


    if (
        inspection.queryActivityObservation
            .totalQueryCount !==
            0
    ) {

        console.log(
            "NOTE: Agent0 query volume changed since the previous observation."
        );

    }


    const serialized =
        JSON.stringify(
            attributionResult
        );


    if (
        serialized.includes(
            apiKey
        )
    ) {

        throw new Error(
            "API key leaked into protocol attribution output."
        );

    }


    console.log("");
    console.log(
        "LIVE THE GRAPH PROTOCOL ATTRIBUTION"
    );
    console.log(
        "==================================="
    );

    console.log(
        `status:              ${assessment.status}`
    );

    console.log(
        `protocol:            ${assessment.protocolId}`
    );

    console.log(
        `GitHub source:       ${assessment.normativeSourceId}`
    );

    console.log(
        `GitHub revision:     ${assessment.normativeSourceRevision}`
    );

    console.log(
        `subgraph:            ${assessment.subgraphId}`
    );

    console.log(
        `deployment IPFS:     ${assessment.ipfsHash}`
    );

    console.log(
        `provider mode:       ${assessment.providerMode}`
    );

    console.log(
        `schema hash:         ${assessment.schemaHash}`
    );

    console.log(
        `identifiers checked: ${assessment.identifiersChecked.join(", ")}`
    );

    console.log(
        `matched identifiers: ${assessment.matchedIdentifiers.map(match => `${match.identifier}(${match.occurrenceCount})`).join(", ")}`
    );

    console.log(
        `30d query count:     ${inspection.queryActivityObservation.totalQueryCount}`
    );

    console.log(
        `attribution basis:   ${assessment.attributionBasis}`
    );

    console.log(
        `next action:         ${assessment.nextAction}`
    );


    console.log("");
    console.log(
        "SCIENTIFIC INTERPRETATION"
    );
    console.log(
        "-------------------------"
    );

    console.log(
        "The exact live Agent0 deployment schema explicitly identifies ERC-8004."
    );

    console.log(
        "Protocol attribution is source association only; no cross-protocol compatibility or composition is inferred."
    );

    console.log("");
    console.log(
        "RESULT: PASS"
    );

}
finally {

    await client.close();

}