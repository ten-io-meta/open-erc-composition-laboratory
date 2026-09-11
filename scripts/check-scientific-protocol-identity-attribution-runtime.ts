import {
    ScientificProtocolIdentityAttributionEngine
} from "../laboratory/scientific-protocol-identity/ScientificProtocolIdentityAttributionEngine.js";

import type {
    ScientificCapabilityAttributionResult
} from "../laboratory/scientific-capability-attribution/ScientificCapabilityAttributionResult.js";

import type {
    ScientificAttributedCapability
} from "../laboratory/scientific-capability-attribution/ScientificAttributedCapability.js";


const sourceId =
    "CONTROLLED-SOURCE";

const sourceRevision =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const sourceModelId =
    "SCIENTIFIC-SEMANTIC-CONTROLLED-SOURCE";


function structuralAttribution(
    attributionId:
        string,
    capabilityId:
        string,
    label:
        string,
    observationId:
        string,
    containerKind:
        "INTERFACE" | "CONTRACT",
    containerSymbol:
        string,
    evidence:
        string[]
): ScientificAttributedCapability {

    return {

        attributionId,

        capabilityId,

        label,

        observationId,

        containerKind,

        containerSymbol,

        evidence

    };

}


const structuralAttributions:
    ScientificAttributedCapability[] = [
        structuralAttribution(
            "ATTR-1",
            "LEXICAL-BALANCE-OF",
            "balance of",
            "OBS-1",
            "INTERFACE",
            "IERC165",
            [
                "FACT-2",
                "FACT-1"
            ]
        ),
        structuralAttribution(
            "ATTR-2",
            "LEXICAL-SUPPORTS-INTERFACE",
            "supports interface",
            "OBS-2",
            "CONTRACT",
            "ERC165",
            [
                "FACT-3"
            ]
        ),
        structuralAttribution(
            "ATTR-3",
            "LEXICAL-TRANSFER",
            "transfer",
            "OBS-3",
            "INTERFACE",
            "IERC999Extension",
            [
                "FACT-4"
            ]
        ),
        structuralAttribution(
            "ATTR-4",
            "LEXICAL-OWNER",
            "owner",
            "OBS-4",
            "CONTRACT",
            "MyERC123",
            [
                "FACT-5"
            ]
        ),
        structuralAttribution(
            "ATTR-5",
            "LEXICAL-ZERO",
            "zero",
            "OBS-5",
            "INTERFACE",
            "IERC0",
            [
                "FACT-6"
            ]
        ),
        structuralAttribution(
            "ATTR-6",
            "LEXICAL-LOWER",
            "lower",
            "OBS-6",
            "INTERFACE",
            "ierc777",
            [
                "FACT-7"
            ]
        ),
        structuralAttribution(
            "ATTR-7",
            "LEXICAL-SECOND",
            "second",
            "OBS-7",
            "INTERFACE",
            "IERC165",
            [
                "FACT-8"
            ]
        ),
        structuralAttribution(
            "ATTR-8",
            "LEXICAL-GENERIC",
            "generic",
            "OBS-8",
            "CONTRACT",
            "Vault",
            [
                "FACT-9"
            ]
        )
    ];


const attribution:
    ScientificCapabilityAttributionResult = {

    sourceId,

    sourceRevision,

    sourceModelId,

    attributedCapabilities:
        structuralAttributions,

    unattributedCapabilityIds: [
        "LEXICAL-NO-CONTAINER"
    ],

    errors:
        []

};


const engine =
    new ScientificProtocolIdentityAttributionEngine();


const result =
    engine.attribute({
        attribution
    });


const secondRun =
    engine.attribute({
        attribution
    });


const erc165Attributions =
    result.protocolAttributedCapabilities.filter(
        capability =>
            capability.protocolId ===
            "ERC-165"
    );


const interfaceErc165 =
    erc165Attributions.find(
        capability =>
            capability.capabilityAttributionId ===
            "ATTR-1"
    );


const contractErc165 =
    erc165Attributions.find(
        capability =>
            capability.capabilityAttributionId ===
            "ATTR-2"
    );


const secondInterfaceErc165 =
    erc165Attributions.find(
        capability =>
            capability.capabilityAttributionId ===
            "ATTR-7"
    );


const upstreamFailureResult =
    engine.attribute({

        attribution: {

            ...attribution,

            errors: [
                "CONTROLLED UPSTREAM FAILURE"
            ]

        }

    });


const duplicateStructuralIdResult =
    engine.attribute({

        attribution: {

            ...attribution,

            attributedCapabilities: [
                structuralAttributions[0],
                {
                    ...structuralAttributions[1],

                    attributionId:
                        structuralAttributions[0]
                            .attributionId
                }
            ]

        }

    });


const duplicateEvidenceResult =
    engine.attribute({

        attribution: {

            ...attribution,

            attributedCapabilities: [
                {
                    ...structuralAttributions[0],

                    evidence: [
                        "FACT-1",
                        "FACT-1"
                    ]
                }
            ]

        }

    });


