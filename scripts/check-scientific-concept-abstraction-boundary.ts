import {
    existsSync,
    readFileSync
} from "node:fs";


const conceptPath =
    "./laboratory/scientific-concept-abstraction/ScientificConcept.ts";

const resultPath =
    "./laboratory/scientific-concept-abstraction/ScientificConceptAbstractionResult.ts";

const enginePath =
    "./laboratory/scientific-concept-abstraction/ScientificConceptAbstractionEngine.ts";


const conceptExists =
    existsSync(
        conceptPath
    );

const resultExists =
    existsSync(
        resultPath
    );

const engineExists =
    existsSync(
        enginePath
    );


const conceptSource =
    conceptExists
        ? readFileSync(
            conceptPath,
            "utf8"
        )
        : "";

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


const productionSource =
    [
        conceptSource,
        resultSource,
        engineSource
    ].join(
        "\n"
    );


const predefinedAnswers = [
    "ERC8004",
    "ERC8060",
    "IERC8060Reservable",
    "EmbeddedValue",
    "Reservation",
    "Settlement",
    "Accounting",
    "Authority",
    "Cursor",
    "AgentIdentity"
];


const legacyReasoners = [
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
            "SCIENTIFIC CONCEPT CONTRACT EXISTS",
        passed:
            conceptExists
    },
    {
        name:
            "SCIENTIFIC CONCEPT ABSTRACTION RESULT EXISTS",
        passed:
            resultExists
    },
    {
        name:
            "SCIENTIFIC CONCEPT ABSTRACTION ENGINE EXISTS",
        passed:
            engineExists
    },
    {
        name:
            "CONCEPT PRESERVES DETERMINISTIC CONCEPT ID",
        passed:
            /conceptId\s*:\s*string/.test(
                conceptSource
            )
    },
    {
        name:
            "CONCEPT PRESERVES OBSERVED LABEL",
        passed:
            /label\s*:\s*string/.test(
                conceptSource
            )
    },
    {
        name:
            "CONCEPT PRESERVES SUPPORTING LEXICAL CAPABILITY IDS",
        passed:
            /lexicalCapabilityIds\s*:\s*string\[\]/.test(
                conceptSource
            )
    },
    {
        name:
            "CONCEPT PRESERVES FACT EVIDENCE",
        passed:
            /evidence\s*:\s*string\[\]/.test(
                conceptSource
            )
    },
    {
        name:
            "RESULT PRESERVES SOURCE ID",
        passed:
            /sourceId\s*:\s*string/.test(
                resultSource
            )
    },
    {
        name:
            "RESULT PRESERVES SOURCE REVISION",
        passed:
            /sourceRevision\?\s*:\s*string/.test(
                resultSource
            )
    },
    {
        name:
            "RESULT PRESERVES SOURCE SEMANTIC MODEL ID",
        passed:
            /sourceModelId\s*:\s*string/.test(
                resultSource
            )
    },
    {
        name:
            "RESULT EXPOSES SCIENTIFIC CONCEPTS",
        passed:
            /concepts\s*:\s*ScientificConcept\[\]/.test(
                resultSource
            )
    },
    {
        name:
            "RESULT EXPOSES FAIL-CLOSED ERRORS",
        passed:
            /errors\s*:\s*string\[\]/.test(
                resultSource
            )
    },
    {
        name:
            "ENGINE CONSUMES SCIENTIFIC SEMANTIC DERIVATION RESULT",
        passed:
            engineSource.includes(
                "ScientificSemanticDerivationResult"
            )
    },
    {
        name:
            "ENGINE READS LEXICAL CAPABILITY LABELS",
        passed:
            /capability\.label/.test(
                engineSource
            )
    },
    {
        name:
            "ENGINE PRESERVES LEXICAL CAPABILITY IDS",
        passed:
            /capability\.capabilityId/.test(
                engineSource
            )
    },
    {
        name:
            "ENGINE PRESERVES CAPABILITY FACT EVIDENCE",
        passed:
            /capability\.evidence/.test(
                engineSource
            )
    },
    {
        name:
            "CONCEPT IDS ARE DERIVED FROM OBSERVED TOKENS",
        passed:
            engineSource.includes(
                "CONCEPT-"
            )
    },
    {
        name:
            "ABSTRACTION REQUIRES MULTIPLE DISTINCT LEXICAL CAPABILITIES",
        passed:
            /lexicalCapabilityIds[\s\S]*size[\s\S]*2/.test(
                engineSource
            ) ||
            /capabilityIds[\s\S]*size[\s\S]*2/.test(
                engineSource
            )
    },
    {
        name:
            "SCIENTIFIC CONCEPTS CONTAIN NO CONFIDENCE",
        passed:
            !/\bconfidence\b/.test(
                productionSource
            )
    },
    {
        name:
            "SCIENTIFIC CONCEPTS CONTAIN NO RELATIONSHIP FIELDS",
        passed:
            !/\brelationships?\s*:/.test(
                [
                    conceptSource,
                    resultSource
                ].join(
                    "\n"
                )
            )
    },
    {
        name:
            "SCIENTIFIC CONCEPTS DO NOT ATTRIBUTE PROTOCOL OWNERSHIP",
        passed:
            !/\bprotocols?\s*:/.test(
                conceptSource
            )
    },
    {
        name:
            "SCIENTIFIC CONCEPT ABSTRACTION HAS NO PREDEFINED ERC ANSWERS",
        passed:
            !predefinedAnswers.some(
                answer =>
                    productionSource.includes(
                        answer
                    )
            )
    },
    {
        name:
            "SCIENTIFIC CONCEPT ABSTRACTION DOES NOT CALL LEGACY REASONERS",
        passed:
            !legacyReasoners.some(
                reasoner =>
                    productionSource.includes(
                        reasoner
                    )
            )
    },
    {
        name:
            "SCIENTIFIC CONCEPT ABSTRACTION HAS NO SYNONYM DICTIONARY",
        passed:
            !/\bsynonyms?\b/i.test(
                productionSource
            )
    }
];


console.log("");
console.log(
    "SCIENTIFIC CONCEPT ABSTRACTION BOUNDARY"
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