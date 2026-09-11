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
    "THEORY-EXECUTABLE-TARGET-RECOMMENDATION";

const existingSourceId =
    "SOURCE-EXECUTABLE-TARGET-EXISTING";

const existingRepository =
    "crytic/slither";

const knownExecutableRepository =
    "crytic/echidna";

const unknownExecutableRepository =
    "foundry-rs/foundry";


const validations = {

    validations: [

        {
            validationId:
                "VALIDATION-EXECUTABLE-TARGET-RECOMMENDATION",

            theoryId,

            theoryTitle:
                "Invariant testing detects contradiction",

            sourcePatternRelation:
                "ACCESS:CONSTRAINS:TRANSFER",

            theoryConfidence:
                50,

            supportingEvidence:
                1,

            supportingEvidenceIds: [
                "EDGE-EXECUTABLE-TARGET-RECOMMENDATION"
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
                "Controlled executable target recommendation fixture."

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
                "EDGE-EXECUTABLE-TARGET-RECOMMENDATION",

            sources: [
                existingSourceId
            ]

        }

    ]

} as unknown as EvidenceGraphResult;


const sourceRepositories: Record<
    string,
    string
> = {

    [existingSourceId]:
        existingRepository

};


const repositoryExecutionIntelligence: Record<
    string,
    GitHubRepositoryIntelligenceResult
> = {

    [existingRepository]: {

        repository:
            existingRepository,

        structure: {} as never,

        toolchain:
            "HARDHAT",

        invariants:
            [],

        executableTargets: [

            {
                type:
                    "TEST",

                filePath:
                    "test/Existing.spec.ts",

                selector:
                    "existing access transfer test",

                semanticContext:
                    "existing access transfer behavior",

                framework:
                    "HARDHAT"
            }

        ],

        intelligenceSignals:
            []

    } as unknown as GitHubRepositoryIntelligenceResult,

    [knownExecutableRepository]: {

        repository:
            knownExecutableRepository,

        structure: {} as never,

        toolchain:
            "FOUNDRY",

        invariants:
            [],

        executableTargets: [

            {
                type:
                    "INVARIANT",

                filePath:
                    "test/AccessInvariant.t.sol",

                selector:
                    "invariant_accessConstrainsTransfer",

                semanticContext:
                    "access granted false transfer executed true invariant",

                framework:
                    "FOUNDRY"
            }

        ],

        intelligenceSignals:
            []

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
    result.errors.length >
    0
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
        "Controlled executable target experiment was not generated."
    );

}


if (
    !experiment.recommendedRepositories.includes(
        knownExecutableRepository
    )
) {

    throw new Error(
        "Known executable repository was not recommended."
    );

}


if (
    !experiment.recommendedRepositories.includes(
        unknownExecutableRepository
    )
) {

    throw new Error(
        "Unknown-feasibility repository was not preserved as a candidate."
    );

}


if (
    experiment.recommendedRepositories.includes(
        existingRepository
    )
) {

    throw new Error(
        "Existing evidence repository was not excluded."
    );

}


const executableTargets =
    experiment.recommendedExecutableTargets ?? [];


const knownTarget =
    executableTargets.find(
        item =>
            item.repository ===
            knownExecutableRepository
    );


if (!knownTarget) {

    throw new Error(
        "Known executable repository did not produce a recommended executable target."
    );

}


if (
    knownTarget.target.type !==
    "INVARIANT"
) {

    throw new Error(
        `Expected INVARIANT target, got ${knownTarget.target.type}.`
    );

}


if (
    knownTarget.target.filePath !==
    "test/AccessInvariant.t.sol"
) {

    throw new Error(
        "Executable target filePath was not preserved."
    );

}


if (
    knownTarget.target.selector !==
    "invariant_accessConstrainsTransfer"
) {

    throw new Error(
        "Executable target selector was not preserved."
    );

}


if (
    knownTarget.target.semanticContext !==
    "access granted false transfer executed true invariant"
) {

    throw new Error(
        "Executable target semanticContext was not preserved."
    );

}


if (
    knownTarget.target.framework !==
    "FOUNDRY"
) {

    throw new Error(
        "Executable target framework was not preserved."
    );

}


const fabricatedUnknownTarget =
    executableTargets.find(
        item =>
            item.repository ===
            unknownExecutableRepository
    );


if (fabricatedUnknownTarget) {

    throw new Error(
        "Repository without execution intelligence produced a fabricated executable target."
    );

}


const leakedExistingTarget =
    executableTargets.find(
        item =>
            item.repository ===
            existingRepository
    );


if (leakedExistingTarget) {

    throw new Error(
        "Existing evidence repository leaked into recommended executable targets."
    );

}


console.log(
    "CONTROLLED AUTONOMOUS EXECUTABLE TARGET RECOMMENDATION: PASS"
);

console.log(
    `EXISTING REPOSITORY: ${existingRepository}`
);

console.log(
    `KNOWN EXECUTABLE REPOSITORY: ${knownExecutableRepository}`
);

console.log(
    `UNKNOWN FEASIBILITY REPOSITORY: ${unknownExecutableRepository}`
);

console.log(
    `TARGET TYPE: ${knownTarget.target.type}`
);

console.log(
    `TARGET FILE: ${knownTarget.target.filePath}`
);

console.log(
    `TARGET SELECTOR: ${knownTarget.target.selector}`
);

console.log(
    `TARGET FRAMEWORK: ${knownTarget.target.framework}`
);

console.log(
    "KNOWN INTELLIGENCE -> EXECUTABLE TARGET: PASS"
);

console.log(
    "REPOSITORY PROVENANCE -> PRESERVED: PASS"
);

console.log(
    "UNKNOWN INTELLIGENCE -> NO FABRICATED TARGET: PASS"
);

console.log(
    "EXISTING EVIDENCE REPOSITORY -> EXCLUDED: PASS"
);