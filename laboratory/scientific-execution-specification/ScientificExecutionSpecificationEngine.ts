import type {
    ScientificExecutionTargetResolutionResult
} from "../scientific-execution-target-resolution/ScientificExecutionTargetResolutionResult.js";

import type {
    ScientificExecutionPlan
} from "../scientific-execution-plan/ScientificExecutionPlan.js";

import type {
    ScientificExecutionPlanResult
} from "../scientific-execution-plan/ScientificExecutionPlanResult.js";

import type {
    ScientificExecutionSpecification
} from "./ScientificExecutionSpecification.js";

import type {
    ScientificExecutionSpecificationResult
} from "./ScientificExecutionSpecificationResult.js";


export class ScientificExecutionSpecificationEngine {

    build(
        campaignId: string,
        plans:
            ScientificExecutionPlanResult,
        targetResolution:
            ScientificExecutionTargetResolutionResult,
        repositoryToolchains:
            Record<
                string,
                | "FOUNDRY"
                | "HARDHAT"
                | "MIXED"
                | "UNKNOWN"
            >,
        repositoryLocalPaths:
            Record<
                string,
                string
            >
    ): ScientificExecutionSpecificationResult {

        try {

            const specifications:
                ScientificExecutionSpecification[] = [];

            let counter = 1;

            for (
                const plan
                of plans.plans ?? []
            ) {

                for (
                    const step
                    of plan.steps ?? []
                ) {

                    if (
                        step.stepType !== "TEST_EXECUTION" &&
                        step.stepType !== "INVARIANT_VALIDATION" &&
                        step.stepType !== "STATIC_ANALYSIS"
                    ) {
                        continue;
                    }

                    const unresolvedReasons:
                        string[] = [];

                    /*
                     * Resolve the scientific executable target first.
                     *
                     * Once a concrete target has been resolved, its
                     * repository becomes authoritative for execution.
                     */
                    const resolvedTarget =
                        targetResolution.resolutions.find(
                            resolution =>
                                resolution.executionTaskId ===
                                    plan.executionTaskId &&
                                resolution.experimentId ===
                                    plan.experimentId &&
                                resolution.resolutionStatus ===
                                    "RESOLVED"
                        );

                    const selectedExecutableTarget =
                        resolvedTarget
                            ?.selectedExecutableTarget ??
                        null;

                    /*
                     * Legacy plan-based repository resolution remains
                     * only as a fallback when no structured executable
                     * target has been selected.
                     */
                    const repository =
                        selectedExecutableTarget
                            ?.repository ??
                        this.repositoryForPlan(
                            plan,
                            repositoryToolchains,
                            repositoryLocalPaths
                        );

                    const toolchain =
                        repository
                            ? repositoryToolchains[
                                repository
                            ] ?? "UNKNOWN"
                            : "UNKNOWN";

                    if (!repository) {
                        unresolvedReasons.push(
                            "No concrete repository could be resolved for the execution step."
                        );
                    }

                    const command =
                        this.commandFor(
                            step.stepType,
                            repository,
                            toolchain
                        );

                    if (!command) {
                        unresolvedReasons.push(
                            "No executable command could be resolved for the execution step."
                        );
                    }

                    const workingDirectory:
                        string | null =
                            repository
                                ? repositoryLocalPaths[
                                    repository
                                ] ?? null
                                : null;

                    if (!workingDirectory) {
                        unresolvedReasons.push(
                            "No local working directory could be resolved for the target repository."
                        );
                    }

                    const testSelector =
                        step.stepType ===
                        "TEST_EXECUTION"
                            ? (
                                selectedExecutableTarget
                                    ?.type === "TEST"
                                    ? selectedExecutableTarget.selector
                                    : (
                                        resolvedTarget
                                            ?.testSelector ??
                                        this.selectorFor(
                                            step.requiredInputs
                                        )
                                    )
                            )
                            : null;

                    const invariantSelector =
                        step.stepType ===
                        "INVARIANT_VALIDATION"
                            ? (
                                selectedExecutableTarget
                                    ?.type === "INVARIANT"
                                    ? selectedExecutableTarget.selector
                                    : (
                                        resolvedTarget
                                            ?.invariantSelector ??
                                        resolvedTarget
                                            ?.testSelector ??
                                        this.selectorFor(
                                            step.requiredInputs
                                        )
                                    )
                            )
                            : null;

                    /*
                     * A RESOLVED test/invariant target must carry its
                     * structured physical identity. Otherwise the
                     * specification cannot claim reproducible target
                     * resolution.
                     */
                    const requiresExecutableTarget =
                        step.stepType ===
                            "TEST_EXECUTION" ||
                        step.stepType ===
                            "INVARIANT_VALIDATION";

                    if (
                        requiresExecutableTarget &&
                        resolvedTarget &&
                        !selectedExecutableTarget
                    ) {
                        unresolvedReasons.push(
                            "The scientific target was resolved without a structured executable target identity."
                        );
                    }

                    /*
                     * Guard against accidental repository divergence.
                     */
                    if (
                        selectedExecutableTarget &&
                        repository !==
                            selectedExecutableTarget.repository
                    ) {
                        unresolvedReasons.push(
                            "The execution repository diverges from the selected executable target repository."
                        );
                    }

                    const resolutionStatus =
                        unresolvedReasons.length === 0
                            ? "EXECUTABLE"
                            : "UNRESOLVED";

                    specifications.push({

                        specificationId:
                            `SCIENTIFIC-EXECUTION-SPECIFICATION-${String(
                                counter++
                            ).padStart(5, "0")}`,

                        experimentId:
                            plan.experimentId,

                        executionTaskId:
                            plan.executionTaskId,

                        executionPlanId:
                            plan.executionPlanId,

                        stepId:
                            step.stepId,

                        specificationType:
                            step.stepType,

                        repository,

                        selectedExecutableTarget,

                        workingDirectory,

                        command,

                        testSelector,

                        invariantSelector,

                        supportCondition:
                            plan.supportCondition,

                        challengeCondition:
                            plan.challengeCondition,

                        scientificCriteria:
                            plan.scientificCriteria,

                        scientificPolarity:
                            resolvedTarget
                                ?.scientificPolarity ??
                            "NEUTRAL",

                        expectedExitCode:
                            command
                                ? 0
                                : null,

                        resolutionStatus,

                        unresolvedReasons,

                        successCriteria:
                            [
                                ...(plan.successCriteria ?? [])
                            ],

                        failureCriteria:
                            [
                                ...(plan.failureCriteria ?? [])
                            ],

                        generatedAt:
                            new Date().toISOString()

                    });

                }

            }

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                specifications,

                statistics: {

                    total:
                        specifications.length,

                    testExecution:
                        this.countType(
                            specifications,
                            "TEST_EXECUTION"
                        ),

                    invariantValidation:
                        this.countType(
                            specifications,
                            "INVARIANT_VALIDATION"
                        ),

                    staticAnalysis:
                        this.countType(
                            specifications,
                            "STATIC_ANALYSIS"
                        ),

                    executable:
                        specifications.filter(
                            item =>
                                item.resolutionStatus ===
                                "EXECUTABLE"
                        ).length,

                    unresolved:
                        specifications.filter(
                            item =>
                                item.resolutionStatus ===
                                "UNRESOLVED"
                        ).length

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                specifications: [],

                statistics: {

                    total: 0,

                    testExecution: 0,

                    invariantValidation: 0,

                    staticAnalysis: 0,

                    executable: 0,

                    unresolved: 0

                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]

            };

        }

    }


