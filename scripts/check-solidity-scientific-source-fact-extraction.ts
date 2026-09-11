const modulePath =
    "../laboratory/scientific-source-fact/SolidityScientificSourceFactExtractor.js";

let extractorLoaded =
    false;

let extractionSucceeded =
    false;

let facts: any[] =
    [];

try {

    const imported =
        await import(
            modulePath
        );

    const Extractor =
        imported.SolidityScientificSourceFactExtractor;

    if (
        typeof Extractor ===
        "function"
    ) {

        extractorLoaded =
            true;

        const extractor =
            new Extractor();

        facts =
            extractor.extract({
                observationId:
                    "SOURCE-A-OBS-00001",

                sourceId:
                    "SOURCE-A",

                sourceType:
                    "GITHUB",

                sourceRevision:
                    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",

                kind:
                    "CONTRACT_SOURCE",

                locator: {
                    sourceLocation:
                        "https://github.com/example/repository",

                    filePath:
                        "/contracts/Example.sol",

                    startLine:
                        1,

                    endLine:
                        23
                },

                rawText:
`interface IExample {
    function quote(uint256 amount) external view returns (uint256);
}

contract Example {

    event Updated(uint256 value);

    uint256 public value;

    modifier onlyReady() {
        require(value > 0, "not ready");
        _;
    }

    function setValue(uint256 next) external onlyReady {
        if (next == 0) {
            revert ZeroValue();
        }

        value = next;
    }
}`
            });

        extractionSucceeded =
            Array.isArray(
                facts
            );

    }

} catch {

    facts =
        [];

}

const byKind = (
    kind: string
) =>
    facts.filter(
        fact =>
            fact.kind ===
            kind
    );

const findSymbol = (
    kind: string,
    symbol: string
) =>
    facts.find(
        fact =>
            fact.kind ===
                kind &&
            fact.symbol ===
                symbol
    );

const interfaceFact =
    findSymbol(
        "INTERFACE_DECLARATION",
        "IExample"
    );

const contractFact =
    findSymbol(
        "CONTRACT_DECLARATION",
        "Example"
    );

const quoteFact =
    findSymbol(
        "FUNCTION_DECLARATION",
        "quote"
    );

const setValueFact =
    findSymbol(
        "FUNCTION_DECLARATION",
        "setValue"
    );

const eventFact =
    findSymbol(
        "EVENT_DECLARATION",
        "Updated"
    );

const stateFact =
    findSymbol(
        "STATE_VARIABLE_DECLARATION",
        "value"
    );

const modifierFact =
    findSymbol(
        "MODIFIER_DECLARATION",
        "onlyReady"
    );

const requireFact =
    byKind(
        "REQUIRE_STATEMENT"
    )[0];

const revertFact =
    byKind(
        "REVERT_STATEMENT"
    )[0];

const forbiddenFields = [
    "protocolPair",
    "capabilityPair",
    "relation",
    "confidence",
    "compositionCandidate"
];

const hasForbiddenField =
    facts.some(
        fact =>
            forbiddenFields.some(
                field =>
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            fact,
                            field
                        )
            )
    );

