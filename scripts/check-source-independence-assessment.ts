import {
    SourceIndependenceAssessmentEngine
} from "../laboratory/source-independence/SourceIndependenceAssessmentEngine.js";

import type {
    ResearchSource
} from "../laboratory/research-source/ResearchSource.js";

import {
    ResearchSourceType
} from "../laboratory/research-source/ResearchSourceType.js";

import type {
    SourceIndependenceEvidence
} from "../laboratory/source-independence/SourceIndependenceEvidence.js";

const engine =
    new SourceIndependenceAssessmentEngine();

function source(
    overrides:
        Partial<ResearchSource> &
        Pick<ResearchSource, "sourceId">
): ResearchSource {

    return {
        sourceId:
            overrides.sourceId,

        title:
            overrides.title ??
            overrides.sourceId,

        type:
            overrides.type ??
            ResearchSourceType.GITHUB,

        author:
            overrides.author,

        publishedAt:
            overrides.publishedAt,

        version:
            overrides.version,

        location:
            overrides.location,

        repository:
            overrides.repository,

        branch:
            overrides.branch,

        commit:
            overrides.commit,

        metadata:
            overrides.metadata,

        description:
            overrides.description,

        keywords:
            overrides.keywords ??
            [],

        referencedProtocols:
            overrides.referencedProtocols ??
            [],

        referencedCapabilities:
            overrides.referencedCapabilities ??
            [],

        ingested:
            overrides.ingested ??
            true,

        ingestedAt:
            overrides.ingestedAt
    };

}

function assert(
    condition: boolean,
    message: string
): void {

    if (
        condition
    ) {

        console.log(
            `PASS: ${message}`
        );

        return;

    }

    console.error(
        `FAIL: ${message}`
    );

    process.exitCode = 1;

}

console.log(
    "\n=== SOURCE INDEPENDENCE CONTROLLED REGRESSION ===\n"
);

const sameSourceId =
    engine.build([
        source({
            sourceId:
                "SOURCE-A",
            location:
                "https://example.com/a"
        }),
        source({
            sourceId:
                "SOURCE-A",
            location:
                "https://example.com/b"
        })
    ]);

assert(
    sameSourceId.assessments.length === 1,
    "SAME SOURCE ID PRODUCES ONE PAIR ASSESSMENT"
);

assert(
    sameSourceId.assessments[0]?.status ===
        "DEPENDENT",
    "SAME SOURCE ID IS DEPENDENT"
);

assert(
    sameSourceId.assessments[0]?.reason ===
        "SAME_SOURCE_ID",
    "SAME SOURCE ID USES SAME_SOURCE_ID REASON"
);

assert(
    sameSourceId.assessments[0]?.establishedIndependentSources ===
        0,
    "SAME SOURCE ID DOES NOT CREATE INDEPENDENT SOURCES"
);

const sameRepository =
    engine.build([
        source({
            sourceId:
                "SOURCE-REPO-A",
            location:
                "https://github.com/ten-io-meta/erc8060-reservable"
        }),
        source({
            sourceId:
                "SOURCE-REPO-B",
            repository:
                "ten-io-meta/erc8060-reservable"
        })
    ]);

assert(
    sameRepository.assessments[0]?.status ===
        "DEPENDENT",
    "DISTINCT SOURCE IDS IN SAME REPOSITORY ARE DEPENDENT"
);

assert(
    sameRepository.assessments[0]?.reason ===
        "SAME_REPOSITORY",
    "SAME REPOSITORY USES SAME_REPOSITORY REASON"
);

assert(
    sameRepository.assessments[0]?.establishedIndependentSources ===
        0,
    "SAME REPOSITORY DOES NOT CREATE INDEPENDENT SOURCES"
);

const sameLocation =
    engine.build([
        source({
            sourceId:
                "SOURCE-LOCATION-A",
            location:
                "https://example.com/source/"
        }),
        source({
            sourceId:
                "SOURCE-LOCATION-B",
            location:
                "https://example.com/source"
        })
    ]);

assert(
    sameLocation.assessments[0]?.status ===
        "DEPENDENT",
    "SAME NORMALIZED LOCATION IS DEPENDENT"
);

assert(
    sameLocation.assessments[0]?.reason ===
        "SAME_NORMALIZED_LOCATION",
    "SAME LOCATION USES SAME_NORMALIZED_LOCATION REASON"
);

const distinctWithoutEvidence =
    engine.build([
        source({
            sourceId:
                "SOURCE-DISTINCT-A",
            type:
                ResearchSourceType.DOI,
            author:
                "Author A",
            location:
                "doi:10.0000/example"
        }),
        source({
            sourceId:
                "SOURCE-DISTINCT-B",
            type:
                ResearchSourceType.GITHUB,
            author:
                "Author B",
            location:
                "https://github.com/example/project"
        })
    ]);

