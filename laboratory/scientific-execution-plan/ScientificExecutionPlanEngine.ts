import {
    cloneScientificCompositionExecutionRequirement
} from "../scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";
import type {
    ScientificExperimentExecutionResult
} from "../scientific-experiment-execution/ScientificExperimentExecutionResult.js";

import type {
    ScientificExperimentExecutionTask
} from "../scientific-experiment-execution/ScientificExperimentExecutionTask.js";

import type {
    ScientificExecutionCapabilityResult
} from "../scientific-execution-capability/ScientificExecutionCapabilityResult.js";

import type {
    ScientificExecutionStep,
    ScientificExecutionStepType
} from "./ScientificExecutionStep.js";

import type {
    ScientificExecutionPlan
} from "./ScientificExecutionPlan.js";

import type {
    ScientificExecutionPlanResult
} from "./ScientificExecutionPlanResult.js";

export class ScientificExecutionPlanEngine {

    build(
        campaignId: string,
        execution:
            ScientificExperimentExecutionResult,
        capabilities:
            ScientificExecutionCapabilityResult
    ): ScientificExecutionPlanResult {

        try {

            const plans:
                ScientificExecutionPlan[] = [];

            let planCounter = 1;

            for (
                const task
                of execution.tasks ?? []
            ) {

                if (
                    task.executionStatus !==
                    "READY"
                ) {
                    continue;
                }

                const capability =
                    capabilities.capabilities.find(
                        item =>
                            item.executionTaskId ===
                            task.executionTaskId
                    );

                const steps =
                    this.buildSteps(
                        task,
                        capability?.capability
                    );

                plans.push({

                    executionPlanId:
                        `SCIENTIFIC-EXECUTION-PLAN-${String(
                            planCounter++
                        ).padStart(5, "0")}`,

                    executionTaskId:
                        task.executionTaskId,

                    experimentId:
    task.experimentId,

    targetType:
    task.targetType,

targetId:
    task.targetId,

sourcePatternRelation:
    task.sourcePatternRelation,

sourceConclusionId:
    task.sourceConclusionId,

sourceIds:
    [...(task.sourceIds ?? [])],

targetEvidenceIds:
    [...(task.targetEvidenceIds ?? [])],

...(task.compositionExecutionRequirement !==
    undefined
        ? {
            compositionExecutionRequirement:
                cloneScientificCompositionExecutionRequirement(
                    task.compositionExecutionRequirement
                )
        }
        : {}),

supportCondition:
    task.supportCondition,

challengeCondition:
    task.challengeCondition,

    scientificCriteria:
    task.scientificCriteria,

successCriteria:
    [...(task.successCriteria ?? [])],

failureCriteria:
    [...(task.failureCriteria ?? [])],

origin:
    task.origin,

                    priority:
                        task.priority,

                    queueScore:
                        task.queueScore,

                    steps,

                    totalSteps:
                        steps.length,

                    readySteps:
                        steps.filter(
                            step =>
                                step.status ===
                                "READY"
                        ).length,

                    blockedSteps:
                        steps.filter(
                            step =>
                                step.status ===
                                "BLOCKED"
                        ).length,

                    executionReady:
                        steps.every(
                            step =>
                                step.status ===
                                "READY"
                        ),

                    explanation:
                        `Execution plan generated for ` +
                        `${task.experimentId} using capability ` +
                        `${capability?.capability ?? "UNCLASSIFIED"}.`

                });

            }

            const allSteps =
                plans.flatMap(
                    plan =>
                        plan.steps
                );

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                plans,

                statistics: {

                    plans:
                        plans.length,

                    totalSteps:
                        allSteps.length,

                    readyPlans:
                        plans.filter(
                            plan =>
                                plan.executionReady
                        ).length,

                    blockedPlans:
                        plans.filter(
                            plan =>
                                !plan.executionReady
                        ).length,

                    sourceReingestionSteps:
                        this.countSteps(
                            allSteps,
                            "SOURCE_REINGESTION"
                        ),

                    staticAnalysisSteps:
                        this.countSteps(
                            allSteps,
                            "STATIC_ANALYSIS"
                        ),

                    testExecutionSteps:
                        this.countSteps(
                            allSteps,
                            "TEST_EXECUTION"
                        ),

                    invariantValidationSteps:
                        this.countSteps(
                            allSteps,
                            "INVARIANT_VALIDATION"
                        ),

                    evidenceCollectionSteps:
                        this.countSteps(
                            allSteps,
                            "EVIDENCE_COLLECTION"
                        ),

                    manualReviewSteps:
                        this.countSteps(
                            allSteps,
                            "MANUAL_REVIEW"
                        ),

                    averageStepsPerPlan:
                        plans.length === 0
                            ? 0
                            : Math.round(
                                allSteps.length /
                                plans.length
                            )

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                plans: [],

                statistics: {

                    plans: 0,

                    totalSteps: 0,

                    readyPlans: 0,

                    blockedPlans: 0,

                    sourceReingestionSteps: 0,

                    staticAnalysisSteps: 0,

                    testExecutionSteps: 0,

                    invariantValidationSteps: 0,

                    evidenceCollectionSteps: 0,

                    manualReviewSteps: 0,

                    averageStepsPerPlan: 0

                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]

            };

        }

    }

