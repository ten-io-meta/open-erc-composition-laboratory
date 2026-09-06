import {
    ScientificConceptAbstractionEngine
} from "../laboratory/scientific-concept-abstraction/ScientificConceptAbstractionEngine.js";

import type {
    ScientificSemanticDerivationResult
} from "../laboratory/scientific-semantic-derivation/ScientificSemanticDerivationResult.js";


const derivation:
    ScientificSemanticDerivationResult = {

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
                    "FACT-SHARED"
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
                    "FACT-SHARED"
                ]
            }
        ],

        relationships:
            []

    },

    errors:
        []

};


const engine =
    new ScientificConceptAbstractionEngine();

const result =
    engine.abstract(
        derivation
    );


const checks = [
    {
        name:
            "FACT EVIDENCE REUSE ACROSS DISTINCT CAPABILITIES IS DETECTED",

        passed:
            result.errors.some(
                error =>
                    error.includes(
                        "FACT-SHARED"
                    ) &&
                    error.includes(
                        "multiple lexical capabilities"
                    )
            )
    },
    {
        name:
            "CROSS-CAPABILITY FACT EVIDENCE REUSE FAILS CLOSED",

        passed:
            result.concepts.length ===
            0
    },
    {
        name:
            "REUSED FACT CANNOT CREATE RECURRENT VALUE CONCEPT",

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
    "SCIENTIFIC CONCEPT ABSTRACTION EVIDENCE INTEGRITY"
);
console.log(
    "------------------------------------------------"
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
