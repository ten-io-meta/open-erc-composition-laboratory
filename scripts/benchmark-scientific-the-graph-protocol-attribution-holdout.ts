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


function createProfile(
    benchmarkCase:
        HoldoutCase
): any {

    return {

        profileId:
            `HOLDOUT-PROFILE-${benchmarkCase.caseId}`,

        protocolId:
            benchmarkCase.protocolId,

        sourceId:
            "HOLDOUT-NORMATIVE-SOURCE",

        sourceRevision:
            "HOLDOUT-V1",

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


function createInspection(
    benchmarkCase:
        HoldoutCase,
    index:
        number
): any {

    const requestId =
        `HOLDOUT-REQUEST-${benchmarkCase.caseId}`;

    const subgraphId =
        `HOLDOUT-SUBGRAPH-${benchmarkCase.caseId}`;

    const ipfsHash =
        `Qm${String(index + 1).padStart(44, "0")}`;

    const schemaHash =
        sha256(
            benchmarkCase.schemaText
        );


    return {

        inspectionId:
            `HOLDOUT-INSPECTION-${benchmarkCase.caseId}`,

        requestId,

        subgraphId,

        ipfsHash,

        providerMode:
            "FIXTURE",

        schemaObservation: {

            observationId:
                `HOLDOUT-SCHEMA-${benchmarkCase.caseId}`,

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
                `HOLDOUT-ACTIVITY-${benchmarkCase.caseId}`,

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


const corpusPath =
    new URL(
        "../benchmarks/scientific-the-graph-protocol-attribution/holdout-v1.json",
        import.meta.url
    );


const corpus =
    JSON.parse(
        readFileSync(
            corpusPath,
            "utf8"
        )
    ) as HoldoutCase[];


if (
    corpus.length !==
    24
) {

    throw new Error(
        `Expected 24 holdout cases, found ${corpus.length}.`
    );

}


const uniqueIds =
    new Set(
        corpus.map(
            benchmarkCase =>
                benchmarkCase.caseId
        )
    );


if (
    uniqueIds.size !==
    corpus.length
) {

    throw new Error(
        "Holdout corpus contains duplicate case IDs."
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
                        createProfile(
                            benchmarkCase
                        ),

                    inspection:
                        createInspection(
                            benchmarkCase,
                            index
                        )

                })
            )
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
    corpus.length
) {

    throw new Error(
        `Expected ${corpus.length} assessments, found ${attribution.assessments.length}.`
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
                            `HOLDOUT-SUBGRAPH-${benchmarkCase.caseId}`
                        );


                    if (
                        assessment ===
                        undefined
                    ) {

                        throw new Error(
                            `Missing assessment for ${benchmarkCase.caseId}.`
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
    benchmark.errors.length >
        0 ||
    benchmark.metrics ===
        null
) {

    throw new Error(
        benchmark.errors.join(
            "\n"
        ) ||
        "Holdout benchmark produced no metrics."
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
    "THE GRAPH PROTOCOL ATTRIBUTION — HOLDOUT V1"
);
console.log(
    "============================================"
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
            `HOLDOUT-SUBGRAPH-${benchmarkCase.caseId}`
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
        assessment.rejectedIdentifierOccurrences.length >
        0
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
    "HOLDOUT CONFUSION MATRIX"
);
console.log(
    "------------------------"
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
    "HOLDOUT METRICS"
);
console.log(
    "---------------"
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
    "HOLDOUT INTERPRETATION"
);
console.log(
    "----------------------"
);

console.log(
    "These 24 cases were introduced after Hito 26B and did not participate in its hardening."
);

console.log(
    "A target miss is a measured benchmark result, not an execution failure."
);

console.log(
    "No production behavior is changed by this benchmark."
);


console.log("");
console.log(
    "HOLDOUT EXECUTION: PASS"
);