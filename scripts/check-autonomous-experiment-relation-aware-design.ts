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
    "CONTROLLED-THEORY-RELATION-AWARE";

const relation =
    "RESERVATION:CONSTRAINS:ACCOUNTING";


const validations = {

    validations: [

        {
            validationId:
                "CONTROLLED-VALIDATION-RELATION-AWARE",

            theoryId,

            theoryTitle:
                "Reservation constrains accounting",

            sourcePatternRelation:
                relation,

            theoryConfidence:
                50,

            supportingEvidence:
                1,

            supportingEvidenceIds: [
                "EDGE-CONTROLLED-RELATION-AWARE"
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
                "Controlled relation-aware design fixture."

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
                "EDGE-CONTROLLED-RELATION-AWARE",

            sources: [
                "SOURCE-CONTROLLED-RELATION-AWARE"
            ]

        }

    ]

} as unknown as EvidenceGraphResult;


const sourceRepositories: Record<
    string,
    string
> = {

    "SOURCE-CONTROLLED-RELATION-AWARE":
        "crytic/slither"

};


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
        "Controlled relation-aware experiment was not generated."
    );

}


if (
    experiment.sourcePatternRelation !==
    relation
) {

    throw new Error(
        `Expected sourcePatternRelation ${relation}, got ${experiment.sourcePatternRelation}.`
    );

}


if (
    !experiment.hypothesis.includes(
        relation
    )
) {

    throw new Error(
        "Hypothesis does not include the scientific relation."
    );

}


if (
    !experiment.supportCondition.includes(
        relation
    )
) {

    throw new Error(
        "Support condition does not include the scientific relation."
    );

}


if (
    !experiment.challengeCondition.includes(
        relation
    )
) {

    throw new Error(
        "Challenge condition does not include the scientific relation."
    );

}


const requiredEvidenceContainsRelation =
    experiment.requiredEvidence.some(
        item =>
            item.includes(
                relation
            )
    );


if (
    !requiredEvidenceContainsRelation
) {

    throw new Error(
        "Required evidence does not include the scientific relation."
    );

}


const procedureContainsRelation =
    experiment.procedure.some(
        item =>
            item.includes(
                relation
            )
    );


if (
    !procedureContainsRelation
) {

    throw new Error(
        "Procedure does not include the scientific relation."
    );

}


console.log(
    "CONTROLLED AUTONOMOUS RELATION-AWARE DESIGN: PASS"
);

console.log(
    `RELATION: ${relation}`
);

console.log(
    `HYPOTHESIS: ${experiment.hypothesis}`
);

console.log(
    `SUPPORT CONDITION: ${experiment.supportCondition}`
);

console.log(
    `CHALLENGE CONDITION: ${experiment.challengeCondition}`
);

console.log(
    "RELATION -> HYPOTHESIS: PASS"
);

console.log(
    "RELATION -> SUPPORT CONDITION: PASS"
);

console.log(
    "RELATION -> CHALLENGE CONDITION: PASS"
);

console.log(
    "RELATION -> REQUIRED EVIDENCE: PASS"
);

console.log(
    "RELATION -> PROCEDURE: PASS"
);