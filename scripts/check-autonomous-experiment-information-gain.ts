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


const highGainTheoryId =
    "CONTROLLED-THEORY-HIGH-INFORMATION-GAIN";

const lowGainTheoryId =
    "CONTROLLED-THEORY-LOW-INFORMATION-GAIN";


const validations = {
    validations: [

        {
            validationId:
                "CONTROLLED-VALIDATION-HIGH-INFORMATION-GAIN",

            theoryId:
                highGainTheoryId,

            theoryTitle:
                "Invariant evidence remains underdetermined",

            sourcePatternRelation:
                "InvariantValidation VALIDATES Accounting",

            theoryConfidence:
                50,

            supportingEvidence:
                1,

            supportingEvidenceIds: [
                "EDGE-HIGH-GAIN-0001"
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
                "Controlled sparse-evidence validation fixture."

        },

        {
            validationId:
                "CONTROLLED-VALIDATION-LOW-INFORMATION-GAIN",

            theoryId:
                lowGainTheoryId,

            theoryTitle:
                "Invariant evidence is already well sampled",

            sourcePatternRelation:
                "InvariantValidation VALIDATES Accounting",

            theoryConfidence:
                50,

            supportingEvidence:
                6,

            supportingEvidenceIds: [
                "EDGE-LOW-GAIN-0001",
                "EDGE-LOW-GAIN-0002",
                "EDGE-LOW-GAIN-0003",
                "EDGE-LOW-GAIN-0004",
                "EDGE-LOW-GAIN-0005",
                "EDGE-LOW-GAIN-0006"
            ],

            contradictoryEvidence:
                0,

            contradictoryEvidenceIds:
                [],

            independentSources:
                3,

            validationScore:
                50,

            status:
                "INCONCLUSIVE",

            challenges:
                [],

            explanation:
                "Controlled evidence-rich validation fixture."

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

    edges:
        [],

    statistics: {

        nodes:
            0,

        edges:
            0,

        protocols:
            0,

        capabilities:
            0,

        conclusions:
            0

    },

    errors:
        []

};


const result =
    new AutonomousExperimentDesignEngine().build(
        validations,
        gaps,
        contradictions,
        confidence,
        evidenceGraph,
        {},
        {}
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


const highGainExperiment =
    result.experiments.find(
        experiment =>
            experiment.targetId ===
            highGainTheoryId
    );


const lowGainExperiment =
    result.experiments.find(
        experiment =>
            experiment.targetId ===
            lowGainTheoryId
    );


if (!highGainExperiment) {

    throw new Error(
        "High-information-gain experiment was not generated."
    );

}


if (!lowGainExperiment) {

    throw new Error(
        "Low-information-gain experiment was not generated."
    );

}


const expectedHighGain =
    76;

const expectedLowGain =
    50;


if (
    highGainExperiment.priority !==
    lowGainExperiment.priority
) {

    throw new Error(
        "Controlled experiments do not have equal priority, so knowledge-gain ordering is not isolated."
    );

}


if (
    highGainExperiment.priority !==
    "MEDIUM"
) {

    throw new Error(
        `Expected both controlled INCONCLUSIVE validations to have MEDIUM priority, got ${highGainExperiment.priority}.`
    );

}


if (
    highGainExperiment.estimatedKnowledgeGain !==
    expectedHighGain
) {

    throw new Error(
        `Expected sparse validation knowledge gain ${expectedHighGain}, got ${highGainExperiment.estimatedKnowledgeGain}.`
    );

}


if (
    lowGainExperiment.estimatedKnowledgeGain !==
    expectedLowGain
) {

    throw new Error(
        `Expected evidence-rich validation knowledge gain ${expectedLowGain}, got ${lowGainExperiment.estimatedKnowledgeGain}.`
    );

}


if (
    highGainExperiment.estimatedKnowledgeGain <=
    lowGainExperiment.estimatedKnowledgeGain
) {

    throw new Error(
        "Sparse, low-independence evidence did not produce greater estimated knowledge gain."
    );

}


const highGainIndex =
    result.experiments.findIndex(
        experiment =>
            experiment.targetId ===
            highGainTheoryId
    );

const lowGainIndex =
    result.experiments.findIndex(
        experiment =>
            experiment.targetId ===
            lowGainTheoryId
    );


if (
    highGainIndex < 0 ||
    lowGainIndex < 0 ||
    highGainIndex >= lowGainIndex
) {

    throw new Error(
        "Higher estimated knowledge gain did not receive higher ordering among equal-priority experiments."
    );

}


console.log(
    "CONTROLLED AUTONOMOUS INFORMATION GAIN: PASS"
);

console.log(
    `HIGH-GAIN PRIORITY: ${highGainExperiment.priority}`
);

console.log(
    `LOW-GAIN PRIORITY: ${lowGainExperiment.priority}`
);

console.log(
    `HIGH-GAIN ESTIMATE: ${highGainExperiment.estimatedKnowledgeGain}`
);

console.log(
    `LOW-GAIN ESTIMATE: ${lowGainExperiment.estimatedKnowledgeGain}`
);

console.log(
    "SPARSE EVIDENCE + SOURCE DEFICIT -> HIGHER KNOWLEDGE GAIN: PASS"
);

console.log(
    "EQUAL PRIORITY -> KNOWLEDGE GAIN CONTROLS ORDERING: PASS"
);