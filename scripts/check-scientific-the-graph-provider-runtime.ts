import type {
    ScientificTheGraphHttpRequest,
    ScientificTheGraphHttpResponse,
    ScientificTheGraphTransport
} from "../laboratory/scientific-the-graph-provider/ScientificTheGraphProvider.js";

import {
    ScientificTheGraphGatewayProvider
} from "../laboratory/scientific-the-graph-provider/ScientificTheGraphGatewayProvider.js";


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


const blockHash =
    "0x" +
    "44".repeat(
        32
    );


class FixtureTransport
implements ScientificTheGraphTransport {

    public lastRequest:
        ScientificTheGraphHttpRequest | null =
        null;


    constructor(
        private readonly response:
            ScientificTheGraphHttpResponse
    ) {}


    async post(
        request:
            ScientificTheGraphHttpRequest
    ): Promise<ScientificTheGraphHttpResponse> {

        this.lastRequest =
            request;


        return this.response;

    }

}


const goodResponse = {

    status:
        200,

    body:
        JSON.stringify({

            data: {

                agents: [
                    {
                        id:
                            "8453:1",

                        owner:
                            "0x" +
                            "55".repeat(
                                20
                            )
                    }
                ],

                _meta: {

                    block: {

                        number:
                            12345678,

                        hash:
                            blockHash

                    },

                    deployment:
                        "QmFixtureDeployment",

                    hasIndexingErrors:
                        false

                }

            }

        })

};


const transport =
    new FixtureTransport(
        goodResponse
    );

const provider =
    new ScientificTheGraphGatewayProvider(
        transport
    );


const secret =
    "THIS-SECRET-MUST-NOT-APPEAR-IN-RESULT";


const result =
    await provider.query({

        subgraphId:
            "TEST-SUBGRAPH-ID",

        network:
            "base",

        chainId:
            "8453",

        apiKey:
            secret,

        document:
            `
            query {
                agents(first: 1) {
                    id
                    owner
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
            `,

        variables:
            {},

        schemaId:
            "ERC8004-STANDARDIZED"

    });


console.log("");
console.log(
    "SCIENTIFIC THE GRAPH PROVIDER"
);
console.log(
    "-----------------------------"
);


check(
    "VALID PROVIDER RESPONSE HAS NO ERRORS",
    result.errors.length ===
        0
);


check(
    "TEST DOUBLE CANNOT MASQUERADE AS LIVE",
    result.providerMode ===
        "FIXTURE"
);


check(
    "GATEWAY ENDPOINT USES SUBGRAPH ID PATH",
    transport.lastRequest
        ?.url ===
        "https://gateway.thegraph.com/api/subgraphs/id/TEST-SUBGRAPH-ID"
);


check(
    "API KEY IS SENT IN AUTHORIZATION HEADER",
    transport.lastRequest
        ?.headers
        .Authorization ===
        `Bearer ${secret}`
);


check(
    "API KEY IS NOT PUT IN URL",
    !transport.lastRequest!
        .url
        .includes(
            secret
        )
);


check(
    "API KEY IS NOT STORED IN RESULT",
    !JSON.stringify(
        result
    ).includes(
        secret
    )
);


check(
    "NETWORK AND CHAIN ARE PRESERVED",
    result.network ===
        "base" &&
    result.chainId ===
        "8453"
);


check(
    "INDEXED BLOCK IS TAKEN FROM META",
    result.query
        ?.indexedBlock
        .number ===
        12345678
);


check(
    "INDEXED BLOCK HASH IS PRESERVED",
    result.query
        ?.indexedBlock
        .hash ===
        blockHash
);


check(
    "OBSERVED DEPLOYMENT IS PRESERVED",
    result.deploymentId ===
        "QmFixtureDeployment"
);


check(
    "GRAPH RESPONSE REMAINS AVAILABLE FOR ADAPTER",
    Array.isArray(
        (
            result.query
                ?.response as any
        )?.data?.agents
    )
);


/*
 * GraphQL errors fail closed.
 */