    private repositoryForPlan(
        plan:
            ScientificExecutionPlan,
        repositoryToolchains:
            Record<
                string,
                | "FOUNDRY"
                | "HARDHAT"
                | "MIXED"
                | "UNKNOWN"
            >,
        repositoryLocalPaths:
            Record<
                string,
                string
            >
    ): string | null {

        const sourceReingestionStep =
            plan.steps.find(
                step =>
                    step.stepType ===
                    "SOURCE_REINGESTION"
            );

        if (!sourceReingestionStep) {
            return null;
        }

        const repositories =
            (
                sourceReingestionStep.requiredInputs ??
                []
            ).filter(
                input =>
                    /^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i.test(
                        input
                    )
            );

        /*
         * Prefer a repository for which OECL already
         * knows both the local checkout and a usable
         * execution toolchain.
         */
        for (
            const repository
            of repositories
        ) {

            const toolchain =
                repositoryToolchains[
                    repository
                ];

            const localPath =
                repositoryLocalPaths[
                    repository
                ];

            if (
                localPath &&
                (
                    toolchain === "FOUNDRY" ||
                    toolchain === "HARDHAT" ||
                    toolchain === "MIXED"
                )
            ) {
                return repository;
            }

        }

        /*
         * If no executable repository is known,
         * preserve the first repository candidate
         * for traceability. The specification will
         * remain UNRESOLVED.
         */
        return repositories[0] ?? null;

    }


    private commandFor(
        specificationType:
            ScientificExecutionSpecification[
                "specificationType"
            ],
        repository:
            string | null,
        toolchain:
            | "FOUNDRY"
            | "HARDHAT"
            | "MIXED"
            | "UNKNOWN"
    ): string | null {

        if (!repository) {
            return null;
        }

        switch (
            specificationType
        ) {

            case "TEST_EXECUTION":

                if (
                    toolchain === "FOUNDRY"
                ) {
                    return "forge test";
                }

                if (
                    toolchain === "HARDHAT"
                ) {
                    return "npx hardhat test";
                }

                if (
                    toolchain === "MIXED"
                ) {
                    return "forge test";
                }

                return null;

            case "INVARIANT_VALIDATION":

                switch (toolchain) {

                    case "HARDHAT":
                        return "npx hardhat test";

                    case "FOUNDRY":
                        return "forge test";

                    case "MIXED":
                        return "forge test";

                    default:
                        return null;

                }

            case "STATIC_ANALYSIS":

                return null;

        }

    }


    private selectorFor(
        requiredInputs:
            string[]
    ): string | null {

        for (
            const input
            of requiredInputs ?? []
        ) {

            if (
                input.startsWith(
                    "TEST:"
                ) ||
                input.startsWith(
                    "INVARIANT:"
                )
            ) {
                return input;
            }

        }

        return null;

    }


    private countType(
        specifications:
            ScientificExecutionSpecification[],
        type:
            ScientificExecutionSpecification[
                "specificationType"
            ]
    ): number {

        return specifications.filter(
            item =>
                item.specificationType ===
                type
        ).length;

    }

}