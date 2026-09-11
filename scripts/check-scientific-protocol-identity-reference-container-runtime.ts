import {
    ScientificProtocolIdentityAttributionEngine
} from "../laboratory/scientific-protocol-identity/ScientificProtocolIdentityAttributionEngine.js";


let passed =
    0;

let failed =
    0;


function check(
    name: string,
    condition: boolean
): void {

    if (condition) {

        console.log(
            `PASS: ${name}`
        );

        passed++;

        return;

    }

    console.log(
        `FAIL: ${name}`
    );

    failed++;

}


function attribution(
    containerSymbol: string
): any {

    return {

        sourceId:
            "SOURCE-A",

        sourceRevision:
            "REVISION-A",

        sourceModelId:
            "MODEL-A",

        attributedCapabilities: [
            {

                attributionId:
                    `ATTRIBUTION-${containerSymbol}`,

                capabilityId:
                    "LEXICAL-VALUE-OF",

                label:
                    "value of",

                observationId:
                    "OBSERVATION-A",

                containerKind:
                    "CONTRACT",

                containerSymbol,

                evidence: [
                    "FACT-A"
                ]

            }
        ],

        unattributedCapabilityIds:
            [],

        errors:
            []

    };

}


function observation(
    rawText: string
): any {

    return {

        observationId:
            "OBSERVATION-A",

        sourceId:
            "SOURCE-A",

        sourceType:
            "GITHUB",

        sourceRevision:
            "REVISION-A",

        kind:
            "CONTRACT_SOURCE",

        locator: {

            sourceLocation:
                "https://github.com/example/example",

            filePath:
                "contracts/Example.sol",

            startLine:
                1,

            endLine:
                20

        },

        rawText

    };

}


const engine =
    new ScientificProtocolIdentityAttributionEngine();


console.log("");
console.log(
    "SCIENTIFIC PROTOCOL IDENTITY - EXACT ERC REFERENCE CONTAINER"
);
console.log(
    "-------------------------------------------------------------"
);


/*
 * Existing exact container behavior remains unchanged.
 */

const exact =
    engine.attribute({

        attribution:
            attribution(
                "IERC165"
            )

    } as any);


check(
    "EXACT ERC CONTAINER STILL RESOLVES",
    exact.protocolAttributedCapabilities.length ===
        1 &&
    exact.protocolAttributedCapabilities[0]
        ?.protocolId ===
        "ERC-165"
);


/*
 * Existing explicit storage namespace behavior remains unchanged.
 */

const namespace =
    engine.attribute({

        attribution:
            attribution(
                "IdentityRegistryUpgradeable"
            ),

        observations: [
            observation(
                [
                    "contract IdentityRegistryUpgradeable {",
                    "/// @custom:storage-location erc7201:erc8004.identity.registry",
                    "}"
                ].join("\n")
            )
        ]

    } as any);


check(
    "EXPLICIT STORAGE NAMESPACE STILL RESOLVES",
    namespace.protocolAttributedCapabilities.length ===
        1 &&
    namespace.protocolAttributedCapabilities[0]
        ?.protocolId ===
        "ERC-8004"
);


/*
 * Real ERC-8060 reference implementation shape.
 */

const reference =
    engine.attribute({

        attribution:
            attribution(
                "ERC8060Reference"
            )

    } as any);


check(
    "EXACT ERC REFERENCE CONTAINER RESOLVES",
    reference.protocolAttributedCapabilities.length ===
        1
);

check(
    "EXACT ERC REFERENCE CONTAINER RESOLVES ERC-8060",
    reference.protocolAttributedCapabilities[0]
        ?.protocolId ===
        "ERC-8060"
);

check(
    "EXACT ERC REFERENCE CONTAINER PRESERVES DISTINCT BASIS",
    reference.protocolAttributedCapabilities[0]
        ?.identityBasis ===
        "EXACT_ERC_REFERENCE_CONTAINER_SYMBOL"
);


/*
 * Arbitrary ERC suffixes remain rejected.
 */

const mintBurn =
    engine.attribute({

        attribution:
            attribution(
                "IERC8060MintBurn"
            )

    } as any);


check(
    "ARBITRARY ERC INTERFACE SUFFIX REMAINS UNRESOLVED",
    mintBurn.protocolAttributedCapabilities.length ===
        0
);


const referenceHelper =
    engine.attribute({

        attribution:
            attribution(
                "ERC8060ReferenceHelper"
            )

    } as any);


check(
    "REFERENCE HELPER SUFFIX REMAINS UNRESOLVED",
    referenceHelper.protocolAttributedCapabilities.length ===
        0
);


const prefixed =
    engine.attribute({

        attribution:
            attribution(
                "MyERC8060Reference"
            )

    } as any);


check(
    "PREFIXED REFERENCE SYMBOL REMAINS UNRESOLVED",
    prefixed.protocolAttributedCapabilities.length ===
        0
);


const zero =
    engine.attribute({

        attribution:
            attribution(
                "ERC0Reference"
            )

    } as any);


check(
    "ERC ZERO REFERENCE REMAINS UNRESOLVED",
    zero.protocolAttributedCapabilities.length ===
        0
);


const interfaceReference =
    engine.attribute({

        attribution:
            attribution(
                "IERC8060Reference"
            )

    } as any);


check(
    "INTERFACE REFERENCE SUFFIX IS NOT ASSUMED TO BE PROTOCOL",
    interfaceReference.protocolAttributedCapabilities.length ===
        0
);


console.log("");
console.log(
    `PASS: ${passed}`
);
console.log(
    `FAIL: ${failed}`
);

console.log(
    failed ===
        0
        ? "RESULT: PASS"
        : "RESULT: FAIL"
);

if (
    failed >
    0
) {

    process.exitCode =
        1;

}
