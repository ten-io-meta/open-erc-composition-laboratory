import {
    createHash
} from "node:crypto";

import {
    ScientificPrecisionBenchmarkEngine
} from "../laboratory/scientific-precision-benchmark/ScientificPrecisionBenchmarkEngine.js";

import {
    ScientificTheGraphProtocolAttributionEngine
} from "../laboratory/scientific-the-graph-protocol-attribution/ScientificTheGraphProtocolAttributionEngine.js";


interface AttributionBenchmarkFixture {

    caseId:
        string;

    expected:
        "POSITIVE" | "NEGATIVE";

    schemaText:
        string;

}


function sha256(
    value:
        string
): string {

    return createHash(
        "sha256"
    )
        .update(
            value,
            "utf8"
        )
        .digest(
            "hex"
        );

}


function makeProfile():
    any {

    return {

        profileId:
            "BENCHMARK-PROFILE-ERC-8004",

        protocolId:
            "ERC-8004",

        sourceId:
            "BENCHMARK-NORMATIVE-SOURCE",

        sourceRevision:
            "BENCHMARK-REVISION",

        attributedContainerSymbols:
            [],

        contributions:
            [],

        boundaries:
            [],

        needs:
            []

    };

}


function makeInspection(
    fixture:
        AttributionBenchmarkFixture,
    index:
        number
): any {

    const schemaHash =
        sha256(
            fixture.schemaText
        );


    const ipfsHash =
        `Qm${String(index + 1).padStart(44, "0")}`;


    const requestId =
        `BENCHMARK-REQUEST-${fixture.caseId}`;


    const subgraphId =
        `BENCHMARK-SUBGRAPH-${fixture.caseId}`;


    return {

        inspectionId:
            `BENCHMARK-INSPECTION-${fixture.caseId}`,

        requestId,

        subgraphId,

        ipfsHash,

        providerMode:
            "FIXTURE",

        schemaObservation: {

            observationId:
                `BENCHMARK-SCHEMA-${fixture.caseId}`,

            requestId,

            provider:
                "THE_GRAPH",

            providerMode:
                "FIXTURE",

            productKind:
                "SUBGRAPH",

            subgraphId,

            ipfsHash,

            toolName:
                "get_schema_by_ipfs_hash",

            schemaText:
                fixture.schemaText,

            schemaHash,

            status:
                "SCHEMA_OBSERVED"

        },

        queryActivityObservation: {

            observationId:
                `BENCHMARK-ACTIVITY-${fixture.caseId}`,

            requestId,

            provider:
                "THE_GRAPH",

            providerMode:
                "FIXTURE",

            productKind:
                "SUBGRAPH",

            subgraphId,

            ipfsHash,

            toolName:
                "get_deployment_30day_query_counts",

            dataPointsCount:
                0,

            totalQueryCount:
                0,

            activityStatus:
                "NO_RECENT_ACTIVITY_OBSERVED",

            rawFragment:
                "{}",

            fragmentHash:
                sha256(
                    "{}"
                )

        },

        status:
            "INSPECTED",

        nextAction:
            "ASSESS_PROTOCOL_ATTRIBUTION"

    };

}


const fixtures:
    AttributionBenchmarkFixture[] =
    [

        {
            caseId:
                "POSITIVE-EXACT-HYPHENATED",

            expected:
                "POSITIVE",

            schemaText:
                "# ERC-8004 protocol indexed entities"
        },

        {
            caseId:
                "POSITIVE-EXACT-COMPACT",

            expected:
                "POSITIVE",

            schemaText:
                "# ERC8004 protocol indexed entities"
        },

        {
            caseId:
                "POSITIVE-PUNCTUATED",

            expected:
                "POSITIVE",

            schemaText:
                '"""Indexed entities for ERC-8004."""'
        },

        {
            caseId:
                "POSITIVE-ENTITY-COMMENT",

            expected:
                "POSITIVE",

            schemaText:
                "type Agent @entity { id: ID! } # ERC-8004"
        },

        {
            caseId:
                "NEGATIVE-LOWERCASE-VARIANT",

            expected:
                "NEGATIVE",

            schemaText:
                "# erc-8004 is lowercase non-canonical text"
        },

        {
            caseId:
                "NEGATIVE-EMBEDDED-SUBSTRING",

            expected:
                "NEGATIVE",

            schemaText:
                "# XERC-8004Y is an unrelated token"
        },

        {
            caseId:
                "NEGATIVE-NEIGHBORING-NUMBER",

            expected:
                "NEGATIVE",

            schemaText:
                "# ERC-80040 is a different identifier"
        },

        {
            caseId:
                "NEGATIVE-SEMANTIC-ONLY",

            expected:
                "NEGATIVE",

            schemaText:
                "type AgentRegistry @entity { id: ID! owner: Bytes! }"
        },

        {
            caseId:
                "NEGATIVE-EXPLICIT-NEGATION",

            expected:
                "NEGATIVE",

            schemaText:
                "# This deployment does not implement ERC-8004."
        },

        {
            caseId:
                "NEGATIVE-REFERENCE-ONLY",

            expected:
                "NEGATIVE",

            schemaText:
                "# Documentation reference: ERC-8004; indexed protocol is ERC-9999."
        }

    ];


