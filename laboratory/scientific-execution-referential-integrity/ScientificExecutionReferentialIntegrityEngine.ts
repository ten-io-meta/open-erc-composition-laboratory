import type {
    ScientificExperimentQueueResult
} from "../scientific-experiment-queue/ScientificExperimentQueueResult.js";

import type {
    ScientificExperimentExecutionResult
} from "../scientific-experiment-execution/ScientificExperimentExecutionResult.js";

import type {
    ScientificExecutionPlanResult
} from "../scientific-execution-plan/ScientificExecutionPlanResult.js";

import type {
    ScientificExecutionSpecificationResult
} from "../scientific-execution-specification/ScientificExecutionSpecificationResult.js";

import type {
    ScientificRuntimeExecutionResult
} from "../scientific-execution-runtime/ScientificRuntimeExecutionResult.js";

import type {
    ScientificExecutionOutcomeResult
} from "../scientific-execution-outcome/ScientificExecutionOutcomeResult.js";

import type {
    ScientificExecutionObservationResult
} from "../scientific-execution-observation/ScientificExecutionObservationResult.js";

import type {
    ScientificExecutionEvidenceResult
} from "../scientific-execution-evidence/ScientificExecutionEvidenceResult.js";

import type {
    ScientificExecutionReferentialIntegrityIssue
} from "./ScientificExecutionReferentialIntegrity.js";

import type {
    ScientificExecutionReferentialIntegrityResult
} from "./ScientificExecutionReferentialIntegrityResult.js";


export class ScientificExecutionReferentialIntegrityEngine {

