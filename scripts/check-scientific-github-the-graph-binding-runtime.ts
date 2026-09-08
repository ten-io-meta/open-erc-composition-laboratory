import {
    ScientificGitHubTheGraphEvidenceBindingEngine
} from "../laboratory/scientific-github-the-graph-binding/ScientificGitHubTheGraphEvidenceBindingEngine.js";


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


const githubRevision =
    "b9e466c250744a7e06b13dff9d3c2844ed64f825";

const graphBlockHash =
    "0x" +
    "11".repeat(
        32
    );


const profile:
    any = {

        profileId:
            "PROFILE-ERC-8004",

        protocolId:
            "ERC-8004",

        sourceId:
            "GITHUB-ERC-8004-ERC-8004-CONTRACTS",

        sourceRevision:
            githubRevision,

        attributedContainerSymbols:
            [],

        contributions:
            [],

        boundaries:
            [],

        needs:
            []

    };


const normativeSource:
    any = {

        sourceType:
            "GITHUB",

        sourceId:
            "GITHUB-ERC-8004-ERC-8004-CONTRACTS",

        sourceRevision:
            githubRevision

    };


const attribution:
    any = {

        attributionId:
            "AGENT0-BASE-MAINNET-ERC8004",

        adapterId:
            "ScientificAgent0Erc8004Adapter",

        protocolId:
            "ERC-8004",

        attributionBasis:
            "EXPLICIT_PROVIDER_ADAPTER_PROTOCOL_ATTRIBUTION",

        graphProductId:
            "AGENT0-SUBGRAPH",

        network:
            "base",

        chainId:
            "8453",

        requiredProviderMode:
            "LIVE"

    };


const graphEvidence:
    any = {

        source: {

            sourceId:
                "GRAPH-SOURCE-1",

            provider:
                "THE_GRAPH",

            productKind:
                "SUBGRAPH",

            productId:
                "AGENT0-SUBGRAPH",

            network:
                "base",

            chainId:
                "8453",

            deploymentId:
                "QmDeployment",

            schemaId:
                "AGENT0-ERC8004",

            providerMode:
                "LIVE"

        },

        queryReceipt: {

            queryReceiptId:
                "QUERY-1",

            sourceId:
                "GRAPH-SOURCE-1",

            queryDocumentHash:
                "a".repeat(
                    64
                ),

            variablesHash:
                "b".repeat(
                    64
                ),

            responseHash:
                "c".repeat(
                    64
                ),

            indexedBlock: {

                number:
                    51056764,

                hash:
                    graphBlockHash

            },

            fetchedAt:
                "2026-09-08T21:00:00Z"

        },

        evidence: [

            {
                evidenceId:
                    "GRAPH-EVIDENCE-1",

                sourceId:
                    "GRAPH-SOURCE-1",

                queryReceiptId:
                    "QUERY-1",

                evidenceBasis:
                    "THE_GRAPH_INDEXED_RESPONSE",

                observationKind:
                    "ENTITY",

                entityType:
                    "Agent",

                entityId:
                    "8453:1",

                rawFragment:
                    '{"id":"8453:1"}',

                fragmentHash:
                    "d".repeat(
                        64
                    )

            },

            {
                evidenceId:
                    "GRAPH-EVIDENCE-2",

                sourceId:
                    "GRAPH-SOURCE-1",

                queryReceiptId:
                    "QUERY-1",

                evidenceBasis:
                    "THE_GRAPH_INDEXED_RESPONSE",

                observationKind:
                    "ENTITY",

                entityType:
                    "Agent",

                entityId:
                    "8453:2",

                rawFragment:
                    '{"id":"8453:2"}',

                fragmentHash:
                    "e".repeat(
                        64
                    )

            }

        ],

        errors:
            []

    };


const engine =
    new ScientificGitHubTheGraphEvidenceBindingEngine();


const result =
    engine.bind({

        profile,

        normativeSource,

        graphEvidence,

        attribution

    });


console.log("");
console.log(
    "SCIENTIFIC GITHUB <-> THE GRAPH EVIDENCE BINDING"
);
console.log(
    "------------------------------------------------"
);


check(
    "VALID CROSS-PLANE BINDING HAS NO ERRORS",
    result.errors.length ===
        0
);


check(
    "EXACTLY ONE PROTOCOL BINDING IS PRODUCED",
    result.bindings.length ===
        1
);


const binding =
    result.bindings[0];


check(
    "PROTOCOL IDENTITY IS PRESERVED",
    binding.protocolId ===
        "ERC-8004"
);


check(
    "GITHUB SOURCE ID IS PRESERVED",
    binding.normativeSourceId ===
        profile.sourceId
);


check(
    "GITHUB REVISION IS PRESERVED",
    binding.normativeSourceRevision ===
        githubRevision
);


check(
    "GRAPH SOURCE ID IS PRESERVED",
    binding.graphSourceId ===
        "GRAPH-SOURCE-1"
);


check(
    "GRAPH NETWORK AND CHAIN ARE PRESERVED",
    binding.graphNetwork ===
        "base" &&
    binding.graphChainId ===
        "8453"
);


check(
    "LIVE PROVIDER MODE IS PRESERVED",
    binding.providerMode ===
        "LIVE"
);


check(
    "QUERY RECEIPT IS PRESERVED",
    binding.queryReceiptId ===
        "QUERY-1"
);


