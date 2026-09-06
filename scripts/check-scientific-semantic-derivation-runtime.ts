import {
    ScientificSemanticDerivationEngine
} from "../laboratory/scientific-semantic-derivation/ScientificSemanticDerivationEngine.js";

import type {
    ScientificSourceFact
} from "../laboratory/scientific-source-fact/ScientificSourceFact.js";


const sourceId =
    "GITHUB-EXAMPLE-REPOSITORY";

const sourceRevision =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";


const facts:
    ScientificSourceFact[] = [
        {
            factId:
                "OBS-00001-FACT-00001",

            observationId:
                "OBS-00001",

            sourceId,

            sourceRevision,

            kind:
                "FUNCTION_DECLARATION",

            symbol:
                "reserveValue",

            locator: {
                sourceLocation:
                    "https://github.com/example/repository",

                filePath:
                    "/contracts/Example.sol",

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
                "OBS-00001-FACT-00002",

            observationId:
                "OBS-00001",

            sourceId,

            sourceRevision,

            kind:
                "STATE_VARIABLE_DECLARATION",

            symbol:
                "reserve_value",

            locator: {
                sourceLocation:
                    "https://github.com/example/repository",

                filePath:
                    "/contracts/Example.sol",

                startLine:
                    12,

                endLine:
                    12
            },

            rawText:
                "uint256 public reserve_value;"
        },
        {
            factId:
                "OBS-00001-FACT-00003",

            observationId:
                "OBS-00001",

            sourceId,

            sourceRevision,

            kind:
                "EVENT_DECLARATION",

            symbol:
                "ValueReleased",

            locator: {
                sourceLocation:
                    "https://github.com/example/repository",

                filePath:
                    "/contracts/Example.sol",

                startLine:
                    14,

                endLine:
                    14
            },

            rawText:
                "event ValueReleased(uint256 amount);"
        },
        {
            factId:
                "OBS-00001-FACT-00004",

            observationId:
                "OBS-00001",

            sourceId,

            sourceRevision,

            kind:
                "REQUIRE_STATEMENT",

            locator: {
                sourceLocation:
                    "https://github.com/example/repository",

                filePath:
                    "/contracts/Example.sol",

                startLine:
                    18,

                endLine:
                    18
            },

            rawText:
                'require(amount > 0, "zero");'
        },
        {
            factId:
                "OBS-00001-FACT-00005",

            observationId:
                "OBS-00001",

            sourceId,

            sourceRevision,

            kind:
                "CONTRACT_DECLARATION",

            symbol:
                "Example",

            locator: {
                sourceLocation:
                    "https://github.com/example/repository",

                filePath:
                    "/contracts/Example.sol",

                startLine:
                    1,

                endLine:
                    1
            },

            rawText:
                "contract Example {"
        }
    ];


const engine =
    new ScientificSemanticDerivationEngine();


const result =
    engine.derive({
        sourceId,
        sourceRevision,
        facts
    });


const reserveCapability =
    result.model.capabilities.find(
        capability =>
            capability.capabilityId ===
            "LEXICAL-RESERVE-VALUE"
    );


const releasedCapability =
    result.model.capabilities.find(
        capability =>
            capability.capabilityId ===
            "LEXICAL-VALUE-RELEASED"
    );


const contaminatedResult =
    engine.derive({
        sourceId,
        sourceRevision,
        facts: [
            {
                ...facts[0],

                sourceRevision:
                    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
            }
        ]
    });


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "RUNTIME DERIVATION PRESERVES SOURCE ID",
        passed:
            result.sourceId ===
            sourceId
    },
    {
        name:
            "RUNTIME DERIVATION PRESERVES SOURCE REVISION",
        passed:
            result.sourceRevision ===
            sourceRevision
    },
    {
        name:
            "VALID DERIVATION HAS NO ERRORS",
        passed:
            result.errors.length ===
            0
    },
    {
        name:
            "ONLY LOCALLY SEMANTIC SYMBOLS BECOME CAPABILITIES",
        passed:
            result.model.capabilities.length ===
            2
    },
    {
        name:
            "CAMEL CASE SYMBOL IS NORMALIZED",
        passed:
            reserveCapability?.label ===
            "reserve value"
    },
    {
        name:
            "SNAKE CASE SYMBOL IS NORMALIZED TO SAME CAPABILITY",
        passed:
            reserveCapability !==
            undefined
    },
    {
        name:
            "EQUIVALENT SYMBOLS ARE GROUPED",
        passed:
            reserveCapability
                ?.evidence
                .length ===
            2
    },
    {
        name:
            "GROUPED CAPABILITY PRESERVES FIRST FACT ID",
        passed:
            reserveCapability
                ?.evidence
                .includes(
                    "OBS-00001-FACT-00001"
                ) ===
            true
    },
    {
        name:
            "GROUPED CAPABILITY PRESERVES SECOND FACT ID",
        passed:
            reserveCapability
                ?.evidence
                .includes(
                    "OBS-00001-FACT-00002"
                ) ===
            true
    },
    {
        name:
            "PASCAL CASE EVENT IS NORMALIZED",
        passed:
            releasedCapability?.label ===
            "value released"
    },
    {
        name:
            "EVENT CAPABILITY PRESERVES FACT ID",
        passed:
            releasedCapability
                ?.evidence
                .includes(
                    "OBS-00001-FACT-00003"
                ) ===
            true
    },
    {
        name:
            "REQUIRE STATEMENT DOES NOT BECOME CAPABILITY",
        passed:
            !result
                .model
                .capabilities
                .some(
                    capability =>
                        capability
                            .evidence
                            .includes(
                                "OBS-00001-FACT-00004"
                            )
                )
    },
    {
        name:
            "CONTRACT NAME DOES NOT BECOME CAPABILITY",
        passed:
            !result
                .model
                .capabilities
                .some(
                    capability =>
                        capability
                            .evidence
                            .includes(
                                "OBS-00001-FACT-00005"
                            )
                )
    },
    {
        name:
            "RUNTIME DERIVATION LEAVES PROTOCOLS UNATTRIBUTED",
        passed:
            result
                .model
                .capabilities
                .every(
                    capability =>
                        capability.protocols.length ===
                        0
                )
    },
    {
        name:
            "RUNTIME DERIVATION CREATES NO RELATIONSHIPS",
        passed:
            result.model.relationships.length ===
            0
    },
    {
        name:
            "CAPABILITIES CONTAIN NO CONFIDENCE FIELD",
        passed:
            result
                .model
                .capabilities
                .every(
                    capability =>
                        !Object.prototype.hasOwnProperty.call(
                            capability,
                            "confidence"
                        )
                )
    },
    {
        name:
            "CAPABILITY ORDER IS DETERMINISTIC",
        passed:
            result
                .model
                .capabilities
                .map(
                    capability =>
                        capability.capabilityId
                )
                .join("|") ===
            [
                "LEXICAL-RESERVE-VALUE",
                "LEXICAL-VALUE-RELEASED"
            ].join("|")
    },
    {
        name:
            "MODEL ID PRESERVES SOURCE ID",
        passed:
            result
                .model
                .modelId
                .includes(
                    sourceId
                )
    },
    {
        name:
            "MODEL ID PRESERVES SOURCE REVISION",
        passed:
            result
                .model
                .modelId
                .includes(
                    sourceRevision
                )
    },
    {
        name:
            "REVISION CONTAMINATION IS DETECTED",
        passed:
            contaminatedResult.errors.length >
            0
    },
    {
        name:
            "REVISION CONTAMINATION FAILS CLOSED",
        passed:
            contaminatedResult
                .model
                .capabilities
                .length ===
                0 &&
            contaminatedResult
                .model
                .relationships
                .length ===
                0
    }
];


console.log("");
console.log(
    "SCIENTIFIC SEMANTIC DERIVATION — RUNTIME"
);
console.log(
    "----------------------------------------"
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