assert(
    distinctWithoutEvidence.assessments[0]?.status ===
        "INCONCLUSIVE",
    "DISTINCT SOURCES WITHOUT EXPLICIT EVIDENCE ARE INCONCLUSIVE"
);

assert(
    distinctWithoutEvidence.assessments[0]?.establishedIndependentSources ===
        0,
    "DISTINCT SOURCE IDS DO NOT AUTOMATICALLY BECOME INDEPENDENT SOURCES"
);

const explicitIndependence:
    SourceIndependenceEvidence[] = [
        {
            sourceAId:
                "SOURCE-INDEPENDENT-A",

            sourceBId:
                "SOURCE-INDEPENDENT-B",

            status:
                "INDEPENDENT",

            basis:
                "Controlled fixture explicitly establishes independent origin.",

            evidenceIds:
                [
                    "CONTROLLED-INDEPENDENCE-EVIDENCE-0001"
                ]
        }
    ];

const explicitlyIndependent =
    engine.build(
        [
            source({
                sourceId:
                    "SOURCE-INDEPENDENT-A",
                type:
                    ResearchSourceType.PAPER,
                author:
                    "Independent Author A",
                location:
                    "https://example.com/paper-a"
            }),

            source({
                sourceId:
                    "SOURCE-INDEPENDENT-B",
                type:
                    ResearchSourceType.GITHUB,
                author:
                    "Independent Author B",
                location:
                    "https://github.com/example/independent-b"
            })
        ],
        explicitIndependence
    );

assert(
    explicitlyIndependent.assessments[0]?.status ===
        "INDEPENDENT",
    "EXPLICIT EVIDENCE CAN ESTABLISH SOURCE INDEPENDENCE"
);

assert(
    explicitlyIndependent.assessments[0]?.establishedIndependentSources ===
        2,
    "EXPLICITLY INDEPENDENT PAIR ESTABLISHES TWO INDEPENDENT SOURCES"
);

const explicitDependence:
    SourceIndependenceEvidence[] = [
        {
            sourceAId:
                "SOURCE-DEPENDENT-A",

            sourceBId:
                "SOURCE-DEPENDENT-B",

            status:
                "DEPENDENT",

            basis:
                "Controlled fixture explicitly establishes shared derivation.",

            evidenceIds:
                [
                    "CONTROLLED-DEPENDENCE-EVIDENCE-0001"
                ]
        }
    ];

const explicitlyDependent =
    engine.build(
        [
            source({
                sourceId:
                    "SOURCE-DEPENDENT-A",
                location:
                    "https://example.com/dependent-a"
            }),

            source({
                sourceId:
                    "SOURCE-DEPENDENT-B",
                location:
                    "https://example.com/dependent-b"
            })
        ],
        explicitDependence
    );

assert(
    explicitlyDependent.assessments[0]?.status ===
        "DEPENDENT",
    "EXPLICIT EVIDENCE CAN ESTABLISH SOURCE DEPENDENCE"
);

assert(
    explicitlyDependent.assessments[0]?.establishedIndependentSources ===
        0,
    "EXPLICIT DEPENDENCE DOES NOT CREATE INDEPENDENT SOURCES"
);

const singleSource =
    engine.build([
        source({
            sourceId:
                "SOURCE-SINGLE"
        })
    ]);

assert(
    singleSource.assessments[0]?.status ===
        "NOT_APPLICABLE",
    "SINGLE SOURCE IS NOT APPLICABLE FOR PAIR INDEPENDENCE"
);

assert(
    singleSource.assessments[0]?.establishedIndependentSources ===
        0,
    "SINGLE SOURCE DOES NOT CREATE INDEPENDENT SOURCES"
);

console.log(
    "\n=== STATISTICS CHECK ==="
);

const statisticsCheck =
    engine.build([
        source({
            sourceId:
                "SOURCE-STATS-A",
            repository:
                "example/shared"
        }),
        source({
            sourceId:
                "SOURCE-STATS-B",
            repository:
                "example/shared"
        }),
        source({
            sourceId:
                "SOURCE-STATS-C",
            location:
                "https://example.com/other"
        })
    ]);

console.log(
    JSON.stringify(
        statisticsCheck.statistics,
        null,
        4
    )
);

assert(
    statisticsCheck.statistics.total ===
        3,
    "THREE SOURCES PRODUCE THREE PAIR ASSESSMENTS"
);

assert(
    statisticsCheck.statistics.dependent >=
        1,
    "STATISTICS RECORD DEPENDENT PAIRS"
);

assert(
    statisticsCheck.statistics.inconclusive >=
        1,
    "STATISTICS RECORD INCONCLUSIVE PAIRS"
);

if (
    process.exitCode
) {

    console.error(
        "\nPHASE 10.3E SOURCE INDEPENDENCE REGRESSION FAILED"
    );

    process.exit(
        process.exitCode
    );

}

console.log(
    "\nPHASE 10.3E SOURCE INDEPENDENCE REGRESSION PASSED"
);