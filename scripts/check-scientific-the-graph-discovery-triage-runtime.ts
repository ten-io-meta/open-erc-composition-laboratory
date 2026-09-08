import {
    ScientificTheGraphDiscoveryTriageEngine
} from "../laboratory/scientific-the-graph-discovery-triage/ScientificTheGraphDiscoveryTriageEngine.js";


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


const terms:
    any[] =
    [

        {
            termId:
                "TERM-IDENTITY",

            protocolId:
                "ERC-8301",

            profileId:
                "PROFILE-8301",

            term:
                "ERC-8301",

            originKinds: [
                "PROTOCOL_IDENTITY"
            ],

            sourceArtifactIds:
                [],

            evidenceIds:
                [],

            sourceSubjects: [
                "ERC-8301"
            ],

            discoveryScore:
                1000000
        },

        {
            termId:
                "TERM-AGENT",

            protocolId:
                "ERC-8301",

            profileId:
                "PROFILE-8301",

            term:
                "agent",

            originKinds: [
                "CONTRIBUTION_SUBJECT"
            ],

            sourceArtifactIds: [
                "CONTRIBUTION-A"
            ],

            evidenceIds: [
                "EVIDENCE-A"
            ],

            sourceSubjects: [
                "agent workflow"
            ],

            discoveryScore:
                111
        },

        {
            termId:
                "TERM-REPLY",

            protocolId:
                "ERC-8301",

            profileId:
                "PROFILE-8301",

            term:
                "reply",

            originKinds: [
                "CONTRIBUTION_SUBJECT"
            ],

            sourceArtifactIds: [
                "CONTRIBUTION-B"
            ],

            evidenceIds: [
                "EVIDENCE-B"
            ],

            sourceSubjects: [
                "agent reply"
            ],

            discoveryScore:
                111
        }

    ];


const request:
    any =
    {

        requestId:
            "REQUEST-8301",

        protocolId:
            "ERC-8301",

        profileId:
            "PROFILE-8301",

        sourceId:
            "GITHUB-AGENT-ERCS",

        sourceRevision:
            "REV-1",

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
            "TERM-IDENTITY",
            "TERM-AGENT",
            "TERM-REPLY"
        ]

    };


function hit(
    hitId:
        string,
    subgraphId:
        string,
    ipfsHash:
        string,
    displayName:
        string
): any {

    return {

        hitId,

        subgraphId,

        displayName,

        ipfsHash,

        providerRank:
            1,

        rawFragment:
            "{}",

        fragmentHash:
            "0".repeat(
                64
            )

    };

}


function search(
    searchId:
        string,
    term:
        string,
    hits:
        any[]
): any {

    return {

        searchId,

        requestId:
            request.requestId,

        protocolId:
            request.protocolId,

        searchTerm:
            term,

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

        total:
            hits.length,

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
                "SEARCH-IDENTITY",
                "ERC-8301",
                [
                    hit(
                        "HIT-IDENTITY",
                        "SUBGRAPH-IDENTITY",
                        "Qm11111111111111111111111111111111111111111111",
                        "ERC-8301 Indexer"
                    )
                ]
            ),

            search(
                "SEARCH-AGENT",
                "agent",
                [
                    hit(
                        "HIT-A-AGENT",
                        "SUBGRAPH-A",
                        "Qm22222222222222222222222222222222222222222222",
                        "Agent Reply Indexer"
                    ),

                    hit(
                        "HIT-B-AGENT",
                        "SUBGRAPH-B",
                        "Qm33333333333333333333333333333333333333333333",
                        "Generic Agent"
                    )
                ]
            ),

            search(
                "SEARCH-REPLY",
                "reply",
                [
                    hit(
                        "HIT-A-REPLY",
                        "SUBGRAPH-A",
                        "Qm22222222222222222222222222222222222222222222",
                        "Agent Reply Indexer"
                    )
                ]
            )

        ],

        errors:
            []

    };


const engine =
    new ScientificTheGraphDiscoveryTriageEngine();


const result =
    engine.triage({

        requests: [
            request
        ],

        terms,

        discovery

    });


console.log("");
console.log(
    "SCIENTIFIC THE GRAPH DISCOVERY TRIAGE"
);
console.log(
    "====================================="
);


check(
    "TRIAGE HAS NO ERRORS",
    result.errors.length ===
        0
);


