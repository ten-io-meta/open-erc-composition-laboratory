import {
    cloneScientificCompositionExecutionRequirement
} from "../scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";
import {
    ResearchPipeline
} from "../pipeline/ResearchPipeline.js";
import {
    GitHubAdapter
} from "../github-adapter/GitHubAdapter.js";
import { exec } from "child_process";
import { promisify } from "util";

import type {
    ScientificExecutionSpecification
} from "../scientific-execution-specification/ScientificExecutionSpecification.js";

import type {
    ScientificExecutionSpecificationResult
} from "../scientific-execution-specification/ScientificExecutionSpecificationResult.js";

import type {
    ScientificExecutionPlanResult
} from "../scientific-execution-plan/ScientificExecutionPlanResult.js";

import type {
    ScientificExecutionPlan
} from "../scientific-execution-plan/ScientificExecutionPlan.js";

import type {
    ScientificExecutionStep
} from "../scientific-execution-plan/ScientificExecutionStep.js";

import type {
    ScientificRuntimeExecution
} from "./ScientificRuntimeExecution.js";

import type {
    ScientificRuntimeExecutionResult
} from "./ScientificRuntimeExecutionResult.js";

const execAsync =
    promisify(exec);
const DEFAULT_EXTERNAL_EXECUTION_TIMEOUT_MS =
    120_000;
const TOOLCHAIN_PROBE_TIMEOUT_MS =
    10_000;

const TOOLCHAIN_PROBE_MAX_BUFFER =
    1024 * 1024;
function externalExecutionTimeoutMs(): number {

    const configuredTimeout =
        Number(
            process.env
                .OECL_EXTERNAL_EXECUTION_TIMEOUT_MS
        );

    if (
        Number.isFinite(
            configuredTimeout
        ) &&
        configuredTimeout > 0
    ) {

        return configuredTimeout;

    }

    return DEFAULT_EXTERNAL_EXECUTION_TIMEOUT_MS;

}
const MAX_CAPTURED_OUTPUT_CHARS =
    64 * 1024;

function truncateCapturedOutput(
    output: string
): string {

    if (
        output.length <=
        MAX_CAPTURED_OUTPUT_CHARS
    ) {

        return output;

    }

    const edgeLength =
        Math.floor(
            MAX_CAPTURED_OUTPUT_CHARS /
            2
        );

    const omittedCharacters =
        output.length -
        (
            edgeLength *
            2
        );

    return (
        output.slice(
            0,
            edgeLength
        ) +
        `\n...[OECL_OUTPUT_TRUNCATED:${omittedCharacters}_CHARS]...\n` +
        output.slice(
            -edgeLength
        )
    );

}
export class ScientificExecutionRuntimeEngine {

    async build(
        campaignId: string,
        executionPlans:
            ScientificExecutionPlanResult,
        executionSpecifications:
            ScientificExecutionSpecificationResult
    ): Promise<ScientificRuntimeExecutionResult> {

        try {

            const executions:
                ScientificRuntimeExecution[] = [];

            let counter = 1;
            const executionCache =
    new Map<
        string,
        ScientificRuntimeExecution
    >();

            const specificationsByStep =
                new Map(
                    (
                        executionSpecifications
                            .specifications ?? []
                    ).map(
                        specification => [
                            specification.stepId,
                            specification
                        ] as const
                    )
                );

            for (
                const plan
                of executionPlans.plans ?? []
            ) {

                if (
                    !plan.executionReady
                ) {
                    continue;
                }

                for (
                    const step
                    of plan.steps ?? []
                ) {

                    const specification =
    specificationsByStep.get(
        step.stepId
    );

const cacheKey =
    specification &&
    specification.resolutionStatus === "EXECUTABLE" &&
    specification.repository &&
    specification.workingDirectory &&
    specification.command
        ? [
            step.stepType,
            specification.repository,
            specification.workingDirectory,
            specification.command,
            specification.testSelector ?? "",
            specification.invariantSelector ?? "",
            specification.scientificPolarity ?? "",
            specification.supportCondition ?? "",
            specification.challengeCondition ?? ""
        ].join("|")
        : null;

if (
    cacheKey &&
    executionCache.has(
        cacheKey
    )
) {

    const cachedExecution =
        executionCache.get(
            cacheKey
        )!;

    executions.push({

        ...cachedExecution,

        runtimeExecutionId:
            this.executionId(
                counter++
            ),

        executionPlanId:
            plan.executionPlanId,

        executionTaskId:
            plan.executionTaskId,

        experimentId:
            plan.experimentId,

        targetId:
            plan.targetId,

        sourceConclusionId:
            plan.sourceConclusionId,
            sourceIds:
    [
        ...(
            plan.sourceIds ??
            []
        )
    ],

        targetEvidenceIds:
            [
                ...(
                    plan.targetEvidenceIds ??
                    []
                )
            ],

        stepId:
            step.stepId,

        stepType:
            step.stepType,

        evidence: [
            ...cachedExecution.evidence,
            `REUSED_RUNTIME_EXECUTION:${cachedExecution.runtimeExecutionId}`
        ],

        observations: [
    ...cachedExecution.observations,
    "Runtime result was reused from an identical executable scientific specification."
],


        explanation:
            (
                `Runtime result reused from ` +
                `${cachedExecution.runtimeExecutionId} ` +
                `for identical executable specification.`
            )

    });

    continue;

}

const execution =
    await this.executeStep(
        counter++,
        plan,
        step,
        specification,
        executions
    );

executions.push(
    execution
);

if (
    cacheKey &&
    (
        execution.status === "SUCCESS" ||
        execution.status === "FAILURE"
    )
) {

    executionCache.set(
        cacheKey,
        execution
    );

}

                }

            }

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                executions,

                statistics: {

                    total:
                        executions.length,

                    success:
                        this.countStatus(
                            executions,
                            "SUCCESS"
                        ),

                    failure:
                        this.countStatus(
                            executions,
                            "FAILURE"
                        ),

                    inconclusive:
                        this.countStatus(
                            executions,
                            "INCONCLUSIVE"
                        ),

                    unsupported:
                        this.countStatus(
                            executions,
                            "UNSUPPORTED"
                        ),

                    skipped:
                        this.countStatus(
                            executions,
                            "SKIPPED"
                        ),

                    sourceReingestionExecuted:
                        this.countSuccessfulStep(
                            executions,
                            "SOURCE_REINGESTION"
                        ),

                    staticAnalysisExecuted:
                        this.countSuccessfulStep(
                            executions,
                            "STATIC_ANALYSIS"
                        ),

                    testExecutionExecuted:
                        this.countSuccessfulStep(
                            executions,
                            "TEST_EXECUTION"
                        ),

                    invariantValidationExecuted:
                        this.countSuccessfulStep(
                            executions,
                            "INVARIANT_VALIDATION"
                        ),

                    evidenceCollectionExecuted:
                        this.countSuccessfulStep(
                            executions,
                            "EVIDENCE_COLLECTION"
                        ),

                    manualReviewExecuted:
                        this.countSuccessfulStep(
                            executions,
                            "MANUAL_REVIEW"
                        )

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                executions: [],

                statistics: {

                    total: 0,

                    success: 0,

                    failure: 0,

                    inconclusive: 0,

                    unsupported: 0,

                    skipped: 0,

                    sourceReingestionExecuted: 0,

                    staticAnalysisExecuted: 0,

                    testExecutionExecuted: 0,

                    invariantValidationExecuted: 0,

                    evidenceCollectionExecuted: 0,

                    manualReviewExecuted: 0

                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]

            };

        }

    }

