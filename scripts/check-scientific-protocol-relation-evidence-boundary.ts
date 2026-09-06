import {
    existsSync,
    readFileSync
} from "node:fs";


const relationPath =
    "./laboratory/scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.ts";

const resultPath =
    "./laboratory/scientific-protocol-relation-evidence/ScientificProtocolRelationEvidenceResult.ts";

const enginePath =
    "./laboratory/scientific-protocol-relation-evidence/ScientificDocumentationProtocolRelationEvidenceEngine.ts";


const relationExists =
    existsSync(
        relationPath
    );

const resultExists =
    existsSync(
        resultPath
    );

const engineExists =
    existsSync(
        enginePath
    );


const relationSource =
    relationExists
        ? readFileSync(
            relationPath,
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
        relationSource,
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
    "GitHubSourceBundle",
    "GitHubAdapterResult",
    "ProtocolSemanticExtractor",
    "SemanticReasoningEngine",
    "MachineReasoningEngine",
    "CompositionDiscoveryEngine",
    "SemanticModelBuilder"
];


const downstreamSemanticInputs = [
    "ScientificCapabilityAttributionResult",
    "ScientificProtocolIdentityAttributionResult",
    "ScientificProtocolAttributedCapability"
];


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "PROTOCOL RELATION EVIDENCE CONTRACT EXISTS",
        passed:
            relationExists
    },
    {
        name:
            "PROTOCOL RELATION EVIDENCE RESULT EXISTS",
        passed:
            resultExists
    },
    {
        name:
            "DOCUMENTATION RELATION EVIDENCE ENGINE EXISTS",
        passed:
            engineExists
    },
    {
        name:
            "RELATION DECLARES DETERMINISTIC EVIDENCE ID",
        passed:
            /relationEvidenceId\s*:\s*string/.test(
                relationSource
            )
    },
    {
        name:
            "RELATION PRESERVES SOURCE ID",
        passed:
            /sourceId\s*:\s*string/.test(
                relationSource
            )
    },
    {
        name:
            "RELATION PRESERVES OPTIONAL SOURCE REVISION",
        passed:
            /sourceRevision\?\s*:\s*string/.test(
                relationSource
            )
    },
    {
        name:
            "RELATION PRESERVES OBSERVATION ID",
        passed:
            /observationId\s*:\s*string/.test(
                relationSource
            )
    },
    {
        name:
            "RELATION PRESERVES DOCUMENT SUBJECT SYMBOL",
        passed:
            /subjectSymbol\s*:\s*string/.test(
                relationSource
            )
    },
    {
        name:
            "RELATION SUPPORTS EXTENSION FOR",
        passed:
            relationSource.includes(
                '"EXTENSION_FOR"'
            )
    },
    {
        name:
            "RELATION PRESERVES OBJECT PROTOCOL ID",
        passed:
            /objectProtocolId\s*:\s*string/.test(
                relationSource
            )
    },
    {
        name:
            "RELATION PRESERVES EXPLICIT EVIDENCE BASIS",
        passed:
            /evidenceBasis\s*:\s*ScientificProtocolRelationEvidenceBasis/.test(
                relationSource
            )
    },
    {
        name:
            "RELATION PRESERVES STRUCTURED LOCATOR",
        passed:
            /locator\s*:\s*ScientificSourceObservationLocator/.test(
                relationSource
            )
    },
    {
        name:
            "RELATION PRESERVES EXACT RAW EVIDENCE",
        passed:
            /rawText\s*:\s*string/.test(
                relationSource
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
            "RESULT EXPOSES RELATION EVIDENCE",
        passed:
            /relations\s*:\s*ScientificProtocolRelationEvidence\[\]/.test(
                resultSource
            )
    },
    {
        name:
            "RESULT EXPOSES UNRESOLVED DOCUMENTATION OBSERVATIONS",
        passed:
            /unresolvedObservationIds\s*:\s*string\[\]/.test(
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
            "ENGINE CONSUMES SCIENTIFIC SOURCE OBSERVATIONS",
        passed:
            engineSource.includes(
                "ScientificSourceObservation"
            )
    },
    {
        name:
            "ENGINE RESTRICTS EXTRACTION TO DOCUMENTATION",
        passed:
            engineSource.includes(
                '"DOCUMENTATION"'
            )
    },
    {
        name:
            "ENGINE READS OBSERVATION RAW TEXT",
        passed:
            engineSource.includes(
                "observation.rawText"
            )
    },
    {
        name:
            "ENGINE READS OBSERVATION LOCATOR",
        passed:
            engineSource.includes(
                "observation.locator"
            )
    },
    {
        name:
            "ENGINE REQUIRES MARKDOWN TOP LEVEL SUBJECT",
        passed:
            engineSource.includes(
                "^#"
            )
    },
    {
        name:
            "ENGINE REQUIRES EXPLICIT EXTENSION FOR PHRASE",
        passed:
            engineSource.includes(
                "extension"
            ) &&
            engineSource.includes(
                "for"
            )
    },
    {
        name:
            "ENGINE REQUIRES EXACT ERC OBJECT IDENTIFIER",
        passed:
            engineSource.includes(
                "ERC-([1-9][0-9]*)"
            )
    },
    {
        name:
            "RELATION EVIDENCE CONTAINS NO CONFIDENCE",
        passed:
            !/\bconfidence\b/.test(
                productionSource
            )
    },
    {
        name:
            "RELATION EVIDENCE DOES NOT PRECOMPUTE COMPOSITION",
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
            "RELATION EVIDENCE HAS NO PREDEFINED ERC ANSWERS",
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
            "RELATION EVIDENCE DOES NOT USE LEGACY INPUTS",
        passed:
            !legacyInputs.some(
                legacy =>
                    productionSource.includes(
                        legacy
                    )
            )
    },
    {
        name:
            "RELATION EVIDENCE IS INDEPENDENT OF DOWNSTREAM SEMANTIC ATTRIBUTION",
        passed:
            !downstreamSemanticInputs.some(
                downstream =>
                    productionSource.includes(
                        downstream
                    )
            )
    }
];


console.log("");
console.log(
    "SCIENTIFIC PROTOCOL RELATION EVIDENCE BOUNDARY"
);
console.log(
    "----------------------------------------------"
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
