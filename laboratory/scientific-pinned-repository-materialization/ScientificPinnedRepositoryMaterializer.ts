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

import {
    execFile
} from "node:child_process";

import {
    promisify
} from "node:util";

import type {
    ScientificPinnedRepositoryMaterialization
} from "./ScientificPinnedRepositoryMaterialization.js";


const execFileAsync =
    promisify(
        execFile
    );


export class ScientificPinnedRepositoryMaterializer {

    async materialize(
        params: {
            repository: string;
            requiredRevision: string;
            remoteUrl?: string;
            workspaceRoot?: string;
        }
    ): Promise<ScientificPinnedRepositoryMaterialization> {

        const repository =
            params.repository.trim();

        const requiredRevision =
            params.requiredRevision.trim();

        const remoteUrl =
            params.remoteUrl ??
            `https://github.com/${repository}.git`;

        const workspaceRoot =
            params.workspaceRoot ??
            "./external/scientific-pinned";


        /*
         * Scientific execution requires a concrete immutable Git
         * revision. Accept the common SHA-1 and SHA-256 object-id
         * widths only; never interpret branches, tags or HEAD.
         */
        if (
            !/^[0-9a-fA-F]{40}$|^[0-9a-fA-F]{64}$/.test(
                requiredRevision
            )
        ) {

            return this.rejected(
                repository,
                requiredRevision,
                remoteUrl,
                [
                    "Required scientific repository revision is not a full Git object ID."
                ]
            );

        }


        if (
            repository.length ===
                0 ||
            remoteUrl.trim().length ===
                0
        ) {

            return this.rejected(
                repository,
                requiredRevision,
                remoteUrl,
                [
                    "Repository identity or remote URL is empty."
                ]
            );

        }


        /*
         * Physical paths are deliberately compact.
         *
         * Repository and revision remain fully preserved and
         * independently verified in scientific metadata. They do
         * not need to be encoded verbatim into the filesystem path.
         *
         * This avoids platform path-length limits without weakening
         * revision identity.
         */
        const materializationDirectory =
            this.materializationDirectoryName(
                repository,
                requiredRevision
            );

        const localPath =
            join(
                workspaceRoot,
                materializationDirectory
            );


        /*
         * Never reuse an existing working tree for scientific
         * materialization. Every attempt begins from an empty,
         * isolated destination.
         */
        await rm(
            localPath,
            {
                recursive: true,
                force: true
            }
        );


        try {

            await mkdir(
                localPath,
                {
                    recursive: true
                }
            );


            await execFileAsync(
                "git",
                [
                    "init",
                    localPath
                ],
                {
                    encoding: "utf8"
                }
            );


            await execFileAsync(
                "git",
                [
                    "-C",
                    localPath,
                    "remote",
                    "add",
                    "origin",
                    remoteUrl
                ],
                {
                    encoding: "utf8"
                }
            );


            /*
             * Fetch exactly the immutable object requested by the
             * scientific execution requirement.
             *
             * No branch, tag, pull or implicit remote HEAD is used.
             */
            await execFileAsync(
                "git",
                [
                    "-C",
                    localPath,
                    "fetch",
                    "--depth",
                    "1",
                    "origin",
                    requiredRevision
                ],
                {
                    encoding: "utf8"
                }
            );


            await execFileAsync(
                "git",
                [
                    "-C",
                    localPath,
                    "checkout",
                    "--detach",
                    "FETCH_HEAD"
                ],
                {
                    encoding: "utf8"
                }
            );


            const {
                stdout:
                    revisionOutput
            } =
                await execFileAsync(
                    "git",
                    [
                        "-C",
                        localPath,
                        "rev-parse",
                        "HEAD"
                    ],
                    {
                        encoding: "utf8"
                    }
                );


            const observedRevision =
                revisionOutput.trim();


            /*
             * Fetch success alone is insufficient. The checked-out
             * HEAD must exactly equal the revision required by the
             * scientific experiment.
             */
            if (
                observedRevision.toLowerCase() !==
                requiredRevision.toLowerCase()
            ) {

                await rm(
                    localPath,
                    {
                        recursive: true,
                        force: true
                    }
                );


                return this.rejected(
                    repository,
                    requiredRevision,
                    remoteUrl,
                    [
                        (
                            "Materialized repository revision diverges from " +
                            `required revision: observed ${observedRevision}.`
                        )
                    ]
                );

            }


            const {
                stdout:
                    worktreeStatusOutput
            } =
                await execFileAsync(
                    "git",
                    [
                        "-C",
                        localPath,
                        "status",
                        "--porcelain"
                    ],
                    {
                        encoding: "utf8"
                    }
                );


            const worktreeClean =
                worktreeStatusOutput
                    .trim()
                    .length ===
                0;


            if (
                !worktreeClean
            ) {

                await rm(
                    localPath,
                    {
                        recursive: true,
                        force: true
                    }
                );


                return this.rejected(
                    repository,
                    requiredRevision,
                    remoteUrl,
                    [
                        "Materialized pinned repository worktree is not clean."
                    ]
                );

            }


            return {

                repository,

                requiredRevision,

                remoteUrl,

                localPath,

                observedRevision,

                worktreeClean:
                    true,

                status:
                    "MATERIALIZED",

                errors: []

            };

        } catch (error) {

            /*
             * A failed exact fetch must never fall back to remote
             * HEAD, a branch, an existing checkout or another
             * revision.
             */
            await rm(
                localPath,
                {
                    recursive: true,
                    force: true
                }
            );


            return this.rejected(
                repository,
                requiredRevision,
                remoteUrl,
                [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]
            );

        }

    }


    private rejected(
        repository: string,
        requiredRevision: string,
        remoteUrl: string,
        errors: string[]
    ): ScientificPinnedRepositoryMaterialization {

        return {

            repository,

            requiredRevision,

            remoteUrl,

            localPath:
                null,

            observedRevision:
                null,

            worktreeClean:
                null,

            status:
                "REJECTED",

            errors: [
                ...errors
            ]

        };

    }


    private materializationDirectoryName(
        repository: string,
        requiredRevision: string
    ): string {

        /*
         * This digest is only a compact physical workspace key.
         *
         * It is NOT scientific source identity and is never used to
         * establish revision equality. Exact identity continues to
         * require:
         *
         *     observed HEAD === requiredRevision
         *
         * after checkout.
         */
        const digest =
            createHash(
                "sha256"
            )
                .update(
                    repository,
                    "utf8"
                )
                .update(
                    "\0",
                    "utf8"
                )
                .update(
                    requiredRevision.toLowerCase(),
                    "utf8"
                )
                .digest(
                    "hex"
                )
                .slice(
                    0,
                    24
                );

        return `pinned-${digest}`;

    }

}
