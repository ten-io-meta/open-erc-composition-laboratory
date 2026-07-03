import type { GitHubRepositoryStructure } from "./GitHubStructureAnalyzer.js";

export class GitHubInvariantExtractor {

    extract(structure: GitHubRepositoryStructure): string[] {

        const invariants = new Set<string>();

        const files = [
            ...structure.testFiles,
            ...structure.contractFiles,
            ...structure.documentationFiles
        ];

        for (const file of files) {

            const lines = file.content.split(/\r?\n/);

            for (const line of lines) {

                const clean = line.trim();

                if (clean.length < 20) {
                    continue;
                }

                const lower = clean.toLowerCase();

                if (
                    lower.includes("invariant") ||
                    lower.includes("must") ||
                    lower.includes("cannot") ||
                    lower.includes("never") ||
                    lower.includes("always") ||
                    lower.includes("locked") ||
                    lower.includes("available") ||
                    lower.includes("reserved")
                ) {
                    invariants.add(
                        clean
                            .replace(/^\/\/\s*/, "")
                            .replace(/^\/\*\s*/, "")
                            .replace(/\*\/$/, "")
                            .trim()
                    );
                }

            }

        }

        return [...invariants].slice(0, 30);

    }

}