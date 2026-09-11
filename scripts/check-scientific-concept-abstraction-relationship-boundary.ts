import {
    ScientificConceptAbstractionEngine
} from "../laboratory/scientific-concept-abstraction/ScientificConceptAbstractionEngine.js";

import type {
    ScientificSemanticDerivationResult
} from "../laboratory/scientific-semantic-derivation/ScientificSemanticDerivationResult.js";


const derivation =
    {
        sourceId:
            "CONTROLLED-SOURCE",

        sourceRevision:
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",

        model: {
            modelId:
                "SCIENTIFIC-SEMANTIC-CONTROLLED-SOURCE-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",

            generatedAt:
                "2026-01-01T00:00:00.000Z",

            capabilities: [
                {
                    capabilityId:
                        "LEXICAL-RESERVE-VALUE",

                    label:
                        "reserve value",

                    protocols:
                        [],

                    evidence: [
                        "FACT-1"
                    ]
                },
                {
                    capabilityId:
                        "LEXICAL-RELEASE-VALUE",

                    label:
                        "release value",

                    protocols:
                        [],

                    evidence: [
                        "FACT-2"
                    ]
                }
            ],

            relationships: [
                {
                    fromCapability:
                        "LEXICAL-RESERVE-VALUE",

                    toCapability:
                        "LEXICAL-RELEASE-VALUE",

                    relation:
                        "CO_OCCURS_WITH",

                    evidence:
                        [
                            "CONTAMINATED-EVIDENCE"
                        ],

                    confidence:
                        75
                }
            ]
        },

        errors:
            []

    } as ScientificSemanticDerivationResult;


const engine =
    new ScientificConceptAbstractionEngine();


const result =
    engine.abstract(
        derivation
    );


const checks = [
    {
        name:
            "UPSTREAM RELATIONSHIP CONTAMINATION IS DETECTED",

        passed:
            result.errors.some(
                error =>
                    error.includes(
                        "relationships"
                    )
            )
    },
    {
        name:
            "UPSTREAM RELATIONSHIP CONTAMINATION FAILS CLOSED",

        passed:
            result.concepts.length ===
            0
    },
    {
        name:
            "CONTAMINATED CO-OCCURRENCE DOES NOT PRODUCE VALUE CONCEPT",

        passed:
            !result.concepts.some(
                concept =>
                    concept.conceptId ===
                    "CONCEPT-VALUE"
            )
    }
];


console.log("");
console.log(
    "SCIENTIFIC CONCEPT ABSTRACTION RELATIONSHIP BOUNDARY"
);
console.log(
    "----------------------------------------------------"
);


for (
    const check
    of checks
) {

    console.log(
        `${check.name}: ${
            check.passed
                ? "PASS"
                : "FAIL"
        }`
    );

}


const failures =
    checks.filter(
        check =>
            !check.passed
    );


console.log("");


if (
    failures.length ===
    0
) {

    console.log(
        "RESULT: PASS"
    );

} else {

    console.log(
        `RESULT: FAIL (${failures.length}/${checks.length})`
    );

    process.exitCode =
        1;

}