    private async executeStep(
        index: number,
        plan:
            ScientificExecutionPlan,
        step:
            ScientificExecutionStep,
        specification?:
            ScientificExecutionSpecification,
        completedExecutions:
            ScientificRuntimeExecution[] = []
    ): Promise<ScientificRuntimeExecution> {

        switch (
            step.stepType
        ) {

            case "SOURCE_REINGESTION":

                return this.executeSourceReingestion(
                    index,
                    plan,
                    step
                );

            case "EVIDENCE_COLLECTION":

                return this.executeEvidenceCollection(
                    index,
                    plan,
                    step,
                    completedExecutions
                );

            case "COMPOSITION_EXECUTION":

                return this.executeCompositionExecution(
                    index,
                    plan,
                    step,
                    specification
                );


            case "STATIC_ANALYSIS":

                return this.unsupportedExecution(
                    index,
                    plan,
                    step,
                    "External static analysis adapter is not connected."
                );

            case "TEST_EXECUTION":

                return await this.executeTestExecution(
                    index,
                    plan,
                    step,
                    specification
                );

            case "INVARIANT_VALIDATION":

    return await this.executeTestExecution(
        index,
        plan,
        step,
        specification
    );
            case "MANUAL_REVIEW":

                return this.unsupportedExecution(
                    index,
                    plan,
                    step,
                    "Manual scientific review cannot be executed autonomously."
                );

        }

    }

