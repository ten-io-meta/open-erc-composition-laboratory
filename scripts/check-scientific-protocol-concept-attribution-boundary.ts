import {
    existsSync,
    readFileSync
} from "node:fs";


const conceptPath =
    "./laboratory/scientific-protocol-concept-attribution/ScientificProtocolConcept.ts";

const resultPath =
    "./laboratory/scientific-protocol-concept-attribution/ScientificProtocolConceptAttributionResult.ts";

const enginePath =
    "./laboratory/scientific-protocol-concept-attribution/ScientificProtocolConceptAttributionEngine.ts";


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


const forbiddenAnswers = [
    "ERC8004",
    "ERC8060",
    "IERC8060Reservable",
    "IERC721Value",
    "EmbeddedValue",
    "AgentIdentity",
    "Reservation",
    "Settlement",
    "Accounting"
];


const legacyInputs = [
    "CompositionCandidate",
    "CompositionDiscoveryEngine",
    "SemanticRelationship",
    "SemanticReasoningEngine",
    "MachineReasoningEngine",
    "SemanticModelBuilder",
    "GitHubSourceBundle",
    "GitHubAdapterResult"
];


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "SCIENTIFIC PROTOCOL CONCEPT CONTRACT EXISTS",
        passed:
            conceptExists
    },
    {
        name:
            "PROTOCOL CONCEPT ATTRIBUTION RESULT EXISTS",
        passed:
            resultExists
    },
    {
        name:
            "PROTOCOL CONCEPT ATTRIBUTION ENGINE EXISTS",
        passed:
            engineExists
    },
    {
        name:
            "PROTOCOL CONCEPT HAS DETERMINISTIC ID",
        passed:
            /protocolConceptId\s*:\s*string/.test(
                conceptSource
            )
    },
    {
        name:
            "PROTOCOL CONCEPT PRESERVES CONCEPT ID",
        passed:
            /conceptId\s*:\s*string/.test(
                conceptSource
            )
    },
    {
        name:
            "PROTOCOL CONCEPT PRESERVES CONCEPT LABEL",
        passed:
            /label\s*:\s*string/.test(
                conceptSource
            )
    },
    {
        name:
            "PROTOCOL CONCEPT PRESERVES PROTOCOL ID",
        passed:
            /protocolId\s*:\s*string/.test(
                conceptSource
            )
    },
    {
        name:
            "PROTOCOL CONCEPT PRESERVES SUPPORTING LEXICAL CAPABILITIES",
        passed:
            /lexicalCapabilityIds\s*:\s*string\[\]/.test(
                conceptSource
            )
    },
    {
        name:
            "PROTOCOL CONCEPT PRESERVES PROTOCOL ATTRIBUTION IDS",
        passed:
            /protocolAttributionIds\s*:\s*string\[\]/.test(
                conceptSource
            )
    },
    {
        name:
            "PROTOCOL CONCEPT PRESERVES FACT EVIDENCE",
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
            "RESULT PRESERVES OPTIONAL SOURCE REVISION",
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
            "RESULT EXPOSES PROTOCOL CONCEPTS",
        passed:
            /protocolConcepts\s*:\s*ScientificProtocolConcept\[\]/.test(
                resultSource
            )
    },
    {
        name:
            "RESULT EXPOSES UNATTRIBUTED CONCEPT IDS",
        passed:
            /unattributedConceptIds\s*:\s*string\[\]/.test(
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
            "ENGINE CONSUMES SCIENTIFIC CONCEPT ABSTRACTION",
        passed:
            engineSource.includes(
                "ScientificConceptAbstractionResult"
            )
    },
    {
        name:
            "ENGINE CONSUMES SCIENTIFIC PROTOCOL IDENTITY ATTRIBUTION",
        passed:
            engineSource.includes(
                "ScientificProtocolIdentityAttributionResult"
            )
    },
    {
        name:
            "ENGINE JOINS CONCEPT CAPABILITY IDS",
        passed:
            engineSource.includes(
                "concept.lexicalCapabilityIds"
            )
    },
    {
        name:
            "ENGINE JOINS PROTOCOL CAPABILITY IDS",
        passed:
            engineSource.includes(
                "capability.capabilityId"
            )
    },
    {
        name:
            "ENGINE READS ATTRIBUTED PROTOCOL ID",
        passed:
            engineSource.includes(
                "capability.protocolId"
            )
    },
    {
        name:
            "ENGINE PRESERVES PROTOCOL ATTRIBUTION ID",
        passed:
            engineSource.includes(
                "capability.protocolAttributionId"
            )
    },
    {
        name:
            "ENGINE PRESERVES PROTOCOL FACT EVIDENCE",
        passed:
            engineSource.includes(
                "capability.evidence"
            )
    },
    {
        name:
            "PROTOCOL CONCEPT REQUIRES RECURRENCE WITHIN SAME PROTOCOL",
        passed:
            engineSource.includes(
                "lexicalCapabilityIds.size >= 2"
            )
    },
    {
        name:
            "ENGINE VALIDATES SOURCE ID CONTINUITY",
        passed:
            engineSource.includes(
                "concepts.sourceId"
            ) &&
            engineSource.includes(
                "protocols.sourceId"
            )
    },
    {
        name:
            "ENGINE VALIDATES SOURCE REVISION CONTINUITY",
        passed:
            engineSource.includes(
                "concepts.sourceRevision"
            ) &&
            engineSource.includes(
                "protocols.sourceRevision"
            )
    },
    {
        name:
            "ENGINE VALIDATES SOURCE MODEL CONTINUITY",
        passed:
            engineSource.includes(
                "concepts.sourceModelId"
            ) &&
            engineSource.includes(
                "protocols.sourceModelId"
            )
    },
    {
        name:
            "PROTOCOL CONCEPT CONTAINS NO CONFIDENCE",
        passed:
            !/\bconfidence\b/.test(
                productionSource
            )
    },
    {
        name:
            "PROTOCOL CONCEPT DOES NOT PRECOMPUTE RELATIONSHIPS",
        passed:
            !/\brelationships?\s*:/.test(
                conceptSource
            ) &&
            !/\brelationships?\s*:/.test(
                resultSource
            )
    },
    {
        name:
            "PROTOCOL CONCEPT DOES NOT PRECOMPUTE COMPOSITION",
        passed:
            !/\bcompositionCandidate\b/.test(
                productionSource
            ) &&
            !/\bprotocolPair\b/.test(
                productionSource
            )
    },
    {
        name:
            "PROTOCOL CONCEPT DOES NOT USE SOURCE ID AS PROTOCOL",
        passed:
            !/protocolId\s*:\s*(?:concepts|protocols)\.sourceId/.test(
                engineSource
            )
    },
    {
        name:
            "PROTOCOL CONCEPT HAS NO PREDEFINED ERC ANSWERS",
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
            "PROTOCOL CONCEPT DOES NOT USE LEGACY INPUTS",
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
    "SCIENTIFIC PROTOCOL CONCEPT ATTRIBUTION BOUNDARY"
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
