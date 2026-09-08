import {
    ScientificTheGraphGatewayProvider
} from "../laboratory/scientific-the-graph-provider/ScientificTheGraphGatewayProvider.js";

import {
    AGENT0_BASE_MAINNET_SUBGRAPH_ID,
    ScientificAgent0Erc8004Adapter
} from "../laboratory/scientific-the-graph-agent0/ScientificAgent0Erc8004Adapter.js";


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

    if (condition) {
        pass++;
    }
    else {
        fail++;
    }

}


const apiKey =
    process.env.THE_GRAPH_API_KEY
        ?.trim();


if (
    !apiKey
) {

    throw new Error(
        "THE_GRAPH_API_KEY environment variable is required for the live Agent0 validation."
    );

}


const document = `
query OECLAgent0BaseEvidence {
    agents(first: 5) {
        id
        chainId
        agentId
        owner
        agentURI
        createdAt
        updatedAt
        totalFeedback
        lastActivity
    }

    _meta {
        block {
            number
            hash
        }
        deployment
        hasIndexingErrors
    }
}
`;


const provider =
    new ScientificTheGraphGatewayProvider();


const queryResult =
    await provider.query({

        subgraphId:
            AGENT0_BASE_MAINNET_SUBGRAPH_ID,

        network:
            "base",

        chainId:
            "8453",

        apiKey,

        document,

        variables:
            {},

        schemaId:
            "AGENT0-ERC8004",

        timeoutMs:
            30_000

    });


const adapter =
    new ScientificAgent0Erc8004Adapter();


const adapted =
    adapter.adapt(
        queryResult
    );


console.log("");
console.log(
    "LIVE THE GRAPH — AGENT0 ERC-8004 BASE"
);
console.log(
    "======================================"
);


check(
    "THE GRAPH PROVIDER IS LIVE",
    queryResult.providerMode ===
        "LIVE"
);


check(
    "LIVE GRAPH QUERY HAS NO ERRORS",
    queryResult.errors.length ===
        0
);


check(
    "LIVE QUERY RETURNED HTTP 2XX",
    queryResult.httpStatus !==
        null &&
    queryResult.httpStatus >=
        200 &&
    queryResult.httpStatus <
        300
);


check(
    "LIVE QUERY HAS INDEXED BLOCK",
    (
        queryResult.query
            ?.indexedBlock
            .number ??
        -1
    ) >
        0
);


check(
    "AGENT0 ADAPTER HAS NO ERRORS",
    adapted.errors.length ===
        0
);


check(
    "LIVE AGENT0 RETURNS INDEXED AGENTS",
    adapted.agentIds.length >
        0
);


check(
    "LIVE AGENTS BECOME GRAPH EVIDENCE",
    adapted.graphEvidence
        ?.evidence
        .length ===
        adapted.agentIds.length &&
    adapted.agentIds.length >
        0
);


check(
    "EVIDENCE IS MARKED LIVE",
    adapted.graphEvidence
        ?.source
        ?.providerMode ===
        "LIVE"
);


check(
    "EVIDENCE IS BASE MAINNET",
    adapted.graphEvidence
        ?.source
        ?.network ===
        "base" &&
    adapted.graphEvidence
        ?.source
        ?.chainId ===
        "8453"
);


console.log("");
console.log(
    `subgraph:       ${queryResult.productId}`
);

console.log(
    `deployment:     ${queryResult.deploymentId ?? "NOT_EXPOSED"}`
);

console.log(
    `indexed block:  ${queryResult.query?.indexedBlock.number ?? "NONE"}`
);

console.log(
    `agents:         ${adapted.agentIds.length}`
);

console.log(
    `evidence items: ${adapted.graphEvidence?.evidence.length ?? 0}`
);


for (
    const evidence
    of (
        adapted.graphEvidence
            ?.evidence ??
        []
    ).slice(
        0,
        5
    )
) {

    console.log("");
    console.log(
        `  AGENT ${evidence.entityId}`
    );

    console.log(
        `    evidence: ${evidence.evidenceId}`
    );

    console.log(
        `    fragment hash: ${evidence.fragmentHash}`
    );

}


const serialized =
    JSON.stringify(
        adapted
    );


check(
    "LIVE GRAPH EVIDENCE CONTAINS NO SCIENTIFIC POLARITY",
    !serialized.includes(
        "scientificPolarity"
    ) &&
    !serialized.includes(
        "compatibilityPolarity"
    ) &&
    !serialized.includes(
        '"FULL"'
    ) &&
    !serialized.includes(
        '"PARTIAL"'
    ) &&
    !serialized.includes(
        '"CHALLENGED"'
    )
);


check(
    "API KEY IS ABSENT FROM SCIENTIFIC OUTPUT",
    !serialized.includes(
        apiKey
    )
);


console.log("");
console.log(
    "SCIENTIFIC INTERPRETATION"
);
console.log(
    "-------------------------"
);
console.log(
    "The Graph supplied live indexed ERC-8004 state."
);
console.log(
    "This observation alone does not establish cross-protocol compatibility or composition."
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