import { execFile } from "child_process";
import { promisify } from "util";
import { mkdir, rm } from "fs/promises";

const execFileAsync = promisify(execFile);

export class GitHubRepositoryIngestor {

    async clone(repository: string): Promise<string> {

        const safeName = repository
            .replace(/^https:\/\/github\.com\//, "")
            .replace(/\.git$/, "")
            .replace(/[\/\\]/g, "-");

        const targetPath = `./tmp/github/${safeName}`;

        await mkdir("./tmp/github", { recursive: true });

        await rm(targetPath, {
            recursive: true,
            force: true
        });

        const repoUrl = repository.startsWith("https://")
            ? repository
            : `https://github.com/${repository}.git`;

        await execFileAsync("git", [
            "clone",
            "--depth",
            "1",
            repoUrl,
            targetPath
        ]);

        return targetPath;

    }

}