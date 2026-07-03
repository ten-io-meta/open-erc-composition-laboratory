import type { GitHubScannedFile } from "./GitHubFileScanner.js";

export interface GitHubRepositoryStructure {

    readmeFiles: GitHubScannedFile[];

    contractFiles: GitHubScannedFile[];

    testFiles: GitHubScannedFile[];

    documentationFiles: GitHubScannedFile[];

    configFiles: GitHubScannedFile[];

    workflowFiles: GitHubScannedFile[];

    sourceFiles: GitHubScannedFile[];

}

export class GitHubStructureAnalyzer {

    analyze(files: GitHubScannedFile[]): GitHubRepositoryStructure {

        return {

            readmeFiles:
                files.filter(file => file.path.toLowerCase().includes("readme")),

            contractFiles:
                files.filter(file =>
                    file.path.endsWith(".sol") ||
                    file.path.toLowerCase().includes("contract") ||
                    file.path.toLowerCase().includes("interface")
                ),

            testFiles:
                files.filter(file =>
                    file.path.toLowerCase().includes("test") ||
                    file.path.toLowerCase().includes("spec")
                ),

            documentationFiles:
                files.filter(file =>
                    file.path.toLowerCase().includes("doc") ||
                    file.path.endsWith(".md")
                ),

            configFiles:
                files.filter(file =>
                    file.path.endsWith("package.json") ||
                    file.path.endsWith("tsconfig.json") ||
                    file.path.endsWith("hardhat.config.ts") ||
                    file.path.endsWith("foundry.toml")
                ),

            workflowFiles:
                files.filter(file =>
                    file.path.toLowerCase().includes(".github/workflows")
                ),

            sourceFiles:
                files

        };

    }

}