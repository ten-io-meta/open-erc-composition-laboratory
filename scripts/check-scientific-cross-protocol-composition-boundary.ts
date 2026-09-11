import {
    existsSync,
    readFileSync
} from "node:fs";


const candidatePath =
    "./laboratory/scientific-cross-protocol-composition/ScientificCompositionCandidate.ts";

const resultPath =
    "./laboratory/scientific-cross-protocol-composition/ScientificCrossProtocolCompositionResult.ts";

const enginePath =
    "./laboratory/scientific-cross-protocol-composition/CrossProtocolCompositionEngine.ts";


const candidateExists =
    existsSync(
        candidatePath
    );

const resultExists =
    existsSync(
        resultPath
    );

const engineExists =
    existsSync(
        enginePath
    );


const candidateSource =
    candidateExists
        ? readFileSync(
            candidatePath,
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
        candidateSource,
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
    "../composition-discovery/CompositionCandidate.js",
    "CompositionDiscoveryEngine",
    "CompositionDiscoveryResult",
    "SemanticRelationship",
    "SemanticReasoningEngine",
    "MachineReasoningEngine",
    "SemanticModelBuilder",
    "KnowledgeGraph",
    "CO_OCCURS_WITH",
    "POTENTIAL_COMPOSITION"
];


const checks: Array<{
    name: string;
    passed: boolean;
}> = [

    {
        name:
            "SCIENTIFIC COMPOSITION CANDIDATE CONTRACT EXISTS",
        passed:
            candidateExists
    },

    {
        name:
            "SCIENTIFIC CROSS PROTOCOL RESULT EXISTS",
        passed:
            resultExists
    },

    {
        name:
            "CROSS PROTOCOL COMPOSITION ENGINE EXISTS",
        passed:
            engineExists
    },

    {
        name:
            "CANDIDATE DECLARES DETERMINISTIC ID",
        passed:
            /candidateId\s*:\s*string/.test(
                candidateSource
            )
    },

    {
        name:
            "PARTICIPANT SUPPORTS EXPLICIT PROTOCOL IDENTITY",
        passed:
            candidateSource.includes(
                '"PROTOCOL"'
            )
    },

    {
        name:
            "PARTICIPANT SUPPORTS SYMBOLIC SUBJECT IDENTITY",
        passed:
            candidateSource.includes(
                '"SYMBOLIC_SUBJECT"'
            )
    },

    {
        name:
            "CANDIDATE PRESERVES PARTICIPANT A",
        passed:
            /participantA\s*:\s*ScientificCompositionParticipant/.test(
                candidateSource
            )
    },

    {
        name:
            "CANDIDATE PRESERVES PARTICIPANT B",
        passed:
            /participantB\s*:\s*ScientificCompositionParticipant/.test(
                candidateSource
            )
    },

    {
        name:
            "CANDIDATE SUPPORTS EXPLICIT EXTENSION MECHANISM",
        passed:
            candidateSource.includes(
                '"EXPLICIT_EXTENSION_FOR"'
            )
    },

    {
        name:
            "CANDIDATE SUPPORTS SHARED RECURRENT CONCEPT MECHANISM",
        passed:
            candidateSource.includes(
                '"SHARED_RECURRENT_CONCEPT"'
            )
    },

    {
        name:
            "CANDIDATE MAY PRESERVE SUPPORTING CONCEPT ID",
        passed:
            /conceptId\?\s*:\s*string/.test(
                candidateSource
            )
    },

    {
        name:
            "CANDIDATE PRESERVES PARTICIPANT A CAPABILITIES",
        passed:
            /supportingCapabilityIdsA\s*:\s*string\[\]/.test(
                candidateSource
            )
    },

    {
        name:
            "CANDIDATE PRESERVES PARTICIPANT B CAPABILITIES",
        passed:
            /supportingCapabilityIdsB\s*:\s*string\[\]/.test(
                candidateSource
            )
    },

    {
        name:
            "CANDIDATE PRESERVES STRUCTURED PROVENANCE",
        passed:
            /provenance\s*:\s*ScientificCompositionProvenance\[\]/.test(
                candidateSource
            )
    },

    {
        name:
            "PROVENANCE PRESERVES SOURCE ID",
        passed:
            /sourceId\s*:\s*string/.test(
                candidateSource
            )
    },

    {
        name:
            "PROVENANCE PRESERVES OPTIONAL SOURCE REVISION",
        passed:
            /sourceRevision\?\s*:\s*string/.test(
                candidateSource
            )
    },

    {
        name:
            "PROVENANCE DISTINGUISHES PROTOCOL CONCEPT EVIDENCE",
        passed:
            candidateSource.includes(
                '"PROTOCOL_CONCEPT"'
            )
    },

    {
        name:
            "PROVENANCE DISTINGUISHES PROTOCOL RELATION EVIDENCE",
        passed:
            candidateSource.includes(
                '"PROTOCOL_RELATION"'
            )
    },

    {
        name:
            "PROVENANCE PRESERVES EVIDENCE ID",
        passed:
            /evidenceId\s*:\s*string/.test(
                candidateSource
            )
    },

    {
        name:
            "CANDIDATE IS EXPLICITLY UNEVALUATED",
        passed:
            candidateSource.includes(
                '"UNEVALUATED"'
            ) &&
            /evaluationStatus\s*:/.test(
                candidateSource
            )
    },

    {
        name:
            "RESULT EXPOSES SCIENTIFIC CANDIDATES",
        passed:
            /candidates\s*:\s*ScientificCompositionCandidate\[\]/.test(
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
            "ENGINE CONSUMES PROTOCOL CONCEPT ATTRIBUTION RESULTS",
        passed:
            engineSource.includes(
                "ScientificProtocolConceptAttributionResult"
            )
    },

    {
        name:
            "ENGINE CONSUMES EXPLICIT PROTOCOL RELATION EVIDENCE RESULTS",
        passed:
            engineSource.includes(
                "ScientificProtocolRelationEvidenceResult"
            )
    },

    {
        name:
            "ENGINE READS EXPLICIT RELATION SUBJECT SYMBOL",
        passed:
            engineSource.includes(
                "relation.subjectSymbol"
            )
    },

    {
        name:
            "ENGINE READS EXPLICIT RELATION OBJECT PROTOCOL",
        passed:
            engineSource.includes(
                "relation.objectProtocolId"
            )
    },

    {
        name:
            "ENGINE REQUIRES EXTENSION FOR RELATION",
        passed:
            /relation\.relation\s*!==\s*"EXTENSION_FOR"/.test(
                engineSource
            ) ||
            /relation\.relation\s*===\s*"EXTENSION_FOR"/.test(
                engineSource
            )
    },

    {
        name:
            "ENGINE READS PROTOCOL CONCEPT ID",
        passed:
            engineSource.includes(
                "concept.conceptId"
            )
    },

    {
        name:
            "ENGINE READS PROTOCOL ID FROM PROTOCOL CONCEPT",
        passed:
            engineSource.includes(
                "concept.protocolId"
            )
    },

    {
        name:
            "ENGINE READS PROTOCOL CONCEPT CAPABILITIES",
        passed:
            engineSource.includes(
                "concept.lexicalCapabilityIds"
            )
    },

    {
        name:
            "ENGINE REQUIRES DISTINCT PROTOCOLS FOR SHARED CONCEPT",
        passed:
            engineSource.includes(
                "protocolId"
            ) &&
            (
                engineSource.includes(
                    "!=="
                ) ||
                engineSource.includes(
                    "distinct"
                )
            )
    },

    {
        name:
            "ENGINE PRESERVES PROTOCOL CONCEPT PROVENANCE",
        passed:
            engineSource.includes(
                "protocolConceptId"
            )
    },

    {
        name:
            "ENGINE PRESERVES RELATION EVIDENCE PROVENANCE",
        passed:
            engineSource.includes(
                "relationEvidenceId"
            )
    },

    {
        name:
            "ENGINE FAILS CLOSED ON UPSTREAM ERRORS",
        passed:
            engineSource.includes(
                ".errors"
            ) &&
            engineSource.includes(
                "errors.length"
            )
    },

    {
        name:
            "ENGINE PRODUCES DETERMINISTIC CANDIDATE IDS",
        passed:
            engineSource.includes(
                "candidateId"
            ) &&
            engineSource.includes(
                "length"
            ) &&
            engineSource.includes(
                ".join("
            )
    },

    {
        name:
            "ENGINE DETERMINISTICALLY SORTS CANDIDATES",
        passed:
            engineSource.includes(
                "candidates.sort"
            )
    },

    {
        name:
            "SCIENTIFIC CANDIDATE CONTAINS NO CONFIDENCE",
        passed:
            !/\bconfidence\b/.test(
                productionSource
            )
    },

    {
        name:
            "SCIENTIFIC CANDIDATE CONTAINS NO FREE TEXT REASON",
        passed:
            !/\breason\s*:/.test(
                candidateSource
            )
    },

    {
        name:
            "SCIENTIFIC CANDIDATE DOES NOT DEPEND ON SOURCE GRAPH",
        passed:
            !/\bsourceGraphId\b/.test(
                productionSource
            )
    },

    {
        name:
            "SCIENTIFIC CANDIDATE DOES NOT STORE LEGACY PROTOCOL PAIR",
        passed:
            !/\bprotocolPair\b/.test(
                productionSource
            )
    },

    {
        name:
            "ENGINE DOES NOT USE CO MENTION AS CANDIDATE EVIDENCE",
        passed:
            !/mentioned by the same research source/i.test(
                productionSource
            ) &&
            !/\bco.?mention/i.test(
                productionSource
            )
    },

    {
        name:
            "ENGINE HAS NO PREDEFINED ERC ANSWERS",
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
            "ENGINE DOES NOT USE LEGACY DISCOVERY INPUTS",
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
    "SCIENTIFIC CROSS PROTOCOL COMPOSITION Ã¢â‚¬â€ BOUNDARY"
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
