import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

export interface GitHubScannedFile {
    path: string;
    content: string;
}

export class GitHubFileScanner {

    private relevantExtensions = [
    ".md",
    ".ts",
    ".js",
    ".sol",
    ".json",
    ".yml",
    ".yaml",
    ".toml"
];

    async scan(root: string): Promise<GitHubScannedFile[]> {
        const files: GitHubScannedFile[] = [];
        await this.walk(root, root, files);
        return files;
    }

    private async walk(root: string, current: string, files: GitHubScannedFile[]) {
        const entries = await readdir(current);

        for (const entry of entries) {
            if (entry === ".git" || entry === "node_modules" || entry === "dist") {
                continue;
            }

            const fullPath = join(current, entry);
            const info = await stat(fullPath);

            if (info.isDirectory()) {
                await this.walk(root, fullPath, files);
                continue;
            }

            if (!this.isRelevant(entry)) {
                continue;
            }

            const content = await readFile(fullPath, "utf8");

            files.push({
                path: fullPath.replace(root, "").replace(/\\/g, "/"),
                content
            });
        }
    }

    private isRelevant(file: string): boolean {
        return this.relevantExtensions.some(ext => file.endsWith(ext));
    }

}