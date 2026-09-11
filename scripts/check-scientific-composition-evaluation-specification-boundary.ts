import {
    existsSync,
    readFileSync
} from "node:fs";


const constraintPath =
    "./laboratory/scientific-composition-evaluation-specification/ScientificCompositionConstraint.ts";

const specificationPath =
    "./laboratory/scientific-composition-evaluation-specification/ScientificCompositionEvaluationSpecification.ts";

const resultPath =
    "./laboratory/scientific-composition-evaluation-specification/ScientificCompositionEvaluationSpecificationResult.ts";

const enginePath =
    "./laboratory/scientific-composition-evaluation-specification/ScientificCompositionEvaluationSpecificationEngine.ts";


const constraintExists =
    existsSync(
        constraintPath
    );

const specificationExists =
    existsSync(
        specificationPath
    );

const resultExists =
    existsSync(
        resultPath
    );

const engineExists =
    existsSync(
        enginePath
    );


const constraintSource =
    constraintExists
        ? readFileSync(
            constraintPath,
            "utf8"
        )
        : "";

const specificationSource =
    specificationExists
        ? readFileSync(
            specificationPath,
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
        constraintSource,
        specificationSource,
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
    "CompositionDiscoveryEngine",
    "../composition-discovery/",
    "SemanticReasoningEngine",
    "MachineReasoningEngine",
    "SemanticRelationship",
    "KnowledgeGraph",
    "ResearchConclusion",
    "ConfidenceEngine",
    "CO_OCCURS_WITH",
    "POTENTIAL_COMPOSITION"
];


