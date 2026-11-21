import { mkdir, rm, stat } from "fs/promises";
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

        // An existing checked-out commit is intentional immutable evidence.
        // Do not "pull" a detached HEAD: that fails and could silently
        // replace the scientific source revision with moving upstream data.
        // Freshness must be explicitly requested by forceFresh.
        let exists = false;
        try {
            exists = (await stat(localPath)).isDirectory();
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        }
        if (!exists) {
            await execFileAsync(
                "git",
                ["clone", "--depth", "1", url, localPath]
            );
        } else {
            const {stdout: actualOrigin} = await execFileAsync(
                "git", ["-C",localPath,"remote","get-url","origin"],
                {encoding:"utf8"}
            );
            const normalize = (value:string) => value.trim()
                .replace(/\\.git$/,"")
                .replace(/^git@github\\.com:/,"https://github.com/");
            if (normalize(actualOrigin) !== normalize(url)) {
                throw new Error("EXTERNAL_SOURCE_REMOTE_MISMATCH: "+localPath);
            }
            const {stdout: currentStatus} = await execFileAsync(
                "git",["-C",localPath,"status","--porcelain"],
                {encoding:"utf8"}
            );
            if (currentStatus.trim()) {
                throw new Error("EXTERNAL_SOURCE_DIRTY: "+localPath);
            }
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