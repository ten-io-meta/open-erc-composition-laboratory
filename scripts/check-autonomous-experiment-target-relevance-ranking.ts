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
    "THEORY-TARGET-RELEVANCE-RANKING";

const candidateRepository =
    "crytic/echidna";


const validations = {

    validations: [

        {
            validationId:
                "VALIDATION-TARGET-RELEVANCE-RANKING",

            theoryId,

            theoryTitle:
                "Invariant testing detects contradiction",

            sourcePatternRelation:
                "ACCESS:CONSTRAINS:TRANSFER",

            theoryConfidence:
                50,

            supportingEvidence:
                0,

            supportingEvidenceIds:
                [],

            contradictoryEvidence:
                0,

            contradictoryEvidenceIds:
                [],

            independentSources:
                0,

            validationScore:
                50,

            status:
                "INCONCLUSIVE",

            challenges:
                [],

            explanation:
                "Controlled target relevance ranking fixture."

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
    edges: []
} as unknown as EvidenceGraphResult;


const sourceRepositories: Record<
    string,
    string
> = {};


const repositoryExecutionIntelligence: Record<
    string,
    GitHubRepositoryIntelligenceResult
> = {

    [candidateRepository]: {

        repository:
            candidateRepository,

        structure:
            {} as never,

        toolchain:
            "FOUNDRY",

        invariants:
            [],

        executableTargets: [

            {
                type:
                    "INVARIANT",

                filePath:
                    "test/IrrelevantInvariant.t.sol",

                selector:
                    "invariant_mintSupply",

                semanticContext:
                    "mint token supply behavior",

                framework:
                    "FOUNDRY"
            },

            {
                type:
                    "TEST",

                filePath:
                    "test/PartialAccessTransfer.t.sol",

                selector:
                    "test_accessTransfer",

                semanticContext:
                    "access transfer behavior",

                framework:
                    "FOUNDRY"
            },

            {
                type:
                    "INVARIANT",

                filePath:
                    "test/ExactRelationInvariant.t.sol",

                selector:
                    "invariant_accessConstrainsTransfer",

                semanticContext:
                    "access constrains transfer behavior",

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
        "Controlled target relevance experiment was not generated."
    );

}


const targets =
    experiment.recommendedExecutableTargets ?? [];


if (
    targets.length !==
    3
) {

    throw new Error(
        `Expected 3 executable targets, got ${targets.length}.`
    );

}


const selectors =
    targets.map(
        item =>
            item.target.selector
    );


const exactSelector =
    "invariant_accessConstrainsTransfer";

const partialSelector =
    "test_accessTransfer";

const irrelevantSelector =
    "invariant_mintSupply";


if (
    selectors[0] !==
    exactSelector
) {

    throw new Error(
        `Expected exact relation target first, got ${selectors[0]}.`
    );

}


if (
    selectors[1] !==
    partialSelector
) {

    throw new Error(
        `Expected partial relation target second, got ${selectors[1]}.`
    );

}


if (
    selectors[2] !==
    irrelevantSelector
) {

    throw new Error(
        `Expected irrelevant target last, got ${selectors[2]}.`
    );

}


if (
    !targets.some(
        item =>
            item.target.selector ===
            irrelevantSelector
    )
) {

    throw new Error(
        "Irrelevant target was incorrectly filtered out."
    );

}


if (
    targets.some(
        item =>
            item.repository !==
            candidateRepository
    )
) {

    throw new Error(
        "Repository provenance was not preserved."
    );

}
const exactRelevance =
    targets[0].relationRelevance;

const partialRelevance =
    targets[1].relationRelevance;

const irrelevantRelevance =
    targets[2].relationRelevance;


if (
    exactRelevance?.score !==
    3
) {

    throw new Error(
        `Expected exact target relevance score 3, got ${exactRelevance?.score}.`
    );

}


if (
    exactRelevance.matchedComponents.join(",") !==
    "SUBJECT,PREDICATE,OBJECT"
) {

    throw new Error(
        "Exact target relation components were not preserved correctly."
    );

}


if (
    partialRelevance?.score !==
    2
) {

    throw new Error(
        `Expected partial target relevance score 2, got ${partialRelevance?.score}.`
    );

}


if (
    partialRelevance.matchedComponents.join(",") !==
    "SUBJECT,OBJECT"
) {

    throw new Error(
        "Partial target relation components were not preserved correctly."
    );

}


if (
    irrelevantRelevance?.score !==
    0
) {

    throw new Error(
        `Expected irrelevant target relevance score 0, got ${irrelevantRelevance?.score}.`
    );

}


if (
    irrelevantRelevance.matchedComponents.length !==
    0
) {

    throw new Error(
        "Zero-relevance target unexpectedly contains matched relation components."
    );

}

console.log(
    "CONTROLLED AUTONOMOUS TARGET RELEVANCE RANKING: PASS"
);

console.log(
    "RELATION: ACCESS:CONSTRAINS:TRANSFER"
);

console.log(
    `RANK 1: ${targets[0].target.selector}`
);

console.log(
    `RANK 2: ${targets[1].target.selector}`
);

console.log(
    `RANK 3: ${targets[2].target.selector}`
);

console.log(
    "EXACT SUBJECT + PREDICATE + OBJECT -> FIRST: PASS"
);

console.log(
    "PARTIAL SUBJECT + OBJECT -> SECOND: PASS"
);

console.log(
    "ZERO RELATION COMPONENTS -> PRESERVED LAST: PASS"
);

console.log(
    "NO TARGET FILTERING: PASS"
);

console.log(
    "REPOSITORY PROVENANCE: PASS"
);