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
            `V5-PROFILE-${benchmarkCase.caseId}`,

        protocolId:
            benchmarkCase.protocolId,

        sourceId:
            "HOLDOUT-V5-NORMATIVE-SOURCE",

        sourceRevision:
            "POST-26J-V5",

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
        `V5-REQUEST-${benchmarkCase.caseId}`;

    const subgraphId =
        `V5-SUBGRAPH-${benchmarkCase.caseId}`;

    const ipfsHash =
        `QmK5${String(index + 1).padStart(42, "0")}`;

    const schemaHash =
        sha256(
            benchmarkCase.schemaText
        );


    return {

        inspectionId:
            `V5-INSPECTION-${benchmarkCase.caseId}`,

        requestId,

        subgraphId,

        ipfsHash,

        providerMode:
            "FIXTURE",

        schemaObservation: {

            observationId:
                `V5-SCHEMA-${benchmarkCase.caseId}`,

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
                `V5-ACTIVITY-${benchmarkCase.caseId}`,

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


function selectiveDecision(
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


    const reasons =
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


    if (
        reasons.has(
            "EXPLICIT_NEGATION_CONTEXT"
        ) ||
        reasons.has(
            "REFERENCE_ONLY_CONTEXT"
        )
    ) {

        return "NEGATIVE";

    }


    if (
        reasons.has(
            "AMBIGUOUS_IDENTIFIER_CONTEXT"
        )
    ) {

        return "ABSTAIN";

    }


    return "ABSTAIN";

}


const corpus =
    JSON.parse(
        readFileSync(
            new URL(
                "../benchmarks/scientific-the-graph-protocol-attribution/holdout-v5.json",
                import.meta.url
            ),
            "utf8"
        )
    ) as HoldoutCase[];


if (corpus.length !== 60) {

    throw new Error(
        `Expected 60 V5 cases, found ${corpus.length}.`
    );

}


if (
    new Set(
        corpus.map(
            benchmarkCase =>
                benchmarkCase.caseId
        )
    ).size !==
    corpus.length
) {

    throw new Error(
        "V5 contains duplicate case IDs."
    );

}


const expectedPositive =
    corpus.filter(
        benchmarkCase =>
            benchmarkCase.expected ===
            "POSITIVE"
    ).length;


const expectedNegative =
    corpus.filter(
        benchmarkCase =>
            benchmarkCase.expected ===
            "NEGATIVE"
    ).length;


if (
    expectedPositive !== 30 ||
    expectedNegative !== 30
) {

    throw new Error(
        `Expected balanced 30/30 V5 corpus, found ${expectedPositive}/${expectedNegative}.`
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
        `Expected 60 assessments, found ${attribution.assessments.length}.`
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


const benchmarkInput =
    corpus.map(
        benchmarkCase => {

            const assessment =
                assessmentBySubgraph.get(
                    `V5-SUBGRAPH-${benchmarkCase.caseId}`
                );


            if (assessment === undefined) {

                throw new Error(
                    `Missing V5 assessment for ${benchmarkCase.caseId}.`
                );

            }


            return {

                caseId:
                    benchmarkCase.caseId,

                expected:
                    benchmarkCase.expected,

                observed:
                    selectiveDecision(
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
        "V5 benchmark produced no metrics."
    );

}


const decisionById =
    new Map(
        benchmarkInput.map(
            decision => [
                decision.caseId,
                decision
            ]
        )
    );


console.log("");
console.log(
    "THE GRAPH PROTOCOL ATTRIBUTION — FINAL SELECTIVE HOLDOUT V5"
);
console.log(
    "============================================================"
);


for (
    const benchmarkCase
    of corpus
) {

    const decision =
        decisionById.get(
            benchmarkCase.caseId
        )!;


    const assessment =
        assessmentBySubgraph.get(
            `V5-SUBGRAPH-${benchmarkCase.caseId}`
        )!;


    console.log(
        `${benchmarkCase.caseId}: expected=${benchmarkCase.expected} observed=${decision.observed}`
    );

    console.log(
        `  category: ${benchmarkCase.category}`
    );

    console.log(
        `  status:   ${assessment.status}`
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
    "FINAL V5 CONFUSION MATRIX"
);
console.log(
    "-------------------------"
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
    "FINAL V5 METRICS"
);
console.log(
    "----------------"
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
    `target precision met: ${metrics.targetPrecisionMet === null
        ? "UNDEFINED"
        : metrics.targetPrecisionMet
            ? "YES"
            : "NO"}`
);


const closureEligible =
    metrics.precision !== null &&
    metrics.precision >= 0.95 &&
    metrics.firmAccuracy !== null &&
    metrics.firmAccuracy >= 0.95 &&
    metrics.coverage >= 0.60 &&
    metrics.recall !== null &&
    metrics.recall >= 0.60 &&
    metrics.negativeRecall !== null &&
    metrics.negativeRecall >= 0.60;


console.log("");
console.log(
    "PRE-REGISTERED CLOSURE CRITERIA"
);
console.log(
    "-------------------------------"
);

console.log(
    "precision >= 95%"
);

console.log(
    "firm accuracy >= 95%"
);

console.log(
    "coverage >= 60%"
);

console.log(
    "positive recall >= 60%"
);

console.log(
    "negative recall >= 60%"
);

console.log("");
console.log(
    `ATTRIBUTION BENCHMARK CLOSURE ELIGIBLE: ${closureEligible ? "YES" : "NO"}`
);


console.log("");
console.log(
    "FINAL INTERPRETATION"
);
console.log(
    "--------------------"
);

console.log(
    "V5 was created after Hito 26J and evaluated with production frozen."
);

console.log(
    "Precision applies only to firm decisions; abstentions and coverage are reported separately."
);

console.log(
    "This benchmark concerns The Graph protocol attribution only, not overall OECL scientific precision."
);

console.log(
    "The benchmark result is preserved regardless of whether closure criteria are met."
);

console.log("");
console.log(
    "FINAL V5 EXECUTION: PASS"
);