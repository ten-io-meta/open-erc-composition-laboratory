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


const theoryId =
    "CONTROLLED-THEORY-EVIDENCE-NOVELTY";

const evidenceId =
    "EDGE-CONTROLLED-EVIDENCE-NOVELTY";

const existingSourceId =
    "GITHUB-CRYTIC-SLITHER";


const validations = {

    validations: [

        {
            validationId:
                "CONTROLLED-VALIDATION-EVIDENCE-NOVELTY",

            theoryId,

            theoryTitle:
                "Invariant testing detects contradiction",

            sourcePatternRelation:
                "INVARIANT:VALIDATES:SAFETY",

            theoryConfidence:
                50,

            supportingEvidence:
                1,

            supportingEvidenceIds: [
                evidenceId
            ],

            contradictoryEvidence:
                0,

            contradictoryEvidenceIds:
                [],

            independentSources:
                1,

            validationScore:
                50,

            status:
                "INCONCLUSIVE",

            challenges:
                [],

            explanation:
                "Controlled evidence-novelty validation fixture."

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


const evidenceGraph = {

    generatedAt:
        new Date().toISOString(),

    nodes:
        [],

    edges: [

        {
            edgeId:
                evidenceId,

            sources: [
                existingSourceId
            ]

        }

    ],

    statistics: {
        nodes: 0,
        edges: 1,
        protocols: 0,
        capabilities: 0,
        conclusions: 0
    },

    errors:
        []

} as unknown as EvidenceGraphResult;


const sourceRepositories: Record<
    string,
    string
> = {

    [existingSourceId]:
        "crytic/slither"

};


const repositoryExecutionIntelligence: Record<
    string,
    GitHubRepositoryIntelligenceResult
> = {

    "crytic/slither": {

        structure: {
            readmes: 1,
            contracts: 1,
            tests: 1,
            docs: 1,
            configs: 1,
            workflows: 0,
            totalFiles: 5
        },

        toolchain:
            "HARDHAT",

        invariants:
            [],

        executableTargets: [

            {
                type:
                    "TEST",

                filePath:
                    "test/existing.ts",

                selector:
                    "existing safety test",

                semanticContext:
                    "existing safety test",

                framework:
                    "HARDHAT"
            }

        ],

        intelligenceSignals:
            []

    },

    "crytic/echidna": {

        structure: {
            readmes: 1,
            contracts: 1,
            tests: 1,
            docs: 1,
            configs: 1,
            workflows: 0,
            totalFiles: 5
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

                filePath:
                    "test/ControlledInvariant.t.sol",

                selector:
                    "invariant_controlledNovelty",

                semanticContext:
                    "invariant_controlledNovelty",

                framework:
                    "FOUNDRY"
            }

        ],

        intelligenceSignals:
            []

    }

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
        candidate =>
            candidate.targetId ===
            theoryId
    );


if (!experiment) {

    throw new Error(
        "Controlled evidence-novelty experiment was not generated."
    );

}


if (!experiment.evidenceNovelty) {

    throw new Error(
        "Controlled validation experiment does not expose evidenceNovelty."
    );

}


const novelty =
    experiment.evidenceNovelty;


if (
    novelty.existingRepositories.length !==
        1 ||
    novelty.existingRepositories[0] !==
        "crytic/slither"
) {

    throw new Error(
        `Expected existing evidence repository crytic/slither, got ${JSON.stringify(novelty.existingRepositories)}.`
    );

}


if (
    experiment.recommendedRepositories.includes(
        "crytic/slither"
    )
) {

    throw new Error(
        "Existing evidence repository was incorrectly recommended as a novel candidate."
    );

}


if (
    !experiment.recommendedRepositories.includes(
        "crytic/echidna"
    )
) {

    throw new Error(
        "Known feasible novel repository crytic/echidna was not recommended."
    );

}


if (
    !experiment.recommendedRepositories.includes(
        "foundry-rs/foundry"
    )
) {

    throw new Error(
        "Unknown-feasibility repository foundry-rs/foundry was not preserved as a candidate."
    );

}


if (
    novelty.score !==
    88
) {

    throw new Error(
        `Expected evidence novelty score 88, got ${novelty.score}.`
    );

}


if (
    novelty.knownExecutableTargetTypes.length !==
        1 ||
    novelty.knownExecutableTargetTypes[0] !==
        "INVARIANT"
) {

    throw new Error(
        `Expected candidate executable target type INVARIANT, got ${JSON.stringify(novelty.knownExecutableTargetTypes)}.`
    );

}


if (
    novelty.candidateRepositories.length !==
        experiment.recommendedRepositories.length
) {

    throw new Error(
        "Evidence novelty candidate repositories do not match the experiment recommendations."
    );

}


console.log(
    "CONTROLLED AUTONOMOUS EVIDENCE NOVELTY: PASS"
);

console.log(
    `EXISTING REPOSITORIES: ${JSON.stringify(novelty.existingRepositories)}`
);

console.log(
    `CANDIDATE REPOSITORIES: ${JSON.stringify(novelty.candidateRepositories)}`
);

console.log(
    `KNOWN CANDIDATE TARGET TYPES: ${JSON.stringify(novelty.knownExecutableTargetTypes)}`
);

console.log(
    `EVIDENCE NOVELTY SCORE: ${novelty.score}`
);

console.log(
    "EXISTING REPOSITORY -> EXCLUDED: PASS"
);

console.log(
    "INDEPENDENT REPOSITORIES -> NOVELTY: PASS"
);

console.log(
    "NEW EXECUTABLE TARGET TYPE -> NOVELTY: PASS"
);

console.log(
    "UNKNOWN FEASIBILITY -> PRESERVED WITHOUT FALSE EXECUTABILITY: PASS"
);