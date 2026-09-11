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


const validRelation =
    "RESERVATION:CONSTRAINS:ACCOUNTING";

const malformedRelation =
    "RESERVATION:CONSTRAINS";


const validations = {

    validations: [

        {
            validationId:
                "VALIDATION-RELATION-STRUCTURE-VALID",

            theoryId:
                "THEORY-RELATION-STRUCTURE-VALID",

            theoryTitle:
                "Valid structured relation",

            sourcePatternRelation:
                validRelation,

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
                1,

            validationScore:
                50,

            status:
                "INCONCLUSIVE",

            challenges:
                [],

            explanation:
                "Controlled valid relation fixture."

        },

        {
            validationId:
                "VALIDATION-RELATION-STRUCTURE-MALFORMED",

            theoryId:
                "THEORY-RELATION-STRUCTURE-MALFORMED",

            theoryTitle:
                "Malformed structured relation",

            sourcePatternRelation:
                malformedRelation,

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
                1,

            validationScore:
                50,

            status:
                "INCONCLUSIVE",

            challenges:
                [],

            explanation:
                "Controlled malformed relation fixture."

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
> = {};


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


if (result.errors.length > 0) {

    throw new Error(
        `Autonomous experiment design returned errors: ${
            result.errors.join(" | ")
        }`
    );

}


const validExperiment =
    result.experiments.find(
        experiment =>
            experiment.targetId ===
            "THEORY-RELATION-STRUCTURE-VALID"
    );


if (!validExperiment) {

    throw new Error(
        "Valid relation experiment was not generated."
    );

}


const malformedExperiment =
    result.experiments.find(
        experiment =>
            experiment.targetId ===
            "THEORY-RELATION-STRUCTURE-MALFORMED"
    );


if (!malformedExperiment) {

    throw new Error(
        "Malformed relation experiment was not generated."
    );

}


if (!validExperiment.relationUnderTest) {

    throw new Error(
        "Valid relation did not produce relationUnderTest."
    );

}


if (
    validExperiment.relationUnderTest.relation !==
    validRelation
) {

    throw new Error(
        "Structured relation does not preserve the original relation."
    );

}


if (
    validExperiment.relationUnderTest.subject !==
    "RESERVATION"
) {

    throw new Error(
        "Expected subject RESERVATION."
    );

}


if (
    validExperiment.relationUnderTest.predicate !==
    "CONSTRAINS"
) {

    throw new Error(
        "Expected predicate CONSTRAINS."
    );

}


if (
    validExperiment.relationUnderTest.object !==
    "ACCOUNTING"
) {

    throw new Error(
        "Expected object ACCOUNTING."
    );

}


if (
    malformedExperiment.relationUnderTest !==
    undefined
) {

    throw new Error(
        "Malformed relation unexpectedly produced relationUnderTest."
    );

}


console.log(
    "CONTROLLED AUTONOMOUS RELATION STRUCTURE: PASS"
);

console.log(
    `VALID RELATION: ${validRelation}`
);

console.log(
    `SUBJECT: ${validExperiment.relationUnderTest.subject}`
);

console.log(
    `PREDICATE: ${validExperiment.relationUnderTest.predicate}`
);

console.log(
    `OBJECT: ${validExperiment.relationUnderTest.object}`
);

console.log(
    `MALFORMED RELATION: ${malformedRelation}`
);

console.log(
    "VALID RELATION -> STRUCTURED RELATION: PASS"
);

console.log(
    "MALFORMED RELATION -> UNDEFINED: PASS"
);