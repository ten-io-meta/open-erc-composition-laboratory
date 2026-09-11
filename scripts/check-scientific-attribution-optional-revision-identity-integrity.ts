import {
    ScientificCapabilityAttributionEngine
} from "../laboratory/scientific-capability-attribution/ScientificCapabilityAttributionEngine.js";

import {
    ScientificProtocolIdentityAttributionEngine
} from "../laboratory/scientific-protocol-identity/ScientificProtocolIdentityAttributionEngine.js";

import type {
    ScientificSemanticDerivationResult
} from "../laboratory/scientific-semantic-derivation/ScientificSemanticDerivationResult.js";

import type {
    ScientificSourceFact
} from "../laboratory/scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificCapabilityAttributionResult
} from "../laboratory/scientific-capability-attribution/ScientificCapabilityAttributionResult.js";


const capabilityEngine =
    new ScientificCapabilityAttributionEngine();

const protocolEngine =
    new ScientificProtocolIdentityAttributionEngine();


function derivation(
    sourceRevision:
        string | undefined
): ScientificSemanticDerivationResult {

    return {

        sourceId:
            "CONTROLLED-SOURCE",

        sourceRevision,

        model: {

            modelId:
                "CONTROLLED-MODEL",

            generatedAt:
                "2026-01-01T00:00:00.000Z",

            capabilities: [
                {
                    capabilityId:
                        "LEXICAL-VALUE",

                    label:
                        "value",

                    protocols:
                        [],

                    evidence: [
                        "FACT-1"
                    ]
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
    sourceRevision:
        string | undefined
): ScientificSourceFact {

    return {

        factId:
            "FACT-1",

        observationId:
            "OBS-1",

        sourceId:
            "CONTROLLED-SOURCE",

        sourceRevision,

        kind:
            "FUNCTION_DECLARATION",

        symbol:
            "value",

        containerKind:
            "INTERFACE",

        containerSymbol:
            "IERC165",

        locator: {

            sourceLocation:
                "CONTROLLED",

            filePath:
                "IERC165.sol",

            startLine:
                1,

            endLine:
                1

        },

        rawText:
            "function value() external;"

    };

}


const capabilityWithoutRevision =
    capabilityEngine.attribute({

        derivation:
            derivation(
                undefined
            ),

        facts: [
            fact(
                undefined
            )
        ]

    });


const capabilityLiteralSentinelRevision =
    capabilityEngine.attribute({

        derivation:
            derivation(
                "UNVERSIONED"
            ),

        facts: [
            fact(
                "UNVERSIONED"
            )
        ]

    });


const capabilityIdWithoutRevision =
    capabilityWithoutRevision
        .attributedCapabilities[0]
        ?.attributionId;

const capabilityIdLiteralSentinel =
    capabilityLiteralSentinelRevision
        .attributedCapabilities[0]
        ?.attributionId;


function protocolInput(
    sourceRevision:
        string | undefined
): ScientificCapabilityAttributionResult {

    return {

        sourceId:
            "CONTROLLED-SOURCE",

        sourceRevision,

        sourceModelId:
            "CONTROLLED-MODEL",

        attributedCapabilities: [
            {
                attributionId:
                    "CONTROLLED-STRUCTURAL-ID",

                capabilityId:
                    "LEXICAL-VALUE",

                label:
                    "value",

                observationId:
                    "OBS-1",

                containerKind:
                    "INTERFACE",

                containerSymbol:
                    "IERC165",

                evidence: [
                    "FACT-1"
                ]
            }
        ],

        unattributedCapabilityIds:
            [],

        errors:
            []

    };

}


const protocolWithoutRevision =
    protocolEngine.attribute({

        attribution:
            protocolInput(
                undefined
            )

    });


const protocolLiteralSentinelRevision =
    protocolEngine.attribute({

        attribution:
            protocolInput(
                "UNVERSIONED"
            )

    });


const protocolIdWithoutRevision =
    protocolWithoutRevision
        .protocolAttributedCapabilities[0]
        ?.protocolAttributionId;

const protocolIdLiteralSentinel =
    protocolLiteralSentinelRevision
        .protocolAttributedCapabilities[0]
        ?.protocolAttributionId;


const checks = [
    {
        name:
            "ABSENT AND LITERAL REVISION PRODUCE DISTINCT CAPABILITY ATTRIBUTION IDS",
        passed:
            capabilityIdWithoutRevision !==
                undefined &&
            capabilityIdLiteralSentinel !==
                undefined &&
            capabilityIdWithoutRevision !==
                capabilityIdLiteralSentinel
    },
    {
        name:
            "ABSENT AND LITERAL REVISION PRODUCE DISTINCT PROTOCOL ATTRIBUTION IDS",
        passed:
            protocolIdWithoutRevision !==
                undefined &&
            protocolIdLiteralSentinel !==
                undefined &&
            protocolIdWithoutRevision !==
                protocolIdLiteralSentinel
    }
];


console.log("");
console.log(
    "SCIENTIFIC ATTRIBUTION — OPTIONAL REVISION IDENTITY INTEGRITY"
);
console.log(
    "------------------------------------------------------------"
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
