import {
    ScientificPrecisionBenchmarkEngine
} from "../laboratory/scientific-precision-benchmark/ScientificPrecisionBenchmarkEngine.js";

import {
    ScientificTheGraphSubgraphMcpLiveClient
} from "../laboratory/scientific-the-graph-subgraph-mcp/ScientificTheGraphSubgraphMcpClient.js";

import {
    ScientificTheGraphSubgraphInspectionEngine
} from "../laboratory/scientific-the-graph-subgraph-inspection/ScientificTheGraphSubgraphInspectionEngine.js";

import {
    ScientificTheGraphProtocolAttributionEngine
} from "../laboratory/scientific-the-graph-protocol-attribution/ScientificTheGraphProtocolAttributionEngine.js";


const apiKey =
    process.env.THE_GRAPH_API_KEY
        ?.trim();


if (
    apiKey ===
        undefined ||
    apiKey.length ===
        0
) {

    throw new Error(
        "THE_GRAPH_API_KEY is required."
    );

}


const subgraphId =
    "43s9hQRurMGjuYnC1r2ZwS6xSQktbFyXMPMqGKUFJojb";

const ipfsHash =
    "QmcLwgyKn3RnyhkkSwLYscP9dL1Fc6omvfC9bFRgcK1e7u";


const client =
    new ScientificTheGraphSubgraphMcpLiveClient(
        apiKey
    );


let inspectionResult;


try {

    inspectionResult =
        await new ScientificTheGraphSubgraphInspectionEngine(
            client,
            "LIVE"
        )
            .inspect([
                {

                    requestId:
                        "H26C-LIVE-AGENT0-BASE",

                    subgraphId,

                    ipfsHash

                }
            ]);

}
finally {

    await client.close();

}


if (
    inspectionResult.errors.length >
        0 ||
    inspectionResult.inspections.length !==
        1
) {

    throw new Error(
        inspectionResult.errors.join(
            "\n"
        ) ||
        `Expected one LIVE inspection, found ${inspectionResult.inspections.length}.`
    );

}


const inspection =
    inspectionResult.inspections[0];


if (
    inspection.providerMode !==
        "LIVE" ||
    inspection.subgraphId !==
        subgraphId ||
    inspection.ipfsHash !==
        ipfsHash
) {

    throw new Error(
        "Agent0 LIVE inspection provenance mismatch."
    );

}


const protocolCases =
    [

        {
            protocolId:
                "ERC-8004",
            expected:
                "POSITIVE" as const
        },

        {
            protocolId:
                "ERC-8060",
            expected:
                "NEGATIVE" as const
        },

        {
            protocolId:
                "ERC-8263",
            expected:
                "NEGATIVE" as const
        },

        {
            protocolId:
                "ERC-8274",
            expected:
                "NEGATIVE" as const
        },

        {
            protocolId:
                "ERC-8275",
            expected:
                "NEGATIVE" as const
        },

        {
            protocolId:
                "ERC-8301",
            expected:
                "NEGATIVE" as const
        },

        {
            protocolId:
                "ERC-8312",
            expected:
                "NEGATIVE" as const
        },

        {
            protocolId:
                "ERC-8354",
            expected:
                "NEGATIVE" as const
        }

    ];


const attribution =
    new ScientificTheGraphProtocolAttributionEngine()
        .assess(
            protocolCases.map(
                protocolCase => ({

                    profile: {

                        profileId:
                            `H26C-LIVE-${protocolCase.protocolId}`,

                        protocolId:
                            protocolCase.protocolId,

                        sourceId:
                            "H26C-LIVE-AGENT0",

                        sourceRevision:
                            "AGENT0-BASE-PINNED",

                        attributedContainerSymbols:
                            [],

                        contributions:
                            [],

                        boundaries:
                            [],

                        needs:
                            []

                    } as any,

                    inspection

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


const assessmentByProtocol =
    new Map(
        attribution.assessments.map(
            assessment => [
                assessment.protocolId,
                assessment
            ]
        )
    );


const benchmark =
    new ScientificPrecisionBenchmarkEngine()
        .benchmark(
            protocolCases.map(
                protocolCase => {

                    const assessment =
                        assessmentByProtocol.get(
                            protocolCase.protocolId
                        );


                    if (
                        assessment ===
                        undefined
                    ) {

                        throw new Error(
                            `Missing LIVE assessment for ${protocolCase.protocolId}.`
                        );

                    }


                    return {

                        caseId:
                            `LIVE-AGENT0-${protocolCase.protocolId}`,

                        expected:
                            protocolCase.expected,

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
        "LIVE benchmark produced no metrics."
    );

}


console.log("");
console.log(
    "LIVE AGENT0 PROTOCOL ATTRIBUTION REFERENCE"
);
console.log(
    "=========================================="
);

console.log(
    `subgraph:    ${inspection.subgraphId}`
);

console.log(
    `deployment:  ${inspection.ipfsHash}`
);

console.log(
    `schema hash: ${inspection.schemaObservation.schemaHash}`
);

console.log(
    `provider:    ${inspection.providerMode}`
);


for (
    const protocolCase
    of protocolCases
) {

    const assessment =
        assessmentByProtocol.get(
            protocolCase.protocolId
        )!;


    console.log("");
    console.log(
        protocolCase.protocolId
    );

    console.log(
        `  expected: ${protocolCase.expected}`
    );

    console.log(
        `  observed: ${assessment.status === "ATTRIBUTED" ? "POSITIVE" : "NEGATIVE"}`
    );

    console.log(
        `  basis:    ${assessment.attributionBasis}`
    );

    console.log(
        `  matches:  ${assessment.matchedIdentifiers.length === 0
            ? "NONE"
            : assessment.matchedIdentifiers
                .map(
                    match =>
                        `${match.identifier}(${match.occurrenceCount})`
                )
                .join(", ")}`
    );

}


const metrics =
    benchmark.metrics;


console.log("");
console.log(
    "LIVE REFERENCE CONFUSION MATRIX"
);
console.log(
    "-------------------------------"
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


const expectedPattern =
    metrics.truePositive ===
        1 &&
    metrics.falsePositive ===
        0 &&
    metrics.trueNegative ===
        7 &&
    metrics.falseNegative ===
        0;


console.log("");
console.log(
    `LIVE EXPECTED REFERENCE PATTERN: ${expectedPattern ? "YES" : "NO"}`
);

console.log(
    "A classification miss here remains a benchmark result; only provider/provenance failure fails execution."
);

console.log("");
console.log(
    "LIVE REFERENCE EXECUTION: PASS"
);