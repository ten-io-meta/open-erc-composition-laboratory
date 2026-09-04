import {
    KnowledgePipeline
} from "../laboratory/orchestration/knowledge-pipeline/KnowledgePipeline.js";

import {
    SourceIndependenceAssessmentEngine
} from "../laboratory/source-independence/SourceIndependenceAssessmentEngine.js";

import type {
    ResearchSource
} from "../laboratory/research-source/ResearchSource.js";

function assert(
    condition: boolean,
    message: string
): void {

    if (condition) {

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
    "\n=== KNOWLEDGE PIPELINE SOURCE INDEPENDENCE INTEGRATION ===\n"
);

/*
 * Two distinct source identities deliberately point
 * to the same repository.
 *
 * They must remain distinct provenance identities,
 * while their scientific independence must be
 * classified as DEPENDENT.
 */

const sources: ResearchSource[] = [
    {
        sourceId:
            "SOURCE-CONTROLLED-A",

        title:
            "Controlled source A",

        type:
            "GITHUB",

        author:
            "CONTROLLED",

        publishedAt:
            "2026-09-01",

        version:
            "1",

        location:
            "https://github.com/ten-io-meta/erc8060-reservable",

        repository:
            "ten-io-meta/erc8060-reservable",

        description:
            "Controlled source A."
    },
    {
        sourceId:
            "SOURCE-CONTROLLED-B",

        title:
            "Controlled source B",

        type:
            "GITHUB",

        author:
            "CONTROLLED",

        publishedAt:
            "2026-09-01",

        version:
            "1",

        location:
            "https://github.com/ten-io-meta/erc8060-reservable",

        repository:
            "ten-io-meta/erc8060-reservable",

        description:
            "Controlled source B."
    }
];

const sourceIndependence =
    new SourceIndependenceAssessmentEngine().build(
        sources
    );

assert(
    sourceIndependence.assessments.length === 1,
    "ONE PAIRWISE SOURCE INDEPENDENCE ASSESSMENT CREATED"
);

const pair =
    sourceIndependence.assessments[0];

assert(
    pair?.status ===
        "DEPENDENT",
    "DISTINCT SOURCE IDS FROM SAME REPOSITORY ARE DEPENDENT"
);

assert(
    pair?.reason ===
        "SAME_REPOSITORY",
    "DEPENDENCY IS EXPLAINED BY SAME REPOSITORY"
);

assert(
    pair?.establishedIndependentSources === 0,
    "SAME-REPOSITORY SOURCES ESTABLISH ZERO INDEPENDENT SOURCES"
);

/*
 * Minimal merged-knowledge fixture.
 *
 * Both source identities support the same relation.
 * CrossSourcePatternEngine should therefore preserve
 * both source identities into the resulting conclusion.
 */

const mergedKnowledge = {
    entries: [
        {
            knowledgeId:
                "KNOWLEDGE-CONTROLLED-A",

            sourceId:
                "SOURCE-CONTROLLED-A",

            subject:
                "RESERVATION",

            relation:
                "CONSTRAINS",

            object:
                "ACCOUNTING",

            confidence:
                80,

            status:
                "SUPPORTED",

            evidence:
                []
        },
        {
            knowledgeId:
                "KNOWLEDGE-CONTROLLED-B",

            sourceId:
                "SOURCE-CONTROLLED-B",

            subject:
                "RESERVATION",

            relation:
                "CONSTRAINS",

            object:
                "ACCOUNTING",

            confidence:
                80,

            status:
                "SUPPORTED",

            evidence:
                []
        }
    ]
};

const knowledge =
    new KnowledgePipeline().run(
        mergedKnowledge,
        sourceIndependence.assessments
    );

assert(
    knowledge.researchConclusions
        .conclusions.length > 0,
    "KNOWLEDGE PIPELINE CREATED A RESEARCH CONCLUSION"
);

const conclusion =
    knowledge.researchConclusions
        .conclusions[0];

assert(
    conclusion !== undefined,
    "CONTROLLED RESEARCH CONCLUSION EXISTS"
);

assert(
    conclusion?.supportedBy.includes(
        "SOURCE-CONTROLLED-A"
    ) === true,
    "FIRST SOURCE ID REACHES RESEARCH CONCLUSION"
);

assert(
    conclusion?.supportedBy.includes(
        "SOURCE-CONTROLLED-B"
    ) === true,
    "SECOND SOURCE ID REACHES RESEARCH CONCLUSION"
);

assert(
    conclusion?.supportedBy.length === 2,
    "BOTH SOURCE IDENTITIES REMAIN VISIBLE AS PROVENANCE"
);

const confidence =
    knowledge.confidence
        .assessments.find(
            assessment =>
                assessment.sourceConclusionId ===
                conclusion?.conclusionId
        );

assert(
    confidence !== undefined,
    "CONFIDENCE ASSESSMENT CREATED FOR CONTROLLED CONCLUSION"
);

assert(
    confidence?.independentSources === 0,
    "TWO SAME-REPOSITORY SOURCE IDS DO NOT BECOME TWO INDEPENDENT SOURCES"
);

/*
 * Critical separation:
 *
 * supportedBy remains provenance = 2 observed identities.
 * independentSources remains scientific assessment = 0.
 */

assert(
    conclusion?.supportedBy.length === 2 &&
    confidence?.independentSources === 0,
    "SOURCE PROVENANCE AND SOURCE INDEPENDENCE REMAIN SEPARATE THROUGH KNOWLEDGE PIPELINE"
);

assert(
    confidence?.reasons.some(
        reason =>
            reason.includes(
                "No scientifically independent source set"
            )
    ) === true,
    "CONFIDENCE EXPLAINS THAT SCIENTIFIC INDEPENDENCE WAS NOT ESTABLISHED"
);

if (
    process.exitCode
) {

    console.error(
        "\nPHASE 10.3G3E KNOWLEDGE PIPELINE SOURCE INDEPENDENCE INTEGRATION FAILED"
    );

    process.exit(
        process.exitCode
    );

}

console.log(
    "\nPHASE 10.3G3E KNOWLEDGE PIPELINE SOURCE INDEPENDENCE INTEGRATION PASSED"
);