const attributionInputs =
    fixtures.map(
        (
            fixture,
            index
        ) => ({

            profile:
                makeProfile(),

            inspection:
                makeInspection(
                    fixture,
                    index
                )

        })
    );


const attribution =
    new ScientificTheGraphProtocolAttributionEngine()
        .assess(
            attributionInputs
        );


if (
    attribution.errors.length >
    0
) {

    throw new Error(
        attribution.errors.join(
            "\n"
        )
    );

}


if (
    attribution.assessments.length !==
    fixtures.length
) {

    throw new Error(
        `Expected ${fixtures.length} attribution assessments, found ${attribution.assessments.length}.`
    );

}


const assessmentBySubgraph =
    new Map(
        attribution.assessments.map(
            assessment => [
                assessment.subgraphId,
                assessment
            ]
        )
    );


const benchmarkCases =
    fixtures.map(
        fixture => {

            const subgraphId =
                `BENCHMARK-SUBGRAPH-${fixture.caseId}`;


            const assessment =
                assessmentBySubgraph.get(
                    subgraphId
                );


            if (
                assessment ===
                undefined
            ) {

                throw new Error(
                    `Missing attribution assessment for benchmark case ${fixture.caseId}.`
                );

            }


            return {

                caseId:
                    fixture.caseId,

                expected:
                    fixture.expected,

                observed:
                    assessment.status ===
                        "ATTRIBUTED"
                            ? "POSITIVE" as const
                            : "NEGATIVE" as const

            };

        }
    );


const benchmark =
    new ScientificPrecisionBenchmarkEngine()
        .benchmark(
            benchmarkCases,
            0.95
        );


if (
    benchmark.errors.length >
        0 ||
    benchmark.metrics ===
        null
) {

    throw new Error(
        benchmark.errors.join(
            "\n"
        ) ||
        "Precision benchmark produced no metrics."
    );

}


const metrics =
    benchmark.metrics;


console.log("");
console.log(
    "THE GRAPH PROTOCOL ATTRIBUTION PRECISION BASELINE"
);
console.log(
    "================================================="
);


for (
    const benchmarkCase
    of benchmark.cases
) {

    console.log(
        `${benchmarkCase.caseId}: expected=${benchmarkCase.expected} observed=${benchmarkCase.observed}`
    );

}


console.log("");
console.log(
    "CONFUSION MATRIX"
);
console.log(
    "----------------"
);

console.log(
    `TP: ${metrics.truePositive}`
);

console.log(
    `FP: ${metrics.falsePositive}`
);

console.log(
    `TN: ${metrics.trueNegative}`
);

console.log(
    `FN: ${metrics.falseNegative}`
);

console.log(
    `abstained positive: ${metrics.abstainedPositive}`
);

console.log(
    `abstained negative: ${metrics.abstainedNegative}`
);


console.log("");
console.log(
    "METRICS"
);
console.log(
    "-------"
);

console.log(
    `precision: ${metrics.precision === null ? "UNDEFINED" : (metrics.precision * 100).toFixed(2) + "%"}`
);

console.log(
    `recall:    ${metrics.recall === null ? "UNDEFINED" : (metrics.recall * 100).toFixed(2) + "%"}`
);

console.log(
    `coverage:  ${(metrics.coverage * 100).toFixed(2)}%`
);

console.log(
    `firm accuracy: ${metrics.firmAccuracy === null ? "UNDEFINED" : (metrics.firmAccuracy * 100).toFixed(2) + "%"}`
);

console.log(
    `target precision: ${(metrics.targetPrecision * 100).toFixed(2)}%`
);

console.log(
    `target met: ${metrics.targetPrecisionMet === null ? "UNDEFINED" : metrics.targetPrecisionMet ? "YES" : "NO"}`
);


/*
 * This is the frozen baseline expected from the current
 * exact-token attribution engine.
 *
 * Two adversarial negatives contain the exact ERC identifier
 * in explicitly negative/reference-only context. The current
 * engine sees the token but does not yet interpret that context.
 */
const baselineMatchesCurrentEngine =
    metrics.truePositive ===
        4 &&
    metrics.falsePositive ===
        2 &&
    metrics.trueNegative ===
        4 &&
    metrics.falseNegative ===
        0 &&
    metrics.abstainedPositive ===
        0 &&
    metrics.abstainedNegative ===
        0;


console.log("");
console.log(
    "BASELINE INTERPRETATION"
);
console.log(
    "-----------------------"
);

console.log(
    "Exact token boundaries correctly reject lowercase, embedded, neighboring-number and semantic-only negatives."
);

console.log(
    "The current engine still produces false positives when an exact ERC identifier appears only in explicit negation or reference-only context."
);

console.log(
    "The 95% precision objective is therefore not claimed by this baseline."
);

console.log(
    "This benchmark is controlled/adversarial evidence, not a real-world population estimate."
);


console.log("");
console.log(
    `BASELINE CONTRACT: ${baselineMatchesCurrentEngine ? "PASS" : "FAIL"}`
);


if (
    !baselineMatchesCurrentEngine
) {

    process.exitCode =
        1;

}