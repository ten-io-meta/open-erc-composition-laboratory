import { readdir, readFile, stat } from "fs/promises";
import path from "path";

export interface RepositoryScanResult {
    rootPath: string;
    readme: string;
    docs: string[];
    contracts: string[];
    tests: string[];
    configs: string[];
}

export class RepositoryScanner {

    async scan(rootPath: string): Promise<RepositoryScanResult> {

        const files = await this.walk(rootPath);

        const readmeFile = files.find(file =>
            path.basename(file).toLowerCase().startsWith("readme")
        );

        const docs = files.filter(file =>
            file.includes(`${path.sep}docs${path.sep}`)
            && this.isTextFile(file)
        );

        const contracts = files.filter(file =>
            file.endsWith(".sol")
        );

        const tests = files.filter(file =>
            file.includes(`${path.sep}test${path.sep}`)
            || file.includes(`${path.sep}tests${path.sep}`)
        );

        const configs = files.filter(file =>
            [
                "package.json",
                "foundry.toml",
                "hardhat.config.ts",
                "hardhat.config.js"
            ].includes(path.basename(file))
        );

        return {
            rootPath,
            readme: readmeFile
                ? await this.safeRead(readmeFile)
                : "",
            docs: await this.readMany(docs.slice(0, 20)),
            contracts: await this.readMany(contracts.slice(0, 50)),
            tests: await this.readMany(tests.slice(0, 50)),
            configs: await this.readMany(configs)
        };

    }

    private async walk(dir: string): Promise<string[]> {

        const result: string[] = [];

        const entries = await readdir(dir);

        for (const entry of entries) {
            if ([".git", "node_modules", "dist", "build", "out", "cache"].includes(entry)) {
                continue;
            }

            const fullPath = path.join(dir, entry);
            const info = await stat(fullPath);

            if (info.isDirectory()) {
                result.push(...await this.walk(fullPath));
            } else {
                result.push(fullPath);
            }
        }

        return result;

    }

    private async readMany(files: string[]): Promise<string[]> {
        return Promise.all(
            files.map(file => this.safeRead(file))
        );
    }

    private async safeRead(file: string): Promise<string> {
        try {
            return await readFile(file, "utf8");
        } catch {
            return "";
        }
    }

    private isTextFile(file: string): boolean {
        return [
            ".md",
            ".txt",
            ".json",
            ".sol",
            ".ts",
            ".js"
        ].some(extension => file.endsWith(extension));
    }

}