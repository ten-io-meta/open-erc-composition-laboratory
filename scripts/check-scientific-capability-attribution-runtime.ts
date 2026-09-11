import {
    ScientificCapabilityAttributionEngine
} from "../laboratory/scientific-capability-attribution/ScientificCapabilityAttributionEngine.js";

import type {
    ScientificSemanticDerivationResult
} from "../laboratory/scientific-semantic-derivation/ScientificSemanticDerivationResult.js";

import type {
    ScientificSourceFact
} from "../laboratory/scientific-source-fact/ScientificSourceFact.js";


const sourceId =
    "CONTROLLED-SOURCE";

const sourceRevision =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const sourceModelId =
    `SCIENTIFIC-SEMANTIC-${sourceId}-${sourceRevision}`;


const facts: ScientificSourceFact[] = [
    {
        factId:
            "FACT-1",

        observationId:
            "OBS-A",

        sourceId,

        sourceRevision,

        kind:
            "FUNCTION_DECLARATION",

        symbol:
            "reserveValue",

        containerKind:
            "INTERFACE",

        containerSymbol:
            "IFoo",

        locator: {
            sourceLocation:
                "https://github.com/example/repository",

            filePath:
                "contracts/IFoo.sol",

            startLine:
                10,

            endLine:
                10
        },

        rawText:
            "function reserveValue(uint256 amount) external;"
    },
    {
        factId:
            "FACT-2",

        observationId:
            "OBS-A",

        sourceId,

        sourceRevision,

        kind:
            "EVENT_DECLARATION",

        symbol:
            "reserveValue",

        containerKind:
            "INTERFACE",

        containerSymbol:
            "IFoo",

        locator: {
            sourceLocation:
                "https://github.com/example/repository",

            filePath:
                "contracts/IFoo.sol",

            startLine:
                12,

            endLine:
                12
        },

        rawText:
            "event reserveValue(uint256 amount);"
    },
    {
        factId:
            "FACT-3",

        observationId:
            "OBS-B",

        sourceId,

        sourceRevision,

        kind:
            "FUNCTION_DECLARATION",

        symbol:
            "reserveValue",

        containerKind:
            "CONTRACT",

        containerSymbol:
            "FooImplementation",

        locator: {
            sourceLocation:
                "https://github.com/example/repository",

            filePath:
                "contracts/FooImplementation.sol",

            startLine:
                20,

            endLine:
                20
        },

        rawText:
            "function reserveValue(uint256 amount) public;"
    },
    {
        factId:
            "FACT-4",

        observationId:
            "OBS-C",

        sourceId,

        sourceRevision,

        kind:
            "FUNCTION_DECLARATION",

        symbol:
            "reserveValue",

        containerKind:
            "INTERFACE",

        containerSymbol:
            "IFoo",

        locator: {
            sourceLocation:
                "https://github.com/example/repository",

            filePath:
                "contracts/alternate/IFoo.sol",

            startLine:
                7,

            endLine:
                7
        },

        rawText:
            "function reserveValue(uint256 amount) external;"
    },
    {
        factId:
            "FACT-5",

        observationId:
            "OBS-D",

        sourceId,

        sourceRevision,

        kind:
            "FUNCTION_DECLARATION",

        symbol:
            "orphanValue",

        locator: {
            sourceLocation:
                "https://github.com/example/repository",

            filePath:
                "contracts/Loose.sol",

            startLine:
                3,

            endLine:
                3
        },

        rawText:
            "function orphanValue() external;"
    },
    {
        factId:
            "FACT-6",

        observationId:
            "OBS-E",

        sourceId,

        sourceRevision,

        kind:
            "FUNCTION_DECLARATION",

        symbol:
            "mixedValue",

        containerKind:
            "CONTRACT",

        containerSymbol:
            "MixedContainer",

        locator: {
            sourceLocation:
                "https://github.com/example/repository",

            filePath:
                "contracts/Mixed.sol",

            startLine:
                5,

            endLine:
                5
        },

        rawText:
            "function mixedValue() external;"
    },
    {
        factId:
            "FACT-7",

        observationId:
            "OBS-E",

        sourceId,

        sourceRevision,

        kind:
            "EVENT_DECLARATION",

        symbol:
            "mixedValue",

        locator: {
            sourceLocation:
                "https://github.com/example/repository",

            filePath:
                "contracts/Mixed.sol",

            startLine:
                6,

            endLine:
                6
        },

        rawText:
            "event mixedValue();"
    }
];