check(
    "INDEXED BLOCK IS PRESERVED",
    binding.indexedBlockNumber ===
        51056764 &&
    binding.indexedBlockHash ===
        graphBlockHash
);


check(
    "EXACT EVIDENCE IDS ARE PRESERVED",
    JSON.stringify(
        binding.evidenceIds
    ) ===
        JSON.stringify([
            "GRAPH-EVIDENCE-1",
            "GRAPH-EVIDENCE-2"
        ])
);


check(
    "BINDING STATUS IS OPERATIONAL ONLY",
    binding.status ===
        "BOUND"
);


const repeated =
    engine.bind({

        profile:

            JSON.parse(
                JSON.stringify(
                    profile
                )
            ),

        normativeSource:

            JSON.parse(
                JSON.stringify(
                    normativeSource
                )
            ),

        graphEvidence:

            JSON.parse(
                JSON.stringify(
                    graphEvidence
                )
            ),

        attribution:

            JSON.parse(
                JSON.stringify(
                    attribution
                )
            )

    });


check(
    "BINDING IS DETERMINISTIC",
    JSON.stringify(
        result
    ) ===
        JSON.stringify(
            repeated
        )
);


/*
 * Explicit protocol identity must match.
 */
const wrongProtocol =
    engine.bind({

        profile,

        normativeSource,

        graphEvidence,

        attribution: {

            ...attribution,

            protocolId:
                "ERC-8060"

        }

    });


check(
    "WRONG PROTOCOL ATTRIBUTION FAILS CLOSED",
    wrongProtocol.errors.length >
        0 &&
    wrongProtocol.bindings.length ===
        0
);


/*
 * GitHub source revision cannot silently drift.
 */
const wrongRevision =
    engine.bind({

        profile,

        normativeSource: {

            ...normativeSource,

            sourceRevision:
                "ffffffffffffffffffffffffffffffffffffffff"

        },

        graphEvidence,

        attribution

    });


check(
    "GITHUB REVISION MISMATCH FAILS CLOSED",
    wrongRevision.errors.length >
        0
);


/*
 * Product identity must be explicit.
 */
const wrongProduct =
    engine.bind({

        profile,

        normativeSource,

        graphEvidence,

        attribution: {

            ...attribution,

            graphProductId:
                "ANOTHER-SUBGRAPH"

        }

    });


check(
    "WRONG GRAPH PRODUCT FAILS CLOSED",
    wrongProduct.errors.length >
        0
);


/*
 * Network / chain cannot be silently changed.
 */
const wrongChain =
    engine.bind({

        profile,

        normativeSource,

        graphEvidence,

        attribution: {

            ...attribution,

            chainId:
                "1"

        }

    });


check(
    "WRONG GRAPH CHAIN FAILS CLOSED",
    wrongChain.errors.length >
        0
);


/*
 * Fixture evidence cannot satisfy a LIVE attribution.
 */
const fixtureMasquerade =
    engine.bind({

        profile,

        normativeSource,

        graphEvidence: {

            ...graphEvidence,

            source: {

                ...graphEvidence.source,

                providerMode:
                    "FIXTURE"

            }

        },

        attribution

    });


check(
    "FIXTURE CANNOT MASQUERADE AS LIVE",
    fixtureMasquerade.errors.length >
        0
);


/*
 * Query receipt must belong to the exact Graph source.
 */
const wrongReceiptSource =
    engine.bind({

        profile,

        normativeSource,

        graphEvidence: {

            ...graphEvidence,

            queryReceipt: {

                ...graphEvidence.queryReceipt,

                sourceId:
                    "ANOTHER-GRAPH-SOURCE"

            }

        },

        attribution

    });


check(
    "QUERY RECEIPT SOURCE MISMATCH FAILS CLOSED",
    wrongReceiptSource.errors.length >
        0
);


/*
 * Evidence ownership must be exact.
 */
const wrongEvidenceSource =
    engine.bind({

        profile,

        normativeSource,

        graphEvidence: {

            ...graphEvidence,

            evidence: [

                {
                    ...graphEvidence.evidence[0],

                    sourceId:
                        "ANOTHER-GRAPH-SOURCE"

                }

            ]

        },

        attribution

    });


check(
    "GRAPH EVIDENCE SOURCE MISMATCH FAILS CLOSED",
    wrongEvidenceSource.errors.length >
        0
);


/*
 * Empty provider observations do not become a scientific binding.
 */
const noEvidence =
    engine.bind({

        profile,

        normativeSource,

        graphEvidence: {

            ...graphEvidence,

            evidence:
                []

        },

        attribution

    });


check(
    "ZERO INDEXED EVIDENCE DOES NOT BIND",
    noEvidence.errors.length >
        0
);


/*
 * Duplicate provider evidence must fail closed.
 */
const duplicateEvidence =
    engine.bind({

        profile,

        normativeSource,

        graphEvidence: {

            ...graphEvidence,

            evidence: [
                graphEvidence.evidence[0],
                graphEvidence.evidence[0]
            ]

        },

        attribution

    });


check(
    "DUPLICATE GRAPH EVIDENCE FAILS CLOSED",
    duplicateEvidence.errors.length >
        0
);


/*
 * The binding layer must not manufacture scientific conclusions.
 */
const serialized =
    JSON.stringify(
        result
    );


check(
    "BINDING CONTAINS NO SCIENTIFIC POLARITY",
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