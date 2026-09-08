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


const ownerA =
    "0x" +
    "11".repeat(
        20
    );

const ownerB =
    "0x" +
    "22".repeat(
        20
    );

const blockHash =
    "0x" +
    "33".repeat(
        32
    );


const fixture:
    any = {

        provider:
            "THE_GRAPH",

        providerMode:
            "FIXTURE",

        productKind:
            "SUBGRAPH",

        productId:
            AGENT0_BASE_MAINNET_SUBGRAPH_ID,

        network:
            "base",

        chainId:
            "8453",

        deploymentId:
            "QmFixture",

        schemaId:
            "AGENT0-ERC8004",

        endpoint:
            "https://gateway.thegraph.com/api/subgraphs/id/FIXTURE",

        httpStatus:
            200,

        query: {

            document:
                "query Fixture { agents { id } }",

            variables:
                {},

            response: {

                data: {

                    agents: [

                        {
                            id:
                                "8453:1",

                            chainId:
                                "8453",

                            agentId:
                                "1",

                            owner:
                                ownerA,

                            agentURI:
                                "ipfs://agent-a",

                            createdAt:
                                "1",

                            updatedAt:
                                "2",

                            totalFeedback:
                                "3",

                            lastActivity:
                                "4"
                        },

                        {
                            id:
                                "8453:2",

                            chainId:
                                "8453",

                            agentId:
                                "2",

                            owner:
                                ownerB,

                            agentURI:
                                "ipfs://agent-b",

                            createdAt:
                                "5",

                            updatedAt:
                                "6",

                            totalFeedback:
                                "7",

                            lastActivity:
                                "8"
                        }

                    ],

                    _meta: {

                        block: {

                            number:
                                123456,

                            hash:
                                blockHash

                        },

                        deployment:
                            "QmFixture",

                        hasIndexingErrors:
                            false

                    }

                }

            },

            fetchedAt:
                "2026-09-08T20:30:00Z",

            indexedBlock: {

                number:
                    123456,

                hash:
                    blockHash

            }

        },

        errors:
            []

    };


const adapter =
    new ScientificAgent0Erc8004Adapter();


const result =
    adapter.adapt(
        fixture
    );


console.log("");
console.log(
    "SCIENTIFIC AGENT0 ERC-8004 ADAPTER"
);
console.log(
    "----------------------------------"
);


check(
    "VALID AGENT0 FIXTURE HAS NO ERRORS",
    result.errors.length ===
        0
);


check(
    "TWO AGENTS BECOME TWO EVIDENCE ITEMS",
    result.graphEvidence
        ?.evidence
        .length ===
        2
);


check(
    "AGENT IDENTITIES ARE PRESERVED",
    JSON.stringify(
        result.agentIds
    ) ===
        JSON.stringify([
            "8453:1",
            "8453:2"
        ])
);


check(
    "GRAPH EVIDENCE PRESERVES FIXTURE MODE",
    result.graphEvidence
        ?.source
        ?.providerMode ===
        "FIXTURE"
);


check(
    "GRAPH EVIDENCE PRESERVES BASE CHAIN",
    result.graphEvidence
        ?.source
        ?.network ===
        "base" &&
    result.graphEvidence
        ?.source
        ?.chainId ===
        "8453"
);


check(
    "GRAPH EVIDENCE PRESERVES DEPLOYMENT",
    result.graphEvidence
        ?.source
        ?.deploymentId ===
        "QmFixture"
);


check(
    "AGENT RAW FRAGMENT IS PRESERVED",
    result.graphEvidence
        ?.evidence
        .some(
            evidence =>
                evidence.entityId ===
                    "8453:1" &&
                evidence.rawFragment.includes(
                    ownerA
                )
        ) ===
        true
);


const wrongChain =
    adapter.adapt({

        ...fixture,

        query: {

            ...fixture.query,

            response: {

                data: {

                    agents: [

                        {
                            ...fixture.query.response.data.agents[0],

                            chainId:
                                "1"

                        }

                    ]

                }

            }

        }

    });


check(
    "WRONG AGENT CHAIN FAILS CLOSED",
    wrongChain.errors.length >
        0
);


const duplicate =
    adapter.adapt({

        ...fixture,

        query: {

            ...fixture.query,

            response: {

                data: {

                    agents: [
                        fixture.query.response.data.agents[0],
                        fixture.query.response.data.agents[0]
                    ]

                }

            }

        }

    });


check(
    "DUPLICATE AGENT ID FAILS CLOSED",
    duplicate.errors.length >
        0
);


const wrongProduct =
    adapter.adapt({

        ...fixture,

        productId:
            "ANOTHER-SUBGRAPH"

    });


check(
    "WRONG SUBGRAPH FAILS CLOSED",
    wrongProduct.errors.length >
        0
);


const serialized =
    JSON.stringify(
        result
    );


check(
    "AGENT0 ADAPTER DOES NOT INVENT SCIENTIFIC POLARITY",
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