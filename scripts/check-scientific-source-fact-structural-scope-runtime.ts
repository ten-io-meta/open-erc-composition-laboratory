import {
    SolidityScientificSourceFactExtractor
} from "../laboratory/scientific-source-fact/SolidityScientificSourceFactExtractor.js";

import type {
    ScientificSourceObservation
} from "../laboratory/scientific-source-observation/ScientificSourceObservation.js";


const observation:
    ScientificSourceObservation = {

    observationId:
        "CONTROLLED-OBS-00001",

    sourceId:
        "CONTROLLED-SOURCE",

    sourceType:
        "GITHUB",

    sourceRevision:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",

    kind:
        "CONTRACT_SOURCE",

    locator: {
        sourceLocation:
            "https://github.com/example/scoped",

        filePath:
            "contracts/Scoped.sol",

        startLine:
            1
    },

    rawText: `
interface IScopedExample
{
    function reserveValue(uint256 amount) external;

    event ValueReserved(uint256 amount);
}

contract ScopedExample {
    uint256 public storedValue;

    modifier onlyReady() {
        require(storedValue >= 0, "ready");
        _;
    }

    function releaseValue(uint256 amount) external onlyReady {
        require(amount > 0, "amount");
        revert("controlled");
    }
}
`.trim()

};


const extractor =
    new SolidityScientificSourceFactExtractor();

const facts =
    extractor.extract(
        observation
    );


const bySymbol =
    (
        symbol:
            string
    ) =>
        facts.find(
            fact =>
                fact.symbol ===
                symbol
        );


const interfaceDeclaration =
    bySymbol(
        "IScopedExample"
    );

const interfaceFunction =
    bySymbol(
        "reserveValue"
    );

const interfaceEvent =
    bySymbol(
        "ValueReserved"
    );

const contractDeclaration =
    bySymbol(
        "ScopedExample"
    );

const stateVariable =
    bySymbol(
        "storedValue"
    );

const modifier =
    bySymbol(
        "onlyReady"
    );

const contractFunction =
    bySymbol(
        "releaseValue"
    );


const requireFacts =
    facts.filter(
        fact =>
            fact.kind ===
            "REQUIRE_STATEMENT"
    );

const revertFact =
    facts.find(
        fact =>
            fact.kind ===
            "REVERT_STATEMENT"
    );


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "INTERFACE DECLARATION REMAINS TOP LEVEL",
        passed:
            interfaceDeclaration
                ?.containerKind ===
                undefined &&
            interfaceDeclaration
                ?.containerSymbol ===
                undefined
    },
    {
        name:
            "INTERFACE FUNCTION PRESERVES INTERFACE KIND",
        passed:
            interfaceFunction
                ?.containerKind ===
            "INTERFACE"
    },
    {
        name:
            "INTERFACE FUNCTION PRESERVES INTERFACE SYMBOL",
        passed:
            interfaceFunction
                ?.containerSymbol ===
            "IScopedExample"
    },
    {
        name:
            "INTERFACE EVENT PRESERVES INTERFACE KIND",
        passed:
            interfaceEvent
                ?.containerKind ===
            "INTERFACE"
    },
    {
        name:
            "INTERFACE EVENT PRESERVES INTERFACE SYMBOL",
        passed:
            interfaceEvent
                ?.containerSymbol ===
            "IScopedExample"
    },
    {
        name:
            "CONTRACT DECLARATION REMAINS TOP LEVEL",
        passed:
            contractDeclaration
                ?.containerKind ===
                undefined &&
            contractDeclaration
                ?.containerSymbol ===
                undefined
    },
    {
        name:
            "CONTRACT STATE VARIABLE PRESERVES CONTRACT KIND",
        passed:
            stateVariable
                ?.containerKind ===
            "CONTRACT"
    },
    {
        name:
            "CONTRACT STATE VARIABLE PRESERVES CONTRACT SYMBOL",
        passed:
            stateVariable
                ?.containerSymbol ===
            "ScopedExample"
    },
    {
        name:
            "CONTRACT MODIFIER PRESERVES CONTRACT KIND",
        passed:
            modifier
                ?.containerKind ===
            "CONTRACT"
    },
    {
        name:
            "CONTRACT MODIFIER PRESERVES CONTRACT SYMBOL",
        passed:
            modifier
                ?.containerSymbol ===
            "ScopedExample"
    },
    {
        name:
            "CONTRACT FUNCTION PRESERVES CONTRACT KIND",
        passed:
            contractFunction
                ?.containerKind ===
            "CONTRACT"
    },
    {
        name:
            "CONTRACT FUNCTION PRESERVES CONTRACT SYMBOL",
        passed:
            contractFunction
                ?.containerSymbol ===
            "ScopedExample"
    },
    {
        name:
            "REQUIRE STATEMENTS PRESERVE CONTRACT SCOPE",
        passed:
            requireFacts.length ===
                2 &&
            requireFacts.every(
                fact =>
                    fact.containerKind ===
                        "CONTRACT" &&
                    fact.containerSymbol ===
                        "ScopedExample"
            )
    },
    {
        name:
            "REVERT STATEMENT PRESERVES CONTRACT SCOPE",
        passed:
            revertFact
                ?.containerKind ===
                "CONTRACT" &&
            revertFact
                ?.containerSymbol ===
                "ScopedExample"
    },
    {
        name:
            "INTERFACE SCOPE DOES NOT LEAK INTO CONTRACT",
        passed:
            [
                stateVariable,
                modifier,
                contractFunction,
                ...requireFacts,
                revertFact
            ]
                .filter(
                    fact =>
                        fact !==
                        undefined
                )
                .every(
                    fact =>
                        fact
                            ?.containerSymbol !==
                        "IScopedExample"
                )
    },
    {
        name:
            "STRUCTURAL SCOPE PRESERVES SOURCE REVISION",
        passed:
            facts.every(
                fact =>
                    fact.sourceRevision ===
                    observation.sourceRevision
            )
    }
];


console.log("");
console.log(
    "SCIENTIFIC SOURCE FACT STRUCTURAL SCOPE — RUNTIME"
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