const checks: Array<{
    name: string;
    passed: boolean;
}> = [

    {
        name:
            "SCIENTIFIC COMPOSITION CONSTRAINT CONTRACT EXISTS",
        passed:
            constraintExists
    },

    {
        name:
            "SCIENTIFIC COMPOSITION EVALUATION SPECIFICATION EXISTS",
        passed:
            specificationExists
    },

    {
        name:
            "SCIENTIFIC COMPOSITION EVALUATION RESULT EXISTS",
        passed:
            resultExists
    },

    {
        name:
            "SCIENTIFIC COMPOSITION EVALUATION SPECIFICATION ENGINE EXISTS",
        passed:
            engineExists
    },

    {
        name:
            "CONSTRAINT DECLARES DETERMINISTIC ID",
        passed:
            /constraintId\s*:\s*string/.test(
                constraintSource
            )
    },

    {
        name:
            "CONSTRAINT PRESERVES CANDIDATE ID",
        passed:
            /candidateId\s*:\s*string/.test(
                constraintSource
            )
    },

    {
        name:
            "CONSTRAINT PRESERVES PARTICIPANT SIDE",
        passed:
            constraintSource.includes(
                '"A"'
            ) &&
            constraintSource.includes(
                '"B"'
            )
    },

    {
        name:
            "CONSTRAINT PRESERVES PARTICIPANT KIND",
        passed:
            /participantKind\s*:/.test(
                constraintSource
            )
    },

    {
        name:
            "CONSTRAINT PRESERVES PARTICIPANT ID",
        passed:
            /participantId\s*:\s*string/.test(
                constraintSource
            )
    },

    {
        name:
            "CONSTRAINT PRESERVES SOURCE ID",
        passed:
            /sourceId\s*:\s*string/.test(
                constraintSource
            )
    },

    {
        name:
            "CONSTRAINT PRESERVES OPTIONAL SOURCE REVISION",
        passed:
            /sourceRevision\?\s*:\s*string/.test(
                constraintSource
            )
    },

    {
        name:
            "CONSTRAINT PRESERVES FACT ID",
        passed:
            /factId\s*:\s*string/.test(
                constraintSource
            )
    },

    {
        name:
            "CONSTRAINT BASIS IS EXPLICIT SOLIDITY REQUIRE",
        passed:
            constraintSource.includes(
                '"SOLIDITY_REQUIRE_STATEMENT"'
            )
    },

    {
        name:
            "CONSTRAINT PRESERVES STRUCTURAL CONTAINER",
        passed:
            /containerSymbol\s*:\s*string/.test(
                constraintSource
            )
    },

    {
        name:
            "CONSTRAINT PRESERVES STRUCTURED LOCATOR",
        passed:
            /locator\s*:/.test(
                constraintSource
            )
    },

    {
        name:
            "CONSTRAINT PRESERVES EXACT RAW TEXT",
        passed:
            /rawText\s*:\s*string/.test(
                constraintSource
            )
    },

    {
        name:
            "SPECIFICATION DECLARES DETERMINISTIC ID",
        passed:
            /specificationId\s*:\s*string/.test(
                specificationSource
            )
    },

    {
        name:
            "SPECIFICATION PRESERVES CANDIDATE ID",
        passed:
            /candidateId\s*:\s*string/.test(
                specificationSource
            )
    },

    {
        name:
            "SPECIFICATION PRESERVES CANDIDATE MECHANISM",
        passed:
            /mechanism\s*:/.test(
                specificationSource
            )
    },

    {
        name:
            "SPECIFICATION SUPPORTS READY",
        passed:
            specificationSource.includes(
                '"READY"'
            )
    },

    {
        name:
            "SPECIFICATION SUPPORTS INSUFFICIENT EVIDENCE",
        passed:
            specificationSource.includes(
                '"INSUFFICIENT_EVIDENCE"'
            )
    },

    {
        name:
            "SPECIFICATION PRESERVES SOURCE IDS",
        passed:
            /sourceIds\s*:\s*string\[\]/.test(
                specificationSource
            )
    },

    {
        name:
            "SPECIFICATION PRESERVES TARGET EVIDENCE IDS",
        passed:
            /targetEvidenceIds\s*:\s*string\[\]/.test(
                specificationSource
            )
    },

    {
        name:
            "SPECIFICATION PRESERVES CONSTRAINTS",
        passed:
            /constraints\s*:\s*ScientificCompositionConstraint\[\]/.test(
                specificationSource
            )
    },

    {
        name:
            "SPECIFICATION PRESERVES PARTICIPANT A CONSTRAINT IDS",
        passed:
            /participantAConstraintIds\s*:\s*string\[\]/.test(
                specificationSource
            )
    },

    {
        name:
            "SPECIFICATION PRESERVES PARTICIPANT B CONSTRAINT IDS",
        passed:
            /participantBConstraintIds\s*:\s*string\[\]/.test(
                specificationSource
            )
    },

    {
        name:
            "SPECIFICATION PRESERVES UNRESOLVED GUARD FACT IDS",
        passed:
            /unresolvedGuardFactIds\s*:\s*string\[\]/.test(
                specificationSource
            )
    },

    {
        name:
            "READY SPECIFICATION USES EXPLICIT SCIENTIFIC CRITERIA",
        passed:
            specificationSource.includes(
                '"PRESERVES_OBSERVED_CONSTRAINTS"'
            ) &&
            specificationSource.includes(
                '"ALL_OBSERVED_PARTICIPANT_CONSTRAINTS_PRESERVED"'
            ) &&
            specificationSource.includes(
                '"ANY_OBSERVED_PARTICIPANT_CONSTRAINT_VIOLATED"'
            )
    },

    {
        name:
            "SCIENTIFIC CRITERIA PRESERVE SUPPORT POLARITY",
        passed:
            specificationSource.includes(
                '"SUPPORT"'
            )
    },

    {
        name:
            "SCIENTIFIC CRITERIA PRESERVE CHALLENGE POLARITY",
        passed:
            specificationSource.includes(
                '"CHALLENGE"'
            )
    },

    {
        name:
            "SCIENTIFIC CRITERIA PRESERVE INCONCLUSIVE FALLBACK",
        passed:
            specificationSource.includes(
                "whenNoScientificPolarity"
            )
    },

    {
        name:
            "RESULT EXPOSES SPECIFICATIONS",
        passed:
            /specifications\s*:\s*ScientificCompositionEvaluationSpecification\[\]/.test(
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
            "ENGINE CONSUMES SCIENTIFIC CROSS PROTOCOL DISCOVERY",
        passed:
            engineSource.includes(
                "ScientificCrossProtocolCompositionResult"
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
            "ENGINE CONSUMES PROTOCOL CONCEPT RESULTS FOR PROVENANCE",
        passed:
            engineSource.includes(
                "ScientificProtocolConceptAttributionResult"
            )
    },

    {
        name:
            "ENGINE CONSUMES PROTOCOL RELATION RESULTS FOR PROVENANCE",
        passed:
            engineSource.includes(
                "ScientificProtocolRelationEvidenceResult"
            )
    },

    {
        name:
            "ENGINE RESOLVES CANDIDATE PROVENANCE EVIDENCE IDS",
        passed:
            engineSource.includes(
                "provenance.evidenceId"
            )
    },

    {
        name:
            "ENGINE USES REQUIRE STATEMENT AS EXPLICIT CONSTRAINT",
        passed:
            engineSource.includes(
                '"REQUIRE_STATEMENT"'
            )
    },

    {
        name:
            "ENGINE DOES NOT PROMOTE REVERT TO TESTABLE CONDITION",
        passed:
            engineSource.includes(
                '"REVERT_STATEMENT"'
            ) &&
            engineSource.includes(
                "unresolvedGuardFactIds"
            )
    },

    {
        name:
            "ENGINE READS FACT CONTAINER SYMBOL",
        passed:
            engineSource.includes(
                "fact.containerSymbol"
            )
    },

    {
        name:
            "ENGINE MATCHES SYMBOLIC SUBJECT EXACTLY",
        passed:
            engineSource.includes(
                '"SYMBOLIC_SUBJECT"'
            )
    },

    {
        name:
            "ENGINE MATCHES EXPLICIT PROTOCOL PARTICIPANTS",
        passed:
            engineSource.includes(
                '"PROTOCOL"'
            )
    },

    {
        name:
            "READY REQUIRES PARTICIPANT A CONSTRAINT",
        passed:
            engineSource.includes(
                "participantAConstraintIds.length > 0"
            )
    },

    {
        name:
            "READY REQUIRES PARTICIPANT B CONSTRAINT",
        passed:
            engineSource.includes(
                "participantBConstraintIds.length > 0"
            )
    },

    {
        name:
            "ENGINE PRESERVES FACT RAW TEXT",
        passed:
            engineSource.includes(
                "fact.rawText"
            )
    },

    {
        name:
            "ENGINE PRESERVES FACT LOCATOR",
        passed:
            engineSource.includes(
                "fact.locator"
            )
    },

    {
        name:
            "ENGINE FAILS CLOSED ON UPSTREAM DISCOVERY ERRORS",
        passed:
            engineSource.includes(
                "discovery.errors"
            )
    },

    {
        name:
            "EVALUATION SPECIFICATION CONTAINS NO CONFIDENCE",
        passed:
            !/\bconfidence\b/.test(
                productionSource
            )
    },

    {
        name:
            "EVALUATION SPECIFICATION DOES NOT DECLARE FINAL VERDICT",
        passed:
            !/\bSUPPORTED\b/.test(
                specificationSource
            ) &&
            !/\bREJECTED\b/.test(
                specificationSource
            )
    },

    {
        name:
            "EVALUATION SPECIFICATION DOES NOT INVENT SOURCE CONCLUSION",
        passed:
            !/\bsourceConclusionId\b/.test(
                productionSource
            )
    },

    {
        name:
            "EVALUATION SPECIFICATION HAS NO PREDEFINED ERC ANSWERS",
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
            "EVALUATION SPECIFICATION DOES NOT USE LEGACY INPUTS",
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
    "SCIENTIFIC COMPOSITION EVALUATION SPECIFICATION - BOUNDARY"
);

console.log(
    "---------------------------------------------------------"
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
