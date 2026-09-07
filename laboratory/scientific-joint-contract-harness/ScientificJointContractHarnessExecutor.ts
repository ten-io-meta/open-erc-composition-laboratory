import {
    mkdir,
    rm,
    writeFile
} from "node:fs/promises";

import {
    basename,
    join
} from "node:path";

import {
    execFile
} from "node:child_process";

import {
    promisify
} from "node:util";

import type {
    ScientificCompositionWorkspaceMaterialization,
    ScientificCompositionWorkspaceSourceMaterialization
} from "../scientific-composition-workspace-materialization/ScientificCompositionWorkspaceMaterialization.js";

import type {
    ScientificCompositionExecutionRequirement
} from "../scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

import type {
    ScientificCompositionConstraintObservation
} from "../scientific-composition-constraint-evaluation/ScientificCompositionConstraintObservation.js";

import type {
    ScientificJointContractHarnessDriverParticipantReport,
    ScientificJointContractHarnessDriverReport,
    ScientificJointContractHarnessExecution,
    ScientificJointContractHarnessParticipantSide,
    ScientificJointContractHarnessRecipe
} from "./ScientificJointContractHarness.js";


const execFileAsync =
    promisify(
        execFile
    );


const DRIVER_RESULT_PREFIX =
    "OECL_JOINT_EXECUTION_RESULT=";


export class ScientificJointContractHarnessExecutor {

