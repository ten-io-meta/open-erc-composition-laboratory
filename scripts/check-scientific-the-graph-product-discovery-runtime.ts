import {
    ScientificTheGraphProductDiscoveryEngine
} from "../laboratory/scientific-the-graph-product-discovery/ScientificTheGraphProductDiscoveryEngine.js";


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


const profiles:
    any[] = [

        {
            profileId:
                "PROFILE-ERC-8004",

            protocolId:
                "ERC-8004",

            sourceId:
                "GITHUB-ERC-8004",

            sourceRevision:
                "REV-8004",

            attributedContainerSymbols:
                [],

            contributions:
                [],

            boundaries:
                [],

            needs:
                []
        },

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
        },

        {
            profileId:
                "PROFILE-ERC-8354",

            protocolId:
                "ERC-8354",

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


const engine =
    new ScientificTheGraphProductDiscoveryEngine();


const plan =
    engine.plan(
        profiles,
        [
            "ERC-8004"
        ]
    );


console.log("");
console.log(
    "SCIENTIFIC THE GRAPH PRODUCT DISCOVERY"
);
console.log(
    "======================================"
);


check(
    "DISCOVERY PLAN HAS NO ERRORS",
    plan.errors.length ===
        0
);


check(
    "ALREADY INTEGRATED ERC-8004 IS EXCLUDED",
    !plan.requests.some(
        request =>
            request.protocolId ===
            "ERC-8004"
    )
);


check(
    "REMAINING PROFILES ARE PLANNED",
    plan.requests.length ===
        2 &&
    plan.requests.some(
        request =>
            request.protocolId ===
            "ERC-8301"
    ) &&
    plan.requests.some(
        request =>
            request.protocolId ===
            "ERC-8354"
    )
);


const request8301 =
    plan.requests.find(
        request =>
            request.protocolId ===
            "ERC-8301"
    )!;


const request8354 =
    plan.requests.find(
        request =>
            request.protocolId ===
            "ERC-8354"
    )!;


check(
    "PROTOCOL IDENTITY ALIASES ARE DETERMINISTIC",
    JSON.stringify(
        request8301.searchTerms
    ) ===
        JSON.stringify([
            "ERC-8301",
            "ERC8301"
        ])
);


check(
    "DISCOVERY REQUEST PRESERVES SOURCE REVISION",
    request8301.sourceRevision ===
        "REV-AGENTS"
);


const observations:
    any[] = [

        {
            observationId:
                "DISCOVERY-OBS-1",

            requestId:
                request8301.requestId,

            provider:
                "THE_GRAPH",

            discoveryProductKind:
                "SUBGRAPH_MCP",

            resultProductKind:
                "SUBGRAPH",

            productId:
                "SUBGRAPH-A",

            network:
                "base",

            chainId:
                "8453",

            deploymentId:
                "DEPLOYMENT-A",

            matchKind:
                "KEYWORD",

            matchedValue:
                "ERC-8301",

            providerRank:
                1
        },

        {
            observationId:
                "DISCOVERY-OBS-2",

            requestId:
                request8301.requestId,

            provider:
                "THE_GRAPH",

            discoveryProductKind:
                "SUBGRAPH_MCP",

            resultProductKind:
                "SUBGRAPH",

            productId:
                "SUBGRAPH-A",

            network:
                "base",

            chainId:
                "8453",

            deploymentId:
                "DEPLOYMENT-A",

            matchKind:
                "KEYWORD",

            matchedValue:
                "ERC8301",

            providerRank:
                2
        },

        {
            observationId:
                "DISCOVERY-OBS-3",

            requestId:
                request8354.requestId,

            provider:
                "THE_GRAPH",

            discoveryProductKind:
                "SUBGRAPH_MCP",

            resultProductKind:
                "SUBGRAPH",

            productId:
                "SUBGRAPH-B",

            network:
                "mainnet",

            chainId:
                "1",

            deploymentId:
                "DEPLOYMENT-B",

            matchKind:
                "KEYWORD",

            matchedValue:
                "ERC-8354",

            providerRank:
                1
        }

    ];


const result =
    engine.assemble(
        profiles,
        plan.requests,
        observations
    );


check(
    "DISCOVERY ASSEMBLY HAS NO ERRORS",
    result.errors.length ===
        0
);


check(
    "DISCOVERY PRODUCES TWO PRODUCT CANDIDATES",
    result.candidates.length ===
        2
);


const candidate8301 =
    result.candidates.find(
        candidate =>
            candidate.protocolId ===
            "ERC-8301"
    )!;


check(
    "MULTIPLE SEARCH HITS MERGE INTO ONE EXACT PRODUCT",
    candidate8301.discoveryObservationIds.length ===
        2
);


check(
    "MATCHED SEARCH TERMS REMAIN AUDITABLE",
    JSON.stringify(
        candidate8301.matchedValues
    ) ===
        JSON.stringify([
            "ERC-8301",
            "ERC8301"
        ])
);


check(
    "DISCOVERY STATUS IS OPERATIONAL ONLY",
    candidate8301.status ===
        "DISCOVERED" &&
    candidate8301.nextAction ===
        "INSPECT_SCHEMA_AND_METADATA"
);


check(
    "PRODUCT NETWORK AND CHAIN ARE PRESERVED",
    candidate8301.network ===
        "base" &&
    candidate8301.chainId ===
        "8453"
);


const zeroObservationResult =
    engine.assemble(
        profiles,
        plan.requests,
        []
    );


check(
    "ZERO SEARCH RESULTS ARE VALID AND PRODUCE ZERO CANDIDATES",
    zeroObservationResult.errors.length ===
        0 &&
    zeroObservationResult.candidates.length ===
        0
);


const unknownRequestResult =
    engine.assemble(
        profiles,
        plan.requests,
        [
            {
                ...observations[0],

                observationId:
                    "UNKNOWN-REQUEST-OBS",

                requestId:
                    "UNKNOWN-REQUEST"
            }
        ]
    );


check(
    "UNKNOWN DISCOVERY REQUEST FAILS CLOSED",
    unknownRequestResult.errors.length >
        0 &&
    unknownRequestResult.candidates.length ===
        0
);


const wrongMatchedValueResult =
    engine.assemble(
        profiles,
        plan.requests,
        [
            {
                ...observations[0],

                observationId:
                    "WRONG-MATCH-OBS",

                matchedValue:
                    "SOMETHING-ELSE"
            }
        ]
    );


check(
    "NON-REQUEST SEARCH MATCH FAILS CLOSED",
    wrongMatchedValueResult.errors.length >
        0
);


const duplicateObservationResult =
    engine.assemble(
        profiles,
        plan.requests,
        [
            observations[0],
            observations[0]
        ]
    );


check(
    "DUPLICATE DISCOVERY OBSERVATION FAILS CLOSED",
    duplicateObservationResult.errors.length >
        0
);


const invalidRankResult =
    engine.assemble(
        profiles,
        plan.requests,
        [
            {
                ...observations[0],

                observationId:
                    "INVALID-RANK-OBS",

                providerRank:
                    0
            }
        ]
    );


check(
    "INVALID PROVIDER RANK FAILS CLOSED",
    invalidRankResult.errors.length >
        0
);


const differentChainResult =
    engine.assemble(
        profiles,
        plan.requests,
        [
            observations[0],

            {
                ...observations[0],

                observationId:
                    "DISCOVERY-OBS-OTHER-CHAIN",

                network:
                    "mainnet",

                chainId:
                    "1"
            }
        ]
    );


check(
    "SAME PRODUCT ON DIFFERENT CHAINS REMAINS DISTINCT",
    differentChainResult.errors.length ===
        0 &&
    differentChainResult.candidates.length ===
        2
);


const repeated =
    engine.assemble(
        JSON.parse(
            JSON.stringify(
                profiles
            )
        ),
        JSON.parse(
            JSON.stringify(
                plan.requests
            )
        ),
        JSON.parse(
            JSON.stringify(
                observations
            )
        )
    );


check(
    "DISCOVERY OUTPUT IS DETERMINISTIC",
    JSON.stringify(
        repeated
    ) ===
        JSON.stringify(
            result
        )
);


const serialized =
    JSON.stringify(
        {
            plan,
            result
        }
    );


check(
    "DISCOVERY CONTAINS NO SCIENTIFIC POLARITY",
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


if (fail > 0) {
    process.exitCode = 1;
}