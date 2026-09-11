import {
    ScientificValidationEngine
} from "../laboratory/scientific-validation/ScientificValidationEngine.js";

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

console.log(
    "\n=== SCIENTIFIC VALIDATION SOURCE INDEPENDENCE ===\n"
);

/*
 * Controlled theory with three observed source identities.
 *
 * The evidence graph preserves all three identities.
 * Their mere existence must NOT establish scientific
 * independence.
 */

const theories = {
    generatedAt:
        new Date().toISOString(),

    theories: [
        {
            theoryId:
                "THEORY-CONTROLLED-001",

            title:
                "Controlled reservation theory",

            statement:
                "Reservation constrains accounting.",

            subject:
                "RESERVATION",

            relation:
                "CONSTRAINS",

            object:
                "ACCOUNTING",

            supportingEdges: [
                "EDGE-CONTROLLED-001"
            ],

            confidence:
                60,

            status:
                "PRELIMINARY"
        }
    ],

    statistics: {
        total: 1
    },

    errors: []
};

const graph = {
    generatedAt:
        new Date().toISOString(),

    nodes: [],

    edges: [
        {
            edgeId:
                "EDGE-CONTROLLED-001",

            from:
                "RESERVATION",

            relation:
                "CONSTRAINS",

            to:
                "ACCOUNTING",

            sources: [
                "SOURCE-A",
                "SOURCE-B",
                "SOURCE-C"
            ],

            evidence: []
        }
    ],

    statistics: {
        nodes: 0,
        edges: 1
    },

    errors: []
};

const contradictions = {
    generatedAt:
        new Date().toISOString(),

    contradictions: [],

    statistics: {
        total: 0
    },

    errors: []
};

/*
 * CASE 1
 *
 * Three source identities exist, but no scientific
 * independence assessments are supplied.
 */

const unassessed =
    new ScientificValidationEngine().build(
        theories,
        graph,
        contradictions,
        []
    );

const unassessedValidation =
    unassessed.validations[0];

assert(
    unassessedValidation !== undefined,
    "UNASSESSED VALIDATION CREATED"
);

assert(
    unassessedValidation?.independentSources === 0,
    "THREE OBSERVED SOURCE IDS DO NOT BECOME THREE INDEPENDENT SOURCES"
);

assert(
    unassessedValidation?.validationScore === 64,
    "UNASSESSED SOURCES RECEIVE NO INDEPENDENCE SCORE BONUS"
);

assert(
    unassessedValidation?.status ===
        "INCONCLUSIVE",
    "UNASSESSED SOURCE INDEPENDENCE CANNOT VALIDATE THEORY"
);

/*
 * CASE 2
 *
 * Every pair is explicitly established independent.
 *
 * The set engine may therefore establish a mutually
 * independent set of three sources.
 */

const fullyIndependent:
    SourceIndependenceAssessment[] = [
        {
            sourceIds: [
                "SOURCE-A",
                "SOURCE-B"
            ],

            status:
                "INDEPENDENT",

            reason:
                "DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",

            establishedIndependentSources:
                2,

            explanation:
                "Controlled explicit independence."
        },
        {
            sourceIds: [
                "SOURCE-A",
                "SOURCE-C"
            ],

            status:
                "INDEPENDENT",

            reason:
                "DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",

            establishedIndependentSources:
                2,

            explanation:
                "Controlled explicit independence."
        },
        {
            sourceIds: [
                "SOURCE-B",
                "SOURCE-C"
            ],

            status:
                "INDEPENDENT",

            reason:
                "DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",

            establishedIndependentSources:
                2,

            explanation:
                "Controlled explicit independence."
        }
    ];

const assessed =
    new ScientificValidationEngine().build(
        theories,
        graph,
        contradictions,
        fullyIndependent
    );

const assessedValidation =
    assessed.validations[0];

assert(
    assessedValidation !== undefined,
    "ASSESSED VALIDATION CREATED"
);

assert(
    assessedValidation?.independentSources === 3,
    "THREE MUTUALLY ESTABLISHED SOURCES COUNT AS THREE INDEPENDENT SOURCES"
);

assert(
    assessedValidation?.validationScore === 79,
    "THREE ESTABLISHED INDEPENDENT SOURCES ADD EXACTLY FIFTEEN SCORE POINTS"
);

assert(
    assessedValidation?.status ===
        "VALIDATED",
    "EXPLICITLY ESTABLISHED INDEPENDENCE CAN SATISFY VALIDATION SOURCE THRESHOLD"
);

/*
 * CASE 3
 *
 * Only a two-source mutually independent subset exists.
 * A-C remains inconclusive.
 */

const partiallyIndependent:
    SourceIndependenceAssessment[] = [
        {
            sourceIds: [
                "SOURCE-A",
                "SOURCE-B"
            ],

            status:
                "INDEPENDENT",

            reason:
                "DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",

            establishedIndependentSources:
                2,

            explanation:
                "Controlled explicit independence."
        },
        {
            sourceIds: [
                "SOURCE-A",
                "SOURCE-C"
            ],

            status:
                "INCONCLUSIVE",

            reason:
                "INSUFFICIENT_PROVENANCE",

            establishedIndependentSources:
                0,

            explanation:
                "Controlled inconclusive relationship."
        },
        {
            sourceIds: [
                "SOURCE-B",
                "SOURCE-C"
            ],

            status:
                "INDEPENDENT",

            reason:
                "DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",

            establishedIndependentSources:
                2,

            explanation:
                "Controlled explicit independence."
        }
    ];

const partial =
    new ScientificValidationEngine().build(
        theories,
        graph,
        contradictions,
        partiallyIndependent
    );

const partialValidation =
    partial.validations[0];

assert(
    partialValidation?.independentSources === 2,
    "INCOMPLETE THREE-WAY INDEPENDENCE COUNTS ONLY LARGEST ESTABLISHED SUBSET"
);

assert(
    partialValidation?.validationScore === 74,
    "TWO ESTABLISHED INDEPENDENT SOURCES ADD EXACTLY TEN SCORE POINTS"
);

assert(
    partialValidation?.status ===
        "INCONCLUSIVE",
    "TWO INDEPENDENT SOURCES CANNOT SATISFY THREE-SOURCE VALIDATION THRESHOLD"
);

assert(
    unassessedValidation?.explanation.includes(
        "explicitly established independent source"
    ) === true,
    "VALIDATION EXPLANATION USES EXPLICIT INDEPENDENCE SEMANTICS"
);

if (
    process.exitCode
) {

    console.error(
        "\nPHASE 10.3H2 SCIENTIFIC VALIDATION SOURCE INDEPENDENCE REGRESSION FAILED"
    );

    process.exit(
        process.exitCode
    );

}

console.log(
    "\nPHASE 10.3H2 SCIENTIFIC VALIDATION SOURCE INDEPENDENCE REGRESSION PASSED"
);