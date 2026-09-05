import {
    CrossSourcePatternEngine
} from "../laboratory/cross-source-patterns/CrossSourcePatternEngine.js";

import {
    ResearchConclusionEngine
} from "../laboratory/research-conclusions/ResearchConclusionEngine.js";

function check(
    condition: boolean,
    label: string
): boolean {

    console.log(
        `${label}: ${condition ? "PASS" : "FAIL"}`
    );

    return condition;
}

const engine =
    new CrossSourcePatternEngine();

/*
 * B-04
 *
 * KnowledgeMergeEngine may already have combined
 * several provenance identities into one entry.
 *
 * sourceId is only the backward-compatible primary
 * source. sources[] is the full provenance set.
 */
const mergedSourceFixture = {
    entries: [
        {
            sourceId:
                "SOURCE-A",

            sources: [
                "SOURCE-A",
                "SOURCE-B"
            ],

            relation:
                "Reservation:CONSTRAINS:Accounting",

            protocolPair:
                "ERC8060->IERC8060Reservable",

            confidence:
                80,

            evidence: [
                "CONTROLLED-B04"
            ]
        }
    ]
};

const mergedSourceResult =
    engine.discover(
        mergedSourceFixture
    );

const mergedSourcePattern =
    mergedSourceResult.patterns[0];

const preservesMergedSources =
    mergedSourcePattern !== undefined &&
    mergedSourcePattern.sources.includes(
        "SOURCE-A"
    ) &&
    mergedSourcePattern.sources.includes(
        "SOURCE-B"
    ) &&
    mergedSourcePattern.sources.length === 2;

/*
 * B-05
 *
 * The same capability relation may exist for
 * different protocol pairs.
 *
 * They are distinct scientific pattern identities
 * and must not be merged into one pattern merely
 * because normalizedRelation is identical.
 */
const pairIdentityFixture = {
    entries: [
        {
            sourceId:
                "SOURCE-A",

            relation:
                "Reservation:CONSTRAINS:Accounting",

            protocolPair:
                "ERC1000->ERC1001",

            confidence:
                80,

            evidence: [
                "PAIR-ONE-A"
            ]
        },
        {
            sourceId:
                "SOURCE-B",

            relation:
                "Reservation:CONSTRAINS:Accounting",

            protocolPair:
                "ERC1000->ERC1001",

            confidence:
                80,

            evidence: [
                "PAIR-ONE-B"
            ]
        },
        {
            sourceId:
                "SOURCE-C",

            relation:
                "Reservation:CONSTRAINS:Accounting",

            protocolPair:
                "ERC2000->ERC2001",

            confidence:
                80,

            evidence: [
                "PAIR-TWO-C"
            ]
        },
        {
            sourceId:
                "SOURCE-D",

            relation:
                "Reservation:CONSTRAINS:Accounting",

            protocolPair:
                "ERC2000->ERC2001",

            confidence:
                80,

            evidence: [
                "PAIR-TWO-D"
            ]
        }
    ]
};

const pairIdentityResult =
    engine.discover(
        pairIdentityFixture
    );

const preservesProtocolPairIdentity =
    pairIdentityResult.patterns.length === 2 &&
    pairIdentityResult.patterns.every(
        (pattern: any) =>
            typeof pattern.protocolPair === "string" &&
            pattern.protocolPair.length > 0
    );

const protocolPairs =
    new Set(
        pairIdentityResult.patterns.map(
            (pattern: any) =>
                pattern.protocolPair
        )
    );

const distinctProtocolPairsPreserved =
    protocolPairs.has(
        "ERC1000->ERC1001"
    ) &&
    protocolPairs.has(
        "ERC2000->ERC2001"
    );

/*
 * The identity must survive the next scientific
 * boundary as well.
 */
const conclusions =
    new ResearchConclusionEngine().build(
        pairIdentityResult
    );

const conclusionProtocolPairs =
    new Set(
        conclusions.conclusions.map(
            (conclusion: any) =>
                conclusion.protocolPair
        )
    );

const conclusionPreservesProtocolPairs =
    conclusions.conclusions.length === 2 &&
    conclusionProtocolPairs.has(
        "ERC1000->ERC1001"
    ) &&
    conclusionProtocolPairs.has(
        "ERC2000->ERC2001"
    );

console.log("");
console.log(
    "CROSS-SOURCE PATTERN IDENTITY"
);
console.log(
    "-----------------------------"
);

const checks = [
    check(
        preservesMergedSources,
        "MERGED sources[] PROVENANCE PRESERVED"
    ),

    check(
        preservesProtocolPairIdentity,
        "PROTOCOL PAIR PARTICIPATES IN PATTERN IDENTITY"
    ),

    check(
        distinctProtocolPairsPreserved,
        "SAME RELATION ACROSS DISTINCT PROTOCOL PAIRS REMAINS DISTINCT"
    ),

    check(
        conclusionPreservesProtocolPairs,
        "PROTOCOL PAIR SURVIVES RESEARCH CONCLUSION BOUNDARY"
    )
];

const pass =
    checks.every(Boolean);

console.log("");
console.log(
    `RESULT: ${pass ? "PASS" : "FAIL"}`
);

if (!pass) {
    process.exitCode = 1;
}