check(
    "THREE EXACT DEPLOYMENT CANDIDATES ARE PRESERVED",
    result.candidates.length ===
        3
);


check(
    "TWO CANDIDATES ARE PRIORITIZED",
    result.prioritized.length ===
        2
);


check(
    "ONE GENERIC SINGLE-TERM HIT IS DEFERRED",
    result.deferred.length ===
        1 &&
    result.deferred[0].subgraphId ===
        "SUBGRAPH-B"
);


const identityCandidate =
    result.candidates.find(
        candidate =>
            candidate.subgraphId ===
            "SUBGRAPH-IDENTITY"
    )!;


check(
    "EXACT PROTOCOL IDENTITY HIT IS PRIORITIZED",
    identityCandidate.identityMatch ===
        true &&
    identityCandidate.status ===
        "PRIORITIZED_FOR_INSPECTION" &&
    identityCandidate.triageBasis ===
        "EXPLICIT_PROTOCOL_IDENTITY_HIT"
);


const multiTermCandidate =
    result.candidates.find(
        candidate =>
            candidate.subgraphId ===
            "SUBGRAPH-A"
    )!;


check(
    "MULTIPLE DERIVED TERMS PRIORITIZE SAME DEPLOYMENT",
    multiTermCandidate.identityMatch ===
        false &&
    multiTermCandidate.derivedTermCount ===
        2 &&
    multiTermCandidate.status ===
        "PRIORITIZED_FOR_INSPECTION" &&
    multiTermCandidate.triageBasis ===
        "MULTIPLE_PROFILE_DERIVED_TERM_HITS"
);


check(
    "MULTI-TERM PROVENANCE REMAINS AUDITABLE",
    JSON.stringify(
        multiTermCandidate.matchedTerms
    ) ===
        JSON.stringify([
            "agent",
            "reply"
        ]) &&
    JSON.stringify(
        multiTermCandidate.evidenceIds
    ) ===
        JSON.stringify([
            "EVIDENCE-A",
            "EVIDENCE-B"
        ])
);


check(
    "DEFERRED CANDIDATE REMAINS DISCOVERY EVIDENCE",
    result.deferred[0].nextAction ===
        "RETAIN_AS_DISCOVERY_ONLY"
);


const repeated =
    engine.triage(
        JSON.parse(
            JSON.stringify({

                requests: [
                    request
                ],

                terms,

                discovery

            })
        )
    );


check(
    "TRIAGE IS DETERMINISTIC",
    JSON.stringify(
        repeated
    ) ===
        JSON.stringify(
            result
        )
);


const conflictingDiscovery =
    JSON.parse(
        JSON.stringify(
            discovery
        )
    );


conflictingDiscovery.searches[2]
    .hits[0]
    .ipfsHash =
    "Qm99999999999999999999999999999999999999999999";


const conflictResult =
    engine.triage({

        requests: [
            request
        ],

        terms,

        discovery:
            conflictingDiscovery

    });


check(
    "DEPLOYMENT CHANGE WITHIN ONE DISCOVERY RUN FAILS CLOSED",
    conflictResult.errors.length >
        0 &&
    conflictResult.candidates.length ===
        0
);


const unknownSearchDiscovery =
    JSON.parse(
        JSON.stringify(
            discovery
        )
    );


unknownSearchDiscovery.searches[0]
    .searchTerm =
    "unknown";


const unknownSearchResult =
    engine.triage({

        requests: [
            request
        ],

        terms,

        discovery:
            unknownSearchDiscovery

    });


check(
    "UNREQUESTED SEARCH TERM FAILS CLOSED",
    unknownSearchResult.errors.length >
        0
);


const duplicateHitDiscovery =
    JSON.parse(
        JSON.stringify(
            discovery
        )
    );


duplicateHitDiscovery.searches[2]
    .hits[0]
    .hitId =
    "HIT-A-AGENT";


const duplicateHitResult =
    engine.triage({

        requests: [
            request
        ],

        terms,

        discovery:
            duplicateHitDiscovery

    });


check(
    "DUPLICATE HIT ID FAILS CLOSED",
    duplicateHitResult.errors.length >
        0
);


const serialized =
    JSON.stringify(
        result
    );


check(
    "TRIAGE CONTAINS NO SCIENTIFIC POLARITY",
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