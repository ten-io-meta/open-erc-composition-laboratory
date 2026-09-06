import { readFile } from "fs/promises";

const factPath =
    "./laboratory/scientific-source-fact/ScientificSourceFact.ts";

const fact =
    normalize(
        await readFileSafe(
            factPath
        )
    );

const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "SCIENTIFIC SOURCE FACT CONTRACT EXISTS",
        passed:
            fact.length > 0
    },
    {
        name:
            "SCIENTIFIC SOURCE FACT DECLARES FACT ID",
        passed:
            fact.includes(
                "factId: string"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE FACT PRESERVES OBSERVATION ID",
        passed:
            fact.includes(
                "observationId: string"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE FACT PRESERVES SOURCE ID",
        passed:
            fact.includes(
                "sourceId: string"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE FACT PRESERVES OPTIONAL SOURCE REVISION",
        passed:
            fact.includes(
                "sourceRevision?: string"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE FACT DECLARES STRUCTURAL KIND",
        passed:
            fact.includes(
                "kind: ScientificSourceFactKind"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE FACT SUPPORTS OBSERVED SYMBOL",
        passed:
            fact.includes(
                "symbol?: string"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE FACT PRESERVES STRUCTURED LOCATOR",
        passed:
            fact.includes(
                "locator: ScientificSourceObservationLocator"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE FACT PRESERVES RAW TEXT",
        passed:
            fact.includes(
                "rawText: string"
            )
    },
    {
        name:
            "FACT KIND SUPPORTS FUNCTION DECLARATION",
        passed:
            fact.includes(
                '"FUNCTION_DECLARATION"'
            )
    },
    {
        name:
            "FACT KIND SUPPORTS MODIFIER DECLARATION",
        passed:
            fact.includes(
                '"MODIFIER_DECLARATION"'
            )
    },
    {
        name:
            "FACT KIND SUPPORTS EVENT DECLARATION",
        passed:
            fact.includes(
                '"EVENT_DECLARATION"'
            )
    },
    {
        name:
            "FACT KIND SUPPORTS STATE VARIABLE DECLARATION",
        passed:
            fact.includes(
                '"STATE_VARIABLE_DECLARATION"'
            )
    },
    {
        name:
            "FACT KIND SUPPORTS REQUIRE STATEMENT",
        passed:
            fact.includes(
                '"REQUIRE_STATEMENT"'
            )
    },
    {
        name:
            "FACT KIND SUPPORTS REVERT STATEMENT",
        passed:
            fact.includes(
                '"REVERT_STATEMENT"'
            )
    },
    {
        name:
            "SOURCE FACT DOES NOT PRECOMPUTE PROTOCOL PAIR",
        passed:
            !fact.includes(
                "protocolPair"
            )
    },
    {
        name:
            "SOURCE FACT DOES NOT PRECOMPUTE CAPABILITY PAIR",
        passed:
            !fact.includes(
                "capabilityPair"
            )
    },
    {
        name:
            "SOURCE FACT DOES NOT PRECOMPUTE SEMANTIC RELATION",
        passed:
            !/\brelation\s*:/.test(
                fact
            )
    },
    {
        name:
            "SOURCE FACT DOES NOT PRECOMPUTE COMPOSITION CONFIDENCE",
        passed:
            !/\bconfidence\s*:/.test(
                fact
            )
    },
    {
        name:
            "SOURCE FACT DOES NOT CONTAIN COMPOSITION CANDIDATE",
        passed:
            !fact.includes(
                "CompositionCandidate"
            )
    }
];

console.log("");
console.log(
    "SCIENTIFIC SOURCE FACT BOUNDARY"
);
console.log(
    "-------------------------------"
);

for (const check of checks) {

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
    failures.length === 0
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

async function readFileSafe(
    path: string
): Promise<string> {

    try {

        return await readFile(
            path,
            "utf8"
        );

    } catch {

        return "";

    }

}

function normalize(
    value: string
): string {

    return value
        .replace(/\s+/g, " ")
        .trim();

}