    build(
        campaignId: string,
        experimentQueue:
            ScientificExperimentQueueResult,
        execution:
            ScientificExperimentExecutionResult,
        plans:
            ScientificExecutionPlanResult,
        specifications:
            ScientificExecutionSpecificationResult,
        runtime:
            ScientificRuntimeExecutionResult,
        outcomes:
            ScientificExecutionOutcomeResult,
        observations:
            ScientificExecutionObservationResult,
        evidence:
            ScientificExecutionEvidenceResult
    ): ScientificExecutionReferentialIntegrityResult {

        try {

            const issues:
                ScientificExecutionReferentialIntegrityIssue[] = [];

            const queueItemById =
                new Map(
                    (experimentQueue.queue ?? []).map(
                        item => [
                            item.queueItemId,
                            item
                        ]
                    )
                );

            const taskById =
                new Map(
                    (execution.tasks ?? []).map(
                        task => [
                            task.executionTaskId,
                            task
                        ]
                    )
                );

            const planById =
                new Map(
                    (plans.plans ?? []).map(
                        plan => [
                            plan.executionPlanId,
                            plan
                        ]
                    )
                );

            const stepById =
                new Map(
                    (plans.plans ?? []).flatMap(
                        plan =>
                            (plan.steps ?? []).map(
                                step => [
                                    step.stepId,
                                    {
                                        plan,
                                        step
                                    }
                                ] as const
                            )
                    )
                );

            const specificationByStepId =
                new Map(
                    (specifications.specifications ?? []).map(
                        specification => [
                            specification.stepId,
                            specification
                        ]
                    )
                );

            const runtimeByStepId =
                new Map(
                    (runtime.executions ?? []).map(
                        executionItem => [
                            executionItem.stepId,
                            executionItem
                        ]
                    )
                );

            const outcomeById =
                new Map(
                    (outcomes.outcomes ?? []).map(
                        outcome => [
                            outcome.outcomeId,
                            outcome
                        ]
                    )
                );

            const observationById =
                new Map(
                    (observations.observations ?? []).map(
                        observation => [
                            observation.observationId,
                            observation
                        ]
                    )
                );


            const addIssue = (
                status:
                    ScientificExecutionReferentialIntegrityIssue["status"],
                entityType:
                    ScientificExecutionReferentialIntegrityIssue["entityType"],
                entityId: string,
                referenceType: string,
                referenceId: string | null,
                explanation: string
            ): void => {

                issues.push({
                    status,
                    entityType,
                    entityId,
                    referenceType,
                    referenceId,
                    explanation
                });

            };


            /*
             * Task -> Queue Item -> Experiment
             */

            for (const task of execution.tasks ?? []) {

                const queueItem =
                    queueItemById.get(
                        task.queueItemId
                    );

                if (!queueItem) {

                    addIssue(
                        "BROKEN_TASK_QUEUE_REFERENCE",
                        "TASK",
                        task.executionTaskId,
                        "queueItemId",
                        task.queueItemId,
                        `Execution task ${task.executionTaskId} references missing queue item ${task.queueItemId}.`
                    );

                    continue;
                }

                if (
                    queueItem.experiment.experimentId !==
                    task.experimentId
                ) {

                    addIssue(
                        "TASK_QUEUE_EXPERIMENT_MISMATCH",
                        "TASK",
                        task.executionTaskId,
                        "experimentId",
                        task.experimentId,
                        `Execution task ${task.executionTaskId} experiment ${task.experimentId} does not match queue experiment ${queueItem.experiment.experimentId}.`
                    );
                }

                this.compareScientificProvenance(
                    issues,
                    "TASK",
                    task.executionTaskId,
                    queueItem.experiment,
                    task
                );
            }


            /*
             * Plan -> Task
             * Plan -> Experiment
             */

            for (const plan of plans.plans ?? []) {

                const task =
                    taskById.get(
                        plan.executionTaskId
                    );

                if (!task) {

                    addIssue(
                        "BROKEN_PLAN_TASK_REFERENCE",
                        "PLAN",
                        plan.executionPlanId,
                        "executionTaskId",
                        plan.executionTaskId,
                        `Execution plan ${plan.executionPlanId} references missing task ${plan.executionTaskId}.`
                    );

                } else {

                    this.compareScientificProvenance(
                        issues,
                        "PLAN",
                        plan.executionPlanId,
                        task,
                        plan
                    );
                }


            }


            /*
             * Specification -> Plan / Task / Step
             *
             * Existence is necessary but not sufficient:
             * all three references must describe one lineage.
             */
            for (
                const specification
                of specifications.specifications ?? []
            ) {

                const plan =
                    planById.get(
                        specification.executionPlanId
                    );

                const task =
                    taskById.get(
                        specification.executionTaskId
                    );

                const step =
                    stepById.get(
                        specification.stepId
                    );

                if (!plan) {

                    addIssue(
                        "BROKEN_SPECIFICATION_PLAN_REFERENCE",
                        "SPECIFICATION",
                        specification.specificationId,
                        "executionPlanId",
                        specification.executionPlanId,
                        `Specification ${specification.specificationId} references missing plan ${specification.executionPlanId}.`
                    );
                }

                if (!task) {

                    addIssue(
                        "BROKEN_SPECIFICATION_TASK_REFERENCE",
                        "SPECIFICATION",
                        specification.specificationId,
                        "executionTaskId",
                        specification.executionTaskId,
                        `Specification ${specification.specificationId} references missing task ${specification.executionTaskId}.`
                    );
                }

                if (!step) {

                    addIssue(
                        "BROKEN_SPECIFICATION_STEP_REFERENCE",
                        "SPECIFICATION",
                        specification.specificationId,
                        "stepId",
                        specification.stepId,
                        `Specification ${specification.specificationId} references missing step ${specification.stepId}.`
                    );
                }

                if (
                    plan &&
                    step &&
                    (
                        plan.executionTaskId !==
                            specification.executionTaskId ||
                        step.plan.executionPlanId !==
                            specification.executionPlanId
                    )
                ) {

                    addIssue(
                        "SPECIFICATION_LINEAGE_MISMATCH",
                        "SPECIFICATION",
                        specification.specificationId,
                        "executionLineage",
                        specification.stepId,
                        `Specification ${specification.specificationId} references existing task, plan and step identifiers that do not belong to the same execution lineage.`
                    );
                }
            }

            /*
             * Runtime -> Plan / Task / Step
             * Specification -> Runtime executable target
             */
            for (
                const executionItem
                of runtime.executions ?? []
            ) {

                const plan =
                    planById.get(
                        executionItem.executionPlanId
                    );

                const task =
                    taskById.get(
                        executionItem.executionTaskId
                    );

                const step =
                    stepById.get(
                        executionItem.stepId
                    );

                if (!plan) {

                    addIssue(
                        "BROKEN_RUNTIME_PLAN_REFERENCE",
                        "RUNTIME",
                        executionItem.runtimeExecutionId,
                        "executionPlanId",
                        executionItem.executionPlanId,
                        `Runtime execution ${executionItem.runtimeExecutionId} references missing plan ${executionItem.executionPlanId}.`
                    );
                }

                if (!task) {

                    addIssue(
                        "BROKEN_RUNTIME_TASK_REFERENCE",
                        "RUNTIME",
                        executionItem.runtimeExecutionId,
                        "executionTaskId",
                        executionItem.executionTaskId,
                        `Runtime execution ${executionItem.runtimeExecutionId} references missing task ${executionItem.executionTaskId}.`
                    );
                }

                if (!step) {

                    addIssue(
                        "BROKEN_RUNTIME_STEP_REFERENCE",
                        "RUNTIME",
                        executionItem.runtimeExecutionId,
                        "stepId",
                        executionItem.stepId,
                        `Runtime execution ${executionItem.runtimeExecutionId} references missing step ${executionItem.stepId}.`
                    );
                }

                if (
                    plan &&
                    step &&
                    (
                        plan.executionTaskId !==
                            executionItem.executionTaskId ||
                        step.plan.executionPlanId !==
                            executionItem.executionPlanId
                    )
                ) {

                    addIssue(
                        "RUNTIME_LINEAGE_MISMATCH",
                        "RUNTIME",
                        executionItem.runtimeExecutionId,
                        "executionLineage",
                        executionItem.stepId,
                        `Runtime execution ${executionItem.runtimeExecutionId} references existing task, plan and step identifiers that do not belong to the same execution lineage.`
                    );
                }

                const specification =
                    specificationByStepId.get(
                        executionItem.stepId
                    );

                if (specification) {

                    this.compareExecutableTargetProvenance(
                        issues,
                        "RUNTIME",
                        executionItem.runtimeExecutionId,
                        specification,
                        executionItem
                    );
                }
            }

            /*
             * Outcome -> Plan / Task / Step
             * Runtime -> Outcome executable target
             */
            for (
                const outcome
                of outcomes.outcomes ?? []
            ) {

                const plan =
                    planById.get(
                        outcome.executionPlanId
                    );

                const task =
                    taskById.get(
                        outcome.executionTaskId
                    );

                const step =
                    stepById.get(
                        outcome.stepId
                    );

                if (!plan) {

                    addIssue(
                        "BROKEN_OUTCOME_PLAN_REFERENCE",
                        "OUTCOME",
                        outcome.outcomeId,
                        "executionPlanId",
                        outcome.executionPlanId,
                        `Outcome ${outcome.outcomeId} references missing plan ${outcome.executionPlanId}.`
                    );
                }

                if (!task) {

                    addIssue(
                        "BROKEN_OUTCOME_TASK_REFERENCE",
                        "OUTCOME",
                        outcome.outcomeId,
                        "executionTaskId",
                        outcome.executionTaskId,
                        `Outcome ${outcome.outcomeId} references missing task ${outcome.executionTaskId}.`
                    );
                }

                if (!step) {

                    addIssue(
                        "BROKEN_OUTCOME_STEP_REFERENCE",
                        "OUTCOME",
                        outcome.outcomeId,
                        "stepId",
                        outcome.stepId,
                        `Outcome ${outcome.outcomeId} references missing step ${outcome.stepId}.`
                    );
                }

                if (
                    plan &&
                    step &&
                    (
                        plan.executionTaskId !==
                            outcome.executionTaskId ||
                        step.plan.executionPlanId !==
                            outcome.executionPlanId
                    )
                ) {

                    addIssue(
                        "OUTCOME_LINEAGE_MISMATCH",
                        "OUTCOME",
                        outcome.outcomeId,
                        "executionLineage",
                        outcome.stepId,
                        `Outcome ${outcome.outcomeId} references existing task, plan and step identifiers that do not belong to the same execution lineage.`
                    );
                }

                const runtimeExecution =
                    runtimeByStepId.get(
                        outcome.stepId
                    );

                if (runtimeExecution) {

                    this.compareExecutableTargetProvenance(
                        issues,
                        "OUTCOME",
                        outcome.outcomeId,
                        runtimeExecution,
                        outcome
                    );
                }
            }

            /*
             * Observation -> Outcome
             */

            for (
                const observation
                of observations.observations ?? []
            ) {

                const outcome =
                    outcomeById.get(
                        observation.outcomeId
                    );

                if (!outcome) {

                    addIssue(
                        "BROKEN_OBSERVATION_OUTCOME_REFERENCE",
                        "OBSERVATION",
                        observation.observationId,
                        "outcomeId",
                        observation.outcomeId,
                        `Observation ${observation.observationId} references missing outcome ${observation.outcomeId}.`
                    );

                } else {

                    this.compareScientificProvenance(
                        issues,
                        "OBSERVATION",
                        observation.observationId,
                        outcome,
                        observation
                    );

                    this.compareExecutableTargetProvenance(
                        issues,
                        "OBSERVATION",
                        observation.observationId,
                        outcome,
                        observation
                    );
                }
            }


            /*
             * Evidence -> Observation / Outcome
             */

            for (
                const evidenceItem
                of evidence.evidence ?? []
            ) {

                const observation =
                    observationById.get(
                        evidenceItem.observationId
                    );

                if (!observation) {

                    addIssue(
                        "BROKEN_EVIDENCE_OBSERVATION_REFERENCE",
                        "EVIDENCE",
                        evidenceItem.evidenceId,
                        "observationId",
                        evidenceItem.observationId,
                        `Evidence ${evidenceItem.evidenceId} references missing observation ${evidenceItem.observationId}.`
                    );

                } else {

                    this.compareScientificProvenance(
                        issues,
                        "EVIDENCE",
                        evidenceItem.evidenceId,
                        observation,
                        evidenceItem
                    );

                    this.compareExecutableTargetProvenance(
                        issues,
                        "EVIDENCE",
                        evidenceItem.evidenceId,
                        observation,
                        evidenceItem
                    );
                }

                if (
                    !outcomeById.has(
                        evidenceItem.outcomeId
                    )
                ) {

                    addIssue(
                        "BROKEN_EVIDENCE_OUTCOME_REFERENCE",
                        "EVIDENCE",
                        evidenceItem.evidenceId,
                        "outcomeId",
                        evidenceItem.outcomeId,
                        `Evidence ${evidenceItem.evidenceId} references missing outcome ${evidenceItem.outcomeId}.`
                    );
                }
            }


            const scientificProvenanceMismatches =
                issues.filter(
                    issue =>
                        issue.status ===
                        "SCIENTIFIC_PROVENANCE_MISMATCH"
                ).length;

            const executableTargetProvenanceMismatches =
                issues.filter(
                    issue =>
                        issue.status ===
                        "EXECUTABLE_TARGET_PROVENANCE_MISMATCH"
                ).length;

            const brokenReferences =
                issues.length -
                scientificProvenanceMismatches -
                executableTargetProvenanceMismatches;

            const totalEntities =
                (execution.tasks ?? []).length +
                (plans.plans ?? []).length +
                (specifications.specifications ?? []).length +
                (runtime.executions ?? []).length +
                (outcomes.outcomes ?? []).length +
                (observations.observations ?? []).length +
                (evidence.evidence ?? []).length;

            const integrityScore =
                totalEntities === 0
                    ? 1
                    : Math.max(
                        0,
                        1 -
                        issues.length /
                        totalEntities
                    );


            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                valid:
                    issues.length === 0,

                issues,

                statistics: {

                    tasks:
                        (execution.tasks ?? []).length,

                    plans:
                        (plans.plans ?? []).length,

                    specifications:
                        (specifications.specifications ?? []).length,

                    runtimeExecutions:
                        (runtime.executions ?? []).length,

                    outcomes:
                        (outcomes.outcomes ?? []).length,

                    observations:
                        (observations.observations ?? []).length,

                    evidence:
                        (evidence.evidence ?? []).length,

                    brokenReferences,

                    scientificProvenanceMismatches,

                    executableTargetProvenanceMismatches,

                    integrityScore
                },

                errors: []
            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                valid: false,

                issues: [],

                statistics: {

                    tasks: 0,
                    plans: 0,
                    specifications: 0,
                    runtimeExecutions: 0,
                    outcomes: 0,
                    observations: 0,
                    evidence: 0,
                    brokenReferences: 0,
                    scientificProvenanceMismatches: 0,
                    executableTargetProvenanceMismatches: 0,
                    integrityScore: 0
                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown execution referential integrity error"
                ]
            };
        }
    }


    private compareScientificProvenance(
        issues:
            ScientificExecutionReferentialIntegrityIssue[],
        entityType:
            ScientificExecutionReferentialIntegrityIssue["entityType"],
        entityId: string,
        upstream: {
            experimentId: string;
            targetId: string;
            sourceConclusionId?: string;
            sourceIds: string[];
            targetEvidenceIds: string[];
        },
        downstream: {
            experimentId: string;
            targetId: string;
            sourceConclusionId?: string;
            sourceIds: string[];
            targetEvidenceIds: string[];
        }
    ): void {

        const equalArrays = (
            left: string[],
            right: string[]
        ): boolean =>
            left.length === right.length &&
            left.every(
                (value, index) =>
                    value === right[index]
            );

        if (
            upstream.experimentId !==
                downstream.experimentId ||
            upstream.targetId !==
                downstream.targetId ||
            upstream.sourceConclusionId !==
                downstream.sourceConclusionId ||
            !equalArrays(
                upstream.sourceIds,
                downstream.sourceIds
            ) ||
            !equalArrays(
                upstream.targetEvidenceIds,
                downstream.targetEvidenceIds
            )
        ) {

            issues.push({

                status:
                    "SCIENTIFIC_PROVENANCE_MISMATCH",

                entityType,

                entityId,

                referenceType:
                    "scientificProvenance",

                referenceId: null,

                explanation:
                    `Scientific provenance mismatch detected for ${entityType.toLowerCase()} ${entityId}.`
            });
        }
    }


    private compareExecutableTargetProvenance(
        issues:
            ScientificExecutionReferentialIntegrityIssue[],
        entityType:
            ScientificExecutionReferentialIntegrityIssue["entityType"],
        entityId: string,
        upstream: {
            repository: string | null;
            selectedExecutableTarget: unknown;
        },
        downstream: {
            repository: string | null;
            selectedExecutableTarget: unknown;
        }
    ): void {

        if (
            upstream.repository !==
                downstream.repository ||
            JSON.stringify(
                upstream.selectedExecutableTarget
            ) !==
            JSON.stringify(
                downstream.selectedExecutableTarget
            )
        ) {

            issues.push({

                status:
                    "EXECUTABLE_TARGET_PROVENANCE_MISMATCH",

                entityType,

                entityId,

                referenceType:
                    "selectedExecutableTarget",

                referenceId: null,

                explanation:
                    `Executable target provenance mismatch detected for ${entityType.toLowerCase()} ${entityId}.`
            });
        }
    }
}


