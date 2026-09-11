import {
    readFileSync
} from "node:fs";


const factPath =
    "./laboratory/scientific-source-fact/ScientificSourceFact.ts";

const extractorPath =
    "./laboratory/scientific-source-fact/SolidityScientificSourceFactExtractor.ts";


const factSource =
    readFileSync(
        factPath,
        "utf8"
    );

const extractorSource =
    readFileSync(
        extractorPath,
        "utf8"
    );


const productionSource =
    [
        factSource,
        extractorSource
    ].join(
        "\n"
    );


const forbiddenAnswers = [
    "ERC8004",
    "ERC8060",
    "IERC8060Reservable",
    "Reservation",
    "Settlement",
    "Accounting",
    "EmbeddedValue",
    "AgentIdentity"
];


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "FACT DECLARES STRUCTURAL CONTAINER KIND TYPE",
        passed:
            factSource.includes(
                "ScientificSourceFactContainerKind"
            )
    },
    {
        name:
            "STRUCTURAL CONTAINER SUPPORTS INTERFACE",
        passed:
            factSource.includes(
                '"INTERFACE"'
            )
    },
    {
        name:
            "STRUCTURAL CONTAINER SUPPORTS CONTRACT",
        passed:
            factSource.includes(
                '"CONTRACT"'
            )
    },
    {
        name:
            "FACT PRESERVES OPTIONAL CONTAINER KIND",
        passed:
            /containerKind\?\s*:\s*ScientificSourceFactContainerKind/.test(
                factSource
            )
    },
    {
        name:
            "FACT PRESERVES OPTIONAL CONTAINER SYMBOL",
        passed:
            /containerSymbol\?\s*:\s*string/.test(
                factSource
            )
    },
    {
        name:
            "EXTRACTOR OBSERVES INTERFACE DECLARATIONS",
        passed:
            extractorSource.includes(
                "INTERFACE_DECLARATION"
            )
    },
    {
        name:
            "EXTRACTOR OBSERVES CONTRACT DECLARATIONS",
        passed:
            extractorSource.includes(
                "CONTRACT_DECLARATION"
            )
    },
    {
        name:
            "EXTRACTOR TRACKS STRUCTURAL CONTAINER KIND",
        passed:
            extractorSource.includes(
                "containerKind"
            )
    },
    {
        name:
            "EXTRACTOR TRACKS STRUCTURAL CONTAINER SYMBOL",
        passed:
            extractorSource.includes(
                "containerSymbol"
            )
    },
    {
        name:
            "EXTRACTOR USES BRACE DEPTH FOR STRUCTURAL SCOPE",
        passed:
            extractorSource.includes(
                "braceDepth"
            )
    },
    {
        name:
            "STRUCTURAL SCOPE DOES NOT ASSIGN PROTOCOL FIELD",
        passed:
            !/\bprotocols?\s*:/.test(
                factSource
            )
    },
    {
        name:
            "STRUCTURAL SCOPE DOES NOT ASSIGN CONFIDENCE",
        passed:
            !/\bconfidence\s*:/.test(
                factSource
            )
    },
    {
        name:
            "STRUCTURAL SCOPE DOES NOT PRECOMPUTE COMPOSITION",
        passed:
            !/\bprotocolPair\b|\bcapabilityPair\b|\bcompositionCandidate\b/.test(
                factSource
            )
    },
    {
        name:
            "STRUCTURAL SCOPE CONTAINS NO PREDEFINED ERC ANSWERS",
        passed:
            !forbiddenAnswers.some(
                answer =>
                    productionSource.includes(
                        answer
                    )
            )
    }
];


console.log("");
console.log(
    "SCIENTIFIC SOURCE FACT STRUCTURAL SCOPE BOUNDARY"
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
