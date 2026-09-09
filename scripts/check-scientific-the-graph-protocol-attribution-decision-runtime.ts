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

import {
    projectScientificTheGraphProtocolAttributionDecision
} from "../laboratory/scientific-the-graph-protocol-attribution/ScientificTheGraphProtocolAttributionDecision.js";


let pass =
    0;

let fail =
    0;


function check(
    name:
        string,
    condition:
        boolean
): void {

    console.log(
        `${name}: ${condition ? "PASS" : "FAIL"}`
    );

    if (condition) {
        pass++;
    }
    else {
        fail++;
    }

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


function assessment(
    overrides:
        Record<string, unknown>
): any {

    return {

        assessmentId:
            "ASSESSMENT-A",

        protocolId:
            "ERC-8004",

        profileId:
            "PROFILE-ERC-8004",

        normativeSourceId:
            "GITHUB-ERC-8004",

        normativeSourceRevision:
            "REV-A",

        subgraphId:
            "SUBGRAPH-A",

        ipfsHash:
            "Qm11111111111111111111111111111111111111111111",

        providerMode:
            "FIXTURE",

        schemaObservationId:
            "SCHEMA-A",

        schemaHash:
            "HASH-A",

        identifiersChecked:
            [
                "ERC-8004",
                "ERC8004"
            ],

        matchedIdentifiers:
            [],

        rejectedIdentifierOccurrences:
            [],

        status:
            "UNATTRIBUTED",

        attributionBasis:
            "NO_EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER",

        nextAction:
            "REQUIRES_ADDITIONAL_ATTRIBUTION_EVIDENCE",

        ...overrides

    };

}


console.log("");
console.log(
    "SCIENTIFIC THE GRAPH SELECTIVE ATTRIBUTION DECISION"
);
console.log(
    "==================================================="
);


const positive =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            status:
                "ATTRIBUTED",

            attributionBasis:
                "EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER",

            matchedIdentifiers:
                [
                    {
                        identifier:
                            "ERC-8004",

                        occurrenceCount:
                            1
                    }
                ],

            nextAction:
                "ELIGIBLE_FOR_DATA_QUERY_DESIGN"

        })
    );


check(
    "CONSISTENT AFFIRMATIVE ATTRIBUTION PROJECTS POSITIVE",
    positive.decision ===
        "POSITIVE" &&
    positive.decisionBasis ===
        "AFFIRMATIVE_ATTRIBUTION_EVIDENCE"
);


const noIdentifier =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({})
    );


check(
    "CONSISTENT NO-IDENTIFIER ASSESSMENT PROJECTS NEGATIVE",
    noIdentifier.decision ===
        "NEGATIVE" &&
    noIdentifier.decisionBasis ===
        "NO_EXPLICIT_PROTOCOL_IDENTIFIER"
);


const explicitNegation =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            attributionBasis:
                "ONLY_REJECTED_SCHEMA_PROTOCOL_IDENTIFIER_CONTEXT",

            rejectedIdentifierOccurrences:
                [
                    {
                        identifier:
                            "ERC-8004",

                        occurrenceCount:
                            1,

                        reasons:
                            [
                                "EXPLICIT_NEGATION_CONTEXT"
                            ]
                    }
                ]

        })
    );


check(
    "EXPLICIT NEGATION PROJECTS NEGATIVE",
    explicitNegation.decision ===
        "NEGATIVE" &&
    explicitNegation.decisionBasis ===
        "EXPLICIT_NON_ATTRIBUTION_EVIDENCE"
);


const ambiguous =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            attributionBasis:
                "ONLY_REJECTED_SCHEMA_PROTOCOL_IDENTIFIER_CONTEXT",

            rejectedIdentifierOccurrences:
                [
                    {
                        identifier:
                            "ERC-8004",

                        occurrenceCount:
                            1,

                        reasons:
                            [
                                "AMBIGUOUS_IDENTIFIER_CONTEXT"
                            ]
                    }
                ]

        })
    );


check(
    "AMBIGUOUS IDENTIFIER PROJECTS ABSTAIN",
    ambiguous.decision ===
        "ABSTAIN" &&
    ambiguous.decisionBasis ===
        "AMBIGUOUS_PROTOCOL_IDENTIFIER_CONTEXT"
);


const inconsistentPositiveNoMatch =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            status:
                "ATTRIBUTED",

            attributionBasis:
                "EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER",

            matchedIdentifiers:
                [],

            nextAction:
                "ELIGIBLE_FOR_DATA_QUERY_DESIGN"

        })
    );


check(
    "ATTRIBUTED WITHOUT ACCEPTED MATCH FAILS CLOSED",
    inconsistentPositiveNoMatch.decision ===
        "ABSTAIN" &&
    inconsistentPositiveNoMatch.decisionBasis ===
        "INCONSISTENT_ATTRIBUTION_ASSESSMENT"
);


