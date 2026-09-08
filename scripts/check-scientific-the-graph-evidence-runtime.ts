import {
    ScientificTheGraphEvidenceEngine
} from "../laboratory/scientific-the-graph-evidence/ScientificTheGraphEvidenceEngine.js";


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


const tx =
    "0x" +
    "11".repeat(
        32
    );

const blockHash =
    "0x" +
    "22".repeat(
        32
    );

const contract =
    "0x" +
    "33".repeat(
        20
    );


const baseInput:
    any = {

        source: {

            productKind:
                "SUBGRAPH",

            productId:
                "AGENT0-ERC8004",

            deploymentId:
                "DEPLOYMENT-1",

            schemaId:
                "ERC8004-STANDARDIZED",

            network:
                "base",

            chainId:
                "8453",

            providerMode:
                "FIXTURE"

        },

        query: {

            document:
                `
                query Agent($id: ID!) {
                    agent(id: $id) {
                        id
                        owner
                    }
                    _meta {
                        block {
                            number
                            hash
                        }
                    }
                }
                `,

            variables: {
                id:
                    "1"
            },

            response: {
                data: {
                    agent: {
                        id:
                            "1",

                        owner:
                            contract
                    }
                }
            },

            fetchedAt:
                "2026-09-08T20:30:00+01:00",

            indexedBlock: {

                number:
                    123456,

                hash:
                    blockHash

            }

        },

        observations: [

            {
                observationKind:
                    "ENTITY",

                entityType:
                    "Agent",

                entityId:
                    "1",

                fragment: {

                    id:
                        "1",

                    owner:
                        contract

                },

                blockNumber:
                    123450,

                transactionHash:
                    tx,

                contractAddress:
                    contract

            }

        ]

    };


const engine =
    new ScientificTheGraphEvidenceEngine();


const result =
    engine.build(
        baseInput
    );


console.log("");
console.log(
    "SCIENTIFIC THE GRAPH EVIDENCE CORE"
);
console.log(
    "----------------------------------"
);


check(
    "VALID GRAPH EVIDENCE HAS NO ERRORS",
    result.errors.length ===
        0
);


check(
    "GRAPH SOURCE IS EXPLICITLY THE GRAPH",
    result.source?.provider ===
        "THE_GRAPH"
);


check(
    "PRODUCT NETWORK AND CHAIN ARE PRESERVED",
    result.source?.productKind ===
        "SUBGRAPH" &&
    result.source?.network ===
        "base" &&
    result.source?.chainId ===
        "8453"
);


check(
    "FIXTURE MODE CANNOT MASQUERADE AS LIVE",
    result.source?.providerMode ===
        "FIXTURE"
);


check(
    "QUERY RECEIPT PRESERVES INDEXED BLOCK",
    result.queryReceipt?.indexedBlock.number ===
        123456 &&
    result.queryReceipt?.indexedBlock.hash ===
        blockHash
);


check(
    "QUERY DOCUMENT IS HASHED",
    result.queryReceipt
        ?.queryDocumentHash
        .length ===
        64
);


check(
    "QUERY VARIABLES ARE HASHED",
    result.queryReceipt
        ?.variablesHash
        .length ===
        64
);


check(
    "RAW RESPONSE IS HASHED",
    result.queryReceipt
        ?.responseHash
        .length ===
        64
);


const evidence =
    result.evidence[0];


check(
    "ENTITY BECOMES GRAPH EVIDENCE",
    evidence.observationKind ===
        "ENTITY" &&
    evidence.entityType ===
        "Agent" &&
    evidence.entityId ===
        "1"
);


check(
    "ONCHAIN TRANSACTION PROVENANCE IS PRESERVED",
    evidence.transactionHash ===
        tx
);


check(
    "CONTRACT PROVENANCE IS PRESERVED",
    evidence.contractAddress ===
        contract
);


check(
    "EVIDENCE DECLARES INDEXED RESPONSE BASIS",
    evidence.evidenceBasis ===
        "THE_GRAPH_INDEXED_RESPONSE"
);


const repeated =
    engine.build(
        JSON.parse(
            JSON.stringify(
                baseInput
            )
        )
    );


check(
    "GRAPH EVIDENCE IS DETERMINISTIC",
    JSON.stringify(
        result
    ) ===
        JSON.stringify(
            repeated
        )
);


/*
 * Same entity on another chain must never collide.
 */
const ethereum =
    engine.build({

        ...baseInput,

        source: {

            ...baseInput.source,

            network:
                "mainnet",

            chainId:
                "1"

        }

    });


check(
    "SAME ENTITY ON DIFFERENT CHAIN HAS DIFFERENT SOURCE ID",
    ethereum.source?.sourceId !==
        result.source?.sourceId
);


check(
    "SAME ENTITY ON DIFFERENT CHAIN HAS DIFFERENT EVIDENCE ID",
    ethereum.evidence[0]
        .evidenceId !==
        result.evidence[0]
            .evidenceId
);


/*
 * Changing the query must change the query receipt.
 */
const changedQuery =
    engine.build({

        ...baseInput,

        query: {

            ...baseInput.query,

            variables: {
                id:
                    "2"
            }

        }

    });


check(
    "QUERY VARIABLES CHANGE QUERY RECEIPT ID",
    changedQuery.queryReceipt
        ?.queryReceiptId !==
        result.queryReceipt
            ?.queryReceiptId
);


/*
 * Invalid onchain provenance must fail closed.
 */
const invalidTx =
    engine.build({

        ...baseInput,

        observations: [

            {
                ...baseInput.observations[0],

                transactionHash:
                    "0x1234"

            }

        ]

    });


check(
    "INVALID TRANSACTION HASH FAILS CLOSED",
    invalidTx.errors.length >
        0 &&
    invalidTx.evidence.length ===
        0
);


/*
 * Observation newer than indexed snapshot must fail closed.
 */
const futureObservation =
    engine.build({

        ...baseInput,

        observations: [

            {
                ...baseInput.observations[0],

                blockNumber:
                    999999

            }

        ]

    });


check(
    "OBSERVATION NEWER THAN INDEXED BLOCK FAILS CLOSED",
    futureObservation.errors.length >
        0
);


/*
 * Non-offset-aware timestamps are not sufficient provenance.
 */
const ambiguousTime =
    engine.build({

        ...baseInput,

        query: {

            ...baseInput.query,

            fetchedAt:
                "2026-09-08T20:30:00"

        }

    });


check(
    "AMBIGUOUS FETCH TIME FAILS CLOSED",
    ambiguousTime.errors.length >
        0
);


/*
 * This layer must not invent scientific conclusions.
 */
const serialized =
    JSON.stringify(
        result
    );


check(
    "GRAPH EVIDENCE CORE CONTAINS NO SCIENTIFIC POLARITY",
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