    async execute(
        params: {
            workspace:
                ScientificCompositionWorkspaceMaterialization;

            recipe:
                ScientificJointContractHarnessRecipe;

            requirement?:
                ScientificCompositionExecutionRequirement;
        }
    ): Promise<ScientificJointContractHarnessExecution> {

        const {
            workspace,
            recipe,
            requirement
        } =
            params;


        let requirementPath:
            string | null =
            null;


        /*
         * A rejected or incomplete workspace can never enter
         * physical joint contract execution.
         */
        if (
            workspace.status !==
                "MATERIALIZED" ||
            workspace.workspacePath ===
                null
        ) {

            return this.rejected(
                recipe.recipeId,
                [
                    "Joint contract execution requires a MATERIALIZED composition workspace."
                ]
            );

        }


        const participantA =
            this.singleParticipantSource(
                workspace,
                "A"
            );

        const participantB =
            this.singleParticipantSource(
                workspace,
                "B"
            );


        if (
            participantA ===
            null ||
            participantB ===
            null
        ) {

            return this.rejected(
                recipe.recipeId,
                [
                    "Joint contract execution requires exactly one materialized source root for participant A and participant B."
                ]
            );

        }


        const sourceValidationErrors =
            [
                ...this.validateParticipantSource(
                    participantA
                ),
                ...this.validateParticipantSource(
                    participantB
                )
            ];


        if (
            sourceValidationErrors.length >
            0
        ) {

            return this.rejected(
                recipe.recipeId,
                sourceValidationErrors
            );

        }


        if (
            recipe.recipeId
                .trim()
                .length ===
            0
        ) {

            return this.rejected(
                recipe.recipeId,
                [
                    "Joint contract harness recipe has no recipe identity."
                ]
            );

        }


        if (
            recipe.driver.source
                .trim()
                .length ===
            0
        ) {

            return this.rejected(
                recipe.recipeId,
                [
                    "Joint contract harness driver source is empty."
                ]
            );

        }


        const driverFileName =
            recipe.driver.fileName.trim();


        /*
         * The recipe supplies only a file name, never a filesystem
         * path. Prevent traversal outside the isolated participant
         * checkout.
         */
        if (
            driverFileName.length ===
                0 ||
            basename(
                driverFileName
            ) !==
                driverFileName
        ) {

            return this.rejected(
                recipe.recipeId,
                [
                    "Joint contract harness driver file name is invalid."
                ]
            );

        }


        const participantSources =
            [
                {
                    ...participantA
                },
                {
                    ...participantB
                }
            ];


        const startedAt =
            new Date().toISOString();

        const stdoutParts:
            string[] = [];

        const stderrParts:
            string[] = [];


        let driverPath:
            string | null =
            null;


        try {

            /*
             * =====================================================
             * PARTICIPANT PREPARATION
             * =====================================================
             *
             * Each command executes inside the exact pinned source
             * root associated with its participant.
             *
             * The generic executor does not know what these commands
             * mean: npm, forge, compilation, artifact generation,
             * custom scripts, etc. are recipe concerns.
             */
            for (
                const step
                of recipe.preparationSteps
            ) {

                const participant =
                    step.participantSide ===
                    "A"
                        ? participantA
                        : participantB;


                const invocation =
                    this.commandInvocation(
                        step.command,
                        step.args
                    );


                const {
                    stdout,
                    stderr
                } =
                    await execFileAsync(
                        invocation.command,
                        invocation.args,
                        {
                            cwd:
                                participant.localPath,

                            env: {
                                ...process.env,
                                ...(step.env ?? {})
                            },

                            encoding:
                                "utf8",

                            maxBuffer:
                                16 * 1024 * 1024
                        }
                    );


                if (
                    stdout.length >
                    0
                ) {

                    stdoutParts.push(
                        [
                            `[${step.stepId}]`,
                            stdout
                        ].join(
                            "\n"
                        )
                    );

                }


                if (
                    stderr.length >
                    0
                ) {

                    stderrParts.push(
                        [
                            `[${step.stepId}]`,
                            stderr
                        ].join(
                            "\n"
                        )
                    );

                }

            }


            /*
             * =====================================================
             * JOINT DRIVER
             * =====================================================
             *
             * The driver executes from one selected participant's
             * dependency environment, but receives BOTH exact source
             * roots explicitly.
             *
             * The file is written below .git so the temporary harness
             * does not modify the source worktree.
             */
            const driverParticipant =
                recipe.driver.participantSide ===
                "A"
                    ? participantA
                    : participantB;


            const driverRuntimeDirectory =
                join(
                    driverParticipant.localPath,
                    ".git",
                    "oecl-joint-runtime"
                );


            await mkdir(
                driverRuntimeDirectory,
                {
                    recursive: true
                }
            );


            if (
                requirement !==
                undefined
            ) {

                requirementPath =
                    join(
                        driverRuntimeDirectory,
                        "composition-execution-requirement.json"
                    );


                await writeFile(
                    requirementPath,
                    JSON.stringify(
                        requirement
                    ),
                    "utf8"
                );

            }


            driverPath =
                join(
                    driverRuntimeDirectory,
                    driverFileName
                );


            await writeFile(
                driverPath,
                recipe.driver.source,
                "utf8"
            );


            const {
                stdout:
                    driverStdout,
                stderr:
                    driverStderr
            } =
                await execFileAsync(
                    "node",
                    [
                        driverPath
                    ],
                    {
                        cwd:
                            driverParticipant.localPath,

                        env: {
                            ...process.env,

                            ...(recipe.driver.env ?? {}),

                            OECL_JOINT_WORKSPACE_ROOT:
                                workspace.workspacePath,

                            OECL_PARTICIPANT_A_ROOT:
                                participantA.localPath,

                            OECL_PARTICIPANT_B_ROOT:
                                participantB.localPath,

                            ...(
                                requirementPath ===
                                    null
                                    ? {}
                                    : {
                                        OECL_COMPOSITION_EXECUTION_REQUIREMENT_PATH:
                                            requirementPath
                                    }
                            )
                        },

                        encoding:
                            "utf8",

                        maxBuffer:
                            16 * 1024 * 1024
                    }
                );


            if (
                driverStdout.length >
                0
            ) {

                stdoutParts.push(
                    driverStdout
                );

            }


            if (
                driverStderr.length >
                0
            ) {

                stderrParts.push(
                    driverStderr
                );

            }


            const driverReport =
                this.parseDriverReport(
                    driverStdout
                );


            /*
             * =====================================================
             * BILATERAL EXECUTION ADMISSION
             * =====================================================
             *
             * A generic executor only admits the run as EXECUTED if
             * the driver proves that both participant contracts were
             * executed inside one shared runtime.
             *
             * This is operational evidence only.
             */
            const reportErrors =
                this.validateDriverReport(
                    driverReport
                );


            if (
                reportErrors.length >
                0
            ) {

                return {

                    recipeId:
                        recipe.recipeId,

                    status:
                        "REJECTED",

                    workspacePath:
                        workspace.workspacePath,

                    participantSources,

                    driverReport:
                        null,

                    startedAt,

                    finishedAt:
                        new Date().toISOString(),

                    stdout:
                        stdoutParts.join(
                            "\n"
                        ),

                    stderr:
                        stderrParts.join(
                            "\n"
                        ),

                    errors:
                        reportErrors,

                    scientificPolarity:
                        "NEUTRAL",

                    explanation:
                        "OECL rejected the joint contract harness result because the driver did not establish bilateral execution inside one shared runtime."

                };

            }


            return {

                recipeId:
                    recipe.recipeId,

                status:
                    "EXECUTED",

                workspacePath:
                    workspace.workspacePath,

                participantSources,

                driverReport:
                    this.cloneDriverReport(
                        driverReport
                    ),

                startedAt,

                finishedAt:
                    new Date().toISOString(),

                stdout:
                    stdoutParts.join(
                        "\n"
                    ),

                stderr:
                    stderrParts.join(
                        "\n"
                    ),

                errors:
                    [],

                /*
                 * Successful bilateral execution is deliberately
                 * insufficient to establish SUPPORT or CHALLENGE.
                 */
                scientificPolarity:
                    "NEUTRAL",

                explanation:
                    "OECL executed both composition participants inside one shared runtime and preserved structured bilateral execution evidence. Composition scientific polarity remains neutral until explicit joint evaluation criteria are applied."

            };

        } catch (error) {

            return {

                recipeId:
                    recipe.recipeId,

                status:
                    "REJECTED",

                workspacePath:
                    workspace.workspacePath,

                participantSources,

                driverReport:
                    null,

                startedAt,

                finishedAt:
                    new Date().toISOString(),

                stdout:
                    stdoutParts.join(
                        "\n"
                    ),

                stderr:
                    stderrParts.join(
                        "\n"
                    ),

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ],

                scientificPolarity:
                    "NEUTRAL",

                explanation:
                    "OECL rejected joint contract execution because preparation or joint driver execution failed."

            };

        } finally {

            if (
                requirementPath !==
                null
            ) {

                await rm(
                    requirementPath,
                    {
                        force: true
                    }
                ).catch(
                    () => undefined
                );

            }


            if (
                driverPath !==
                null
            ) {

                await rm(
                    driverPath,
                    {
                        force: true
                    }
                ).catch(
                    () => undefined
                );

            }

        }

    }


    private commandInvocation(
        command: string,
        args: string[]
    ): {
        command: string;
        args: string[];
    } {

        /*
         * Windows .cmd/.bat files are command-shell scripts rather
         * than native executables. child_process.execFile cannot
         * reliably spawn them directly and may return EINVAL.
         *
         * Route only those script types through the platform command
         * processor. Native executables remain shell-free.
         *
         * This is operational portability only; it does not alter
         * participant identity, recipe semantics or scientific
         * evidence.
         */
        if (
            process.platform ===
                "win32" &&
            /\.(?:cmd|bat)$/i.test(
                command
            )
        ) {

            return {

                command:
                    process.env.ComSpec ??
                    "cmd.exe",

                args: [
                    "/d",
                    "/c",
                    command,
                    ...args
                ]

            };

        }


        return {

            command,

            args: [
                ...args
            ]

        };

    }


    private singleParticipantSource(
        workspace:
            ScientificCompositionWorkspaceMaterialization,
        participantSide:
            ScientificJointContractHarnessParticipantSide
    ):
        ScientificCompositionWorkspaceSourceMaterialization | null {

        const matches =
            workspace
                .sourceMaterializations
                .filter(
                    source =>
                        source.participantSide ===
                        participantSide
                );


        if (
            matches.length !==
            1
        ) {

            return null;

        }


        return matches[0];

    }


    private validateParticipantSource(
        source:
            ScientificCompositionWorkspaceSourceMaterialization
    ): string[] {

        const errors:
            string[] = [];


        if (
            source.localPath
                .trim()
                .length ===
            0
        ) {

            errors.push(
                `Participant ${source.participantSide} has no materialized source path.`
            );

        }


        if (
            source.requiredRevision
                .trim()
                .length ===
            0 ||
            source.observedRevision
                .trim()
                .length ===
            0
        ) {

            errors.push(
                `Participant ${source.participantSide} has incomplete pinned revision identity.`
            );

        } else if (
            source.requiredRevision
                .toLowerCase() !==
            source.observedRevision
                .toLowerCase()
        ) {

            errors.push(
                `Participant ${source.participantSide} observed revision diverges from its required revision.`
            );

        }


        if (
            source.worktreeClean !==
            true
        ) {

            errors.push(
                `Participant ${source.participantSide} materialized worktree is not admitted as clean.`
            );

        }


        return errors;

    }


    private parseDriverReport(
        stdout: string
    ): ScientificJointContractHarnessDriverReport {

        const reportLines =
            stdout
                .split(
                    /\r?\n/
                )
                .filter(
                    line =>
                        line.startsWith(
                            DRIVER_RESULT_PREFIX
                        )
                );


        if (
            reportLines.length !==
            1
        ) {

            throw new Error(
                (
                    "Joint harness driver must emit exactly one " +
                    `${DRIVER_RESULT_PREFIX} record.`
                )
            );

        }


        const payload =
            reportLines[0]
                .slice(
                    DRIVER_RESULT_PREFIX.length
                );


        const parsed:
            unknown =
            JSON.parse(
                payload
            );


        if (
            !this.isRecord(
                parsed
            )
        ) {

            throw new Error(
                "Joint harness driver result is not an object."
            );

        }


        const participantA =
            this.parseParticipantReport(
                parsed.participantA,
                "A"
            );

        const participantB =
            this.parseParticipantReport(
                parsed.participantB,
                "B"
            );


        if (
            typeof parsed.executionKind !==
                "string" ||
            parsed.executionKind
                .trim()
                .length ===
                0
        ) {

            throw new Error(
                "Joint harness driver result has no execution kind."
            );

        }


        if (
            !(
                typeof parsed.chainId ===
                    "string" ||
                typeof parsed.chainId ===
                    "number"
            )
        ) {

            throw new Error(
                "Joint harness driver result has no valid chain identity."
            );

        }


        if (
            typeof parsed.sharedRuntime !==
            "boolean"
        ) {

            throw new Error(
                "Joint harness driver result has no shared-runtime observation."
            );

        }


        if (
            !Array.isArray(
                parsed.observations
            ) ||
            !parsed.observations.every(
                observation =>
                    typeof observation ===
                    "string"
            )
        ) {

            throw new Error(
                "Joint harness driver observations are invalid."
            );

        }


        const constraintObservations =
            this.parseConstraintObservations(
                parsed.constraintObservations
            );


        if (
            parsed.scientificPolarity !==
            "NEUTRAL"
        ) {

            throw new Error(
                "Generic joint harness driver attempted to claim non-neutral scientific polarity."
            );

        }


        if (
            typeof parsed.conclusion !==
                "string" ||
            parsed.conclusion
                .trim()
                .length ===
                0
        ) {

            throw new Error(
                "Joint harness driver conclusion is missing."
            );

        }


        return {

            executionKind:
                parsed.executionKind,

            chainId:
                parsed.chainId,

            sharedRuntime:
                parsed.sharedRuntime,

            participantA,

            participantB,

            observations: [
                ...parsed.observations
            ],

            constraintObservations:
                constraintObservations.map(
                    observation => ({
                        ...observation,

                        evidence: [
                            ...observation.evidence
                        ]
                    })
                ),

            scientificPolarity:
                "NEUTRAL",

            conclusion:
                parsed.conclusion

        };

    }


    private parseConstraintObservations(
        value:
            unknown
    ): ScientificCompositionConstraintObservation[] {

        if (
            value ===
            undefined
        ) {

            return [];

        }


        if (
            !Array.isArray(
                value
            )
        ) {

            throw new Error(
                "Joint harness constraint observations are not an array."
            );

        }


        return value.map(
            (
                observation,
                index
            ) => {

                if (
                    !this.isRecord(
                        observation
                    )
                ) {

                    throw new Error(
                        `Joint harness constraint observation ${index} is not an object.`
                    );

                }


                if (
                    typeof observation.observationId !==
                        "string" ||
                    observation.observationId
                        .trim()
                        .length ===
                        0
                ) {

                    throw new Error(
                        `Joint harness constraint observation ${index} has no observation identity.`
                    );

                }


                if (
                    typeof observation.candidateId !==
                        "string" ||
                    observation.candidateId
                        .trim()
                        .length ===
                        0
                ) {

                    throw new Error(
                        `Joint harness constraint observation ${index} has no candidate identity.`
                    );

                }


                if (
                    typeof observation.constraintId !==
                        "string" ||
                    observation.constraintId
                        .trim()
                        .length ===
                        0
                ) {

                    throw new Error(
                        `Joint harness constraint observation ${index} has no constraint identity.`
                    );

                }


                if (
                    observation.participantSide !==
                        "A" &&
                    observation.participantSide !==
                        "B"
                ) {

                    throw new Error(
                        `Joint harness constraint observation ${index} has invalid participant side.`
                    );

                }


                if (
                    observation.verdict !==
                        "PRESERVED" &&
                    observation.verdict !==
                        "VIOLATED"
                ) {

                    throw new Error(
                        `Joint harness constraint observation ${index} has invalid verdict.`
                    );

                }


                if (
                    !Array.isArray(
                        observation.evidence
                    ) ||
                    !observation.evidence.every(
                        evidence =>
                            typeof evidence ===
                            "string"
                    )
                ) {

                    throw new Error(
                        `Joint harness constraint observation ${index} has invalid evidence.`
                    );

                }


                return {

                    observationId:
                        observation.observationId,

                    candidateId:
                        observation.candidateId,

                    constraintId:
                        observation.constraintId,

                    participantSide:
                        observation.participantSide,

                    verdict:
                        observation.verdict,

                    evidence: [
                        ...observation.evidence
                    ]

                };

            }
        );

    }


    private parseParticipantReport(
        value: unknown,
        participantSide:
            ScientificJointContractHarnessParticipantSide
    ): ScientificJointContractHarnessDriverParticipantReport {

        if (
            !this.isRecord(
                value
            )
        ) {

            throw new Error(
                `Joint harness participant ${participantSide} report is missing.`
            );

        }


        if (
            typeof value.executed !==
            "boolean"
        ) {

            throw new Error(
                `Joint harness participant ${participantSide} execution state is invalid.`
            );

        }


        if (
            !Array.isArray(
                value.contractAddresses
            ) ||
            !value.contractAddresses.every(
                address =>
                    typeof address ===
                    "string"
            )
        ) {

            throw new Error(
                `Joint harness participant ${participantSide} contract addresses are invalid.`
            );

        }


        if (
            !Array.isArray(
                value.transactionHashes
            ) ||
            !value.transactionHashes.every(
                hash =>
                    typeof hash ===
                    "string"
            )
        ) {

            throw new Error(
                `Joint harness participant ${participantSide} transaction hashes are invalid.`
            );

        }


        return {

            executed:
                value.executed,

            contractAddresses: [
                ...value.contractAddresses
            ],

            transactionHashes: [
                ...value.transactionHashes
            ]

        };

    }


    private validateDriverReport(
        report:
            ScientificJointContractHarnessDriverReport
    ): string[] {

        const errors:
            string[] = [];


        if (
            report.sharedRuntime !==
            true
        ) {

            errors.push(
                "Joint harness participants did not execute inside one shared runtime."
            );

        }


        if (
            report.participantA
                .executed !==
            true
        ) {

            errors.push(
                "Joint harness did not establish participant A execution."
            );

        }


        if (
            report.participantB
                .executed !==
            true
        ) {

            errors.push(
                "Joint harness did not establish participant B execution."
            );

        }


        if (
            report.participantA
                .contractAddresses
                .length ===
            0 ||
            report.participantA
                .transactionHashes
                .length ===
            0
        ) {

            errors.push(
                "Joint harness participant A lacks contract and transaction evidence."
            );

        }


        if (
            report.participantB
                .contractAddresses
                .length ===
            0 ||
            report.participantB
                .transactionHashes
                .length ===
            0
        ) {

            errors.push(
                "Joint harness participant B lacks contract and transaction evidence."
            );

        }


        if (
            report.scientificPolarity !==
            "NEUTRAL"
        ) {

            errors.push(
                "Generic joint execution attempted to establish composition scientific polarity."
            );

        }


        return errors;

    }


    private cloneDriverReport(
        report:
            ScientificJointContractHarnessDriverReport
    ): ScientificJointContractHarnessDriverReport {

        return {

            executionKind:
                report.executionKind,

            chainId:
                report.chainId,

            sharedRuntime:
                report.sharedRuntime,

            participantA: {

                executed:
                    report.participantA.executed,

                contractAddresses: [
                    ...report
                        .participantA
                        .contractAddresses
                ],

                transactionHashes: [
                    ...report
                        .participantA
                        .transactionHashes
                ]

            },

            participantB: {

                executed:
                    report.participantB.executed,

                contractAddresses: [
                    ...report
                        .participantB
                        .contractAddresses
                ],

                transactionHashes: [
                    ...report
                        .participantB
                        .transactionHashes
                ]

            },

            observations: [
                ...report.observations
            ],

            constraintObservations:
                (
                    report.constraintObservations ??
                    []
                ).map(
                    observation => ({
                        ...observation,

                        evidence: [
                            ...observation.evidence
                        ]
                    })
                ),

            scientificPolarity:
                "NEUTRAL",

            conclusion:
                report.conclusion

        };

    }


    private rejected(
        recipeId: string,
        errors: string[]
    ): ScientificJointContractHarnessExecution {

        return {

            recipeId,

            status:
                "REJECTED",

            workspacePath:
                null,

            participantSources:
                [],

            driverReport:
                null,

            startedAt:
                null,

            finishedAt:
                null,

            stdout:
                "",

            stderr:
                "",

            errors: [
                ...errors
            ],

            scientificPolarity:
                "NEUTRAL",

            explanation:
                "OECL rejected joint contract execution before any bilateral contract harness was admitted."

        };

    }


    private isRecord(
        value: unknown
    ): value is Record<string, any> {

        return (
            typeof value ===
                "object" &&
            value !==
                null &&
            !Array.isArray(
                value
            )
        );

    }

}
