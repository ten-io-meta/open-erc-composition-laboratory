import type {
    AutonomousExperiment
} from "../autonomous-experiment-design/AutonomousExperiment.js";

import type {
    AutonomousExperimentResult
} from "../autonomous-experiment-design/AutonomousExperimentResult.js";

import type {
    ResearchSource
} from "../research-source/ResearchSource.js";

import type {
    ScientificCompositionEvaluationSpecification
} from "../scientific-composition-evaluation-specification/ScientificCompositionEvaluationSpecification.js";

import type {
    ScientificCompositionEvaluationSpecificationResult
} from "../scientific-composition-evaluation-specification/ScientificCompositionEvaluationSpecificationResult.js";


export type ScientificCompositionExperimentSource =
    Pick<
        ResearchSource,
        "sourceId" |
        "repository"
    >;


export class ScientificCompositionExperimentAdapter {

    build(
        specifications:
            ScientificCompositionEvaluationSpecificationResult,

        sources:
            ScientificCompositionExperimentSource[]
    ): AutonomousExperimentResult {

        const errors:
            string[] = [];


        if (
            specifications.errors.length >
            0
        ) {

            return this.emptyResult(
                [
                    ...specifications.errors
                ]
            );

        }


        const sourceById =
            new Map<
                string,
                ScientificCompositionExperimentSource
            >();


        for (
            const source
            of sources
        ) {

            if (
                sourceById.has(
                    source.sourceId
                )
            ) {

                errors.push(
                    `Duplicate research source id: ${source.sourceId}.`
                );

                continue;

            }


            sourceById.set(
                source.sourceId,
                source
            );

        }


        const specificationIds =
            new Set<string>();

        const candidateIds =
            new Set<string>();


        for (
            const specification
            of specifications.specifications
        ) {

            if (
                specificationIds.has(
                    specification.specificationId
                )
            ) {

                errors.push(
                    `Duplicate composition evaluation specification id: ${specification.specificationId}.`
                );

            }


            specificationIds.add(
                specification.specificationId
            );


            if (
                candidateIds.has(
                    specification.candidateId
                )
            ) {

                errors.push(
                    `Duplicate composition candidate id: ${specification.candidateId}.`
                );

            }


            candidateIds.add(
                specification.candidateId
            );

        }


        const readySpecifications =
            specifications.specifications
                .filter(
                    specification =>
                        specification.status ===
                        "READY"
                )
                .sort(
                    (
                        left,
                        right
                    ) =>
                        left.specificationId.localeCompare(
                            right.specificationId
                        )
                );


        for (
            const specification
            of specifications.specifications
        ) {

            if (
                specification.status ===
                "INSUFFICIENT_EVIDENCE"
            ) {

                continue;

            }


            if (
                specification.status !==
                "READY"
            ) {

                errors.push(
                    `Composition specification ${specification.specificationId} has unsupported status ${String(specification.status)}.`
                );

            }

        }


        for (
            const specification
            of readySpecifications
        ) {

            if (
                specification.scientificCriteria ===
                null
            ) {

                errors.push(
                    `READY composition specification ${specification.specificationId} has no scientific criteria.`
                );

                continue;

            }


            for (
                const sourceId
                of specification.sourceIds
            ) {

                const source =
                    sourceById.get(
                        sourceId
                    );


                if (
                    source ===
                    undefined
                ) {

                    errors.push(
                        `Composition specification ${specification.specificationId} references unknown source ${sourceId}.`
                    );

                    continue;

                }


                if (
                    source.repository ===
                        undefined ||
                    source.repository.trim().length ===
                        0
                ) {

                    errors.push(
                        `Research source ${sourceId} has no repository attribution.`
                    );

                }

            }

        }


        if (
            errors.length > 0
        ) {

            return this.emptyResult(
                errors
            );

        }


        const experiments:
            AutonomousExperiment[] = [];


        for (
            const specification
            of readySpecifications
        ) {

            const scientificCriteria =
                specification.scientificCriteria;


            if (
                scientificCriteria ===
                null
            ) {

                continue;

            }


            const recommendedRepositories =
                [
                    ...new Set(
                        specification.sourceIds.map(
                            sourceId => {

                                const source =
                                    sourceById.get(
                                        sourceId
                                    );


                                if (
                                    source ===
                                        undefined ||
                                    source.repository ===
                                        undefined
                                ) {

                                    throw new Error(
                                        `Composition specification ${specification.specificationId} references unknown source ${sourceId}.`
                                    );

                                }


                                return source.repository;

                            }
                        )
                    )
                ].sort();


            const requiredEvidence =
                specification.constraints
                    .map(
                        constraint =>
                            (
                                `Observed constraint ${constraint.constraintId}: ` +
                                `${constraint.rawText}`
                            )
                    );


            requiredEvidence.push(
                "Executable evidence must report explicit scientific polarity for the observed constraint-preservation criteria."
            );


            const procedure = [

                "Resolve an executable test or invariant target from the explicitly attributed repositories.",

                "Execute the selected target against the composition candidate without changing the observed constraint set.",

                ...specification.constraints.map(
                    constraint =>
                        (
                            `Check observed participant ${constraint.participantSide} constraint ` +
                            `${constraint.constraintId}: ${constraint.rawText}`
                        )
                ),

                "Record whether all observed participant constraints are preserved or whether any observed participant constraint is violated.",

                "Emit no scientific polarity when the executable evidence cannot determine constraint preservation."

            ];


            experiments.push({

                experimentId:
                    `SCIENTIFIC-COMPOSITION-EXPERIMENT-${specification.specificationId}`,

                title:
                    `Evaluate composition candidate ${specification.candidateId}`,

                objective:
                    "Determine whether executable evidence preserves or violates the observed constraints attributed to both composition participants.",

                targetType:
                    "COMPOSITION_CANDIDATE",

                targetId:
                    specification.candidateId,

                sourcePatternRelation:
                    scientificCriteria.relation,

                sourceIds:
                    [
                        ...specification.sourceIds
                    ],

                targetEvidenceIds:
                    [
                        ...specification.targetEvidenceIds
                    ],

                hypothesis:
                    "The composition candidate preserves all observed participant constraints under executable evaluation.",

                supportCondition:
                    scientificCriteria.support.condition,

                challengeCondition:
                    scientificCriteria.challenge.condition,

                scientificCriteria:
                    scientificCriteria,

                priority:
                    "MEDIUM",

                requiredEvidence,

                recommendedRepositories,

                variables: {

                    independent: [
                        "Composition candidate execution"
                    ],

                    dependent: [
                        "Observed participant constraint preservation"
                    ],

                    controlled: [
                        "Scientific source identity",
                        "Repository attribution",
                        "Observed constraint set",
                        "Candidate evidence lineage"
                    ]

                },

                procedure,

                successCriteria: [
                    scientificCriteria.support.condition
                ],

                failureCriteria: [
                    scientificCriteria.challenge.condition
                ],

                expectedOutcome:
                    "An explicit scientific polarity for observed constraint preservation, or an inconclusive result when executable evidence is insufficient.",

                estimatedKnowledgeGain:
                    0

            });

        }


        return {

            generatedAt:
                new Date().toISOString(),

            experiments,

            statistics:
                this.statisticsFor(
                    experiments
                ),

            errors: []

        };

    }


