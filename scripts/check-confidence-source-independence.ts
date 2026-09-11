import {
    ConfidenceEngine
} from "../laboratory/confidence-engine/ConfidenceEngine.js";

import type {
    ResearchConclusionResult
} from "../laboratory/research-conclusions/ResearchConclusionResult.js";

import type {
    SourceIndependenceAssessment
} from "../laboratory/source-independence/SourceIndependenceAssessment.js";

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

function conclusions(
    supportedBy: string[]
): ResearchConclusionResult {

    return {
        generatedAt:
            new Date().toISOString(),

        conclusions: [
            {
                conclusionId:
                    "CONCLUSION-CONTROLLED-00001",

                sourcePatternId:
                    "PATTERN-CONTROLLED-00001",

                sourcePatternRelation:
                    "RESERVATION:CONSTRAINS:ACCOUNTING",

                subject:
                    "Reservation",

                relation:
                    "Constrains",

                object:
                    "Accounting",

                statement:
                    "Controlled conclusion.",

                supportedBy,

                confidence:
                    50,

                status:
                    "PRELIMINARY",

                evidence:
                    []
            }
        ],

        errors:
            []
    };

}

function independentPair(
    sourceAId: string,
    sourceBId: string
): SourceIndependenceAssessment {

    return {
        sourceIds: [
            sourceAId,
            sourceBId
        ],

        status:
            "INDEPENDENT",

        reason:
            "DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",

        establishedIndependentSources:
            2,

        explanation:
            "Controlled fixture explicitly establishes scientific independence."
    };

}

console.log(
    "\n=== CONFIDENCE SOURCE INDEPENDENCE REGRESSION ===\n"
);

/*
 * CASE 1
 *
 * Three observed source identities exist,
 * but no scientific independence assessment exists.
 *
 * Legacy behavior would have counted 3 sources and
 * added +21 confidence.
 *
 * New behavior must count zero established
 * independent sources.
 */

const unassessed =
    new ConfidenceEngine().build(
        conclusions([
            "SOURCE-A",
            "SOURCE-B",
            "SOURCE-C"
        ])
    );

const unassessedResult =
    unassessed.assessments[0];

assert(
    unassessedResult !== undefined,
    "UNASSESSED CONFIDENCE RESULT CREATED"
);

assert(
    unassessedResult?.independentSources === 0,
    "THREE OBSERVED SOURCE IDS DO NOT AUTOMATICALLY BECOME THREE INDEPENDENT SOURCES"
);

assert(
    unassessedResult?.calculatedConfidence === 50,
    "UNASSESSED SOURCE IDS DO NOT ADD SOURCE-INDEPENDENCE CONFIDENCE BONUS"
);

assert(
    unassessedResult?.maturity ===
        "PRELIMINARY",
    "UNASSESSED SOURCE IDS DO NOT PROMOTE MATURITY"
);

assert(
    unassessedResult?.reasons.some(
        reason =>
            reason.includes(
                "No scientifically independent source set"
            )
    ) === true,
    "UNASSESSED INDEPENDENCE IS EXPLAINED EXPLICITLY"
);

/*
 * CASE 2
 *
 * All three pairwise relationships are explicitly
 * independent.
 *
 * Therefore the set-level engine may establish all
 * three sources as mutually independent.
 */

const explicitThreeWayIndependence:
    SourceIndependenceAssessment[] = [
        independentPair(
            "SOURCE-A",
            "SOURCE-B"
        ),
        independentPair(
            "SOURCE-A",
            "SOURCE-C"
        ),
        independentPair(
            "SOURCE-B",
            "SOURCE-C"
        )
    ];

const assessed =
    new ConfidenceEngine().build(
        conclusions([
            "SOURCE-A",
            "SOURCE-B",
            "SOURCE-C"
        ]),
        explicitThreeWayIndependence
    );

const assessedResult =
    assessed.assessments[0];

assert(
    assessedResult !== undefined,
    "ASSESSED CONFIDENCE RESULT CREATED"
);

assert(
    assessedResult?.independentSources === 3,
    "THREE MUTUALLY ESTABLISHED SOURCES COUNT AS THREE INDEPENDENT SOURCES"
);

assert(
    assessedResult?.calculatedConfidence === 71,
    "THREE ESTABLISHED INDEPENDENT SOURCES ADD EXACTLY THE CURRENT +21 BONUS"
);

assert(
    assessedResult?.maturity ===
        "SUPPORTED",
    "EXPLICITLY ESTABLISHED SOURCE INDEPENDENCE MAY PROMOTE MATURITY"
);

/*
 * CASE 3
 *
 * Only two pairs are explicitly independent.
 * The third relationship is absent.
 *
 * The system must not count all three.
 */

const incompleteIndependence:
    SourceIndependenceAssessment[] = [
        independentPair(
            "SOURCE-A",
            "SOURCE-B"
        ),
        independentPair(
            "SOURCE-B",
            "SOURCE-C"
        )
    ];

const incomplete =
    new ConfidenceEngine().build(
        conclusions([
            "SOURCE-A",
            "SOURCE-B",
            "SOURCE-C"
        ]),
        incompleteIndependence
    );

const incompleteResult =
    incomplete.assessments[0];

assert(
    incompleteResult?.independentSources === 2,
    "INCOMPLETE THREE-WAY INDEPENDENCE COUNTS ONLY THE LARGEST ESTABLISHED SUBSET"
);

assert(
    incompleteResult?.calculatedConfidence === 64,
    "ONLY TWO ESTABLISHED INDEPENDENT SOURCES CONTRIBUTE TO CONFIDENCE"
);

assert(
    incompleteResult?.maturity ===
        "PRELIMINARY",
    "TWO SOURCES DO NOT PROMOTE MATURITY WHEN CONFIDENCE REMAINS BELOW 70"
);

/*
 * CASE 4
 *
 * Duplicate source IDs in supportedBy must not
 * inflate the independent source set.
 */

const duplicateSources =
    new ConfidenceEngine().build(
        conclusions([
            "SOURCE-A",
            "SOURCE-A",
            "SOURCE-B"
        ]),
        [
            independentPair(
                "SOURCE-A",
                "SOURCE-B"
            )
        ]
    );

const duplicateResult =
    duplicateSources.assessments[0];

assert(
    duplicateResult?.independentSources === 2,
    "DUPLICATE SUPPORTEDBY SOURCE IDS DO NOT INFLATE INDEPENDENT SOURCE COUNT"
);

assert(
    duplicateResult?.calculatedConfidence === 64,
    "DUPLICATE SOURCE IDS DO NOT CREATE EXTRA CONFIDENCE BONUS"
);

if (
    process.exitCode
) {

    console.error(
        "\nPHASE 10.3G3C CONFIDENCE SOURCE INDEPENDENCE REGRESSION FAILED"
    );

    process.exit(
        process.exitCode
    );

}

console.log(
    "\nPHASE 10.3G3C CONFIDENCE SOURCE INDEPENDENCE REGRESSION PASSED"
);