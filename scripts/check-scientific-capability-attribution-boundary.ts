import {
    existsSync,
    readFileSync
} from "node:fs";


const attributionPath =
    "./laboratory/scientific-capability-attribution/ScientificAttributedCapability.ts";

const resultPath =
    "./laboratory/scientific-capability-attribution/ScientificCapabilityAttributionResult.ts";

const enginePath =
    "./laboratory/scientific-capability-attribution/ScientificCapabilityAttributionEngine.ts";


const attributionExists =
    existsSync(
        attributionPath
    );

const resultExists =
    existsSync(
        resultPath
    );

const engineExists =
    existsSync(
        enginePath
    );


const attributionSource =
    attributionExists
        ? readFileSync(
            attributionPath,
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
        attributionSource,
        resultSource,
        engineSource
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


const legacyPaths = [
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
            "SCIENTIFIC ATTRIBUTED CAPABILITY CONTRACT EXISTS",
        passed:
            attributionExists
    },
    {
        name:
            "SCIENTIFIC CAPABILITY ATTRIBUTION RESULT EXISTS",
        passed:
            resultExists
    },
    {
        name:
            "SCIENTIFIC CAPABILITY ATTRIBUTION ENGINE EXISTS",
        passed:
            engineExists
    },
    {
        name:
            "ATTRIBUTION HAS DETERMINISTIC ID",
        passed:
            /attributionId\s*:\s*string/.test(
                attributionSource
            )
    },
    {
        name:
            "ATTRIBUTION PRESERVES CAPABILITY ID",
        passed:
            /capabilityId\s*:\s*string/.test(
                attributionSource
            )
    },
    {
        name:
            "ATTRIBUTION PRESERVES CAPABILITY LABEL",
        passed:
            /label\s*:\s*string/.test(
                attributionSource
            )
    },
    {
        name:
            "ATTRIBUTION PRESERVES STRUCTURAL CONTAINER KIND",
        passed:
            /containerKind\s*:\s*ScientificSourceFactContainerKind/.test(
                attributionSource
            )
    },
    {
        name:
            "ATTRIBUTION PRESERVES STRUCTURAL CONTAINER SYMBOL",
        passed:
            /containerSymbol\s*:\s*string/.test(
                attributionSource
            )
    },
    {
        name:
            "ATTRIBUTION PRESERVES FACT EVIDENCE",
        passed:
            /evidence\s*:\s*string\[\]/.test(
                attributionSource
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
            "RESULT PRESERVES SOURCE MODEL ID",
        passed:
            /sourceModelId\s*:\s*string/.test(
                resultSource
            )
    },
    {
        name:
            "RESULT EXPOSES ATTRIBUTED CAPABILITIES",
        passed:
            /attributedCapabilities\s*:\s*ScientificAttributedCapability\[\]/.test(
                resultSource
            )
    },
    {
        name:
            "RESULT EXPOSES UNATTRIBUTED CAPABILITY IDS",
        passed:
            /unattributedCapabilityIds\s*:\s*string\[\]/.test(
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
            "ENGINE CONSUMES SCIENTIFIC SEMANTIC DERIVATION",
        passed:
            engineSource.includes(
                "ScientificSemanticDerivationResult"
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
            "ENGINE JOINS CAPABILITIES THROUGH FACT IDS",
        passed:
            engineSource.includes(
                "factId"
            ) &&
            engineSource.includes(
                "capability.evidence"
            )
    },
    {
        name:
            "ENGINE USES OBSERVED CONTAINER KIND",
        passed:
            engineSource.includes(
                "fact.containerKind"
            )
    },
    {
        name:
            "ENGINE USES OBSERVED CONTAINER SYMBOL",
        passed:
            engineSource.includes(
                "fact.containerSymbol"
            )
    },
    {
        name:
            "ATTRIBUTION DOES NOT DECLARE PROTOCOL OWNERSHIP",
        passed:
            !/\bprotocols?\s*:/.test(
                attributionSource
            )
    },
    {
        name:
            "ATTRIBUTION CONTAINS NO CONFIDENCE",
        passed:
            !/\bconfidence\b/.test(
                productionSource
            )
    },
    {
        name:
            "ATTRIBUTION CONTAINS NO SEMANTIC RELATIONSHIPS",
        passed:
            !/\brelationships?\s*:/.test(
                attributionSource
            ) &&
            !/\brelationships?\s*:/.test(
                resultSource
            )
    },
    {
        name:
            "ATTRIBUTION DOES NOT USE SOURCE ID AS OWNER",
        passed:
            !/containerSymbol\s*:\s*(?:input|derivation)\.sourceId/.test(
                engineSource
            )
    },
    {
        name:
            "ATTRIBUTION HAS NO PREDEFINED ERC ANSWERS",
        passed:
            !forbiddenAnswers.some(
                answer =>
                    productionSource.includes(
                        answer
                    )
            )
    },
    {
        name:
            "ATTRIBUTION DOES NOT CALL LEGACY REASONERS",
        passed:
            !legacyPaths.some(
                legacy =>
                    productionSource.includes(
                        legacy
                    )
            )
    }
];


console.log("");
console.log(
    "SCIENTIFIC CAPABILITY ATTRIBUTION BOUNDARY"
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
