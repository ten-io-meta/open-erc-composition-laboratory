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


const highNoveltyTheoryId =
    "CONTROLLED-THEORY-HIGH-NOVELTY";

const lowNoveltyTheoryId =
    "CONTROLLED-THEORY-LOW-NOVELTY";


const validations = {

    validations: [

        {
            validationId:
                "CONTROLLED-VALIDATION-HIGH-NOVELTY",

            theoryId:
                highNoveltyTheoryId,

            theoryTitle:
                "Invariant testing detects contradiction",

            sourcePatternRelation:
                "INVARIANT:VALIDATES:SAFETY",

            theoryConfidence:
                50,

            supportingEvidence:
                1,

            supportingEvidenceIds: [
                "EDGE-HIGH-NOVELTY"
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
                "Controlled high-novelty validation."

        },

        {
            validationId:
                "CONTROLLED-VALIDATION-LOW-NOVELTY",

            theoryId:
                lowNoveltyTheoryId,

            theoryTitle:
                "Invariant testing detects contradiction",

            sourcePatternRelation:
                "INVARIANT:VALIDATES:SAFETY",

            theoryConfidence:
                50,

            supportingEvidence:
                1,

            supportingEvidenceIds: [
                "EDGE-LOW-NOVELTY"
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
                "Controlled low-novelty validation."

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

    edges: [

        {
            edgeId:
                "EDGE-HIGH-NOVELTY",

            sources: [
                "SOURCE-HIGH-NOVELTY"
            ]
        },

        {
            edgeId:
                "EDGE-LOW-NOVELTY",

            sources: [
                "SOURCE-LOW-NOVELTY"
            ]
        }

    ]

} as unknown as EvidenceGraphResult;


const sourceRepositories: Record<
    string,
    string
> = {

    "SOURCE-HIGH-NOVELTY":
        "crytic/slither",

    "SOURCE-LOW-NOVELTY":
        "existing/invariant-repository"

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
                    "existing test",

                semanticContext:
                    "existing test",

                framework:
                    "HARDHAT"
            }

        ],

        intelligenceSignals:
            []

    },

    "existing/invariant-repository": {

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
            "existing invariant"
        ],

        executableTargets: [

            {
                type:
                    "INVARIANT",

                filePath:
                    "test/ExistingInvariant.t.sol",

                selector:
                    "invariant_existing",

                semanticContext:
                    "existing invariant",

                framework:
                    "FOUNDRY"
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
            "candidate invariant"
        ],

        executableTargets: [

            {
                type:
                    "INVARIANT",

                filePath:
                    "test/CandidateInvariant.t.sol",

                selector:
                    "invariant_candidate",

                semanticContext:
                    "candidate invariant",

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
    result.errors.length >
    0
) {

    throw new Error(
        `Autonomous experiment design returned errors: ${
            result.errors.join(" | ")
        }`
    );

}


const highNoveltyExperiment =
    result.experiments.find(
        experiment =>
            experiment.targetId ===
            highNoveltyTheoryId
    );


const lowNoveltyExperiment =
    result.experiments.find(
        experiment =>
            experiment.targetId ===
            lowNoveltyTheoryId
    );


if (
    !highNoveltyExperiment ||
    !lowNoveltyExperiment
) {

    throw new Error(
        "Controlled novelty-prioritization experiments were not generated."
    );

}


if (
    !highNoveltyExperiment.evidenceNovelty ||
    !lowNoveltyExperiment.evidenceNovelty
) {

    throw new Error(
        "Controlled validation experiments do not expose evidenceNovelty."
    );

}


if (
    highNoveltyExperiment.priority !==
    lowNoveltyExperiment.priority
) {

    throw new Error(
        "Controlled experiments do not have equal priority."
    );

}


if (
    highNoveltyExperiment.estimatedKnowledgeGain !==
    lowNoveltyExperiment.estimatedKnowledgeGain
) {

    throw new Error(
        "Controlled experiments do not have equal estimatedKnowledgeGain."
    );

}


if (
    highNoveltyExperiment.evidenceNovelty.score <=
    lowNoveltyExperiment.evidenceNovelty.score
) {

    throw new Error(
        `Expected high novelty score > low novelty score, got ${highNoveltyExperiment.evidenceNovelty.score} <= ${lowNoveltyExperiment.evidenceNovelty.score}.`
    );

}


const highIndex =
    result.experiments.findIndex(
        experiment =>
            experiment.targetId ===
            highNoveltyTheoryId
    );


const lowIndex =
    result.experiments.findIndex(
        experiment =>
            experiment.targetId ===
            lowNoveltyTheoryId
    );


if (
    highIndex === -1 ||
    lowIndex === -1
) {

    throw new Error(
        "Controlled experiments are missing from prioritized output."
    );

}


if (
    highIndex >=
    lowIndex
) {

    throw new Error(
        `Expected higher-novelty experiment to be prioritized first, got indexes ${highIndex} and ${lowIndex}.`
    );

}


console.log(
    "CONTROLLED AUTONOMOUS NOVELTY PRIORITIZATION: PASS"
);

console.log(
    `PRIORITY: ${highNoveltyExperiment.priority}`
);

console.log(
    `KNOWLEDGE GAIN: ${highNoveltyExperiment.estimatedKnowledgeGain}`
);

console.log(
    `HIGH NOVELTY SCORE: ${highNoveltyExperiment.evidenceNovelty.score}`
);

console.log(
    `LOW NOVELTY SCORE: ${lowNoveltyExperiment.evidenceNovelty.score}`
);

console.log(
    `HIGH NOVELTY INDEX: ${highIndex}`
);

console.log(
    `LOW NOVELTY INDEX: ${lowIndex}`
);

console.log(
    "EQUAL PRIORITY -> EQUAL KNOWLEDGE GAIN -> NOVELTY TIE-BREAK: PASS"
);