import { mkdir, rm } from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";

import type { GitHubRepositoryMetadata } from "./GitHubRepositoryMetadata.js";

const execFileAsync = promisify(execFile);

export class GitHubRepositoryLoader {

    async load(params: {
        owner: string;
        repo: string;
        branch?: string;
        forceFresh?: boolean;
    }): Promise<GitHubRepositoryMetadata> {

        const url =
            `https://github.com/${params.owner}/${params.repo}.git`;

        const localPath =
            `./external/github/${params.owner}/${params.repo}`;

        await mkdir(
            `./external/github/${params.owner}`,
            {
                recursive: true
            }
        );

        if (params.forceFresh) {
            await rm(
                localPath,
                {
                    recursive: true,
                    force: true
                }
            );
        }

        try {

            await execFileAsync(
                "git",
                [
                    "clone",
                    "--depth",
                    "1",
                    url,
                    localPath
                ]
            );

        } catch {

            await execFileAsync(
                "git",
                [
                    "-C",
                    localPath,
                    "pull",
                    "--ff-only"
                ]
            );

        }

        const {
            stdout: commitShaOutput
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

        const commitSha =
            commitShaOutput.trim();

        const {
            stdout: worktreeStatusOutput
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
            worktreeStatusOutput.trim().length === 0;

        return {
            owner:
                params.owner,

            repo:
                params.repo,

            url:
                `https://github.com/${params.owner}/${params.repo}`,

            localPath,

            defaultBranch:
                params.branch,

            commitSha,

            worktreeClean
        };
    }

}