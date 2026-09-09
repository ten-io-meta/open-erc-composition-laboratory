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


function profileFor(
    benchmarkCase:
        HoldoutCase
): any {

    return {

        profileId:
            `SELECTIVE-V4-PROFILE-${benchmarkCase.caseId}`,

        protocolId:
            benchmarkCase.protocolId,

        sourceId:
            "SELECTIVE-V4-NORMATIVE-SOURCE",

        sourceRevision:
            "FROZEN-HOLDOUT-V4",

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
        `SELECTIVE-V4-REQUEST-${benchmarkCase.caseId}`;

    const subgraphId =
        `SELECTIVE-V4-SUBGRAPH-${benchmarkCase.caseId}`;

    const ipfsHash =
        `QmSJ${String(index + 1).padStart(42, "0")}`;

    const schemaHash =
        sha256(
            benchmarkCase.schemaText
        );


    return {

        inspectionId:
            `SELECTIVE-V4-INSPECTION-${benchmarkCase.caseId}`,

        requestId,

        subgraphId,

        ipfsHash,

        providerMode:
            "FIXTURE",

        schemaObservation: {

            observationId:
                `SELECTIVE-V4-SCHEMA-${benchmarkCase.caseId}`,

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
                `SELECTIVE-V4-ACTIVITY-${benchmarkCase.caseId}`,

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
        `Expected frozen V4 corpus of 40 cases, found ${corpus.length}.`
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


const assessmentBySubgraph =
    new Map(
        attribution.assessments.map(
            assessment => [
                assessment.subgraphId,
                assessment
            ]
        )
    );


function observedDecision(
    assessment:
        any
): "POSITIVE" | "NEGATIVE" | "ABSTAIN" {

    if (
        assessment.status ===
        "ATTRIBUTED"
    ) {

        return "POSITIVE";

    }


    if (
        assessment.attributionBasis ===
        "NO_EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER"
    ) {

        return "NEGATIVE";

    }


    const rejectionReasons =
        new Set(
            assessment.rejectedIdentifierOccurrences
                .flatMap(
                    (
                        rejected:
                            any
                    ) =>
                        rejected.reasons
                )
        );


    /*
     * Explicit negative or explicit reference-only context can
     * support a firm negative attribution decision.
     */
    if (
        rejectionReasons.has(
            "EXPLICIT_NEGATION_CONTEXT"
        ) ||
        rejectionReasons.has(
            "REFERENCE_ONLY_CONTEXT"
        )
    ) {

        return "NEGATIVE";

    }


    /*
     * An exact identifier exists, but the engine cannot justify
     * either affirmative attribution or firm negative absence.
     *
     * Precision benchmark therefore abstains.
     */
    if (
        rejectionReasons.has(
            "AMBIGUOUS_IDENTIFIER_CONTEXT"
        )
    ) {

        return "ABSTAIN";

    }


    return "ABSTAIN";

}


const benchmarkInput =
    corpus.map(
        benchmarkCase => {

            const assessment =
                assessmentBySubgraph.get(
                    `SELECTIVE-V4-SUBGRAPH-${benchmarkCase.caseId}`
                );


            if (assessment === undefined) {

                throw new Error(
                    `Missing selective assessment for ${benchmarkCase.caseId}.`
                );

            }


            return {

                caseId:
                    benchmarkCase.caseId,

                expected:
                    benchmarkCase.expected,

                observed:
                    observedDecision(
                        assessment
                    )

            };

        }
    );


const benchmark =
    new ScientificPrecisionBenchmarkEngine()
        .benchmark(
            benchmarkInput,
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
        "Selective V4 benchmark produced no metrics."
    );

}


const inputById =
    new Map(
        benchmarkInput.map(
            benchmarkCase => [
                benchmarkCase.caseId,
                benchmarkCase
            ]
        )
    );


console.log("");
console.log(
    "THE GRAPH PROTOCOL ATTRIBUTION — SELECTIVE FROZEN V4"
);
console.log(
    "===================================================="
);


for (
    const benchmarkCase
    of corpus
) {

    const decision =
        inputById.get(
            benchmarkCase.caseId
        )!;


    const assessment =
        assessmentBySubgraph.get(
            `SELECTIVE-V4-SUBGRAPH-${benchmarkCase.caseId}`
        )!;


    console.log(
        `${benchmarkCase.caseId}: expected=${benchmarkCase.expected} observed=${decision.observed}`
    );

    console.log(
        `  attributionStatus: ${assessment.status}`
    );

    console.log(
        `  basis: ${assessment.attributionBasis}`
    );


    if (
        assessment.rejectedIdentifierOccurrences.length >
        0
    ) {

        console.log(
            `  rejected: ${assessment.rejectedIdentifierOccurrences
                .map(
                    (
                        rejected:
                            any
                    ) =>
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
    "SELECTIVE V4 CONFUSION MATRIX"
);
console.log(
    "-----------------------------"
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
    "SELECTIVE V4 METRICS"
);
console.log(
    "--------------------"
);

console.log(
    `firm decisions: ${metrics.firmDecisions}`
);

console.log(
    `precision: ${metrics.precision === null
        ? "UNDEFINED"
        : (metrics.precision * 100).toFixed(2) + "%"}`
);

console.log(
    `recall: ${metrics.recall === null
        ? "UNDEFINED"
        : (metrics.recall * 100).toFixed(2) + "%"}`
);

console.log(
    `negative recall: ${metrics.negativeRecall === null
        ? "UNDEFINED"
        : (metrics.negativeRecall * 100).toFixed(2) + "%"}`
);

console.log(
    `firm accuracy: ${metrics.firmAccuracy === null
        ? "UNDEFINED"
        : (metrics.firmAccuracy * 100).toFixed(2) + "%"}`
);

console.log(
    `coverage: ${(metrics.coverage * 100).toFixed(2)}%`
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
    "SELECTIVE INTERPRETATION"
);
console.log(
    "------------------------"
);

console.log(
    "AMBIGUOUS_IDENTIFIER_CONTEXT is treated as benchmark ABSTAIN, not as a manufactured negative decision."
);

console.log(
    "Precision therefore applies only to firm attribution decisions."
);

console.log(
    "Coverage is reported separately and must not be hidden."
);

console.log(
    "Frozen V4 remains unchanged; this is a new selective-decision evaluation."
);

console.log("");
console.log(
    "SELECTIVE V4 EXECUTION: PASS"
);