    private executeCompositionExecution(
        index: number,
        plan:
            ScientificExecutionPlan,
        step:
            ScientificExecutionStep,
        specification?:
            ScientificExecutionSpecification
    ): ScientificRuntimeExecution {

        const now =
            new Date().toISOString();

        const planRequirement =
            plan.compositionExecutionRequirement;

        const specificationRequirement =
            specification
                ?.compositionExecutionRequirement;


        const admissionErrors:
            string[] = [];


        if (
            specification ===
            undefined
        ) {

            admissionErrors.push(
                "No scientific execution specification is available for the composition execution step."
            );

        } else {

            if (
                specification.specificationType !==
                "COMPOSITION_EXECUTION"
            ) {

                admissionErrors.push(
                    "The scientific execution specification is not a composition execution specification."
                );

            }

            if (
                specification.resolutionStatus !==
                "EXECUTABLE"
            ) {

                admissionErrors.push(
                    "The composition execution specification is not executable."
                );

            }

            /*
             * Joint execution must remain detached from individual
             * repository/target command identity.
             */
            if (
                specification.repository !==
                    null ||
                specification.selectedExecutableTarget !==
                    null ||
                specification.workingDirectory !==
                    null ||
                specification.command !==
                    null ||
                specification.testSelector !==
                    null ||
                specification.invariantSelector !==
                    null
            ) {

                admissionErrors.push(
                    "The composition execution specification contains individual executable identity."
                );

            }

        }


        if (
            planRequirement ===
            undefined
        ) {

            admissionErrors.push(
                "The execution plan has no structured composition execution requirement."
            );

        }


        if (
            specificationRequirement ===
            undefined
        ) {

            admissionErrors.push(
                "The execution specification has no structured composition execution requirement."
            );

        }


        if (
            planRequirement !==
                undefined &&
            specificationRequirement !==
                undefined
        ) {

            if (
                planRequirement.requirementId !==
                specificationRequirement.requirementId
            ) {

                admissionErrors.push(
                    "The plan and specification composition requirement identities diverge."
                );

            }

            if (
                planRequirement.candidate.candidateId !==
                specificationRequirement.candidate.candidateId
            ) {

                admissionErrors.push(
                    "The plan and specification composition candidate identities diverge."
                );

            }

        }


        const requirement =
            specificationRequirement;


        if (
            requirement !==
            undefined
        ) {

            if (
                requirement.participantAConstraintIds.length ===
                0
            ) {

                admissionErrors.push(
                    "The composition execution requirement has no participant A constraints."
                );

            }

            if (
                requirement.participantBConstraintIds.length ===
                0
            ) {

                admissionErrors.push(
                    "The composition execution requirement has no participant B constraints."
                );

            }


            const participantASources =
                requirement.participantSources.filter(
                    source =>
                        source.participantSide ===
                        "A"
                );

            const participantBSources =
                requirement.participantSources.filter(
                    source =>
                        source.participantSide ===
                        "B"
                );


            if (
                participantASources.length ===
                0
            ) {

                admissionErrors.push(
                    "The composition execution requirement has no participant A source binding."
                );

            }


            if (
                participantBSources.length ===
                0
            ) {

                admissionErrors.push(
                    "The composition execution requirement has no participant B source binding."
                );

            }


            for (
                const source
                of requirement.participantSources
            ) {

                if (
                    source.sourceRevision.trim().length ===
                        0 ||
                    source.repository.trim().length ===
                        0
                ) {

                    admissionErrors.push(
                        `Composition participant ${source.participantSide} has an incomplete pinned source binding.`
                    );

                }

            }

        }


        if (
            admissionErrors.length >
            0
        ) {

            return {

                runtimeExecutionId:
                    this.executionId(
                        index
                    ),

                executionPlanId:
                    plan.executionPlanId,

                executionTaskId:
                    plan.executionTaskId,

                experimentId:
                    plan.experimentId,

                targetId:
                    plan.targetId,

                sourceConclusionId:
                    plan.sourceConclusionId,

                sourceIds:
                    [
                        ...(plan.sourceIds ?? [])
                    ],

                targetEvidenceIds:
                    [
                        ...(plan.targetEvidenceIds ?? [])
                    ],

                stepId:
                    step.stepId,

                stepType:
                    step.stepType,

                status:
                    "UNSUPPORTED",

                runtime:
                    "INVALID_COMPOSITION_EXECUTION_REQUIREMENT",

                repository:
                    null,

                selectedExecutableTarget:
                    null,

                startedAt:
                    null,

                finishedAt:
                    null,

                evidence: [],

                observations: [
                    "Joint composition execution was rejected before any participant contract execution."
                ],

                errors:
                    admissionErrors,

                explanation:
                    "The dedicated composition runtime rejected an incomplete or divergent joint execution requirement."

            };

        }


        if (
            requirement ===
            undefined
        ) {

            /*
             * Defensive exhaustiveness. The admission error branch
             * above already handles this case.
             */
            throw new Error(
                "Composition requirement admission reached an impossible undefined requirement state."
            );

        }


        return {

            runtimeExecutionId:
                this.executionId(
                    index
                ),

            executionPlanId:
                plan.executionPlanId,

            executionTaskId:
                plan.executionTaskId,

            experimentId:
                plan.experimentId,

            targetId:
                plan.targetId,

            sourceConclusionId:
                plan.sourceConclusionId,

            sourceIds:
                [
                    ...(plan.sourceIds ?? [])
                ],

            targetEvidenceIds:
                [
                    ...(plan.targetEvidenceIds ?? [])
                ],

            stepId:
                step.stepId,

            stepType:
                step.stepType,

            /*
             * Admission is intentionally INCONCLUSIVE.
             *
             * This proves only that the runtime received a valid
             * bilateral execution requirement. No participant
             * contracts are executed at this stage.
             */
            status:
                "INCONCLUSIVE",

            runtime:
                "OECL_NATIVE_COMPOSITION_REQUIREMENT_ADMISSION",

            compositionExecutionRequirement:
                cloneScientificCompositionExecutionRequirement(
                    requirement
                ),

            repository:
                null,

            selectedExecutableTarget:
                null,

            startedAt:
                now,

            finishedAt:
                now,

            evidence: [
                "COMPOSITION_REQUIREMENT_ADMITTED",
                `COMPOSITION_REQUIREMENT_ID:${requirement.requirementId}`,
                `COMPOSITION_CANDIDATE_ID:${requirement.candidate.candidateId}`,
                ...requirement
                    .participantAConstraintIds
                    .map(
                        constraintId =>
                            `PARTICIPANT_A_CONSTRAINT:${constraintId}`
                    ),
                ...requirement
                    .participantBConstraintIds
                    .map(
                        constraintId =>
                            `PARTICIPANT_B_CONSTRAINT:${constraintId}`
                    ),
                ...requirement
                    .participantSources
                    .map(
                        source =>
                            [
                                "PARTICIPANT_SOURCE",
                                source.participantSide,
                                source.sourceId,
                                source.sourceRevision,
                                source.repository
                            ].join(":")
                    )
            ],

            observations: [
                "Structured bilateral composition execution requirement was admitted by the dedicated runtime boundary.",
                "No participant contracts were executed by this runtime admission step."
            ],

            errors: [],

            explanation:
                "The dedicated composition runtime verified and preserved the joint A+B execution requirement without collapsing it to an individual repository or executable target. Contract execution remains pending."

        };

    }