const derivation:
    ScientificSemanticDerivationResult = {

    sourceId,

    sourceRevision,

    model: {

        modelId:
            sourceModelId,

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
                    "FACT-1",
                    "FACT-2",
                    "FACT-3",
                    "FACT-4"
                ]
            },
            {
                capabilityId:
                    "LEXICAL-ORPHAN-VALUE",

                label:
                    "orphan value",

                protocols:
                    [],

                evidence: [
                    "FACT-5"
                ]
            },
            {
                capabilityId:
                    "LEXICAL-MIXED-VALUE",

                label:
                    "mixed value",

                protocols:
                    [],

                evidence: [
                    "FACT-6",
                    "FACT-7"
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
    new ScientificCapabilityAttributionEngine();


const result =
    engine.attribute({
        derivation,
        facts
    });


const reserveAttributions =
    result.attributedCapabilities.filter(
        attribution =>
            attribution.capabilityId ===
            "LEXICAL-RESERVE-VALUE"
    );


const interfaceAttribution =
    reserveAttributions.find(
        attribution =>
            attribution.observationId ===
                "OBS-A" &&
            attribution.containerKind ===
                "INTERFACE" &&
            attribution.containerSymbol ===
                "IFoo"
    );


const contractAttribution =
    reserveAttributions.find(
        attribution =>
            attribution.observationId ===
                "OBS-B" &&
            attribution.containerKind ===
                "CONTRACT" &&
            attribution.containerSymbol ===
                "FooImplementation"
    );


const secondInterfaceAttribution =
    reserveAttributions.find(
        attribution =>
            attribution.observationId ===
                "OBS-C" &&
            attribution.containerKind ===
                "INTERFACE" &&
            attribution.containerSymbol ===
                "IFoo"
    );


const mixedAttribution =
    result.attributedCapabilities.find(
        attribution =>
            attribution.capabilityId ===
            "LEXICAL-MIXED-VALUE"
    );


const missingFactResult =
    engine.attribute({
        derivation: {
            ...derivation,

            model: {
                ...derivation.model,

                capabilities: [
                    {
                        capabilityId:
                            "LEXICAL-MISSING",

                        label:
                            "missing",

                        protocols:
                            [],

                        evidence: [
                            "FACT-DOES-NOT-EXIST"
                        ]
                    }
                ]
            }
        },

        facts
    });


const revisionContaminationResult =
    engine.attribute({
        derivation,
        facts:
            facts.map(
                (
                    fact,
                    index
                ) =>
                    index ===
                        0
                        ? {
                            ...fact,

                            sourceRevision:
                                "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
                        }
                        : fact
            )
    });


const duplicateFactResult =
    engine.attribute({
        derivation,
        facts: [
            ...facts,
            {
                ...facts[0]
            }
        ]
    });


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "RUNTIME ATTRIBUTION PRESERVES SOURCE ID",
        passed:
            result.sourceId ===
            sourceId
    },
    {
        name:
            "RUNTIME ATTRIBUTION PRESERVES SOURCE REVISION",
        passed:
            result.sourceRevision ===
            sourceRevision
    },
    {
        name:
            "RUNTIME ATTRIBUTION PRESERVES SOURCE MODEL ID",
        passed:
            result.sourceModelId ===
            sourceModelId
    },
    {
        name:
            "VALID ATTRIBUTION HAS NO ERRORS",
        passed:
            result.errors.length ===
            0
    },
    {
        name:
            "ONE LEXICAL CAPABILITY SPLITS INTO THREE STRUCTURAL ATTRIBUTIONS",
        passed:
            reserveAttributions.length ===
            3
    },
    {
        name:
            "FIRST INTERFACE ATTRIBUTION EXISTS",
        passed:
            interfaceAttribution !==
            undefined
    },
    {
        name:
            "FIRST INTERFACE ATTRIBUTION GROUPS TWO FACTS",
        passed:
            interfaceAttribution
                ?.evidence
                .length ===
            2
    },
    {
        name:
            "FIRST INTERFACE ATTRIBUTION PRESERVES FACT 1",
        passed:
            interfaceAttribution
                ?.evidence
                .includes(
                    "FACT-1"
                ) ===
            true
    },
    {
        name:
            "FIRST INTERFACE ATTRIBUTION PRESERVES FACT 2",
        passed:
            interfaceAttribution
                ?.evidence
                .includes(
                    "FACT-2"
                ) ===
            true
    },
    {
        name:
            "CONTRACT ATTRIBUTION REMAINS DISTINCT",
        passed:
            contractAttribution
                ?.evidence
                .length ===
                1 &&
            contractAttribution
                ?.evidence[0] ===
                "FACT-3"
    },
    {
        name:
            "SAME CONTAINER SYMBOL IN DIFFERENT OBSERVATION REMAINS DISTINCT",
        passed:
            secondInterfaceAttribution
                ?.evidence
                .length ===
                1 &&
            secondInterfaceAttribution
                ?.evidence[0] ===
                "FACT-4"
    },
    {
        name:
            "EQUAL CONTAINER SYMBOLS ARE NOT MERGED ACROSS OBSERVATIONS",
        passed:
            result
                .attributedCapabilities
                .filter(
                    attribution =>
                        attribution.containerSymbol ===
                        "IFoo"
                )
                .length ===
            2
    },
    {
        name:
            "FULLY UNSCOPED CAPABILITY IS REPORTED UNATTRIBUTED",
        passed:
            result
                .unattributedCapabilityIds
                .includes(
                    "LEXICAL-ORPHAN-VALUE"
                )
    },
    {
        name:
            "FULLY UNSCOPED CAPABILITY PRODUCES NO STRUCTURAL ATTRIBUTION",
        passed:
            !result
                .attributedCapabilities
                .some(
                    attribution =>
                        attribution.capabilityId ===
                        "LEXICAL-ORPHAN-VALUE"
                )
    },
    {
        name:
            "PARTIALLY SCOPED CAPABILITY PRODUCES STRUCTURAL ATTRIBUTION",
        passed:
            mixedAttribution
                ?.containerSymbol ===
            "MixedContainer"
    },
    {
        name:
            "PARTIALLY SCOPED CAPABILITY IS ALSO REPORTED UNATTRIBUTED",
        passed:
            result
                .unattributedCapabilityIds
                .includes(
                    "LEXICAL-MIXED-VALUE"
                )
    },
    {
        name:
            "PARTIAL ATTRIBUTION PRESERVES ONLY SCOPED FACT",
        passed:
            mixedAttribution
                ?.evidence
                .length ===
                1 &&
            mixedAttribution
                ?.evidence[0] ===
                "FACT-6"
    },
    {
        name:
            "ATTRIBUTION IDS ARE UNIQUE",
        passed:
            new Set(
                result
                    .attributedCapabilities
                    .map(
                        attribution =>
                            attribution.attributionId
                    )
            ).size ===
            result
                .attributedCapabilities
                .length
    },
    {
        name:
            "ATTRIBUTION ORDER IS DETERMINISTIC",
        passed:
            result
                .attributedCapabilities
                .every(
                    (
                        attribution,
                        index,
                        attributions
                    ) =>
                        index ===
                            0 ||
                        attributions[
                            index - 1
                        ].attributionId
                            .localeCompare(
                                attribution.attributionId
                            ) <=
                            0
                )
    },
    {
        name:
            "ATTRIBUTIONS DO NOT EXPOSE PROTOCOL FIELD",
        passed:
            !result
                .attributedCapabilities
                .some(
                    attribution =>
                        Object.prototype.hasOwnProperty.call(
                            attribution,
                            "protocol"
                        ) ||
                        Object.prototype.hasOwnProperty.call(
                            attribution,
                            "protocols"
                        )
                )
    },
    {
        name:
            "ATTRIBUTIONS DO NOT EXPOSE CONFIDENCE",
        passed:
            !result
                .attributedCapabilities
                .some(
                    attribution =>
                        Object.prototype.hasOwnProperty.call(
                            attribution,
                            "confidence"
                        )
                )
    },
    {
        name:
            "MISSING FACT IS DETECTED",
        passed:
            missingFactResult.errors.some(
                error =>
                    error.includes(
                        "FACT-DOES-NOT-EXIST"
                    )
            )
    },
    {
        name:
            "MISSING FACT FAILS CLOSED",
        passed:
            missingFactResult
                .attributedCapabilities
                .length ===
            0
    },
    {
        name:
            "REVISION CONTAMINATION IS DETECTED",
        passed:
            revisionContaminationResult
                .errors
                .some(
                    error =>
                        error.includes(
                            "different source revision"
                        )
                )
    },
    {
        name:
            "REVISION CONTAMINATION FAILS CLOSED",
        passed:
            revisionContaminationResult
                .attributedCapabilities
                .length ===
            0
    },
    {
        name:
            "DUPLICATE FACT ID IS DETECTED",
        passed:
            duplicateFactResult
                .errors
                .some(
                    error =>
                        error.includes(
                            "Duplicate fact identity FACT-1"
                        )
                )
    },
    {
        name:
            "DUPLICATE FACT ID FAILS CLOSED",
        passed:
            duplicateFactResult
                .attributedCapabilities
                .length ===
            0
    }
];


console.log("");
console.log(
    "SCIENTIFIC CAPABILITY ATTRIBUTION — RUNTIME"
);
console.log(
    "------------------------------------------"
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
