import {
    mkdir,
    rm
} from "node:fs/promises";

import {
    join
} from "node:path";

import {
    createHash
} from "node:crypto";

import type {
    ScientificCompositionExecutionRequirement
} from "../scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

import {
    ScientificPinnedRepositoryMaterializer
} from "../scientific-pinned-repository-materialization/ScientificPinnedRepositoryMaterializer.js";

import type {
    ScientificCompositionWorkspaceMaterialization,
    ScientificCompositionWorkspaceSourceMaterialization
} from "./ScientificCompositionWorkspaceMaterialization.js";


export class ScientificCompositionWorkspaceMaterializer {

    async materialize(
        params: {
            requirement:
                ScientificCompositionExecutionRequirement;

            workspaceRoot?:
                string;

            remoteUrls?:
                Record<string, string>;
        }
    ): Promise<ScientificCompositionWorkspaceMaterialization> {

        const requirement =
            params.requirement;

        const workspaceRoot =
            params.workspaceRoot ??
            "./external/scientific-composition-workspaces";

        /*
         * Scientific requirement identity can legitimately become
         * very large because it preserves candidate, constraint,
         * source and revision identity.
         *
         * Never project that complete semantic identity directly
         * into the filesystem. Windows in particular has practical
         * path-length limits, while future scientific candidates may
         * contain even larger evidence sets.
         *
         * The full requirementId remains unchanged in every
         * scientific result. Only its physical workspace locator is
         * compacted deterministically.
         */
        const requirementIdentityHash =
            createHash(
                "sha256"
            )
                .update(
                    requirement.requirementId
                )
                .digest(
                    "hex"
                )
                .slice(
                    0,
                    24
                );


        const requirementDirectory =
            this.safeDirectoryName(
                `composition-${requirementIdentityHash}`
            );


        const workspacePath =
            join(
                workspaceRoot,
                requirementDirectory
            );


        /*
         * Composition materialization is atomic from the scientific
         * execution point of view.
         *
         * Never reuse a prior joint workspace.
         */
        await rm(
            workspacePath,
            {
                recursive: true,
                force: true
            }
        );


        const validationErrors:
            string[] = [];


        if (
            requirement.requirementId
                .trim()
                .length ===
            0
        ) {

            validationErrors.push(
                "Composition execution requirement has no requirement identity."
            );

        }


        if (
            requirement.candidate
                .candidateId
                .trim()
                .length ===
            0
        ) {

            validationErrors.push(
                "Composition execution requirement has no candidate identity."
            );

        }


        const participantASources =
            requirement
                .participantSources
                .filter(
                    source =>
                        source.participantSide ===
                        "A"
                );


        const participantBSources =
            requirement
                .participantSources
                .filter(
                    source =>
                        source.participantSide ===
                        "B"
                );


        if (
            participantASources.length ===
            0
        ) {

            validationErrors.push(
                "Composition execution requirement has no participant A source binding."
            );

        }


        if (
            participantBSources.length ===
            0
        ) {

            validationErrors.push(
                "Composition execution requirement has no participant B source binding."
            );

        }


        for (
            const source
            of requirement.participantSources
        ) {

            if (
                source.participantId
                    .trim()
                    .length ===
                0
            ) {

                validationErrors.push(
                    `Participant ${source.participantSide} has no participant identity.`
                );

            }


            if (
                source.sourceId
                    .trim()
                    .length ===
                0
            ) {

                validationErrors.push(
                    `Participant ${source.participantSide} has no source identity.`
                );

            }


            if (
                source.repository
                    .trim()
                    .length ===
                0
            ) {

                validationErrors.push(
                    `Participant ${source.participantSide} has no repository binding.`
                );

            }


            if (
                source.sourceRevision
                    .trim()
                    .length ===
                0
            ) {

                validationErrors.push(
                    `Participant ${source.participantSide} has no pinned source revision.`
                );

            }

        }


        if (
            validationErrors.length >
            0
        ) {

            return this.rejected(
                requirement,
                validationErrors
            );

        }


        try {

            await mkdir(
                workspacePath,
                {
                    recursive: true
                }
            );


            const pinnedMaterializer =
                new ScientificPinnedRepositoryMaterializer();


            const sourceMaterializations:
                ScientificCompositionWorkspaceSourceMaterialization[] =
                [];


            /*
             * Materialize in deterministic participant/source order.
             *
             * This ordering is operational only and does not imply
             * scientific priority between A and B.
             */
            const sources =
                [
                    ...requirement.participantSources
                ].sort(
                    (left, right) => {

                        const leftKey =
                            [
                                left.participantSide,
                                left.participantId,
                                left.sourceId,
                                left.repository,
                                left.sourceRevision
                            ].join("|");

                        const rightKey =
                            [
                                right.participantSide,
                                right.participantId,
                                right.sourceId,
                                right.repository,
                                right.sourceRevision
                            ].join("|");

                        return leftKey.localeCompare(
                            rightKey
                        );

                    }
                );


            for (
                let index = 0;
                index < sources.length;
                index++
            ) {

                const source =
                    sources[index];


                const participantWorkspace =
                    join(
                        workspacePath,
                        (
                            source.participantSide ===
                            "A"
                                ? "participant-A"
                                : "participant-B"
                        ),
                        String(
                            index + 1
                        ).padStart(
                            3,
                            "0"
                        )
                    );


                const remoteUrl =
                    params.remoteUrls?.[
                        source.repository
                    ];


                const materialized =
                    await pinnedMaterializer
                        .materialize(
                            {
                                repository:
                                    source.repository,

                                requiredRevision:
                                    source.sourceRevision,

                                ...(
                                    remoteUrl
                                        ? {
                                            remoteUrl
                                        }
                                        : {}
                                ),

                                workspaceRoot:
                                    participantWorkspace
                            }
                        );


                if (
                    materialized.status !==
                        "MATERIALIZED" ||
                    materialized.localPath ===
                        null ||
                    materialized.observedRevision ===
                        null ||
                    materialized.worktreeClean !==
                        true
                ) {

                    /*
                     * All-or-nothing:
                     *
                     * If any participant source cannot be pinned
                     * exactly, destroy the entire joint workspace.
                     */
                    await rm(
                        workspacePath,
                        {
                            recursive: true,
                            force: true
                        }
                    );


                    return this.rejected(
                        requirement,
                        [
                            (
                                `Participant ${source.participantSide} ` +
                                `source ${source.sourceId} could not be ` +
                                `materialized at required revision ` +
                                `${source.sourceRevision}.`
                            ),
                            ...materialized.errors
                        ]
                    );

                }


                /*
                 * Do not trust the materializer status alone.
                 * Preserve and re-check the exact scientific identity
                 * returned from the pinned repository boundary.
                 */
                if (
                    materialized.repository !==
                        source.repository ||
                    materialized.requiredRevision
                        .toLowerCase() !==
                        source.sourceRevision
                            .toLowerCase() ||
                    materialized.observedRevision
                        .toLowerCase() !==
                        source.sourceRevision
                            .toLowerCase()
                ) {

                    await rm(
                        workspacePath,
                        {
                            recursive: true,
                            force: true
                        }
                    );


                    return this.rejected(
                        requirement,
                        [
                            (
                                `Participant ${source.participantSide} ` +
                                "materialization identity diverged from " +
                                "the scientific execution requirement."
                            )
                        ]
                    );

                }


                sourceMaterializations.push({

                    participantSide:
                        source.participantSide,

                    participantKind:
                        source.participantKind,

                    participantId:
                        source.participantId,

                    sourceId:
                        source.sourceId,

                    repository:
                        source.repository,

                    requiredRevision:
                        source.sourceRevision,

                    localPath:
                        materialized.localPath,

                    observedRevision:
                        materialized.observedRevision,

                    worktreeClean:
                        true

                });

            }


            /*
             * A scientifically usable composition workspace must
             * contain at least one successfully pinned source for
             * each participant after materialization.
             */
            const materializedA =
                sourceMaterializations.some(
                    source =>
                        source.participantSide ===
                        "A"
                );

            const materializedB =
                sourceMaterializations.some(
                    source =>
                        source.participantSide ===
                        "B"
                );


            if (
                !materializedA ||
                !materializedB
            ) {

                await rm(
                    workspacePath,
                    {
                        recursive: true,
                        force: true
                    }
                );


                return this.rejected(
                    requirement,
                    [
                        "Joint composition workspace did not materialize both participants."
                    ]
                );

            }


            return {

                requirementId:
                    requirement.requirementId,

                candidateId:
                    requirement.candidate.candidateId,

                workspacePath,

                sourceMaterializations,

                status:
                    "MATERIALIZED",

                errors: []

            };

        } catch (error) {

            await rm(
                workspacePath,
                {
                    recursive: true,
                    force: true
                }
            );


            return this.rejected(
                requirement,
                [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]
            );

        }

    }


    private rejected(
        requirement:
            ScientificCompositionExecutionRequirement,
        errors:
            string[]
    ): ScientificCompositionWorkspaceMaterialization {

        return {

            requirementId:
                requirement.requirementId,

            candidateId:
                requirement.candidate.candidateId,

            workspacePath:
                null,

            /*
             * Never expose a partial scientific composition as a
             * usable workspace result.
             */
            sourceMaterializations:
                [],

            status:
                "REJECTED",

            errors: [
                ...errors
            ]

        };

    }


    private safeDirectoryName(
        value: string
    ): string {

        const normalized =
            value
                .trim()
                .replace(
                    /[^a-zA-Z0-9._-]+/g,
                    "__"
                )
                .replace(
                    /^_+|_+$/g,
                    ""
                );

        return (
            normalized.length >
            0
                ? normalized
                : "composition"
        );

    }

}