    private async executeTestExecution(
        index: number,
        plan:
            ScientificExecutionPlan,
        step:
            ScientificExecutionStep,
        specification?:
            ScientificExecutionSpecification
    ): Promise<ScientificRuntimeExecution> {

        const now =
            new Date().toISOString();

        if (
            !specification ||
            specification.resolutionStatus !==
                "EXECUTABLE" ||
            !specification.command ||
            !specification.workingDirectory
        ) {

            return {

                runtimeExecutionId:
                    this.executionId(
                        index
                    ),

                executionPlanId:
                    plan.executionPlanId,

                executionTaskId:
                    plan.executionTaskId,

                experimentId:
                    plan.experimentId,

                targetId:
                    plan.targetId,

                sourceConclusionId:
                    plan.sourceConclusionId,

                sourceIds:
                    [
                        ...(
                            plan.sourceIds ??
                            []
                        )
                    ],

                targetEvidenceIds:
                    [
                        ...(
                            plan.targetEvidenceIds ??
                            []
                        )
                    ],

                stepId:
                    step.stepId,

                stepType:
                    step.stepType,

                status:
                    "UNSUPPORTED",

                runtime:
                    "NO_EXECUTABLE_SPECIFICATION",

repository:

    specification?.repository ?? null,


selectedExecutableTarget:

    specification?.selectedExecutableTarget ?? null,

                startedAt:
                    null,

                finishedAt:
                    null,

                evidence: [],

                observations: [],

                errors: [
                    "No executable scientific execution specification is available for this test step."
                ],

                explanation:
                    "The test execution step could not run because its scientific execution specification is unresolved."

            };

        }

        const allowedCommands =
            new Set([
                "forge test",
                "npx hardhat test"
            ]);
        const selector =
    step.stepType === "INVARIANT_VALIDATION"
        ? (
            specification.invariantSelector ??
            specification.testSelector
        )
        : specification.testSelector;

const safeSelector =
    selector &&
    /^[a-zA-Z0-9 _.,:()'/-]+$/.test(
        selector
    )
        ? selector
        : null;

const executionCommand =
    specification.command === "npx hardhat test" &&
    safeSelector
        ? `${specification.command} --grep ${JSON.stringify(
            safeSelector
        )}`
        : specification.command;

        
        if (
            !allowedCommands.has(
                specification.command
            )
        ) {

            return {

                runtimeExecutionId:
                    this.executionId(
                        index
                    ),

                executionPlanId:
                    plan.executionPlanId,

                executionTaskId:
                    plan.executionTaskId,

                experimentId:
                    plan.experimentId,

                targetId:
                    plan.targetId,

                sourceConclusionId:
                    plan.sourceConclusionId,

                sourceIds:
                    [
                        ...(
                            plan.sourceIds ??
                            []
                        )
                    ],

                targetEvidenceIds:
                    [
                        ...(
                            plan.targetEvidenceIds ??
                            []
                        )
                    ],

                stepId:
                    step.stepId,

                stepType:
                    step.stepType,

                status:
                    "UNSUPPORTED",

                runtime:
                    "COMMAND_NOT_ALLOWED",

                repository:

                    specification.repository,


                selectedExecutableTarget:

                    specification.selectedExecutableTarget,

                startedAt:
                    null,

                finishedAt:
                    null,

                evidence: [],

                observations: [],

                errors: [
                    `Execution command is not allowed: ${specification.command}`
                ],

                explanation:
                    "The resolved scientific execution command is outside the runtime allowlist."

            };

        }

               const selectorCannotBeAppliedSafely =
    (
        selector &&
        !safeSelector
    ) ||
    (
        selector &&
        specification.command ===
            "forge test"
    );

if (
    selectorCannotBeAppliedSafely
) {

    return {

        runtimeExecutionId:
            this.executionId(
                index
            ),

        executionPlanId:
            plan.executionPlanId,

        executionTaskId:
            plan.executionTaskId,

        experimentId:
            plan.experimentId,

        targetId:
            plan.targetId,

        sourceConclusionId:
            plan.sourceConclusionId,

        sourceIds:
                    [
                        ...(
                            plan.sourceIds ??
                            []
                        )
                    ],

                targetEvidenceIds:
            [
                ...(
                    plan.targetEvidenceIds ??
                    []
                )
            ],

        stepId:
            step.stepId,

        stepType:
            step.stepType,

        status:
            "UNSUPPORTED",

        runtime:
            "SELECTOR_EXECUTION_UNSUPPORTED",

        repository:

            specification.repository,


        selectedExecutableTarget:

            specification.selectedExecutableTarget,

        startedAt:
            null,

        finishedAt:
            null,

        evidence: [
            `COMMAND:${specification.command}`,
            `SELECTOR:${selector ?? ""}`
        ],

        observations: [],

        errors: [
            "The scientific test selector cannot be applied safely by the current runtime."
        ],

        explanation:
            (
                "The runtime did not execute the broader test suite because " +
                "the requested scientific selector could not be applied safely."
            )

    };

}

const toolchainAvailable =
    await this.testToolchainAvailable(
        specification.command,
        specification.workingDirectory
    );

        if (
            !toolchainAvailable
        ) {

            return {

                runtimeExecutionId:
                    this.executionId(
                        index
                    ),

                executionPlanId:
                    plan.executionPlanId,

                executionTaskId:
                    plan.executionTaskId,

                experimentId:
                    plan.experimentId,

                targetId:
                    plan.targetId,

                sourceConclusionId:
                    plan.sourceConclusionId,

                sourceIds:
                    [
                        ...(
                            plan.sourceIds ??
                            []
                        )
                    ],

                targetEvidenceIds:
                    [
                        ...(
                            plan.targetEvidenceIds ??
                            []
                        )
                    ],

                stepId:
                    step.stepId,

                stepType:
                    step.stepType,

                status:
                    "UNSUPPORTED",

                runtime:
                    "TOOLCHAIN_UNAVAILABLE",

                repository:

                    specification.repository,


                selectedExecutableTarget:

                    specification.selectedExecutableTarget,

                startedAt:
                    null,

                finishedAt:
                    null,

                evidence: [],

                observations: [],

                errors: [
                    `Required execution toolchain is unavailable for command: ${specification.command}`
                ],

                explanation:
                    (
                        "The scientific test execution was not attempted " +
                        "because the required external toolchain is unavailable."
                    )

            };

        } 

        try {

            const startedAt =
                new Date().toISOString();

            const result =
    await execAsync(
        executionCommand,
        {
            cwd:
                specification
                    .workingDirectory,

            timeout:
    externalExecutionTimeoutMs(),

            maxBuffer:
                10 * 1024 * 1024
        }
    );
    

            const stdout =
                String(
                    result.stdout ?? ""
                );

                        const stderr =
                String(
                    result.stderr ?? ""
                );

            const hardhatExecutedZeroTests =
                specification.command ===
                    "npx hardhat test" &&
                /\b0 passing\b/i.test(
                    stdout
                );

            if (
                hardhatExecutedZeroTests
            ) {

                return {

                    runtimeExecutionId:
                        this.executionId(
                            index
                        ),

                    executionPlanId:
                        plan.executionPlanId,

                    executionTaskId:
                        plan.executionTaskId,

                    experimentId:
                        plan.experimentId,

                    targetId:
                        plan.targetId,

                    sourceConclusionId:
                        plan.sourceConclusionId,

                    sourceIds:
                    [
                        ...(
                            plan.sourceIds ??
                            []
                        )
                    ],

                targetEvidenceIds:
                        [
                            ...(
                                plan.targetEvidenceIds ??
                                []
                            )
                        ],

                    stepId:
                        step.stepId,

                    stepType:
                        step.stepType,

                    status:
                        "INCONCLUSIVE",

                    runtime:
                        "OECL_EXTERNAL_TEST_EXECUTION",

                    repository:

                        specification.repository,


                    selectedExecutableTarget:

                        specification.selectedExecutableTarget,

                    startedAt,

                    finishedAt:
                        new Date().toISOString(),

                    evidence: [
                        `REPOSITORY:${specification.repository}`,
                        `WORKING_DIRECTORY:${specification.workingDirectory}`,
                        `COMMAND:${executionCommand}`,
                        `EXIT_CODE:0`,
                        `STDOUT:${truncateCapturedOutput(
    stdout
)}`,
                        `STDERR:${truncateCapturedOutput(
    stderr
)}`
                    ],

                    observations: [
                        "External test command completed successfully but executed zero tests."
                    ],

                    errors: [],

                    explanation:
                        (
                            "The external test runner completed successfully, " +
                            "but no tests were executed, so no scientific " +
                            "conclusion can be drawn from this execution."
                        )

                };

            }

            return {

                runtimeExecutionId:
                    this.executionId(
                        index
                    ),

                executionPlanId:
                    plan.executionPlanId,

                executionTaskId:
                    plan.executionTaskId,

                experimentId:
                    plan.experimentId,

                targetId:
                    plan.targetId,

                sourceConclusionId:
                    plan.sourceConclusionId,

                sourceIds:
                    [
                        ...(
                            plan.sourceIds ??
                            []
                        )
                    ],

                targetEvidenceIds:
                    [
                        ...(
                            plan.targetEvidenceIds ??
                            []
                        )
                    ],

                stepId:
                    step.stepId,

                stepType:
                    step.stepType,

                status:
                    "SUCCESS",

                runtime:
                    "OECL_EXTERNAL_TEST_EXECUTION",

                repository:

                    specification.repository,


                selectedExecutableTarget:

                    specification.selectedExecutableTarget,

                startedAt,

                finishedAt:
                    new Date().toISOString(),

                evidence: [
                    `REPOSITORY:${specification.repository}`,
                    `WORKING_DIRECTORY:${specification.workingDirectory}`,
                    `COMMAND:${executionCommand}`,
                    `SUPPORT_CONDITION:${specification.supportCondition ?? ""}`,
`CHALLENGE_CONDITION:${specification.challengeCondition ?? ""}`,
`SCIENTIFIC_POLARITY:${specification.scientificPolarity}`,
                    `STDOUT:${truncateCapturedOutput(
    stdout
)}`,
                    `STDERR:${truncateCapturedOutput(
    stderr
)}`
                ],

                observations: [
                    "External test command completed successfully."
                ],

                errors: [],

                explanation:
                    "The resolved scientific test specification was executed successfully by the external runtime."

            };

        } catch (error) {

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            const errorWithOutput =
    error as {
        stdout?: unknown;
        stderr?: unknown;
        code?: unknown;
        killed?: unknown;
        signal?: unknown;
    };

            const stdout =
                String(
                    errorWithOutput.stdout ??
                    ""
                );

            const stderr =
                String(
                    errorWithOutput.stderr ??
                    ""
                );

                        const exitCode =
                errorWithOutput.code !==
                    undefined
                    ? String(
                        errorWithOutput.code
                    )
                    : "UNKNOWN";

            const combinedOutput =
    `${stdout}\n${stderr}\n${message}`;

const executionTimedOut =
    errorWithOutput.killed ===
        true &&
    errorWithOutput.code ===
        null &&
    errorWithOutput.signal ===
        "SIGTERM";
const outputBufferExceeded =
    errorWithOutput.code ===
        "ERR_CHILD_PROCESS_STDIO_MAXBUFFER";
const hardhatHookFailure =
    specification.command ===
        "npx hardhat test" &&
    /"(?:before|after) (?:all|each)" hook/i.test(
        combinedOutput
    );

const hardhatCompilationFailure =
    specification.command ===
        "npx hardhat test" &&
    (
        /\bHH600\b/i.test(
            combinedOutput
        ) ||
        /Compilation failed/i.test(
            combinedOutput
        )
    );

const hardhatTestFailure =
    specification.command ===
        "npx hardhat test" &&
    /\b[1-9]\d*\s+failing\b/i.test(
        combinedOutput
    ) &&
    !hardhatHookFailure &&
    !hardhatCompilationFailure &&
    !executionTimedOut &&
    !outputBufferExceeded;

const executionStatus =
    hardhatTestFailure
        ? "FAILURE"
        : "INCONCLUSIVE";

const executionCause =
    executionTimedOut
        ? "EXECUTION_TIMEOUT"
        : outputBufferExceeded
            ? "OUTPUT_BUFFER_EXCEEDED"
            : hardhatCompilationFailure
                ? "COMPILATION_FAILURE"
                : hardhatHookFailure
                    ? "HOOK_FAILURE"
                    : hardhatTestFailure
                        ? "TEST_FAILURE"
                        : "EXECUTION_ERROR";

            return {

                runtimeExecutionId:
                    this.executionId(
                        index
                    ),

                executionPlanId:
                    plan.executionPlanId,

                executionTaskId:
                    plan.executionTaskId,

                experimentId:
                    plan.experimentId,

                targetId:
                    plan.targetId,

                sourceConclusionId:
                    plan.sourceConclusionId,

                sourceIds:
                    [
                        ...(
                            plan.sourceIds ??
                            []
                        )
                    ],

                targetEvidenceIds:
                    [
                        ...(
                            plan.targetEvidenceIds ??
                            []
                        )
                    ],

                stepId:
                    step.stepId,

                stepType:
                    step.stepType,

                status:
    executionStatus,

                runtime:
                    "OECL_EXTERNAL_TEST_EXECUTION",

                repository:

                    specification.repository,


                selectedExecutableTarget:

                    specification.selectedExecutableTarget,


                startedAt:
                    now,

                finishedAt:
                    new Date().toISOString(),

                evidence: [
                    `REPOSITORY:${specification.repository}`,
                    `WORKING_DIRECTORY:${specification.workingDirectory}`,
                    `COMMAND:${executionCommand}`,
                    `SUPPORT_CONDITION:${specification.supportCondition ?? ""}`,
`CHALLENGE_CONDITION:${specification.challengeCondition ?? ""}`,
`EXIT_CODE:${exitCode}`,
`EXECUTION_CAUSE:${executionCause}`,
`PROCESS_KILLED:${String(
    errorWithOutput.killed ??
    false
)}`,
`PROCESS_SIGNAL:${String(
    errorWithOutput.signal ??
    ""
)}`,
`STDOUT:${truncateCapturedOutput(
    stdout
)}`,
`STDERR:${truncateCapturedOutput(
    stderr
)}`
                ],
observations:
    executionCause ===
        "TEST_FAILURE"
        ? [
            "External test command executed and produced one or more failing tests."
        ]
        : executionCause ===
            "COMPILATION_FAILURE"
            ? [
                "External test command could not execute because the target project failed to compile."
            ]
            : executionCause ===
                "OUTPUT_BUFFER_EXCEEDED"
                ? [
                    "External test command exceeded the configured output buffer before a valid scientific result could be obtained."
                ]
                : executionCause ===
                    "HOOK_FAILURE"
                    ? [
                        "External test command failed in a test lifecycle hook, so no valid scientific test result was produced."
                    ]
                    : executionCause ===
                        "EXECUTION_TIMEOUT"
                        ? [
                            "External test command exceeded the configured execution timeout and was terminated."
                        ]
                        : [
                            "External test command did not produce a valid scientific test result."
                        ],

errors: [
    message
],

explanation:
    executionCause ===
        "TEST_FAILURE"
        ? (
            "The external test command executed and produced " +
            "one or more failing tests."
        )
        : executionCause ===
            "COMPILATION_FAILURE"
            ? (
                "The external test command could not execute because " +
                "the target project failed to compile, so no valid " +
                "scientific test result was obtained."
            )
            : executionCause ===
                "OUTPUT_BUFFER_EXCEEDED"
                ? (
                    "The external test command exceeded the configured " +
                    "output buffer before a valid scientific test result " +
                    "could be obtained."
                )
                : executionCause ===
                    "HOOK_FAILURE"
                    ? (
                        "The external test command failed in a test lifecycle hook " +
                        "before a valid scientific test result was obtained."
                    )
                : executionCause ===
                    "EXECUTION_TIMEOUT"
                    ? (
                        "The external test command exceeded the configured " +
                        "execution timeout and was terminated before a valid " +
                        "scientific test result was obtained."
                    )
                    : (
                        "The external test command could not produce a " +
                        "scientific test result because execution failed " +
                        "before a valid test outcome was obtained."
                    )
            };

        }

    }

