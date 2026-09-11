import {
    AutonomousExperimentDesignEngine
} from "../laboratory/autonomous-experiment-design/AutonomousExperimentDesignEngine.js";

import type {
    ScientificValidationResult
} from "../laboratory/scientific-validation/ScientificValidationResult.js";

import type {
    KnowledgeGapResult
} from "../laboratory/knowledge-gap/KnowledgeGapResult.js";

import type {
    ContradictionResult
} from "../laboratory/contradiction-engine/ContradictionResult.js";

import type {
    ConfidenceAssessmentResult
} from "../laboratory/confidence-engine/ConfidenceAssessmentResult.js";

import type {
    EvidenceGraphResult
} from "../laboratory/evidence-graph/EvidenceGraphResult.js";

import type {
    GitHubRepositoryIntelligenceResult
} from "../laboratory/github-adapter/GitHubRepositoryIntelligence.js";


const controlledEvidenceId =
    "EDGE-CONTROLLED-SOURCE-INDEPENDENCE";

const controlledSourceId =
    "GITHUB-CRYTIC-SLITHER";

const excludedRepository =
    "crytic/slither";

const controlledTheoryId =
    "CONTROLLED-THEORY-SOURCE-INDEPENDENCE";

const feasibleRepository =
    "crytic/echidna";

const unknownFeasibilityRepository =
    "foundry-rs/foundry";


const validations = {
    validations: [
        {
            validationId:
                "CONTROLLED-VALIDATION-SOURCE-INDEPENDENCE",

            theoryId:
                controlledTheoryId,

            theoryTitle:
                "Invariant testing detects contradiction",

            sourcePatternRelation:
                "InvariantValidation VALIDATES Accounting",

            theoryConfidence:
                55,

            supportingEvidence:
                1,

            supportingEvidenceIds: [
                controlledEvidenceId
            ],

            contradictoryEvidence:
                0,

            contradictoryEvidenceIds:
                [],

            independentSources:
                1,

            validationScore:
                55,

            status:
                "INCONCLUSIVE",

            challenges:
                [],

            explanation:
                "Controlled source-independence and feasibility-ranking regression fixture."
        }
    ]
} as unknown as ScientificValidationResult;


const gaps = {
    gaps: []
} as unknown as KnowledgeGapResult;


const contradictions = {
    contradictions: []
} as unknown as ContradictionResult;


const confidence = {
    assessments: []
} as unknown as ConfidenceAssessmentResult;


const evidenceGraph: EvidenceGraphResult = {

    generatedAt:
        new Date().toISOString(),

    nodes:
        [],

    edges: [
        {
            edgeId:
                controlledEvidenceId,

            from:
                "InvariantValidation",

            relation:
                "VALIDATES",

            to:
                "Accounting",

            confidence:
                80,

            sources: [
                controlledSourceId
            ]
        }
    ],

    statistics: {

        nodes:
            0,

        edges:
            1,

        protocols:
            0,

        capabilities:
            0,

        conclusions:
            1

    },

    errors:
        []

};


const sourceRepositories:
    Record<string, string> = {

        [controlledSourceId]:
            excludedRepository

    };


const repositoryExecutionIntelligence:
    Record<
        string,
        GitHubRepositoryIntelligenceResult
    > = {

        [feasibleRepository]:
            {
                structure: {
                    readmes: 0,
                    contracts: 1,
                    tests: 1,
                    docs: 0,
                    configs: 1,
                    workflows: 0,
                    totalFiles: 3
                },

                toolchain:
                    "FOUNDRY",

                invariants: [
                    "controlled invariant"
                ],

                executableTargets: [
                    {
                        type:
                            "INVARIANT",

                        selector:
                            "controlled invariant"
                    }
                ],

                intelligenceSignals: [
                    "Controlled repository exposes an executable invariant target."
                ]

            } as unknown as GitHubRepositoryIntelligenceResult

    };


const result =
    new AutonomousExperimentDesignEngine().build(
        validations,
        gaps,
        contradictions,
        confidence,
        evidenceGraph,
        sourceRepositories,
        repositoryExecutionIntelligence
    );


if (
    result.errors.length > 0
) {

    throw new Error(
        `Autonomous experiment design returned errors: ${
            result.errors.join(" | ")
        }`
    );

}


const experiment =
    result.experiments.find(
        item =>
            item.targetId ===
            controlledTheoryId
    );


if (!experiment) {

    throw new Error(
        "Controlled autonomous experiment was not generated."
    );

}


if (
    !experiment.targetEvidenceIds.includes(
        controlledEvidenceId
    )
) {

    throw new Error(
        "Controlled evidence ID was not propagated into targetEvidenceIds."
    );

}


if (
    experiment.recommendedRepositories.includes(
        excludedRepository
    )
) {

    throw new Error(
        `${excludedRepository} was recommended even though it already supplies target evidence.`
    );

}


if (
    !experiment.recommendedRepositories.includes(
        unknownFeasibilityRepository
    )
) {

    throw new Error(
        `${unknownFeasibilityRepository} disappeared merely because no execution intelligence was available.`
    );

}


if (
    !experiment.recommendedRepositories.includes(
        feasibleRepository
    )
) {

    throw new Error(
        `${feasibleRepository} was not recommended despite known executable invariant intelligence.`
    );

}


const feasibleRepositoryIndex =
    experiment.recommendedRepositories.indexOf(
        feasibleRepository
    );

const unknownFeasibilityRepositoryIndex =
    experiment.recommendedRepositories.indexOf(
        unknownFeasibilityRepository
    );


if (
    feasibleRepositoryIndex < 0 ||
    unknownFeasibilityRepositoryIndex < 0 ||
    feasibleRepositoryIndex >=
        unknownFeasibilityRepositoryIndex
) {

    throw new Error(
        "Known executable invariant feasibility did not rank ahead of a candidate with unknown feasibility."
    );

}


console.log(
    "CONTROLLED AUTONOMOUS SOURCE INDEPENDENCE + FEASIBILITY: PASS"
);

console.log(
    `TARGET EVIDENCE: ${experiment.targetEvidenceIds.join(", ")}`
);

console.log(
    `EXISTING SOURCE: ${controlledSourceId}`
);

console.log(
    `EXCLUDED REPOSITORY: ${excludedRepository}`
);

console.log(
    `KNOWN FEASIBLE REPOSITORY: ${feasibleRepository}`
);

console.log(
    `UNKNOWN FEASIBILITY REPOSITORY: ${unknownFeasibilityRepository}`
);

console.log(
    "RECOMMENDED REPOSITORIES:",
    experiment.recommendedRepositories
);

console.log(
    "SOURCE EVIDENCE -> REPOSITORY -> EXCLUSION: PASS"
);

console.log(
    "EXECUTION INTELLIGENCE -> FEASIBILITY RANKING: PASS"
);

console.log(
    "UNKNOWN FEASIBILITY -> PRESERVED AS CANDIDATE: PASS"
);