const graphqlError =
    await new ScientificTheGraphGatewayProvider(
        new FixtureTransport({

            status:
                200,

            body:
                JSON.stringify({

                    errors: [
                        {
                            message:
                                "Synthetic GraphQL error"
                        }
                    ],

                    data:
                        null

                })

        })
    )
        .query({

            subgraphId:
                "TEST",

            network:
                "base",

            chainId:
                "8453",

            apiKey:
                "x",

            document:
                "query { _meta { block { number } } }",

            variables:
                {}

        });


check(
    "GRAPHQL ERROR FAILS CLOSED",
    graphqlError.errors.length >
        0 &&
    graphqlError.query ===
        null
);


/*
 * Indexing errors fail closed.
 */
const indexingError =
    await new ScientificTheGraphGatewayProvider(
        new FixtureTransport({

            status:
                200,

            body:
                JSON.stringify({

                    data: {

                        _meta: {

                            block: {
                                number:
                                    100
                            },

                            hasIndexingErrors:
                                true

                        }

                    }

                })

        })
    )
        .query({

            subgraphId:
                "TEST",

            network:
                "base",

            chainId:
                "8453",

            apiKey:
                "x",

            document:
                "query { _meta { block { number } hasIndexingErrors } }",

            variables:
                {}

        });


check(
    "INDEXING ERROR FAILS CLOSED",
    indexingError.errors.some(
        error =>
            error.includes(
                "indexing errors"
            )
    )
);


/*
 * No _meta provenance is insufficient.
 */
const missingMeta =
    await new ScientificTheGraphGatewayProvider(
        new FixtureTransport({

            status:
                200,

            body:
                JSON.stringify({

                    data: {
                        agents:
                            []
                    }

                })

        })
    )
        .query({

            subgraphId:
                "TEST",

            network:
                "base",

            chainId:
                "8453",

            apiKey:
                "x",

            document:
                "query { agents { id } }",

            variables:
                {}

        });


check(
    "MISSING META PROVENANCE FAILS CLOSED",
    missingMeta.errors.some(
        error =>
            error.includes(
                "_meta"
            )
    )
);


/*
 * A pinned deployment cannot silently change.
 */
const deploymentMismatch =
    await provider.query({

        subgraphId:
            "TEST-SUBGRAPH-ID",

        deploymentId:
            "QmExpectedDeployment",

        network:
            "base",

        chainId:
            "8453",

        apiKey:
            "x",

        document:
            "query { _meta { block { number hash } deployment } }",

        variables:
            {}

    });


check(
    "DEPLOYMENT MISMATCH FAILS CLOSED",
    deploymentMismatch.errors.some(
        error =>
            error.includes(
                "deployment"
            )
    )
);


/*
 * HTTP errors fail closed.
 */
const httpError =
    await new ScientificTheGraphGatewayProvider(
        new FixtureTransport({

            status:
                401,

            body:
                "Unauthorized"

        })
    )
        .query({

            subgraphId:
                "TEST",

            network:
                "base",

            chainId:
                "8453",

            apiKey:
                "bad",

            document:
                "query { _meta { block { number } } }",

            variables:
                {}

        });


check(
    "HTTP AUTH FAILURE FAILS CLOSED",
    httpError.httpStatus ===
        401 &&
    httpError.query ===
        null
);


/*
 * Credentials must never be embedded into gateway URL.
 */
const unsafeUrl =
    await provider.query({

        subgraphId:
            "TEST",

        network:
            "base",

        chainId:
            "8453",

        apiKey:
            "x",

        gatewayBaseUrl:
            "https://gateway.thegraph.com/api?api_key=SECRET",

        document:
            "query { _meta { block { number } } }",

        variables:
            {}

    });


check(
    "CREDENTIAL-LIKE GATEWAY URL FAILS CLOSED",
    unsafeUrl.errors.length >
        0
);


/*
 * This provider transports data only.
 */
const serialized =
    JSON.stringify(
        result
    );


check(
    "PROVIDER DOES NOT INVENT SCIENTIFIC POLARITY",
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