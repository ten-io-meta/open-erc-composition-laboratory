import {
    ScientificTheGraphDiscoveryTriageEngine
} from "../laboratory/scientific-the-graph-discovery-triage/ScientificTheGraphDiscoveryTriageEngine.js";

import {
    ScientificTheGraphInspectionPlanEngine
} from "../laboratory/scientific-the-graph-inspection-plan/ScientificTheGraphInspectionPlanEngine.js";


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


function term(
    termId:
        string,
    protocolId:
        string,
    profileId:
        string,
    value:
        string,
    origin:
        "PROTOCOL_IDENTITY" |
        "CONTRIBUTION_SUBJECT"
): any {

    return {

        termId,

        protocolId,

        profileId,

        term:
            value,

        originKinds: [
            origin
        ],

        sourceArtifactIds:
            origin ===
            "CONTRIBUTION_SUBJECT"
                ? [
                    `ARTIFACT-${termId}`
                ]
                : [],

        evidenceIds:
            origin ===
            "CONTRIBUTION_SUBJECT"
                ? [
                    `EVIDENCE-${termId}`
                ]
                : [],

        sourceSubjects: [
            value
        ],

        discoveryScore:
            origin ===
            "PROTOCOL_IDENTITY"
                ? 1000000
                : 100

    };

}


function hit(
    hitId:
        string,
    subgraphId:
        string,
    ipfsHash:
        string,
    rank:
        number
): any {

    return {

        hitId,

        subgraphId,

        displayName:
            subgraphId,

        ipfsHash,

        providerRank:
            rank,

        rawFragment:
            "{}",

        fragmentHash:
            "0".repeat(
                64
            )

    };

}


const terms:
    any[] =
    [

        term(
            "8301-ID",
            "ERC-8301",
            "PROFILE-8301",
            "ERC-8301",
            "PROTOCOL_IDENTITY"
        ),

        term(
            "8301-AGENT",
            "ERC-8301",
            "PROFILE-8301",
            "agent",
            "CONTRIBUTION_SUBJECT"
        ),

        term(
            "8301-REPLY",
            "ERC-8301",
            "PROFILE-8301",
            "reply",
            "CONTRIBUTION_SUBJECT"
        ),

        term(
            "8274-ID",
            "ERC-8274",
            "PROFILE-8274",
            "ERC-8274",
            "PROTOCOL_IDENTITY"
        ),

        term(
            "8274-PROOF",
            "ERC-8274",
            "PROFILE-8274",
            "proof",
            "CONTRIBUTION_SUBJECT"
        ),

        term(
            "8274-VERIFIER",
            "ERC-8274",
            "PROFILE-8274",
            "verifier",
            "CONTRIBUTION_SUBJECT"
        )

    ];


const requests:
    any[] =
    [

        {
            requestId:
                "REQUEST-8301",

            protocolId:
                "ERC-8301",

            profileId:
                "PROFILE-8301",

            sourceId:
                "SOURCE-A",

            sourceRevision:
                "REV-A",

            searchTerms: [
                "ERC-8301",
                "agent",
                "reply"
            ],

            searchBasis:
                "PROTOCOL_IDENTITY_AND_PROFILE_TERMS",

            targetProductKind:
                "SUBGRAPH",

            termIds: [
                "8301-ID",
                "8301-AGENT",
                "8301-REPLY"
            ]
        },

        {
            requestId:
                "REQUEST-8274",

            protocolId:
                "ERC-8274",

            profileId:
                "PROFILE-8274",

            sourceId:
                "SOURCE-B",

            sourceRevision:
                "REV-B",

            searchTerms: [
                "ERC-8274",
                "proof",
                "verifier"
            ],

            searchBasis:
                "PROTOCOL_IDENTITY_AND_PROFILE_TERMS",

            targetProductKind:
                "SUBGRAPH",

            termIds: [
                "8274-ID",
                "8274-PROOF",
                "8274-VERIFIER"
            ]
        }

    ];


function search(
    searchId:
        string,
    requestId:
        string,
    protocolId:
        string,
    searchTerm:
        string,
    total:
        number,
    hits:
        any[]
): any {

    return {

        searchId,

        requestId,

        protocolId,

        searchTerm,

        provider:
            "THE_GRAPH",

        providerMode:
            "FIXTURE",

        discoveryProductKind:
            "SUBGRAPH_MCP",

        toolName:
            "search_subgraphs_by_keyword",

        returned:
            hits.length,

        total,

        hits,

        status:
            "OBSERVED"

    };

}