    private emptyResult(
        errors:
            string[]
    ): AutonomousExperimentResult {

        return {

            generatedAt:
                new Date().toISOString(),

            experiments: [],

            statistics: {

                experiments:
                    0,

                highPriority:
                    0,

                mediumPriority:
                    0,

                lowPriority:
                    0,

                theoryValidation:
                    0,

                contradictionResolution:
                    0,

                knowledgeGap:
                    0,

                confidenceImprovement:
                    0,

                compositionCandidate:
                    0,

                averageExpectedKnowledgeGain:
                    0

            },

            errors

        };

    }


    private statisticsFor(
        experiments:
            AutonomousExperiment[]
    ): AutonomousExperimentResult[
        "statistics"
    ] {

        return {

            experiments:
                experiments.length,

            highPriority:
                experiments.filter(
                    experiment =>
                        experiment.priority ===
                        "HIGH"
                ).length,

            mediumPriority:
                experiments.filter(
                    experiment =>
                        experiment.priority ===
                        "MEDIUM"
                ).length,

            lowPriority:
                experiments.filter(
                    experiment =>
                        experiment.priority ===
                        "LOW"
                ).length,

            theoryValidation:
                experiments.filter(
                    experiment =>
                        experiment.targetType ===
                        "THEORY_VALIDATION"
                ).length,

            contradictionResolution:
                experiments.filter(
                    experiment =>
                        experiment.targetType ===
                        "CONTRADICTION_RESOLUTION"
                ).length,

            knowledgeGap:
                experiments.filter(
                    experiment =>
                        experiment.targetType ===
                        "KNOWLEDGE_GAP"
                ).length,

            confidenceImprovement:
                experiments.filter(
                    experiment =>
                        experiment.targetType ===
                        "CONFIDENCE_IMPROVEMENT"
                ).length,

            compositionCandidate:
                experiments.filter(
                    experiment =>
                        experiment.targetType ===
                        "COMPOSITION_CANDIDATE"
                ).length,

            averageExpectedKnowledgeGain:
                experiments.length ===
                    0
                    ? 0
                    : Math.round(
                        experiments.reduce(
                            (
                                total,
                                experiment
                            ) =>
                                total +
                                experiment.estimatedKnowledgeGain,
                            0
                        ) /
                        experiments.length
                    )

        };

    }

}
