import { readFile } from "fs/promises";

const factPath =
    "./laboratory/scientific-source-fact/ScientificSourceFact.ts";

const externalCallPath =
    "./laboratory/scientific-source-fact/ScientificSourceExternalCall.ts";

const fact =
    normalize(
        await readFileSafe(
            factPath
        )
    );

const externalCall =
    normalize(
        await readFileSafe(
            externalCallPath
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
            "FACT KIND SUPPORTS EXTERNAL CALL EXPRESSION",
        passed:
            fact.includes(
                '"EXTERNAL_CALL_EXPRESSION"'
            )
    },
    {
        name:
            "SOURCE FACT SUPPORTS STRUCTURED EXTERNAL CALL",
        passed:
            fact.includes(
                "externalCall?: ScientificSourceExternalCall"
            )
    },
    {
        name:
            "EXTERNAL CALL MODEL EXISTS",
        passed:
            externalCall.length > 0
    },
    {
        name:
            "EXTERNAL CALL MODEL DECLARES CALL FORM",
        passed:
            externalCall.includes(
                "callForm: ScientificSourceExternalCallForm"
            )
    },
    {
        name:
            "EXTERNAL CALL MODEL SUPPORTS LOW LEVEL CALL",
        passed:
            externalCall.includes(
                '"LOW_LEVEL_CALL"'
            )
    },
    {
        name:
            "EXTERNAL CALL MODEL SUPPORTS LOW LEVEL STATICCALL",
        passed:
            externalCall.includes(
                '"LOW_LEVEL_STATICCALL"'
            )
    },
    {
        name:
            "EXTERNAL CALL MODEL SUPPORTS LOW LEVEL DELEGATECALL",
        passed:
            externalCall.includes(
                '"LOW_LEVEL_DELEGATECALL"'
            )
    },
    {
        name:
            "EXTERNAL CALL MODEL SUPPORTS CAST MEMBER CALL",
        passed:
            externalCall.includes(
                '"CAST_MEMBER_CALL"'
            )
    },
    {
        name:
            "EXTERNAL CALL MODEL PRESERVES TARGET EXPRESSION",
        passed:
            externalCall.includes(
                "targetExpression: string"
            )
    },
    {
        name:
            "EXTERNAL CALL MODEL PRESERVES OPTIONAL CAST TYPE SYMBOL",
        passed:
            externalCall.includes(
                "castTypeSymbol?: string"
            )
    },
    {
        name:
            "EXTERNAL CALL MODEL PRESERVES OPTIONAL MEMBER SYMBOL",
        passed:
            externalCall.includes(
                "memberSymbol?: string"
            )
    },
    {
        name:
            "EXTERNAL CALL MODEL PRESERVES OPTIONAL ENCODED CALL TYPE SYMBOL",
        passed:
            externalCall.includes(
                "encodedCallTypeSymbol?: string"
            )
    },
    {
        name:
            "EXTERNAL CALL MODEL PRESERVES OPTIONAL ENCODED CALL MEMBER SYMBOL",
        passed:
            externalCall.includes(
                "encodedCallMemberSymbol?: string"
            )
    },
    {
        name:
            "EXTERNAL CALL MODEL DOES NOT PRECOMPUTE COMPOSITION SEMANTICS",
        passed:
            !/\b(protocolPair|capabilityPair|relation|confidence|compositionCandidate|scientificPolarity)\s*:/.test(
                externalCall
            ) &&
            !externalCall.includes(
                "CompositionCandidate"
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