const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "SOLIDITY SCIENTIFIC SOURCE FACT EXTRACTOR LOADS",
        passed:
            extractorLoaded
    },
    {
        name:
            "SOLIDITY SCIENTIFIC SOURCE FACT EXTRACTION SUCCEEDS",
        passed:
            extractionSucceeded
    },
    {
        name:
            "INTERFACE DECLARATION IS OBSERVED",
        passed:
            interfaceFact !==
            undefined
    },
    {
        name:
            "CONTRACT DECLARATION IS OBSERVED",
        passed:
            contractFact !==
            undefined
    },
    {
        name:
            "INTERFACE FUNCTION DECLARATION IS OBSERVED",
        passed:
            quoteFact !==
            undefined
    },
    {
        name:
            "CONTRACT FUNCTION DECLARATION IS OBSERVED",
        passed:
            setValueFact !==
            undefined
    },
    {
        name:
            "EVENT DECLARATION IS OBSERVED",
        passed:
            eventFact !==
            undefined
    },
    {
        name:
            "STATE VARIABLE DECLARATION IS OBSERVED",
        passed:
            stateFact !==
            undefined
    },
    {
        name:
            "MODIFIER DECLARATION IS OBSERVED",
        passed:
            modifierFact !==
            undefined
    },
    {
        name:
            "REQUIRE STATEMENT IS OBSERVED",
        passed:
            requireFact !==
            undefined
    },
    {
        name:
            "REVERT STATEMENT IS OBSERVED",
        passed:
            revertFact !==
            undefined
    },
    {
        name:
            "FACTS PRESERVE SOURCE ID",
        passed:
            facts.length > 0 &&
            facts.every(
                fact =>
                    fact.sourceId ===
                    "SOURCE-A"
            )
    },
    {
        name:
            "FACTS PRESERVE SOURCE REVISION",
        passed:
            facts.length > 0 &&
            facts.every(
                fact =>
                    fact.sourceRevision ===
                    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
            )
    },
    {
        name:
            "FACTS PRESERVE OBSERVATION ID",
        passed:
            facts.length > 0 &&
            facts.every(
                fact =>
                    fact.observationId ===
                    "SOURCE-A-OBS-00001"
            )
    },
    {
        name:
            "FACTS PRESERVE FILE PATH",
        passed:
            facts.length > 0 &&
            facts.every(
                fact =>
                    fact.locator?.filePath ===
                    "/contracts/Example.sol"
            )
    },
    {
        name:
            "INTERFACE LOCATION IS EXACT",
        passed:
            interfaceFact
                ?.locator
                ?.startLine ===
            1
    },
    {
        name:
            "CONTRACT LOCATION IS EXACT",
        passed:
            contractFact
                ?.locator
                ?.startLine ===
            5
    },
    {
        name:
            "EVENT LOCATION IS EXACT",
        passed:
            eventFact
                ?.locator
                ?.startLine ===
            7
    },
    {
        name:
            "STATE VARIABLE LOCATION IS EXACT",
        passed:
            stateFact
                ?.locator
                ?.startLine ===
            9
    },
    {
        name:
            "MODIFIER LOCATION IS EXACT",
        passed:
            modifierFact
                ?.locator
                ?.startLine ===
            11
    },
    {
        name:
            "REQUIRE LOCATION IS EXACT",
        passed:
            requireFact
                ?.locator
                ?.startLine ===
            12
    },
    {
        name:
            "FUNCTION LOCATION IS EXACT",
        passed:
            setValueFact
                ?.locator
                ?.startLine ===
            16
    },
    {
        name:
            "REVERT LOCATION IS EXACT",
        passed:
            revertFact
                ?.locator
                ?.startLine ===
            18
    },
    {
        name:
            "FACT RAW TEXT COMES FROM SOURCE",
        passed:
            requireFact
                ?.rawText
                ?.includes(
                    "require(value > 0"
                ) ===
            true
    },
    {
        name:
            "FACT IDS ARE DETERMINISTIC",
        passed:
            facts.length > 0 &&
            facts.every(
                (
                    fact,
                    index
                ) =>
                    fact.factId ===
                    `SOURCE-A-OBS-00001-FACT-${String(
                        index + 1
                    ).padStart(
                        5,
                        "0"
                    )}`
            )
    },
    {
        name:
            "FACT ORDER FOLLOWS SOURCE LOCATION",
        passed:
            facts.every(
                (
                    fact,
                    index
                ) =>
                    index ===
                        0 ||
                    (
                        facts[
                            index - 1
                        ].locator.startLine <=
                        fact.locator.startLine
                    )
            )
    },
    {
        name:
            "FACTS DO NOT PRECOMPUTE SEMANTIC ANSWERS",
        passed:
            facts.length > 0 &&
            !hasForbiddenField
    }
];

console.log("");
console.log(
    "SOLIDITY SCIENTIFIC SOURCE FACT EXTRACTION"
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