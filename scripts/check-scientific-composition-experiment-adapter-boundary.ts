import {
    existsSync,
    readFileSync
} from "node:fs";


const adapterPath =
    "./laboratory/scientific-composition-experiment/ScientificCompositionExperimentAdapter.ts";

const autonomousExperimentPath =
    "./laboratory/autonomous-experiment-design/AutonomousExperiment.ts";

const autonomousResultPath =
    "./laboratory/autonomous-experiment-design/AutonomousExperimentResult.ts";

const autonomousEnginePath =
    "./laboratory/autonomous-experiment-design/AutonomousExperimentDesignEngine.ts";


const adapterExists =
    existsSync(
        adapterPath
    );


const adapterSource =
    adapterExists
        ? readFileSync(
            adapterPath,
            "utf8"
        )
        : "";

const autonomousExperimentSource =
    readFileSync(
        autonomousExperimentPath,
        "utf8"
    );

const autonomousResultSource =
    readFileSync(
        autonomousResultPath,
        "utf8"
    );

const autonomousEngineSource =
    readFileSync(
        autonomousEnginePath,
        "utf8"
    );


const forbiddenSemanticInputs = [
    "referencedProtocols",
    "referencedCapabilities",
    "confidenceWeight",
    "ProtocolSemantic",
    "SemanticReasoningEngine",
    "MachineReasoningEngine",
    "CompositionDiscoveryEngine",
    "CO_OCCURS_WITH",
    "POTENTIAL_COMPOSITION",
    "ResearchConclusion"
];


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


