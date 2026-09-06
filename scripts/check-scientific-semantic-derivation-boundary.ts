import {
    existsSync,
    readFileSync
} from "node:fs";


const resultPath =
    "./laboratory/scientific-semantic-derivation/ScientificSemanticDerivationResult.ts";

const enginePath =
    "./laboratory/scientific-semantic-derivation/ScientificSemanticDerivationEngine.ts";


const resultExists =
    existsSync(
        resultPath
    );

const engineExists =
    existsSync(
        enginePath
    );


const resultSource =
    resultExists
        ? readFileSync(
            resultPath,
            "utf8"
        )
        : "";

const engineSource =
    engineExists
        ? readFileSync(
            enginePath,
            "utf8"
        )
        : "";


const forbiddenSemanticAnswers =
    [
        "ERC8004",
        "ERC8060",
        "IERC8060Reservable",
        "EmbeddedValue",
        "Reservation",
        "Settlement",
        "Accounting",
        "Authority",
        "Cursor"
    ];


const forbiddenLegacyEngines =
    [
        "SemanticReasoningEngine",
        "MachineReasoningEngine",
        "CompositionDiscoveryEngine",
        "SemanticModelBuilder"
    ];


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "SCIENTIFIC SEMANTIC DERIVATION RESULT EXISTS",
        passed:
            resultExists
    },
    {
        name:
            "SCIENTIFIC SEMANTIC DERIVATION ENGINE EXISTS",
        passed:
            engineExists
    },
    {
        name:
            "DERIVATION RESULT PRESERVES SOURCE ID",
        passed:
            /sourceId\s*:\s*string/.test(
                resultSource
            )
    },
    {
        name:
            "DERIVATION RESULT PRESERVES SOURCE REVISION",
        passed:
            /sourceRevision\?\s*:\s*string/.test(
                resultSource
            )
    },
    {
        name:
            "DERIVATION RESULT EXPOSES SEMANTIC MODEL",
        passed:
            /model\s*:\s*SemanticModel/.test(
                resultSource
            )
    },
    {
        name:
            "DERIVATION RESULT EXPOSES ERRORS",
        passed:
            /errors\s*:\s*string\[\]/.test(
                resultSource
            )
    },
    {
        name:
            "ENGINE CONSUMES SCIENTIFIC SOURCE FACTS",
        passed:
            engineSource.includes(
                "ScientificSourceFact"
            )
    },
    {
        name:
            "ENGINE PRODUCES SEMANTIC CAPABILITIES",
        passed:
            engineSource.includes(
                "SemanticCapability"
            )
    },
    {
        name:
            "ENGINE PRESERVES FACT IDS AS EVIDENCE",
        passed:
            engineSource.includes(
                "fact.factId"
            )
    },
    {
        name:
            "ENGINE DOES NOT PRECOMPUTE RELATIONSHIPS",
        passed:
            /relationships\s*:\s*\[\s*\]/.test(
                engineSource
            )
    },
    {
        name:
            "ENGINE DOES NOT EMIT CO OCCURRENCE",
        passed:
            !engineSource.includes(
                "CO_OCCURS_WITH"
            )
    },
    {
        name:
            "ENGINE DOES NOT EMIT POTENTIAL COMPOSITION",
        passed:
            !engineSource.includes(
                "POTENTIAL_COMPOSITION"
            )
    },
    {
        name:
            "ENGINE DOES NOT ASSIGN SEMANTIC CONFIDENCE",
        passed:
            !/\bconfidence\s*:/.test(
                engineSource
            )
    },
    {
        name:
            "ENGINE DOES NOT USE LEGACY REASONERS",
        passed:
            forbiddenLegacyEngines.every(
                name =>
                    !engineSource.includes(
                        name
                    )
            )
    },
    {
        name:
            "ENGINE CONTAINS NO PREDEFINED ERC OR CAPABILITY ANSWERS",
        passed:
            forbiddenSemanticAnswers.every(
                answer =>
                    !engineSource.includes(
                        answer
                    )
            )
    },
    {
        name:
            "ENGINE DOES NOT ASSIGN SOURCE ID AS PROTOCOL",
        passed:
            !/protocols\s*:\s*\[\s*sourceId\s*\]/.test(
                engineSource
            )
    },
    {
        name:
            "ENGINE LEAVES UNPROVEN PROTOCOL ATTRIBUTION EMPTY",
        passed:
            /protocols\s*:\s*\[\s*\]/.test(
                engineSource
            )
    }
];


console.log("");
console.log(
    "SCIENTIFIC SEMANTIC DERIVATION BOUNDARY"
);
console.log(
    "---------------------------------------"
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