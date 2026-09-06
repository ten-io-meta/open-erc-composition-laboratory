import {
    ScientificCapabilityAttributionEngine
} from "../laboratory/scientific-capability-attribution/ScientificCapabilityAttributionEngine.js";

import type {
    ScientificSemanticDerivationResult
} from "../laboratory/scientific-semantic-derivation/ScientificSemanticDerivationResult.js";

import type {
    ScientificSourceFact
} from "../laboratory/scientific-source-fact/ScientificSourceFact.js";


const engine =
    new ScientificCapabilityAttributionEngine();


function derivation(
    sourceId:
        string,
    sourceRevision:
        string,
    capabilityId:
        string,
    label:
        string,
    evidence:
        string[]
): ScientificSemanticDerivationResult {

    return {

        sourceId,

        sourceRevision,

        model: {

            modelId:
                `MODEL-${sourceId}-${sourceRevision}`,

            generatedAt:
                "2026-01-01T00:00:00.000Z",

            capabilities: [
                {
                    capabilityId,

                    label,

                    protocols:
                        [],

                    evidence
                }
            ],

            relationships:
                []

        },

        errors:
            []

    };

}


function fact(
    factId:
        string,
    sourceId:
        string,
    sourceRevision:
        string
): ScientificSourceFact {

    return {

        factId,

        observationId:
            "OBS",

        sourceId,

        sourceRevision,

        kind:
            "FUNCTION_DECLARATION",

        symbol:
            "value",

        containerKind:
            "INTERFACE",

        containerSymbol:
            "ITest",

        locator: {

            sourceLocation:
                "CONTROLLED",

            filePath:
                "ITest.sol",

            startLine:
                1,

            endLine:
                1

        },

        rawText:
            "function value() external;"

    };

}


const collisionA =
    engine.attribute({

        derivation:
            derivation(
                "A-B",
                "C",
                "LEXICAL-VALUE",
                "value",
                [
                    "FACT-A"
                ]
            ),

        facts: [
            fact(
                "FACT-A",
                "A-B",
                "C"
            )
        ]

    });


const collisionB =
    engine.attribute({

        derivation:
            derivation(
                "A",
                "B-C",
                "LEXICAL-VALUE",
                "value",
                [
                    "FACT-B"
                ]
            ),

        facts: [
            fact(
                "FACT-B",
                "A",
                "B-C"
            )
        ]

    });


const collisionAId =
    collisionA
        .attributedCapabilities[0]
        ?.attributionId;

const collisionBId =
    collisionB
        .attributedCapabilities[0]
        ?.attributionId;


const duplicateSourceId =
    "DUPLICATE-SOURCE";

const duplicateRevision =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";


const duplicateFacts:
    ScientificSourceFact[] = [
        {
            ...fact(
                "FACT-ONE",
                duplicateSourceId,
                duplicateRevision
            ),

            observationId:
                "OBS-ONE"
        },
        {
            ...fact(
                "FACT-TWO",
                duplicateSourceId,
                duplicateRevision
            ),

            observationId:
                "OBS-TWO"
        }
    ];


const duplicateCapabilityResult =
    engine.attribute({

        derivation: {

            sourceId:
                duplicateSourceId,

            sourceRevision:
                duplicateRevision,

            model: {

                modelId:
                    "MODEL-DUPLICATE",

                generatedAt:
                    "2026-01-01T00:00:00.000Z",

                capabilities: [
                    {
                        capabilityId:
                            "LEXICAL-DUPLICATE",

                        label:
                            "first label",

                        protocols:
                            [],

                        evidence: [
                            "FACT-ONE"
                        ]
                    },
                    {
                        capabilityId:
                            "LEXICAL-DUPLICATE",

                        label:
                            "second label",

                        protocols:
                            [],

                        evidence: [
                            "FACT-TWO"
                        ]
                    }
                ],

                relationships:
                    []

            },

            errors:
                []

        },

        facts:
            duplicateFacts

    });


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "DISTINCT IDENTITY TUPLES PRODUCE DISTINCT ATTRIBUTION IDS",
        passed:
            collisionAId !==
                undefined &&
            collisionBId !==
                undefined &&
            collisionAId !==
                collisionBId
    },
    {
        name:
            "DUPLICATE CAPABILITY ID IS DETECTED",
        passed:
            duplicateCapabilityResult
                .errors
                .some(
                    error =>
                        error.includes(
                            "Duplicate capability identity LEXICAL-DUPLICATE"
                        )
                )
    },
    {
        name:
            "DUPLICATE CAPABILITY ID FAILS CLOSED",
        passed:
            duplicateCapabilityResult
                .attributedCapabilities
                .length ===
            0
    }
];


console.log("");
console.log(
    "SCIENTIFIC CAPABILITY ATTRIBUTION — IDENTITY INTEGRITY"
);
console.log(
    "-----------------------------------------------------"
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
