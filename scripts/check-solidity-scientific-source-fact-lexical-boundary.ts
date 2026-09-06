import {
    SolidityScientificSourceFactExtractor
} from "../laboratory/scientific-source-fact/SolidityScientificSourceFactExtractor.js";


const extractor =
    new SolidityScientificSourceFactExtractor();


const facts =
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
                22

        },

        rawText:
`contract Example {

    string public message = "require(false)";
    string public other = "revert FakeError()";

    // function fakeFunction() external {}
    // require(false);
    // revert FakeError();

    /*
     * modifier fakeModifier() {
     *     require(false);
     * }
     */

    function realFunction() external {
        require(true, "allowed");
    }

}`
    });


const functionFacts =
    facts.filter(
        fact =>
            fact.kind ===
            "FUNCTION_DECLARATION"
    );


const modifierFacts =
    facts.filter(
        fact =>
            fact.kind ===
            "MODIFIER_DECLARATION"
    );


const requireFacts =
    facts.filter(
        fact =>
            fact.kind ===
            "REQUIRE_STATEMENT"
    );


const revertFacts =
    facts.filter(
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
            "REAL FUNCTION IS OBSERVED",
        passed:
            functionFacts.some(
                fact =>
                    fact.symbol ===
                    "realFunction"
            )
    },
    {
        name:
            "COMMENTED FUNCTION IS NOT OBSERVED",
        passed:
            !functionFacts.some(
                fact =>
                    fact.symbol ===
                    "fakeFunction"
            )
    },
    {
        name:
            "BLOCK COMMENT MODIFIER IS NOT OBSERVED",
        passed:
            !modifierFacts.some(
                fact =>
                    fact.symbol ===
                    "fakeModifier"
            )
    },
    {
        name:
            "REAL REQUIRE IS OBSERVED",
        passed:
            requireFacts.length ===
            1 &&
            requireFacts[0]
                .rawText
                .includes(
                    "require(true"
                )
    },
    {
        name:
            "LINE COMMENT REQUIRE IS NOT OBSERVED",
        passed:
            !requireFacts.some(
                fact =>
                    fact.rawText.includes(
                        "// require"
                    )
            )
    },
    {
        name:
            "STRING LITERAL REQUIRE IS NOT OBSERVED",
        passed:
            !requireFacts.some(
                fact =>
                    fact.rawText.includes(
                        "message"
                    )
            )
    },
    {
        name:
            "LINE COMMENT REVERT IS NOT OBSERVED",
        passed:
            !revertFacts.some(
                fact =>
                    fact.rawText.includes(
                        "// revert"
                    )
            )
    },
    {
        name:
            "STRING LITERAL REVERT IS NOT OBSERVED",
        passed:
            !revertFacts.some(
                fact =>
                    fact.rawText.includes(
                        "other"
                    )
            )
    },
    {
        name:
            "BLOCK COMMENT REQUIRE IS NOT OBSERVED",
        passed:
            !requireFacts.some(
                fact =>
                    fact.rawText.includes(
                        "*     require"
                    )
            )
    }
];


console.log("");
console.log(
    "SOLIDITY SCIENTIFIC SOURCE FACT LEXICAL BOUNDARY"
);
console.log(
    "------------------------------------------------"
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