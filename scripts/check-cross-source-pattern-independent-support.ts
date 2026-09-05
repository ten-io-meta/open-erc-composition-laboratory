import {
    KnowledgePipeline
} from "../laboratory/orchestration/knowledge-pipeline/KnowledgePipeline.js";

import type {
    SourceIndependenceAssessment
} from "../laboratory/source-independence/SourceIndependenceAssessment.js";

function check(
    condition: boolean,
    label: string
): boolean {

    console.log(
        `${label}: ${condition ? "PASS" : "FAIL"}`
    );

    return condition;

}

/*
 * Three source identities whose pairwise
 * independence has been explicitly established.
 *
 * This is the positive mirror of the dependent
 * source regression.
 */

const sourceIndependenceAssessments =
    [
        {
            sourceIds: [
                "INDEPENDENT-SOURCE-A",
                "INDEPENDENT-SOURCE-B"
            ],

            status:
                "INDEPENDENT",

            reason:
                "DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",

            establishedIndependentSources:
                2,

            explanation:
                "Controlled explicit independence fixture."
        },
        {
            sourceIds: [
                "INDEPENDENT-SOURCE-A",
                "INDEPENDENT-SOURCE-C"
            ],

            status:
                "INDEPENDENT",

            reason:
                "DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",

            establishedIndependentSources:
                2,

            explanation:
                "Controlled explicit independence fixture."
        },
        {
            sourceIds: [
                "INDEPENDENT-SOURCE-B",
                "INDEPENDENT-SOURCE-C"
            ],

            status:
                "INDEPENDENT",

            reason:
                "DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",

            establishedIndependentSources:
                2,

            explanation:
                "Controlled explicit independence fixture."
        }
    ] as SourceIndependenceAssessment[];

const mergedKnowledge = {
    entries: [
        {
            sourceId:
                "INDEPENDENT-SOURCE-A",

            sources: [
                "INDEPENDENT-SOURCE-A",
                "INDEPENDENT-SOURCE-B",
                "INDEPENDENT-SOURCE-C"
            ],

            relation:
                "Reservation:CONSTRAINS:Accounting",

            protocolPair:
                "ERC1000->ERC1001",

            confidence:
                80,

            evidence: [
                "CONTROLLED-INDEPENDENT-SUPPORT"
            ]
        }
    ]
};

const result =
    new KnowledgePipeline().run(
        mergedKnowledge,
        sourceIndependenceAssessments
    );

const pattern =
    result.crossSourcePatterns
        .patterns[0];

const conclusion =
    result.researchConclusions
        .conclusions[0];

const confidence =
    result.confidence
        .assessments[0];

console.log("");
console.log(
    "CROSS-SOURCE INDEPENDENT SUPPORT"
);
console.log(
    "--------------------------------"
);

const checks = [
    check(
        pattern !== undefined &&
        pattern.sources.length === 3,
        "THREE OBSERVED SOURCE IDENTITIES PRESERVED"
    ),

    check(
        pattern?.status === "SUPPORTED",
        "THREE ESTABLISHED INDEPENDENT SOURCES CREATE SUPPORTED PATTERN"
    ),

    check(
        conclusion?.status === "ESTABLISHED",
        "SUPPORTED HIGH-CONFIDENCE PATTERN CREATES ESTABLISHED CONCLUSION"
    ),

    check(
        conclusion?.protocolPair ===
            "ERC1000->ERC1001",
        "PROTOCOL PAIR REMAINS PRESERVED"
    ),

    check(
        confidence?.independentSources === 3,
        "CONFIDENCE LAYER OBSERVES THREE INDEPENDENT SOURCES"
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