const discovery:
    any =
    {

        searches: [

            search(
                "S-8301-ID",
                "REQUEST-8301",
                "ERC-8301",
                "ERC-8301",
                0,
                []
            ),

            search(
                "S-8301-AGENT",
                "REQUEST-8301",
                "ERC-8301",
                "agent",
                62,
                [
                    hit(
                        "H-AGENT",
                        "AGENT-SUBGRAPH",
                        "Qm11111111111111111111111111111111111111111111",
                        1
                    )
                ]
            ),

            search(
                "S-8301-REPLY",
                "REQUEST-8301",
                "ERC-8301",
                "reply",
                1,
                [
                    hit(
                        "H-REPLY",
                        "REPLY-SUBGRAPH",
                        "Qm22222222222222222222222222222222222222222222",
                        1
                    )
                ]
            ),

            search(
                "S-8274-ID",
                "REQUEST-8274",
                "ERC-8274",
                "ERC-8274",
                0,
                []
            ),

            search(
                "S-8274-PROOF",
                "REQUEST-8274",
                "ERC-8274",
                "proof",
                46,
                [
                    hit(
                        "H-PROOF",
                        "PROOF-SUBGRAPH",
                        "Qm33333333333333333333333333333333333333333333",
                        1
                    )
                ]
            ),

            search(
                "S-8274-VERIFIER",
                "REQUEST-8274",
                "ERC-8274",
                "verifier",
                15,
                [
                    hit(
                        "H-VERIFIER-1",
                        "VERIFIER-1",
                        "Qm44444444444444444444444444444444444444444444",
                        1
                    ),

                    hit(
                        "H-VERIFIER-2",
                        "VERIFIER-2",
                        "Qm55555555555555555555555555555555555555555555",
                        2
                    ),

                    hit(
                        "H-VERIFIER-3",
                        "VERIFIER-3",
                        "Qm66666666666666666666666666666666666666666666",
                        3
                    )
                ]
            )

        ],

        errors:
            []

    };


const triage =
    new ScientificTheGraphDiscoveryTriageEngine()
        .triage({

            requests,

            terms,

            discovery

        });


const result =
    new ScientificTheGraphInspectionPlanEngine()
        .plan(
            {

                requests,

                terms,

                discovery,

                triage

            },
            2
        );


console.log("");
console.log(
    "SCIENTIFIC THE GRAPH INSPECTION PLAN"
);
console.log(
    "===================================="
);


check(
    "INSPECTION PLAN HAS NO ERRORS",
    result.errors.length ===
        0
);


check(
    "FALLBACK PLAN SELECTS THREE DEPLOYMENTS",
    result.items.length ===
        3
);


const erc8301 =
    result.items.filter(
        item =>
            item.protocolId ===
            "ERC-8301"
    );


check(
    "ERC-8301 USES MOST SELECTIVE PROFILE TERM",
    erc8301.length ===
        1 &&
    erc8301[0].supportingTerm ===
        "reply" &&
    erc8301[0].providerSearchTotal ===
        1
);


check(
    "BROAD AGENT SEARCH IS NOT SELECTED",
    !result.items.some(
        item =>
            item.supportingTerm ===
            "agent"
    )
);


const erc8274 =
    result.items.filter(
        item =>
            item.protocolId ===
            "ERC-8274"
    );


check(
    "ERC-8274 PREFERS VERIFIER OVER BROADER PROOF",
    erc8274.length ===
        2 &&
    erc8274.every(
        item =>
            item.supportingTerm ===
                "verifier" &&
            item.providerSearchTotal ===
                15
    )
);


check(
    "FALLBACK DEPLOYMENTS ARE BOUNDED PER PROTOCOL",
    erc8274.length ===
        2 &&
    !result.items.some(
        item =>
            item.subgraphId ===
            "VERIFIER-3"
    )
);


check(
    "PROVIDER RANK IS PRESERVED",
    erc8274[0].providerRank ===
        1 &&
    erc8274[1].providerRank ===
        2
);


check(
    "FALLBACK IS EXPLICITLY OPERATIONAL",
    result.items.every(
        item =>
            item.selectionBasis ===
                "MOST_SELECTIVE_PROFILE_TERM_FALLBACK" &&
            item.status ===
                "PLANNED_FOR_EXACT_DEPLOYMENT_INSPECTION" &&
            item.nextAction ===
                "INSPECT_EXACT_DEPLOYMENT"
    )
);


const repeated =
    new ScientificTheGraphInspectionPlanEngine()
        .plan(
            JSON.parse(
                JSON.stringify({

                    requests,

                    terms,

                    discovery,

                    triage

                })
            ),
            2
        );


check(
    "INSPECTION PLAN IS DETERMINISTIC",
    JSON.stringify(
        repeated
    ) ===
        JSON.stringify(
            result
        )
);


const invalidLimit =
    new ScientificTheGraphInspectionPlanEngine()
        .plan(
            {

                requests,

                terms,

                discovery,

                triage

            },
            0
        );


check(
    "INVALID FALLBACK LIMIT FAILS CLOSED",
    invalidLimit.errors.length >
        0 &&
    invalidLimit.items.length ===
        0
);


const serialized =
    JSON.stringify(
        result
    );


check(
    "INSPECTION PLAN CONTAINS NO SCIENTIFIC POLARITY",
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