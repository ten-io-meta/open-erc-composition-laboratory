import {
    KnowledgePipeline
} from "../laboratory/orchestration/knowledge-pipeline/KnowledgePipeline.js";

import {
    SourceIndependenceAssessmentEngine
} from "../laboratory/source-independence/SourceIndependenceAssessmentEngine.js";

import type {
    ResearchSource
} from "../laboratory/research-source/ResearchSource.js";

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
 * Three distinct source identities deliberately
 * point to the same repository.
 *
 * Observed provenance identities = 3.
 * Scientifically independent sources = 0.
 *
 * A cross-source pattern must therefore never become
 * SUPPORTED merely because three sourceIds exist.
 */

const sources: ResearchSource[] = [
    {
        sourceId:
            "DEPENDENT-SOURCE-A",

        title:
            "Dependent source A",

        type:
            "GITHUB",

        author:
            "CONTROLLED",

        publishedAt:
            "2026-09-05",

        version:
            "1",

        location:
            "https://github.com/controlled/shared-repository",

        repository:
            "controlled/shared-repository",

        description:
            "Controlled dependent source A."
    },
    {
        sourceId:
            "DEPENDENT-SOURCE-B",

        title:
            "Dependent source B",

        type:
            "GITHUB",

        author:
            "CONTROLLED",

        publishedAt:
            "2026-09-05",

        version:
            "1",

        location:
            "https://github.com/controlled/shared-repository",

        repository:
            "controlled/shared-repository",

        description:
            "Controlled dependent source B."
    },
    {
        sourceId:
            "DEPENDENT-SOURCE-C",

        title:
            "Dependent source C",

        type:
            "GITHUB",

        author:
            "CONTROLLED",

        publishedAt:
            "2026-09-05",

        version:
            "1",

        location:
            "https://github.com/controlled/shared-repository",

        repository:
            "controlled/shared-repository",

        description:
            "Controlled dependent source C."
    }
];

const sourceIndependence =
    new SourceIndependenceAssessmentEngine().build(
        sources
    );

const mergedKnowledge = {
    entries: [
        {
            sourceId:
                "DEPENDENT-SOURCE-A",

            relation:
                "Reservation:CONSTRAINS:Accounting",

            protocolPair:
                "ERC1000->ERC1001",

            confidence:
                80,

            evidence: []
        },
        {
            sourceId:
                "DEPENDENT-SOURCE-B",

            relation:
                "Reservation:CONSTRAINS:Accounting",

            protocolPair:
                "ERC1000->ERC1001",

            confidence:
                80,

            evidence: []
        },
        {
            sourceId:
                "DEPENDENT-SOURCE-C",

            relation:
                "Reservation:CONSTRAINS:Accounting",

            protocolPair:
                "ERC1000->ERC1001",

            confidence:
                80,

            evidence: []
        }
    ]
};

const result =
    new KnowledgePipeline().run(
        mergedKnowledge,
        sourceIndependence.assessments
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
    "CROSS-SOURCE PATTERN INDEPENDENCE BOUNDARY"
);
console.log(
    "------------------------------------------"
);

const checks = [
    check(
        sourceIndependence.assessments.length === 3,
        "THREE PAIRWISE DEPENDENCY ASSESSMENTS CREATED"
    ),

    check(
        sourceIndependence.assessments.every(
            assessment =>
                assessment.status ===
                "DEPENDENT"
        ),
        "ALL THREE SOURCE PAIRS ARE DEPENDENT"
    ),

    check(
        pattern !== undefined &&
        pattern.sources.length === 3,
        "THREE OBSERVED SOURCE IDENTITIES PRESERVED"
    ),

    check(
        pattern !== undefined &&
        pattern.status !== "SUPPORTED",
        "DEPENDENT SOURCES CANNOT CREATE SUPPORTED PATTERN"
    ),

    check(
        conclusion !== undefined &&
        conclusion.status !== "ESTABLISHED",
        "DEPENDENT SOURCES CANNOT CREATE ESTABLISHED CONCLUSION"
    ),

    check(
        confidence !== undefined &&
        confidence.independentSources === 0,
        "CONFIDENCE LAYER CONFIRMS ZERO INDEPENDENT SOURCES"
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