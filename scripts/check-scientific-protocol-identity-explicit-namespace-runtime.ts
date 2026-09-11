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
    params: {
        sourceId?: string;
        sourceRevision?: string;
        observationId?: string;
        containerSymbol: string;
    }
): any {

    return {

        sourceId:
            params.sourceId ??
            "SOURCE-A",

        sourceRevision:
            params.sourceRevision ??
            "REVISION-A",

        sourceModelId:
            "MODEL-A",

        attributedCapabilities: [
            {

                attributionId:
                    "ATTRIBUTION-A",

                capabilityId:
                    "LEXICAL-REGISTER",

                label:
                    "register",

                observationId:
                    params.observationId ??
                    "OBSERVATION-A",

                containerKind:
                    "CONTRACT",

                containerSymbol:
                    params.containerSymbol,

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
    params: {
        sourceId?: string;
        sourceRevision?: string;
        observationId?: string;
        rawText: string;
    }
): any {

    return {

        observationId:
            params.observationId ??
            "OBSERVATION-A",

        sourceId:
            params.sourceId ??
            "SOURCE-A",

        sourceType:
            "GITHUB",

        sourceRevision:
            params.sourceRevision ??
            "REVISION-A",

        kind:
            "CONTRACT_SOURCE",

        locator: {

            sourceLocation:
                "https://github.com/example/example",

            filePath:
                "contracts/IdentityRegistryUpgradeable.sol",

            startLine:
                1,

            endLine:
                20

        },

        rawText:
            params.rawText

    };

}


const engine =
    new ScientificProtocolIdentityAttributionEngine();


console.log("");
console.log(
    "SCIENTIFIC PROTOCOL IDENTITY - EXPLICIT ERC STORAGE NAMESPACE"
);
console.log(
    "-------------------------------------------------------------"
);


/*
 * Existing exact-container behavior must remain valid.
 */

const exact =
    engine.attribute({

        attribution:
            attribution({
                containerSymbol:
                    "IERC165"
            })

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
 * Real ERC-8004-style namespace.
 *
 * The container name itself does not encode ERC-8004.
 * The explicit ERC-7201 storage namespace does.
 */

const explicitNamespace =
    engine.attribute({

        attribution:
            attribution({
                containerSymbol:
                    "IdentityRegistryUpgradeable"
            }),

        observations: [
            observation({
                rawText:
                    [
                        "contract IdentityRegistryUpgradeable {",
                        "/// @custom:storage-location erc7201:erc8004.identity.registry",
                        "struct IdentityRegistryStorage {}",
                        "}"
                    ].join("\n")
            })
        ]

    } as any);


check(
    "EXPLICIT ERC STORAGE NAMESPACE RESOLVES PROTOCOL",
    explicitNamespace
        .protocolAttributedCapabilities
        .length ===
        1
);

check(
    "EXPLICIT ERC STORAGE NAMESPACE RESOLVES ERC-8004",
    explicitNamespace
        .protocolAttributedCapabilities[0]
        ?.protocolId ===
        "ERC-8004"
);

check(
    "EXPLICIT ERC STORAGE NAMESPACE PRESERVES DISTINCT IDENTITY BASIS",
    explicitNamespace
        .protocolAttributedCapabilities[0]
        ?.identityBasis ===
        "EXPLICIT_ERC_STORAGE_NAMESPACE"
);


/*
 * Repository URL must never establish protocol identity.
 */

const repositoryUrlOnly =
    engine.attribute({

        attribution:
            attribution({
                containerSymbol:
                    "IdentityRegistryUpgradeable"
            }),

        observations: [
            {
                ...observation({
                    rawText:
                        "contract IdentityRegistryUpgradeable {}"
                }),

                locator: {
                    sourceLocation:
                        "https://github.com/erc-8004/erc-8004-contracts",

                    filePath:
                        "contracts/IdentityRegistryUpgradeable.sol",

                    startLine:
                        1,

                    endLine:
                        1
                }
            }
        ]

    } as any);


check(
    "REPOSITORY URL DOES NOT ESTABLISH ERC IDENTITY",
    repositoryUrlOnly
        .protocolAttributedCapabilities
        .length ===
        0
);


/*
 * Arbitrary lexical/string use of ERC8004 is insufficient.
 */

const stringOnly =
    engine.attribute({

        attribution:
            attribution({
                containerSymbol:
                    "IdentityRegistryUpgradeable"
            }),

        observations: [
            observation({
                rawText:
                    [
                        "contract IdentityRegistryUpgradeable {",
                        'string constant NAME = "ERC8004IdentityRegistry";',
                        "}"
                    ].join("\n")
            })
        ]

    } as any);


check(
    "ERC-LIKE STRING DOES NOT ESTABLISH PROTOCOL IDENTITY",
    stringOnly
        .protocolAttributedCapabilities
        .length ===
        0
);


/*
 * General prose/co-mention is insufficient.
 */

const coMention =
    engine.attribute({

        attribution:
            attribution({
                containerSymbol:
                    "IdentityRegistryUpgradeable"
            }),

        observations: [
            observation({
                rawText:
                    [
                        "// ERC-8004 may interact with another standard.",
                        "contract IdentityRegistryUpgradeable {}"
                    ].join("\n")
            })
        ]

    } as any);


check(
    "ERC CO-MENTION DOES NOT ESTABLISH PROTOCOL IDENTITY",
    coMention
        .protocolAttributedCapabilities
        .length ===
        0
);


/*
 * The namespace must occur in the same source observation
 * as the structurally attributed capability.
 */

const otherObservation =
    engine.attribute({

        attribution:
            attribution({
                observationId:
                    "OBSERVATION-A",

                containerSymbol:
                    "IdentityRegistryUpgradeable"
            }),

        observations: [
            observation({
                observationId:
                    "OBSERVATION-B",

                rawText:
                    "/// @custom:storage-location erc7201:erc8004.identity.registry"
            })
        ]

    } as any);


check(
    "NAMESPACE FROM ANOTHER OBSERVATION DOES NOT LEAK IDENTITY",
    otherObservation
        .protocolAttributedCapabilities
        .length ===
        0
);


/*
 * Ambiguous multiple explicit ERC namespaces fail closed.
 */

const ambiguous =
    engine.attribute({

        attribution:
            attribution({
                containerSymbol:
                    "IdentityRegistryUpgradeable"
            }),

        observations: [
            observation({
                rawText:
                    [
                        "/// @custom:storage-location erc7201:erc8004.identity.registry",
                        "/// @custom:storage-location erc7201:erc9999.other.registry",
                        "contract IdentityRegistryUpgradeable {}"
                    ].join("\n")
            })
        ]

    } as any);


check(
    "MULTIPLE ERC STORAGE NAMESPACES FAIL CLOSED",
    ambiguous
        .protocolAttributedCapabilities
        .length ===
        0
);


/*
 * Observation provenance mismatch must fail closed rather
 * than provide protocol identity.
 */

const wrongSource =
    engine.attribute({

        attribution:
            attribution({
                sourceId:
                    "SOURCE-A",

                containerSymbol:
                    "IdentityRegistryUpgradeable"
            }),

        observations: [
            observation({
                sourceId:
                    "SOURCE-B",

                rawText:
                    "/// @custom:storage-location erc7201:erc8004.identity.registry"
            })
        ]

    } as any);


check(
    "MISMATCHED OBSERVATION SOURCE FAILS CLOSED",
    wrongSource.errors.length >
        0 &&
    wrongSource
        .protocolAttributedCapabilities
        .length ===
        0
);


const wrongRevision =
    engine.attribute({

        attribution:
            attribution({
                sourceRevision:
                    "REVISION-A",

                containerSymbol:
                    "IdentityRegistryUpgradeable"
            }),

        observations: [
            observation({
                sourceRevision:
                    "REVISION-B",

                rawText:
                    "/// @custom:storage-location erc7201:erc8004.identity.registry"
            })
        ]

    } as any);


check(
    "MISMATCHED OBSERVATION REVISION FAILS CLOSED",
    wrongRevision.errors.length >
        0 &&
    wrongRevision
        .protocolAttributedCapabilities
        .length ===
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
    failed === 0
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
