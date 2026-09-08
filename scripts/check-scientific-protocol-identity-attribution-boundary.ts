import {
    existsSync,
    readFileSync
} from "node:fs";


const capabilityPath =
    "./laboratory/scientific-protocol-identity/ScientificProtocolAttributedCapability.ts";

const resultPath =
    "./laboratory/scientific-protocol-identity/ScientificProtocolIdentityAttributionResult.ts";

const enginePath =
    "./laboratory/scientific-protocol-identity/ScientificProtocolIdentityAttributionEngine.ts";


const capabilityExists =
    existsSync(
        capabilityPath
    );

const resultExists =
    existsSync(
        resultPath
    );

const engineExists =
    existsSync(
        enginePath
    );


const capabilitySource =
    capabilityExists
        ? readFileSync(
            capabilityPath,
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


const resolverPath =
    "./laboratory/scientific-protocol-identity/ScientificProtocolStructuralIdentityResolver.ts";

const resolverSource =
    readFileSync(
        resolverPath,
        "utf8"
    );


const productionSource =
    [
        capabilitySource,
        resultSource,
        engineSource,
        resolverSource
    ].join(
        "\n"
    );


const forbiddenAnswers = [
    "ERC8004",
    "ERC8060",
    "IERC8060Reservable",
    "EmbeddedValue",
    "AgentIdentity",
    "Reservation",
    "Settlement",
    "Accounting"
];


const legacyInputs = [
    "GitHubSourceBundle",
    "GitHubAdapterResult",
    "MachineReasoningEngine",
    "SemanticReasoningEngine",
    "CompositionDiscoveryEngine",
    "ProtocolSemanticExtractor"
];


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "PROTOCOL ATTRIBUTED CAPABILITY CONTRACT EXISTS",
        passed:
            capabilityExists
    },
    {
        name:
            "PROTOCOL IDENTITY ATTRIBUTION RESULT EXISTS",
        passed:
            resultExists
    },
    {
        name:
            "PROTOCOL IDENTITY ATTRIBUTION ENGINE EXISTS",
        passed:
            engineExists
    },
    {
        name:
            "PROTOCOL ATTRIBUTION HAS DETERMINISTIC ID",
        passed:
            /protocolAttributionId\s*:\s*string/.test(
                capabilitySource
            )
    },
    {
        name:
            "PROTOCOL ATTRIBUTION PRESERVES PROTOCOL ID",
        passed:
            /protocolId\s*:\s*string/.test(
                capabilitySource
            )
    },
    {
        name:
            "PROTOCOL ATTRIBUTION PRESERVES STRUCTURAL ATTRIBUTION ID",
        passed:
            /capabilityAttributionId\s*:\s*string/.test(
                capabilitySource
            )
    },
    {
        name:
            "PROTOCOL ATTRIBUTION PRESERVES CAPABILITY ID",
        passed:
            /capabilityId\s*:\s*string/.test(
                capabilitySource
            )
    },
    {
        name:
            "PROTOCOL ATTRIBUTION PRESERVES CAPABILITY LABEL",
        passed:
            /label\s*:\s*string/.test(
                capabilitySource
            )
    },
    {
        name:
            "PROTOCOL ATTRIBUTION PRESERVES OBSERVATION ID",
        passed:
            /observationId\s*:\s*string/.test(
                capabilitySource
            )
    },
    {
        name:
            "PROTOCOL ATTRIBUTION PRESERVES CONTAINER KIND",
        passed:
            /containerKind\s*:\s*ScientificSourceFactContainerKind/.test(
                capabilitySource
            )
    },
    {
        name:
            "PROTOCOL ATTRIBUTION PRESERVES CONTAINER SYMBOL",
        passed:
            /containerSymbol\s*:\s*string/.test(
                capabilitySource
            )
    },
    {
        name:
            "PROTOCOL ATTRIBUTION PRESERVES FACT EVIDENCE",
        passed:
            /evidence\s*:\s*string\[\]/.test(
                capabilitySource
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
            "RESULT EXPOSES PROTOCOL ATTRIBUTED CAPABILITIES",
        passed:
            /protocolAttributedCapabilities\s*:\s*ScientificProtocolAttributedCapability\[\]/.test(
                resultSource
            )
    },
    {
        name:
            "RESULT EXPOSES UNRESOLVED ATTRIBUTION IDS",
        passed:
            /unresolvedAttributionIds\s*:\s*string\[\]/.test(
                resultSource
            )
    },
    {
        name:
            "RESULT EXPOSES FAIL CLOSED ERRORS",
        passed:
            /errors\s*:\s*string\[\]/.test(
                resultSource
            )
    },
    {
        name:
            "ENGINE CONSUMES SCIENTIFIC CAPABILITY ATTRIBUTION RESULT",
        passed:
            engineSource.includes(
                "ScientificCapabilityAttributionResult"
            )
    },
    {
        name:
            "ENGINE READS STRUCTURAL CONTAINER SYMBOL",
        passed:
            engineSource.includes(
                "attribution.containerSymbol"
            )
    },
    {
        name:
            "STRUCTURAL RESOLVER REQUIRES EXACT ERC IDENTIFIER",
        passed:
            resolverSource.includes(
                "^(?:I)?ERC([1-9][0-9]*)$"
            )
    },
    {
        name:
            "STRUCTURAL RESOLVER DOES NOT ACCEPT ERC PREFIX WITH SUFFIX",
        passed:
            !resolverSource.includes(
                "startsWith(\"IERC\")"
            ) &&
            !resolverSource.includes(
                "startsWith(\"ERC\")"
            )
    },
    {
        name:
            "PROTOCOL ATTRIBUTION CONTAINS NO CONFIDENCE",
        passed:
            !/\bconfidence\b/.test(
                productionSource
            )
    },
    {
        name:
            "PROTOCOL ATTRIBUTION CONTAINS NO RELATIONSHIPS",
        passed:
            !/\brelationships?\s*:/.test(
                capabilitySource
            ) &&
            !/\brelationships?\s*:/.test(
                resultSource
            )
    },
    {
        name:
            "PROTOCOL ATTRIBUTION HAS NO PREDEFINED ERC ANSWERS",
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
            "PROTOCOL ATTRIBUTION DOES NOT USE LEGACY INPUTS",
        passed:
            !legacyInputs.some(
                legacy =>
                    productionSource.includes(
                        legacy
                    )
            )
    }
];


console.log("");
console.log(
    "SCIENTIFIC PROTOCOL IDENTITY ATTRIBUTION BOUNDARY"
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