const checks: Array<{
    name: string;
    passed: boolean;
}> = [

    {
        name:
            "SCIENTIFIC COMPOSITION EXPERIMENT ADAPTER EXISTS",
        passed:
            adapterExists
    },

    {
        name:
            "AUTONOMOUS EXPERIMENT SUPPORTS COMPOSITION CANDIDATE TARGET",
        passed:
            autonomousExperimentSource.includes(
                '"COMPOSITION_CANDIDATE"'
            )
    },

    {
        name:
            "AUTONOMOUS RESULT COUNTS COMPOSITION CANDIDATES",
        passed:
            /compositionCandidate\s*:\s*number/.test(
                autonomousResultSource
            )
    },

    {
        name:
            "AUTONOMOUS DESIGN SUCCESS STATISTICS INITIALIZE COMPOSITION CANDIDATE",
        passed:
            /compositionCandidate\s*:/.test(
                autonomousEngineSource
            )
    },

    {
        name:
            "ADAPTER CONSUMES SCIENTIFIC EVALUATION SPECIFICATION RESULT",
        passed:
            adapterSource.includes(
                "ScientificCompositionEvaluationSpecificationResult"
            )
    },

    {
        name:
            "ADAPTER USES RESEARCH SOURCE AS NEUTRAL PROVENANCE CONTRACT",
        passed:
            adapterSource.includes(
                "ResearchSource"
            )
    },

    {
        name:
            "ADAPTER NARROWS RESEARCH SOURCE TO SOURCE ID AND REPOSITORY",
        passed:
            adapterSource.includes(
                "Pick<"
            ) &&
            adapterSource.includes(
                "ResearchSource"
            ) &&
            adapterSource.includes(
                '"sourceId"'
            ) &&
            adapterSource.includes(
                '"repository"'
            )
    },

    {
        name:
            "ADAPTER RETURNS AUTONOMOUS EXPERIMENT RESULT",
        passed:
            adapterSource.includes(
                "AutonomousExperimentResult"
            )
    },

    {
        name:
            "ADAPTER ONLY PROMOTES READY SPECIFICATIONS",
        passed:
            adapterSource.includes(
                '"READY"'
            ) &&
            adapterSource.includes(
                "specification.status"
            )
    },

    {
        name:
            "INSUFFICIENT EVIDENCE DOES NOT BECOME EXECUTABLE EXPERIMENT",
        passed:
            adapterSource.includes(
                '"INSUFFICIENT_EVIDENCE"'
            )
    },

    {
        name:
            "ADAPTER RESOLVES SOURCES BY EXACT SOURCE ID",
        passed:
            adapterSource.includes(
                "sourceById"
            ) &&
            adapterSource.includes(
                "source.sourceId"
            )
    },

    {
        name:
            "ADAPTER READS EXPLICIT REPOSITORY ATTRIBUTION",
        passed:
            adapterSource.includes(
                "source.repository"
            )
    },

    {
        name:
            "ADAPTER DOES NOT RECONSTRUCT REPOSITORY FROM SOURCE ID",
        passed:
            !adapterSource.includes(
                "GITHUB-"
            )
    },

    {
        name:
            "UNKNOWN SOURCE ID FAILS CLOSED",
        passed:
            adapterSource.includes(
                "references unknown source"
            )
    },

    {
        name:
            "SOURCE WITHOUT REPOSITORY FAILS CLOSED",
        passed:
            adapterSource.includes(
                "has no repository attribution"
            )
    },

    {
        name:
            "DUPLICATE SOURCE ID IS DETECTED",
        passed:
            adapterSource.includes(
                "Duplicate research source id"
            )
    },

    {
        name:
            "REPOSITORIES ARE DEDUPLICATED",
        passed:
            adapterSource.includes(
                "new Set"
            ) &&
            adapterSource.includes(
                "recommendedRepositories"
            )
    },

    {
        name:
            "SOURCE IDS REMAIN SEPARATE FROM REPOSITORY DEDUPLICATION",
        passed:
            adapterSource.includes(
                "specification.sourceIds"
            )
    },

    {
        name:
            "EXPERIMENT TARGET TYPE IS COMPOSITION CANDIDATE",
        passed:
            adapterSource.includes(
                'targetType:'
            ) &&
            adapterSource.includes(
                '"COMPOSITION_CANDIDATE"'
            )
    },

    {
        name:
            "EXPERIMENT TARGET ID IS CANDIDATE ID",
        passed:
            adapterSource.includes(
                "specification.candidateId"
            )
    },

    {
        name:
            "EXPERIMENT PRESERVES TARGET EVIDENCE IDS",
        passed:
            adapterSource.includes(
                "specification.targetEvidenceIds"
            )
    },

    {
        name:
            "EXPERIMENT PRESERVES SCIENTIFIC CRITERIA",
        passed:
            adapterSource.includes(
                "specification.scientificCriteria"
            )
    },

    {
        name:
            "EXPERIMENT USES OBSERVED CONSTRAINTS",
        passed:
            adapterSource.includes(
                "specification.constraints"
            )
    },

    {
        name:
            "EXPERIMENT PRESERVES SUPPORT CONDITION",
        passed:
            adapterSource.includes(
                "scientificCriteria.support.condition"
            )
    },

    {
        name:
            "EXPERIMENT PRESERVES CHALLENGE CONDITION",
        passed:
            adapterSource.includes(
                "scientificCriteria.challenge.condition"
            )
    },

    {
        name:
            "EXPERIMENT DECLARES REQUIRED EVIDENCE",
        passed:
            adapterSource.includes(
                "requiredEvidence"
            )
    },

    {
        name:
            "EXPERIMENT DECLARES PROCEDURE",
        passed:
            adapterSource.includes(
                "procedure"
            )
    },

    {
        name:
            "EXPERIMENT DECLARES RECOMMENDED REPOSITORIES",
        passed:
            adapterSource.includes(
                "recommendedRepositories"
            )
    },

    {
        name:
            "EXPERIMENT ID IS DERIVED FROM SPECIFICATION ID",
        passed:
            adapterSource.includes(
                "specification.specificationId"
            ) &&
            adapterSource.includes(
                "SCIENTIFIC-COMPOSITION-EXPERIMENT-"
            )
    },

    {
        name:
            "ADAPTER DOES NOT INVENT SOURCE CONCLUSION",
        passed:
            !adapterSource.includes(
                "sourceConclusionId"
            )
    },

    {
        name:
            "ADAPTER DOES NOT CONSUME LEGACY SEMANTIC INPUTS",
        passed:
            !forbiddenSemanticInputs.some(
                value =>
                    adapterSource.includes(
                        value
                    )
            )
    },

    {
        name:
            "ADAPTER CONTAINS NO PREDEFINED ERC ANSWERS",
        passed:
            !forbiddenAnswers.some(
                value =>
                    adapterSource.includes(
                        value
                    )
            )
    },

    {
        name:
            "ADAPTER CONTAINS NO SCIENTIFIC CONFIDENCE",
        passed:
            !/\bconfidence\b/i.test(
                adapterSource
            )
    },

    {
        name:
            "ADAPTER DOES NOT DECLARE FINAL SUPPORTED VERDICT",
        passed:
            !/\bSUPPORTED\b/.test(
                adapterSource
            )
    },

    {
        name:
            "ADAPTER DOES NOT DECLARE FINAL REJECTED VERDICT",
        passed:
            !/\bREJECTED\b/.test(
                adapterSource
            )
    },

    {
        name:
            "ADAPTER FAILS CLOSED BEFORE RETURNING EXPERIMENTS ON ERRORS",
        passed:
            adapterSource.includes(
                "errors.length > 0"
            ) &&
            adapterSource.includes(
                "experiments: []"
            )
    },

    {
        name:
            "COMPOSITION EXPERIMENT STATISTICS ARE EXPLICIT",
        passed:
            adapterSource.includes(
                "compositionCandidate"
            )
    },

    {
        name:
            "COMPOSITION EXPERIMENT DOES NOT CLAIM SOURCE INDEPENDENCE",
        passed:
            !adapterSource.includes(
                "independent source"
            ) &&
            !adapterSource.includes(
                "independentSources"
            )
    }

];


console.log("");
console.log(
    "SCIENTIFIC COMPOSITION EXPERIMENT ADAPTER - BOUNDARY"
);
console.log(
    "----------------------------------------------------"
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