    private async executeSourceReingestion(
    index: number,
    plan:
        ScientificExecutionPlan,
    step:
        ScientificExecutionStep
): Promise<ScientificRuntimeExecution> {

    const startedAt =
        new Date().toISOString();

    if (
        step.requiredInputs.length === 0
    ) {

        return {

            runtimeExecutionId:
                this.executionId(
                    index
                ),

            executionPlanId:
                plan.executionPlanId,

            executionTaskId:
                plan.executionTaskId,

            experimentId:
                plan.experimentId,

            targetId:
                plan.targetId,

            sourceConclusionId:
                plan.sourceConclusionId,

            sourceIds:
                    [
                        ...(
                            plan.sourceIds ??
                            []
                        )
                    ],

                targetEvidenceIds:
                [
                    ...(
                        plan.targetEvidenceIds ??
                        []
                    )
                ],

            stepId:
                step.stepId,

            stepType:
                step.stepType,

            status:

    "UNSUPPORTED",

            runtime:
                "OECL_NATIVE_SOURCE_REINGESTION",

            repository:

                null,


            selectedExecutableTarget:

                null,

            startedAt,

            finishedAt:
                new Date().toISOString(),

            evidence:
                [],

            observations:
                [],

            errors: [
                "No source inputs were available for re-ingestion."
            ],

            explanation:
                "Source re-ingestion could not start because no repository inputs were supplied."

        };

    }

    const adapter =
        new GitHubAdapter();

    const evidence:
        string[] = [];

    const observations:
        string[] = [];

    const errors:
        string[] = [];

    let successfulSources =
        0;

    let failedSources =
        0;

    /*
     * Re-ingest every repository supplied by the
     * scientific execution plan.
     */
    for (
        const repository
        of step.requiredInputs
    ) {

        const parts =
            repository.split(
                "/"
            );

        /*
         * GitHub repository identifiers are expected
         * in owner/repository form.
         */
        if (
            parts.length !== 2 ||
            !parts[0] ||
            !parts[1]
        ) {

            failedSources++;

            errors.push(
                `Invalid GitHub repository identifier: ${repository}.`
            );

            continue;

        }

        const [
            owner,
            repo
        ] =
            parts;

        try {

            /*
             * forceFresh is intentionally false.
             *
             * Existing local repository material can be
             * rescanned and normalized without forcing an
             * unnecessary remote refresh.
             */
            const result =
                await adapter.run({
                    owner,
                    repo,
                    forceFresh:
                        false
                });

            if (
                result.errors.length > 0
            ) {

                failedSources++;

                errors.push(
                    ...result.errors.map(
                        error =>
                            `${repository}: ${error}`
                    )
                );

                continue;

            }
const researchPipeline =
    new ResearchPipeline();

const pipelineResult =
    await researchPipeline.run(
        result.sourceId
    );

if (
    pipelineResult.errors.length > 0
) {

    failedSources++;

    errors.push(
        ...pipelineResult.errors.map(
            error =>
                `${repository} research pipeline: ${error}`
        )
    );

    continue;

}

successfulSources++;

evidence.push(
    `REINGESTED_SOURCE:${repository}`
);

evidence.push(
    `RESEARCH_PIPELINE_SOURCE:${pipelineResult.sourceId}`
);

evidence.push(
    `RESEARCH_KNOWLEDGE_ENTRIES:${pipelineResult.knowledgeEntries}`
);

evidence.push(
    `RESEARCH_KNOWLEDGE_PATH:${pipelineResult.partialKnowledgePath}`
);

observations.push(
    (
        `${repository} completed scientific re-analysis: ` +
        `${pipelineResult.knowledgeEntries} knowledge entry/entries, ` +
        `${pipelineResult.supportedKnowledge} supported, ` +
        `${pipelineResult.emergingKnowledge} emerging.`
    )
)

            evidence.push(
                `SOURCE_ID:${result.sourceId}`
            );

            evidence.push(
                `SOURCE_BUNDLE:${result.bundlePath}`
            );

            evidence.push(
                `SOURCE_TOOLCHAIN:${result.intelligence.toolchain}`
            );

            evidence.push(
                `SOURCE_PROTOCOLS:${result.protocols.length}`
            );

            evidence.push(
                `SOURCE_CAPABILITIES:${result.capabilities.length}`
            );

            evidence.push(
                `SOURCE_CLAIMS:${result.claims.length}`
            );

            evidence.push(
                `SOURCE_EXECUTABLE_TARGETS:${result.intelligence.executableTargets.length}`
            );

            observations.push(
                (
                    `${repository} was re-ingested successfully: ` +
                    `${result.protocols.length} protocol(s), ` +
                    `${result.capabilities.length} capability/capabilities, ` +
                    `${result.claims.length} claim(s), ` +
                    `${result.intelligence.executableTargets.length} executable target(s).`
                )
            );

        } catch (error) {

            failedSources++;

            errors.push(
                `${repository}: ${
                    error instanceof Error
                        ? error.message
                        : String(error)
                }`
            );

        }

    }

    /*
 * SUCCESS:
 * every requested repository was re-ingested.
 *
 * INCONCLUSIVE:
 * at least one requested repository could not
 * produce valid re-ingestion evidence.
 *
 * Operational re-ingestion failures must not
 * become scientific FAILURE.
 */
const status:
    ScientificRuntimeExecution[
        "status"
    ] =
        successfulSources === 0
            ? "INCONCLUSIVE"
            : failedSources > 0
                ? "INCONCLUSIVE"
                : "SUCCESS";

    return {

        runtimeExecutionId:
            this.executionId(
                index
            ),

        executionPlanId:
            plan.executionPlanId,

        executionTaskId:
            plan.executionTaskId,

        experimentId:
            plan.experimentId,

        targetId:
            plan.targetId,

        sourceConclusionId:
            plan.sourceConclusionId,

        sourceIds:
                    [
                        ...(
                            plan.sourceIds ??
                            []
                        )
                    ],

                targetEvidenceIds:
            [
                ...(
                    plan.targetEvidenceIds ??
                    []
                )
            ],

        stepId:
            step.stepId,

        stepType:
            step.stepType,

        status,

        runtime:
            "OECL_NATIVE_SOURCE_REINGESTION",

        repository:

            null,


        selectedExecutableTarget:

            null,

        startedAt,

        finishedAt:
            new Date().toISOString(),

        evidence,

        observations: [
            ...observations,
            (
                `${successfulSources} of ${step.requiredInputs.length} ` +
                `source input(s) were actually re-ingested.`
            )
        ],

        errors,

        explanation:
    status === "SUCCESS"
        ? (
            "OECL re-ingested every requested GitHub repository and regenerated its research source bundle."
        )
        : successfulSources === 0
            ? (
                "OECL could not re-ingest any of the requested repository sources, so no valid source re-ingestion result was obtained."
            )
            : (
                "OECL re-ingested part of the requested repository set, but one or more sources failed."
            )

    };

}