const inconsistentPositiveBasis =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            status:
                "ATTRIBUTED",

            attributionBasis:
                "NO_EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER",

            matchedIdentifiers:
                [
                    {
                        identifier:
                            "ERC-8004",

                        occurrenceCount:
                            1
                    }
                ],

            nextAction:
                "ELIGIBLE_FOR_DATA_QUERY_DESIGN"

        })
    );


check(
    "ATTRIBUTED WITH CONTRADICTORY BASIS FAILS CLOSED",
    inconsistentPositiveBasis.decision ===
        "ABSTAIN" &&
    inconsistentPositiveBasis.decisionBasis ===
        "INCONSISTENT_ATTRIBUTION_ASSESSMENT"
);


const inconsistentNoIdentifier =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            rejectedIdentifierOccurrences:
                [
                    {
                        identifier:
                            "ERC-8004",

                        occurrenceCount:
                            1,

                        reasons:
                            [
                                "AMBIGUOUS_IDENTIFIER_CONTEXT"
                            ]
                    }
                ]

        })
    );


check(
    "NO-IDENTIFIER BASIS WITH REJECTED EVIDENCE FAILS CLOSED",
    inconsistentNoIdentifier.decision ===
        "ABSTAIN" &&
    inconsistentNoIdentifier.decisionBasis ===
        "INCONSISTENT_ATTRIBUTION_ASSESSMENT"
);


const inconsistentRejectedEmpty =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            attributionBasis:
                "ONLY_REJECTED_SCHEMA_PROTOCOL_IDENTIFIER_CONTEXT",

            rejectedIdentifierOccurrences:
                []

        })
    );


check(
    "REJECTED-CONTEXT BASIS WITHOUT REJECTED EVIDENCE FAILS CLOSED",
    inconsistentRejectedEmpty.decision ===
        "ABSTAIN" &&
    inconsistentRejectedEmpty.decisionBasis ===
        "INCONSISTENT_ATTRIBUTION_ASSESSMENT"
);


const invalidOccurrence =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            attributionBasis:
                "ONLY_REJECTED_SCHEMA_PROTOCOL_IDENTIFIER_CONTEXT",

            rejectedIdentifierOccurrences:
                [
                    {
                        identifier:
                            "ERC-8004",

                        occurrenceCount:
                            0,

                        reasons:
                            [
                                "EXPLICIT_NEGATION_CONTEXT"
                            ]
                    }
                ]

        })
    );


check(
    "INVALID OCCURRENCE COUNT FAILS CLOSED",
    invalidOccurrence.decision ===
        "ABSTAIN" &&
    invalidOccurrence.decisionBasis ===
        "INCONSISTENT_ATTRIBUTION_ASSESSMENT"
);


const invalidProvenance =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            schemaHash:
                ""

        })
    );


check(
    "INVALID CORE PROVENANCE FAILS CLOSED",
    invalidProvenance.decision ===
        "ABSTAIN" &&
    invalidProvenance.decisionBasis ===
        "INCONSISTENT_ATTRIBUTION_ASSESSMENT"
);


const mixedRejected =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            attributionBasis:
                "ONLY_REJECTED_SCHEMA_PROTOCOL_IDENTIFIER_CONTEXT",

            rejectedIdentifierOccurrences:
                [
                    {
                        identifier:
                            "ERC-8004",

                        occurrenceCount:
                            2,

                        reasons:
                            [
                                "AMBIGUOUS_IDENTIFIER_CONTEXT",
                                "EXPLICIT_NEGATION_CONTEXT"
                            ]
                    }
                ]

        })
    );


check(
    "EXPLICIT NEGATION HAS PRECEDENCE IN MIXED REJECTED CONTEXT",
    mixedRejected.decision ===
        "NEGATIVE" &&
    mixedRejected.decisionBasis ===
        "EXPLICIT_NON_ATTRIBUTION_EVIDENCE"
);


const repeated =
    projectScientificTheGraphProtocolAttributionDecision(
        assessment({

            attributionBasis:
                "ONLY_REJECTED_SCHEMA_PROTOCOL_IDENTIFIER_CONTEXT",

            rejectedIdentifierOccurrences:
                [
                    {
                        identifier:
                            "ERC-8004",

                        occurrenceCount:
                            1,

                        reasons:
                            [
                                "AMBIGUOUS_IDENTIFIER_CONTEXT"
                            ]
                    }
                ]

        })
    );


check(
    "DECISION PROJECTION IS DETERMINISTIC",
    JSON.stringify(
        repeated
    ) ===
    JSON.stringify(
        ambiguous
    )
);


check(
    "FULL ATTRIBUTION PROVENANCE IS PRESERVED",
    positive.assessmentId ===
        "ASSESSMENT-A" &&
    positive.protocolId ===
        "ERC-8004" &&
    positive.profileId ===
        "PROFILE-ERC-8004" &&
    positive.normativeSourceId ===
        "GITHUB-ERC-8004" &&
    positive.normativeSourceRevision ===
        "REV-A" &&
    positive.subgraphId ===
        "SUBGRAPH-A" &&
    positive.ipfsHash ===
        "Qm11111111111111111111111111111111111111111111" &&
    positive.providerMode ===
        "FIXTURE" &&
    positive.schemaObservationId ===
        "SCHEMA-A" &&
    positive.schemaHash ===
        "HASH-A"
);


