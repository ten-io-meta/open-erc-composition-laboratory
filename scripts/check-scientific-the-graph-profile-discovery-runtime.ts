import {
    ScientificTheGraphProductDiscoveryEngine
} from "../laboratory/scientific-the-graph-product-discovery/ScientificTheGraphProductDiscoveryEngine.js";

import {
    ScientificTheGraphProfileDiscoveryEngine
} from "../laboratory/scientific-the-graph-profile-discovery/ScientificTheGraphProfileDiscoveryEngine.js";


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


const profile:
    any =
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

        contributions: [

            {
                contributionId:
                    "CONTRIBUTION-1",

                participantId:
                    "ERC-8301",

                kind:
                    "CAPABILITY",

                subject:
                    "get agent task",

                evidenceIds: [
                    "EVIDENCE-A"
                ]
            },

            {
                contributionId:
                    "CONTRIBUTION-2",

                participantId:
                    "ERC-8301",

                kind:
                    "CAPABILITY",

                subject:
                    "agent reply",

                evidenceIds: [
                    "EVIDENCE-B"
                ]
            },

            {
                contributionId:
                    "CONTRIBUTION-3",

                participantId:
                    "ERC-8301",

                kind:
                    "CAPABILITY",

                subject:
                    "agent verifier",

                evidenceIds: [
                    "EVIDENCE-C"
                ]
            },

            {
                contributionId:
                    "CONTRIBUTION-4",

                participantId:
                    "ERC-8301",

                kind:
                    "CAPABILITY",

                subject:
                    "verdict registry",

                evidenceIds: [
                    "EVIDENCE-D"
                ]
            }

        ],

        boundaries:
            [],

        needs: [

            {
                needId:
                    "NEED-1",

                participantId:
                    "ERC-8301",

                subject:
                    "identity registry",

                evidenceIds: [
                    "EVIDENCE-E"
                ],

                status:
                    "UNRESOLVED",

                candidateProviderParticipantIds:
                    []
            }

        ]

    };


const basePlan =
    new ScientificTheGraphProductDiscoveryEngine()
        .plan([
            profile
        ]);


const expansion =
    new ScientificTheGraphProfileDiscoveryEngine()
        .expand(
            [
                profile
            ],
            basePlan.requests,
            4
        );


console.log("");
console.log(
    "SCIENTIFIC THE GRAPH PROFILE-DERIVED DISCOVERY"
);
console.log(
    "=============================================="
);


check(
    "PROFILE EXPANSION HAS NO ERRORS",
    expansion.errors.length ===
        0
);


check(
    "EXACTLY ONE REQUEST IS EXPANDED",
    expansion.requests.length ===
        1
);


const request =
    expansion.requests[0];


check(
    "SEARCH BASIS RECORDS PROFILE DERIVATION",
    request.searchBasis ===
        "PROTOCOL_IDENTITY_AND_PROFILE_TERMS"
);


check(
    "PROTOCOL IDENTITY ALIASES ARE RETAINED",
    request.searchTerms.includes(
        "ERC-8301"
    ) &&
    request.searchTerms.includes(
        "ERC8301"
    )
);


check(
    "REPEATED AGENT TERM IS SELECTED",
    request.searchTerms.includes(
        "agent"
    )
);


const agentTerm =
    expansion.terms.find(
        term =>
            term.term ===
            "agent"
    )!;


check(
    "PROFILE TERM RETAINS CONTRIBUTION ORIGINS",
    agentTerm.originKinds.includes(
        "CONTRIBUTION_SUBJECT"
    ) &&
    agentTerm.sourceArtifactIds.length ===
        3
);


check(
    "PROFILE TERM RETAINS SOURCE EVIDENCE",
    JSON.stringify(
        agentTerm.evidenceIds
    ) ===
        JSON.stringify([
            "EVIDENCE-A",
            "EVIDENCE-B",
            "EVIDENCE-C"
        ])
);


check(
    "GENERIC GET TOKEN IS NOT USED FOR DISCOVERY",
    !request.searchTerms.includes(
        "get"
    )
);


check(
    "DERIVED TERM COUNT IS CAPPED",
    request.searchTerms.length <=
        6
);


check(
    "SOURCE-SCOPED PROFILE IDENTITY IS PRESERVED",
    request.protocolId ===
        "ERC-8301" &&
    request.profileId ===
        "PROFILE-ERC-8301" &&
    request.sourceId ===
        "GITHUB-AGENT-ERCS" &&
    request.sourceRevision ===
        "REV-AGENTS"
);


const repeated =
    new ScientificTheGraphProfileDiscoveryEngine()
        .expand(
            JSON.parse(
                JSON.stringify([
                    profile
                ])
            ),
            JSON.parse(
                JSON.stringify(
                    basePlan.requests
                )
            ),
            4
        );


check(
    "PROFILE DISCOVERY EXPANSION IS DETERMINISTIC",
    JSON.stringify(
        repeated
    ) ===
        JSON.stringify(
            expansion
        )
);


const acceptedBy25A =
    new ScientificTheGraphProductDiscoveryEngine()
        .assemble(
            [
                profile
            ],
            expansion.requests,
            []
        );


check(
    "25A ACCEPTS EXPANDED SEARCH BASIS",
    acceptedBy25A.errors.length ===
        0 &&
    acceptedBy25A.candidates.length ===
        0
);


const invalidLimit =
    new ScientificTheGraphProfileDiscoveryEngine()
        .expand(
            [
                profile
            ],
            basePlan.requests,
            -1
        );


check(
    "INVALID DERIVED TERM LIMIT FAILS CLOSED",
    invalidLimit.errors.length >
        0 &&
    invalidLimit.requests.length ===
        0
);


const brokenRequest =
    JSON.parse(
        JSON.stringify(
            basePlan.requests[0]
        )
    );


brokenRequest.sourceRevision =
    "WRONG-REVISION";


const brokenExpansion =
    new ScientificTheGraphProfileDiscoveryEngine()
        .expand(
            [
                profile
            ],
            [
                brokenRequest
            ]
        );


check(
    "SOURCE REVISION MISMATCH FAILS CLOSED",
    brokenExpansion.errors.length >
        0 &&
    brokenExpansion.requests.length ===
        0
);


const serialized =
    JSON.stringify(
        expansion
    );


check(
    "PROFILE DISCOVERY CONTAINS NO SCIENTIFIC POLARITY",
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
    "SELECTED SEARCH TERMS"
);

console.log(
    request.searchTerms.join(
        ", "
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