    private buildSteps(
        task:
            ScientificExperimentExecutionTask,
        primaryCapability?:
            string
    ): ScientificExecutionStep[] {

        const steps:
            ScientificExecutionStep[] = [];

        let order = 1;

        /*
         * Every experiment starts by ensuring
         * source material is available.
         */

        steps.push(
            this.createStep(
                task,
                order++,
                "SOURCE_REINGESTION"
            )
        );

        /*
         * Add execution-specific steps.
         */

        if (
            primaryCapability ===
            "STATIC_ANALYSIS"
        ) {

            steps.push(
                this.createStep(
                    task,
                    order++,
                    "STATIC_ANALYSIS"
                )
            );

        }

        if (
            primaryCapability ===
            "TEST_EXECUTION"
        ) {

            steps.push(
                this.createStep(
                    task,
                    order++,
                    "TEST_EXECUTION"
                )
            );

        }

        if (
            primaryCapability ===
            "INVARIANT_VALIDATION"
        ) {

            steps.push(
                this.createStep(
                    task,
                    order++,
                    "INVARIANT_VALIDATION"
                )
            );

        }

        if (
            primaryCapability ===
            "MANUAL_REVIEW"
        ) {

            steps.push(
                this.createStep(
                    task,
                    order++,
                    "MANUAL_REVIEW"
                )
            );

        }

        /*
         * Retests receive an additional
         * invariant-validation step because
         * they are adversarial by design.
         */

        if (
            task.origin ===
            "RETEST" &&
            !steps.some(
                step =>
                    step.stepType ===
                    "INVARIANT_VALIDATION"
            )
        ) {

            steps.push(
                this.createStep(
                    task,
                    order++,
                    "INVARIANT_VALIDATION"
                )
            );

        }

        /*
         * Every execution plan ends by
         * collecting evidence for feedback
         * into the scientific pipeline.
         */

        steps.push(
            this.createStep(
                task,
                order++,
                "EVIDENCE_COLLECTION"
            )
        );

        return steps;

    }

    private createStep(
        task:
            ScientificExperimentExecutionTask,
        order:
            number,
        stepType:
            ScientificExecutionStepType
    ): ScientificExecutionStep {

        const configuration =
            this.configurationFor(
                stepType
            );

        const blocked =
            configuration.tools.length === 0;

        return {

            stepId:
                `${task.executionTaskId}-${String(
                    order
                ).padStart(2, "0")}`,

            order,

            stepType,

            title:
                configuration.title,

            objective:
                configuration.objective,

            tools:
                configuration.tools,

            requiredInputs:
                this.inputsFor(
                    task,
                    stepType
                ),

            expectedOutputs:
                configuration.expectedOutputs,

            status:
                blocked
                    ? "BLOCKED"
                    : "READY"

        };

    }

    private configurationFor(
        stepType:
            ScientificExecutionStepType
    ): {

        title: string;

        objective: string;

        tools: string[];

        expectedOutputs: string[];

    } {

        switch (
            stepType
        ) {

            case "SOURCE_REINGESTION":

                return {

                    title:
                        "Re-ingest experimental sources",

                    objective:
                        "Load and normalize independent source material before evaluation.",

                    tools: [
                        "OECL SourcePipeline"
                    ],

                    expectedOutputs: [
                        "Normalized source representation",
                        "Updated source evidence"
                    ]

                };

            case "STATIC_ANALYSIS":

                return {

                    title:
                        "Run static analysis",

                    objective:
                        "Inspect implementation behavior and identify structural or security-relevant findings.",

                    tools: [
                        "Slither"
                    ],

                    expectedOutputs: [
                        "Static analysis findings",
                        "Code-level evidence"
                    ]

                };

            case "TEST_EXECUTION":

                return {

                    title:
                        "Execute reproducibility tests",

                    objective:
                        "Run executable tests designed to reproduce or falsify the target claim.",

                    tools: [
                        "Foundry",
                        "Hardhat"
                    ],

                    expectedOutputs: [
                        "Test execution results",
                        "Reproduction evidence",
                        "Failure traces"
                    ]

                };

            case "INVARIANT_VALIDATION":

                return {

                    title:
                        "Validate experimental invariants",

                    objective:
                        "Attempt to detect invariant violations under adversarial execution.",

                    tools: [
                        "Foundry invariant testing",
                        "Echidna"
                    ],

                    expectedOutputs: [
                        "Invariant validation results",
                        "Counterexample traces"
                    ]

                };

            case "EVIDENCE_COLLECTION":

                return {

                    title:
                        "Collect experimental evidence",

                    objective:
                        "Convert execution outputs into traceable scientific evidence.",

                    tools: [
                        "OECL EvidencePipeline"
                    ],

                    expectedOutputs: [
                        "Experimental evidence records",
                        "Scientific evidence references"
                    ]

                };

            case "MANUAL_REVIEW":

                return {

                    title:
                        "Perform scientific manual review",

                    objective:
                        "Review evidence that cannot be evaluated deterministically by the automated runtime.",

                    tools: [
                        "Human scientific review"
                    ],

                    expectedOutputs: [
                        "Manual review assessment"
                    ]

                };

        }

    }

    private inputsFor(
        task:
            ScientificExperimentExecutionTask,
        stepType:
            ScientificExecutionStepType
    ): string[] {

        switch (
            stepType
        ) {

            case "SOURCE_REINGESTION":

                return [
                    ...task.recommendedRepositories
                ];

            case "STATIC_ANALYSIS":

            case "TEST_EXECUTION":

            case "INVARIANT_VALIDATION":

                return [
                    task.targetId,
                    ...task.requiredEvidence
                ];

            case "EVIDENCE_COLLECTION":

                return [
                    task.experimentId,
                    ...task.successCriteria,
                    ...task.failureCriteria
                ];

            case "MANUAL_REVIEW":

                return [
                    task.targetId,
                    task.title
                ];

        }

    }

    private countSteps(
        steps:
            ScientificExecutionStep[],
        stepType:
            ScientificExecutionStepType
    ): number {

        return steps.filter(
            step =>
                step.stepType ===
                stepType
        ).length;

    }

}