const serialized =
    JSON.stringify([
        positive,
        noIdentifier,
        explicitNegation,
        ambiguous,
        inconsistentPositiveNoMatch
    ]);


check(
    "DECISION PROJECTION CONTAINS NO SCIENTIFIC POLARITY",
    !serialized.includes(
        "scientificPolarity"
    ) &&
    !serialized.includes(
        "compatibilityPolarity"
    ) &&
    !serialized.includes(
        "\"SUPPORT\""
    ) &&
    !serialized.includes(
        "\"CHALLENGE\""
    ) &&
    !serialized.includes(
        "\"FULL\""
    ) &&
    !serialized.includes(
        "\"PARTIAL\""
    )
);


/*
 * Frozen V5 replay through the production decision projector.
 *
 * This is a regression of the already-closed Hito 26K result,
 * not a new independent precision benchmark.
 */

interface FrozenV5Case {

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


function profileFor(
    benchmarkCase:
        FrozenV5Case
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
        FrozenV5Case,
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
        hash(
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


const frozenV5 =
    JSON.parse(
        readFileSync(
            new URL(
                "../benchmarks/scientific-the-graph-protocol-attribution/holdout-v5.json",
                import.meta.url
            ),
            "utf8"
        )
    ) as FrozenV5Case[];


const attributionResult =
    new ScientificTheGraphProtocolAttributionEngine()
        .assess(
            frozenV5.map(
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


check(
    "FROZEN V5 ATTRIBUTION ENGINE REPLAY HAS NO ERRORS",
    attributionResult.errors.length ===
        0 &&
    attributionResult.assessments.length ===
        60
);


const assessmentBySubgraph =
    new Map(
        attributionResult.assessments.map(
            currentAssessment => [
                currentAssessment.subgraphId,
                currentAssessment
            ]
        )
    );


const replayCases =
    frozenV5.map(
        benchmarkCase => {

            const currentAssessment =
                assessmentBySubgraph.get(
                    `V5-SUBGRAPH-${benchmarkCase.caseId}`
                );


            if (
                currentAssessment ===
                undefined
            ) {

                throw new Error(
                    `Missing frozen V5 assessment for ${benchmarkCase.caseId}.`
                );

            }


            const projection =
                projectScientificTheGraphProtocolAttributionDecision(
                    currentAssessment
                );


            return {

                caseId:
                    benchmarkCase.caseId,

                expected:
                    benchmarkCase.expected,

                observed:
                    projection.decision

            };

        }
    );


const replayBenchmark =
    new ScientificPrecisionBenchmarkEngine()
        .benchmark(
            replayCases,
            0.95
        );


if (
    replayBenchmark.errors.length >
        0 ||
    replayBenchmark.metrics ===
        null
) {

    throw new Error(
        replayBenchmark.errors.join(
            "\n"
        ) ||
        "Frozen V5 production-decision replay produced no metrics."
    );

}


const metrics =
    replayBenchmark.metrics;


check(
    "PRODUCTION DECISION REPRODUCES FROZEN V5 CONFUSION MATRIX",
    metrics.truePositive ===
        20 &&
    metrics.falsePositive ===
        0 &&
    metrics.trueNegative ===
        20 &&
    metrics.falseNegative ===
        0
);


check(
    "PRODUCTION DECISION REPRODUCES FROZEN V5 ABSTENTIONS",
    metrics.abstainedPositive ===
        10 &&
    metrics.abstainedNegative ===
        10
);


check(
    "PRODUCTION DECISION REPRODUCES FROZEN V5 FIRM PRECISION",
    metrics.firmDecisions ===
        40 &&
    metrics.precision ===
        1 &&
    metrics.firmAccuracy ===
        1 &&
    metrics.targetPrecisionMet ===
        true
);


check(
    "PRODUCTION DECISION REPRODUCES FROZEN V5 COVERAGE AND RECALL",
    Math.abs(
        metrics.coverage -
        (2 / 3)
    ) <
        1e-12 &&
    metrics.recall !==
        null &&
    Math.abs(
        metrics.recall -
        (2 / 3)
    ) <
        1e-12 &&
    metrics.negativeRecall !==
        null &&
    Math.abs(
        metrics.negativeRecall -
        (2 / 3)
    ) <
        1e-12
);


console.log("");
console.log(
    "FROZEN V5 PRODUCTION-DECISION REPLAY"
);

console.log(
    "------------------------------------"
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

console.log(
    `firm decisions: ${metrics.firmDecisions}`
);

console.log(
    `precision: ${(metrics.precision! * 100).toFixed(2)}%`
);

console.log(
    `coverage: ${(metrics.coverage * 100).toFixed(2)}%`
);


console.log("");
console.log(
    `PASS: ${pass}`
);

console.log(
    `FAIL: ${fail}`
);

console.log(
    `RESULT: ${fail === 0 ? "PASS" : "FAIL"}`
);


if (fail > 0) {
    process.exitCode = 1;
}