    private executeEvidenceCollection(
        index: number,
        plan:
            ScientificExecutionPlan,
        step:
            ScientificExecutionStep,
        completedExecutions:
            ScientificRuntimeExecution[]
    ): ScientificRuntimeExecution {

        const now =
            new Date().toISOString();

        const upstreamExecutions =
            completedExecutions.filter(
                execution =>
                    execution.executionPlanId ===
                        plan.executionPlanId &&
                    (
    execution.stepType ===
        "SOURCE_REINGESTION" ||
    execution.stepType ===
        "TEST_EXECUTION" ||
    execution.stepType ===
        "INVARIANT_VALIDATION" ||
    execution.stepType ===
        "STATIC_ANALYSIS"
) &&
(
    execution.status ===
        "SUCCESS" ||
    execution.status ===
        "FAILURE" ||
    execution.status ===
        "INCONCLUSIVE"
)
            );

        if (
            upstreamExecutions.length === 0
        ) {

            return {

                runtimeExecutionId:
                    this.executionId(
                        index
                    ),

                executionPlanId:
                    plan.executionPlanId,

                executionTaskId:
                    plan.executionTaskId,

                experimentId:
                    plan.experimentId,

                targetId:
                    plan.targetId,

                sourceConclusionId:
                    plan.sourceConclusionId,

                sourceIds:
                    [
                        ...(
                            plan.sourceIds ??
                            []
                        )
                    ],

                targetEvidenceIds:
                    [
                        ...(
                            plan.targetEvidenceIds ??
                            []
                        )
                    ],

                stepId:
                    step.stepId,

                stepType:
                    step.stepType,

                status:
                    "INCONCLUSIVE",

                runtime:
                    "OECL_NATIVE_EVIDENCE_COLLECTION",

                repository:

                    null,


                selectedExecutableTarget:

                    null,


                startedAt:
                    now,

                finishedAt:
                    new Date().toISOString(),

                evidence: [],

                observations: [
                    "No completed executable upstream results were available for evidence collection."
                ],

                errors: [],

                explanation:
                    "Evidence collection could not produce runtime evidence because no completed test, invariant, or static-analysis execution was available."

            };

        }

        const evidence =
            upstreamExecutions.flatMap(
                execution => [
                    `UPSTREAM_RUNTIME_EXECUTION:${execution.runtimeExecutionId}`,
                    `UPSTREAM_STEP_TYPE:${execution.stepType}`,
                    `UPSTREAM_STATUS:${execution.status}`,
                    ...execution.evidence
                ]
            );

        return {

            runtimeExecutionId:
                this.executionId(
                    index
                ),

            executionPlanId:
                plan.executionPlanId,

            executionTaskId:
                plan.executionTaskId,

            experimentId:
                plan.experimentId,

            targetId:
                plan.targetId,

            sourceConclusionId:
                plan.sourceConclusionId,

            sourceIds:
                    [
                        ...(
                            plan.sourceIds ??
                            []
                        )
                    ],

                targetEvidenceIds:
                [
                    ...(
                        plan.targetEvidenceIds ??
                        []
                    )
                ],

            stepId:
                step.stepId,

            stepType:
                step.stepType,

            status:
                "SUCCESS",

            runtime:
                "OECL_NATIVE_EVIDENCE_COLLECTION",

            repository:

                null,


            selectedExecutableTarget:

                null,


            startedAt:
                now,

            finishedAt:
                new Date().toISOString(),

            evidence,

            observations: [
                `Collected runtime evidence from ${upstreamExecutions.length} completed upstream execution(s).`
            ],

            errors: [],

            explanation:
                "OECL collected traceable runtime evidence from completed test, invariant, or static-analysis executions in the same scientific execution plan."

        };

    }
    private async testToolchainAvailable(
        command:
            string,
        workingDirectory:
            string
    ): Promise<boolean> {

        try {

            if (
                command ===
                "forge test"
            ) {

                const probeCommand =
                    process.platform === "win32"
                        ? "where forge"
                        : "command -v forge";

                await execAsync(
    probeCommand,
    {
        cwd:
            workingDirectory,

        timeout:
            TOOLCHAIN_PROBE_TIMEOUT_MS,

        maxBuffer:
            TOOLCHAIN_PROBE_MAX_BUFFER
    }
);

                return true;

            }

            if (
                command ===
                "npx hardhat test"
            ) {

                const npxProbeCommand =
                    process.platform === "win32"
                        ? "where npx"
                        : "command -v npx";

                await execAsync(
    npxProbeCommand,
    {
        cwd:
            workingDirectory,

        timeout:
            TOOLCHAIN_PROBE_TIMEOUT_MS,

        maxBuffer:
            TOOLCHAIN_PROBE_MAX_BUFFER
    }
);

                const hardhatBinary =
                    process.platform === "win32"
                        ? "node_modules\\.bin\\hardhat.cmd"
                        : "node_modules/.bin/hardhat";

                const hardhatProbeCommand =
                    process.platform === "win32"
                        ? (
                            `if exist "${hardhatBinary}" ` +
                            "(exit 0) else (exit 1)"
                        )
                        : `test -x "${hardhatBinary}"`;

                await execAsync(
    hardhatProbeCommand,
    {
        cwd:
            workingDirectory,

        timeout:
            TOOLCHAIN_PROBE_TIMEOUT_MS,

        maxBuffer:
            TOOLCHAIN_PROBE_MAX_BUFFER
    }
);

                return true;

            }

            return false;

        } catch {

            return false;

        }

    }
        private unsupportedExecution(
        index: number,
        plan:
            ScientificExecutionPlan,
        step:
            ScientificExecutionStep,
        reason:
            string
    ): ScientificRuntimeExecution {

        return {

            runtimeExecutionId:
                this.executionId(
                    index
                ),

            executionPlanId:
                plan.executionPlanId,

            executionTaskId:
                plan.executionTaskId,

            experimentId:
                plan.experimentId,

            targetId:
                plan.targetId,

            sourceConclusionId:
                plan.sourceConclusionId,

            sourceIds:
                    [
                        ...(
                            plan.sourceIds ??
                            []
                        )
                    ],

                targetEvidenceIds:
                [
                    ...(
                        plan.targetEvidenceIds ??
                        []
                    )
                ],

            stepId:
                step.stepId,

            stepType:
                step.stepType,

            status:
                "UNSUPPORTED",

            runtime:
                "NO_RUNTIME_ADAPTER",

            repository:

                null,


            selectedExecutableTarget:

                null,

            startedAt:
                null,

            finishedAt:
                null,

            evidence: [],

            observations: [],

            errors: [],

            explanation:
                reason

        };

    }
    private executionId(
        index: number
    ): string {

        return (
            `SCIENTIFIC-RUNTIME-EXECUTION-${String(
                index
            ).padStart(5, "0")}`
        );

    }

    private countStatus(
        executions:
            ScientificRuntimeExecution[],
        status:
            ScientificRuntimeExecution[
                "status"
            ]
    ): number {

        return executions.filter(
            execution =>
                execution.status ===
                status
        ).length;

    }

    private countSuccessfulStep(
        executions:
            ScientificRuntimeExecution[],
        stepType:
            string
    ): number {

        return executions.filter(
            execution =>
                execution.stepType ===
                    stepType &&
                execution.status ===
                    "SUCCESS"
        ).length;

    }

}