const duplicateUnattributedResult =
    engine.attribute({

        attribution: {

            ...attribution,

            unattributedCapabilityIds: [
                "LEXICAL-NO-CONTAINER",
                "LEXICAL-NO-CONTAINER"
            ]

        }

    });


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "RUNTIME PRESERVES SOURCE ID",
        passed:
            result.sourceId ===
            sourceId
    },
    {
        name:
            "RUNTIME PRESERVES SOURCE REVISION",
        passed:
            result.sourceRevision ===
            sourceRevision
    },
    {
        name:
            "RUNTIME PRESERVES SOURCE MODEL ID",
        passed:
            result.sourceModelId ===
            sourceModelId
    },
    {
        name:
            "VALID PROTOCOL ATTRIBUTION HAS NO ERRORS",
        passed:
            result.errors.length ===
            0
    },
    {
        name:
            "EXACT IERC IDENTIFIER RESOLVES",
        passed:
            interfaceErc165
                ?.protocolId ===
            "ERC-165"
    },
    {
        name:
            "EXACT ERC IDENTIFIER RESOLVES",
        passed:
            contractErc165
                ?.protocolId ===
            "ERC-165"
    },
    {
        name:
            "IDENTITY BASIS IS EXPLICIT",
        passed:
            result
                .protocolAttributedCapabilities
                .every(
                    capability =>
                        capability.identityBasis ===
                        "EXACT_ERC_CONTAINER_SYMBOL"
                )
    },
    {
        name:
            "STRUCTURAL ATTRIBUTION ID IS PRESERVED",
        passed:
            interfaceErc165
                ?.capabilityAttributionId ===
            "ATTR-1"
    },
    {
        name:
            "CAPABILITY ID IS PRESERVED",
        passed:
            interfaceErc165
                ?.capabilityId ===
            "LEXICAL-BALANCE-OF"
    },
    {
        name:
            "CAPABILITY LABEL IS PRESERVED",
        passed:
            interfaceErc165
                ?.label ===
            "balance of"
    },
    {
        name:
            "OBSERVATION ID IS PRESERVED",
        passed:
            interfaceErc165
                ?.observationId ===
            "OBS-1"
    },
    {
        name:
            "CONTAINER KIND IS PRESERVED",
        passed:
            interfaceErc165
                ?.containerKind ===
            "INTERFACE"
    },
    {
        name:
            "CONTAINER SYMBOL IS PRESERVED",
        passed:
            interfaceErc165
                ?.containerSymbol ===
            "IERC165"
    },
    {
        name:
            "FACT EVIDENCE IS PRESERVED",
        passed:
            interfaceErc165
                ?.evidence
                .length ===
                2 &&
            interfaceErc165
                ?.evidence
                .includes(
                    "FACT-1"
                ) ===
                true &&
            interfaceErc165
                ?.evidence
                .includes(
                    "FACT-2"
                ) ===
                true
    },
    {
        name:
            "FACT EVIDENCE IS DETERMINISTICALLY SORTED",
        passed:
            interfaceErc165
                ?.evidence[0] ===
                "FACT-1" &&
            interfaceErc165
                ?.evidence[1] ===
                "FACT-2"
    },
    {
        name:
            "SAME ERC IN DIFFERENT OBSERVATIONS REMAINS DISTINCT",
        passed:
            erc165Attributions.length ===
                3 &&
            secondInterfaceErc165
                ?.observationId ===
                "OBS-7"
    },
    {
        name:
            "PROTOCOL ATTRIBUTION IDS ARE UNIQUE",
        passed:
            new Set(
                result
                    .protocolAttributedCapabilities
                    .map(
                        capability =>
                            capability.protocolAttributionId
                    )
            ).size ===
            result
                .protocolAttributedCapabilities
                .length
    },
    {
        name:
            "PROTOCOL ATTRIBUTION IDS ARE DETERMINISTIC",
        passed:
            JSON.stringify(
                result
                    .protocolAttributedCapabilities
                    .map(
                        capability =>
                            capability.protocolAttributionId
                    )
            ) ===
            JSON.stringify(
                secondRun
                    .protocolAttributedCapabilities
                    .map(
                        capability =>
                            capability.protocolAttributionId
                    )
            )
    },
    {
        name:
            "PROTOCOL ATTRIBUTION ORDER IS DETERMINISTIC",
        passed:
            result
                .protocolAttributedCapabilities
                .every(
                    (
                        capability,
                        index,
                        capabilities
                    ) =>
                        index ===
                            0 ||
                        capabilities[
                            index - 1
                        ].protocolAttributionId
                            .localeCompare(
                                capability.protocolAttributionId
                            ) <=
                            0
                )
    },
    {
        name:
            "IERC PREFIX WITH SUFFIX REMAINS UNRESOLVED",
        passed:
            result
                .unresolvedAttributionIds
                .includes(
                    "ATTR-3"
                )
    },
    {
        name:
            "NON-EXACT ERC PREFIX REMAINS UNRESOLVED",
        passed:
            result
                .unresolvedAttributionIds
                .includes(
                    "ATTR-4"
                )
    },
    {
        name:
            "ERC ZERO REMAINS UNRESOLVED",
        passed:
            result
                .unresolvedAttributionIds
                .includes(
                    "ATTR-5"
                )
    },
    {
        name:
            "LOWERCASE IDENTIFIER REMAINS UNRESOLVED",
        passed:
            result
                .unresolvedAttributionIds
                .includes(
                    "ATTR-6"
                )
    },
    {
        name:
            "GENERIC CONTAINER REMAINS UNRESOLVED",
        passed:
            result
                .unresolvedAttributionIds
                .includes(
                    "ATTR-8"
                )
    },
    {
        name:
            "UNRESOLVED STRUCTURAL ATTRIBUTIONS PRODUCE NO PROTOCOL CLAIM",
        passed:
            !result
                .protocolAttributedCapabilities
                .some(
                    capability =>
                        [
                            "ATTR-3",
                            "ATTR-4",
                            "ATTR-5",
                            "ATTR-6",
                            "ATTR-8"
                        ].includes(
                            capability.capabilityAttributionId
                        )
                )
    },
    {
        name:
            "UNRESOLVED ATTRIBUTION IDS ARE SORTED",
        passed:
            JSON.stringify(
                result.unresolvedAttributionIds
            ) ===
            JSON.stringify(
                [
                    ...result.unresolvedAttributionIds
                ].sort()
            )
    },
    {
        name:
            "STRUCTURALLY UNATTRIBUTED CAPABILITY IS PROPAGATED",
        passed:
            result
                .structurallyUnattributedCapabilityIds
                .includes(
                    "LEXICAL-NO-CONTAINER"
                )
    },
    {
        name:
            "PROTOCOL ATTRIBUTIONS CONTAIN NO CONFIDENCE FIELD",
        passed:
            !result
                .protocolAttributedCapabilities
                .some(
                    capability =>
                        Object.prototype.hasOwnProperty.call(
                            capability,
                            "confidence"
                        )
                )
    },
    {
        name:
            "PROTOCOL ATTRIBUTIONS CONTAIN NO RELATIONSHIP FIELD",
        passed:
            !result
                .protocolAttributedCapabilities
                .some(
                    capability =>
                        Object.prototype.hasOwnProperty.call(
                            capability,
                            "relationship"
                        ) ||
                        Object.prototype.hasOwnProperty.call(
                            capability,
                            "relationships"
                        )
                )
    },
    {
        name:
            "UPSTREAM FAILURE IS PRESERVED",
        passed:
            upstreamFailureResult
                .errors
                .includes(
                    "CONTROLLED UPSTREAM FAILURE"
                )
    },
    {
        name:
            "UPSTREAM FAILURE FAILS CLOSED",
        passed:
            upstreamFailureResult
                .protocolAttributedCapabilities
                .length ===
            0
    },
    {
        name:
            "DUPLICATE STRUCTURAL ATTRIBUTION ID IS DETECTED",
        passed:
            duplicateStructuralIdResult
                .errors
                .some(
                    error =>
                        error.includes(
                            "Duplicate structural attribution identity ATTR-1"
                        )
                )
    },
    {
        name:
            "DUPLICATE STRUCTURAL ATTRIBUTION ID FAILS CLOSED",
        passed:
            duplicateStructuralIdResult
                .protocolAttributedCapabilities
                .length ===
            0
    },
    {
        name:
            "DUPLICATE FACT EVIDENCE IS DETECTED",
        passed:
            duplicateEvidenceResult
                .errors
                .some(
                    error =>
                        error.includes(
                            "duplicate fact evidence FACT-1"
                        )
                )
    },
    {
        name:
            "DUPLICATE FACT EVIDENCE FAILS CLOSED",
        passed:
            duplicateEvidenceResult
                .protocolAttributedCapabilities
                .length ===
            0
    },
    {
        name:
            "DUPLICATE STRUCTURALLY UNATTRIBUTED ID IS DETECTED",
        passed:
            duplicateUnattributedResult
                .errors
                .some(
                    error =>
                        error.includes(
                            "Duplicate structurally unattributed capability identity LEXICAL-NO-CONTAINER"
                        )
                )
    },
    {
        name:
            "DUPLICATE STRUCTURALLY UNATTRIBUTED ID FAILS CLOSED",
        passed:
            duplicateUnattributedResult
                .protocolAttributedCapabilities
                .length ===
            0
    }
];


console.log("");
console.log(
    "SCIENTIFIC PROTOCOL IDENTITY ATTRIBUTION — RUNTIME"
);
console.log(
    "-------------------------------------------------"
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
