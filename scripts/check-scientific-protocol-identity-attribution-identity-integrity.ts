import {
    ScientificProtocolIdentityAttributionEngine
} from "../laboratory/scientific-protocol-identity/ScientificProtocolIdentityAttributionEngine.js";

import type {
    ScientificCapabilityAttributionResult
} from "../laboratory/scientific-capability-attribution/ScientificCapabilityAttributionResult.js";


const engine =
    new ScientificProtocolIdentityAttributionEngine();


function input(
    sourceId:
        string,
    sourceRevision:
        string,
    sourceModelId:
        string
): ScientificCapabilityAttributionResult {

    return {

        sourceId,

        sourceRevision,

        sourceModelId,

        attributedCapabilities: [
            {
                /*
                 * Deliberately identical upstream identity.
                 *
                 * The protocol identity layer must still preserve
                 * source-global uniqueness independently.
                 */
                attributionId:
                    "CONTROLLED-SAME-UPSTREAM-ID",

                capabilityId:
                    "LEXICAL-VALUE",

                label:
                    "value",

                observationId:
                    "OBS",

                containerKind:
                    "INTERFACE",

                containerSymbol:
                    "IERC165",

                evidence: [
                    "FACT"
                ]
            }
        ],

        unattributedCapabilityIds:
            [],

        errors:
            []

    };

}


const sourceA =
    engine.attribute({
        attribution:
            input(
                "SOURCE-A",
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "MODEL-A"
            )
    });


const sourceB =
    engine.attribute({
        attribution:
            input(
                "SOURCE-B",
                "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                "MODEL-B"
            )
    });


const idA =
    sourceA
        .protocolAttributedCapabilities[0]
        ?.protocolAttributionId;

const idB =
    sourceB
        .protocolAttributedCapabilities[0]
        ?.protocolAttributionId;


const checks = [
    {
        name:
            "DISTINCT SOURCES PRODUCE DISTINCT PROTOCOL ATTRIBUTION IDS",
        passed:
            idA !==
                undefined &&
            idB !==
                undefined &&
            idA !==
                idB
    }
];


console.log("");
console.log(
    "SCIENTIFIC PROTOCOL IDENTITY ATTRIBUTION — IDENTITY INTEGRITY"
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
