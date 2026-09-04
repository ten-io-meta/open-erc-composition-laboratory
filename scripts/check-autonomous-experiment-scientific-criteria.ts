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
} from "../laboratory/contradiction-detection/ContradictionResult.js";

import type {
    ConfidenceAssessmentResult
} from "../laboratory/confidence-assessment/ConfidenceAssessmentResult.js";

import type {
    EvidenceGraphResult
} from "../laboratory/evidence-graph/EvidenceGraphResult.js";


const relation =
    "ACCESS:CONSTRAINS:TRANSFER";

const validationResult = {
    validations: [
        {
            theoryId:
                "THEORY-CONTROLLED-00001",

            theoryTitle:
                "Controlled access constraint theory",

            sourcePatternRelation:
                relation,

            status:
                "INCONCLUSIVE",

            validationScore:
                50,

            independentSources:
                1,

            supportingEvidenceIds: [
                "EDGE-CONTROLLED-00001"
            ],

            contradictoryEvidenceIds:
                [],

            challenges:
                []
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
                "EDGE-CONTROLLED-00001",

            sourceId:
                "SOURCE-CONTROLLED-00001"
        }
    ]
} as unknown as EvidenceGraphResult;


const sourceRepositories = {
    "SOURCE-CONTROLLED-00001":
        "existing/source"
};


const repositoryExecutionIntelligence =
    {};


const engine =
    new AutonomousExperimentDesignEngine();


const result =
    engine.build(
        validationResult,
        gaps,
        contradictions,
        confidence,
        evidenceGraph,
        sourceRepositories,
        repositoryExecutionIntelligence
    );


if (
    result.experiments.length !==
    1
) {

    throw new Error(
        `Expected exactly 1 experiment, got ${result.experiments.length}.`
    );

}


const experiment =
    result.experiments[0];


if (
    experiment.targetType !==
    "THEORY_VALIDATION"
) {

    throw new Error(
        `Expected THEORY_VALIDATION, got ${experiment.targetType}.`
    );

}


if (
    !experiment.scientificCriteria
) {

    throw new Error(
        "Scientific criteria were not generated."
    );

}


if (
    experiment.scientificCriteria.relation !==
    relation
) {

    throw new Error(
        "Scientific criteria relation does not match the validation relation."
    );

}


if (
    experiment.scientificCriteria.support.expectedPolarity !==
    "SUPPORT"
) {

    throw new Error(
        "Support scientific polarity is incorrect."
    );

}


if (
    experiment.scientificCriteria.challenge.expectedPolarity !==
    "CHALLENGE"
) {

    throw new Error(
        "Challenge scientific polarity is incorrect."
    );

}


if (
    !experiment.scientificCriteria.support.condition.includes(
        relation
    )
) {

    throw new Error(
        "Support condition does not preserve the scientific relation."
    );

}


if (
    !experiment.scientificCriteria.challenge.condition.includes(
        relation
    )
) {

    throw new Error(
        "Challenge condition does not preserve the scientific relation."
    );

}


if (
    experiment.scientificCriteria.inconclusive.whenNoScientificPolarity !==
    true
) {

    throw new Error(
        "Inconclusive scientific criterion is incorrect."
    );

}


console.log(
    "CONTROLLED AUTONOMOUS SCIENTIFIC CRITERIA: PASS"
);

console.log(
    `RELATION: ${experiment.scientificCriteria.relation}`
);

console.log(
    "SUPPORT POLARITY -> SUPPORT: PASS"
);

console.log(
    "CHALLENGE POLARITY -> CHALLENGE: PASS"
);

console.log(
    "SUPPORT CONDITION PRESERVES RELATION: PASS"
);

console.log(
    "CHALLENGE CONDITION PRESERVES RELATION: PASS"
);

console.log(
    "NO SCIENTIFIC POLARITY -> INCONCLUSIVE: PASS"
);