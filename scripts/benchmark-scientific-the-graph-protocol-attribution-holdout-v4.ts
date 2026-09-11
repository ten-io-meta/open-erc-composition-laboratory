import {
    createHash
} from "node:crypto";

import {
    readFileSync
} from "node:fs";

import {
    ScientificPrecisionBenchmarkEngine
} from "../laboratory/scientific-precision-benchmark/ScientificPrecisionBenchmarkEngine.js";

import {
    ScientificTheGraphProtocolAttributionEngine
} from "../laboratory/scientific-the-graph-protocol-attribution/ScientificTheGraphProtocolAttributionEngine.js";


interface HoldoutCase {

    caseId:
        string;

    category:
        string;

    protocolId:
        string;

    expected:
        "POSITIVE" | "NEGATIVE";

    schemaText:
        string;

}


function hash(
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


function profileFor(
    benchmarkCase:
        HoldoutCase
): any {

    return {

        profileId:
            `V4-PROFILE-${benchmarkCase.caseId}`,

        protocolId:
            benchmarkCase.protocolId,

        sourceId:
            "HOLDOUT-V4-NORMATIVE-SOURCE",

        sourceRevision:
            "HOLDOUT-V4",

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


function inspectionFor(
    benchmarkCase:
        HoldoutCase,
    index:
        number
): any {

    const requestId =
        `V4-REQUEST-${benchmarkCase.caseId}`;

    const subgraphId =
        `V4-SUBGRAPH-${benchmarkCase.caseId}`;

    const ipfsHash =
        `QmV4${String(index + 1).padStart(42, "0")}`;

    const schemaHash =
        hash(
            benchmarkCase.schemaText
        );


    return {

        inspectionId:
            `V4-INSPECTION-${benchmarkCase.caseId}`,

        requestId,

        subgraphId,

        ipfsHash,

        providerMode:
            "FIXTURE",

        schemaObservation: {

            observationId:
                `V4-SCHEMA-${benchmarkCase.caseId}`,

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
                benchmarkCase.schemaText,

            schemaHash,

            status:
                "SCHEMA_OBSERVED"

        },

        queryActivityObservation: {

            observationId:
                `V4-ACTIVITY-${benchmarkCase.caseId}`,

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
                hash(
                    "{}"
                )

        },

        status:
            "INSPECTED",

        nextAction:
            "ASSESS_PROTOCOL_ATTRIBUTION"

    };

}


const corpus =
    JSON.parse(
        readFileSync(
            new URL(
                "../benchmarks/scientific-the-graph-protocol-attribution/holdout-v4.json",
                import.meta.url
            ),
            "utf8"
        )
    ) as HoldoutCase[];


if (corpus.length !== 40) {

    throw new Error(
        `Expected 40 V4 cases, found ${corpus.length}.`
    );

}


const ids =
    new Set(
        corpus.map(
            benchmarkCase =>
                benchmarkCase.caseId
        )
    );


if (ids.size !== corpus.length) {

    throw new Error(
        "V4 contains duplicate case IDs."
    );

}


const positiveCount =
    corpus.filter(
        benchmarkCase =>
            benchmarkCase.expected ===
            "POSITIVE"
    ).length;


const negativeCount =
    corpus.filter(
        benchmarkCase =>
            benchmarkCase.expected ===
            "NEGATIVE"
    ).length;


if (
    positiveCount !== 20 ||
    negativeCount !== 20
) {

    throw new Error(
        `Expected balanced V4 20/20 corpus, found ${positiveCount}/${negativeCount}.`
    );

}


const attribution =
    new ScientificTheGraphProtocolAttributionEngine()
        .assess(
            corpus.map(
                (
                    benchmarkCase,
                    index
                ) => ({

                    profile:
                        profileFor(
                            benchmarkCase
                        ),

                    inspection:
                        inspectionFor(
                            benchmarkCase,
                            index
                        )

                })
            )
        );


if (attribution.errors.length > 0) {

    throw new Error(
        attribution.errors.join(
            "\n"
        )
    );

}


if (
    attribution.assessments.length !==
    corpus.length
) {

    throw new Error(
        `Expected 40 V4 assessments, found ${attribution.assessments.length}.`
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


const benchmark =
    new ScientificPrecisionBenchmarkEngine()
        .benchmark(
            corpus.map(
                benchmarkCase => {

                    const assessment =
                        assessmentBySubgraph.get(
                            `V4-SUBGRAPH-${benchmarkCase.caseId}`
                        );


                    if (assessment === undefined) {

                        throw new Error(
                            `Missing V4 assessment for ${benchmarkCase.caseId}.`
                        );

                    }


                    return {

                        caseId:
                            benchmarkCase.caseId,

                        expected:
                            benchmarkCase.expected,

                        observed:
                            assessment.status ===
                                "ATTRIBUTED"
                                    ? "POSITIVE" as const
                                    : "NEGATIVE" as const

                    };

                }
            ),
            0.95
        );


if (
    benchmark.errors.length > 0 ||
    benchmark.metrics === null
) {

    throw new Error(
        benchmark.errors.join(
            "\n"
        ) ||
        "V4 benchmark produced no metrics."
    );

}


const fixtureById =
    new Map(
        corpus.map(
            benchmarkCase => [
                benchmarkCase.caseId,
                benchmarkCase
            ]
        )
    );


console.log("");
console.log(
    "THE GRAPH PROTOCOL ATTRIBUTION — FINAL HOLDOUT V4"
);
console.log(
    "================================================="
);


for (
    const benchmarkCase
    of benchmark.cases
) {

    const fixture =
        fixtureById.get(
            benchmarkCase.caseId
        )!;


    const assessment =
        assessmentBySubgraph.get(
            `V4-SUBGRAPH-${benchmarkCase.caseId}`
        )!;


    console.log(
        `${benchmarkCase.expected === benchmarkCase.observed ? "PASS" : "MISS"} ${benchmarkCase.caseId}`
    );

    console.log(
        `  category: ${fixture.category}`
    );

    console.log(
        `  protocol: ${fixture.protocolId}`
    );

    console.log(
        `  expected: ${benchmarkCase.expected}`
    );

    console.log(
        `  observed: ${benchmarkCase.observed}`
    );

    console.log(
        `  basis:    ${assessment.attributionBasis}`
    );


    if (
        assessment.rejectedIdentifierOccurrences.length > 0
    ) {

        console.log(
            `  rejected: ${assessment.rejectedIdentifierOccurrences
                .map(
                    rejected =>
                        `${rejected.identifier}:${rejected.reasons.join("+")}`
                )
                .join(", ")}`
        );

    }

}


const metrics =
    benchmark.metrics;


console.log("");
console.log(
    "V4 CONFUSION MATRIX"
);
console.log(
    "-------------------"
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


console.log("");
console.log(
    "V4 METRICS"
);
console.log(
    "----------"
);

console.log(
    `precision: ${metrics.precision === null
        ? "UNDEFINED"
        : (metrics.precision * 100).toFixed(2) + "%"}`
);

console.log(
    `recall:    ${metrics.recall === null
        ? "UNDEFINED"
        : (metrics.recall * 100).toFixed(2) + "%"}`
);

console.log(
    `coverage:  ${(metrics.coverage * 100).toFixed(2)}%`
);

console.log(
    `firm accuracy: ${metrics.firmAccuracy === null
        ? "UNDEFINED"
        : (metrics.firmAccuracy * 100).toFixed(2) + "%"}`
);

console.log(
    `target precision: ${(metrics.targetPrecision * 100).toFixed(2)}%`
);

console.log(
    `target met: ${metrics.targetPrecisionMet === null
        ? "UNDEFINED"
        : metrics.targetPrecisionMet
            ? "YES"
            : "NO"}`
);


console.log("");
console.log(
    "V4 INTERPRETATION"
);
console.log(
    "-----------------"
);

console.log(
    "V4 was created only after Hito 26H was committed."
);

console.log(
    "Production remained frozen while V4 was evaluated."
);

console.log(
    "V4 contains 20 positive and 20 negative cases across multiple protocols."
);

console.log(
    "This benchmark evaluates protocol-attribution classification only; it does not measure overall OECL scientific precision."
);

console.log("");
console.log(
    "V4 EXECUTION: PASS"
);