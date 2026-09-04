import type {
    GitHubScannedFile
} from "./GitHubFileScanner.js";

import {
    GitHubStructureAnalyzer
} from "./GitHubStructureAnalyzer.js";

import {
    GitHubInvariantExtractor
} from "./GitHubInvariantExtractor.js";

import {
    GitHubExecutableTargetExtractor
} from "./GitHubExecutableTargetExtractor.js";

import type {
    GitHubExecutableTarget
} from "./GitHubExecutableTargetExtractor.js";

export interface GitHubRepositoryIntelligenceResult {

    structure: {
        readmes: number;
        contracts: number;
        tests: number;
        docs: number;
        configs: number;
        workflows: number;
        totalFiles: number;
    };

    toolchain:
        | "FOUNDRY"
        | "HARDHAT"
        | "MIXED"
        | "UNKNOWN";

    invariants: string[];

    executableTargets:
        GitHubExecutableTarget[];

    intelligenceSignals: string[];

}

export class GitHubRepositoryIntelligence {

    analyze(
        files:
            GitHubScannedFile[]
    ): GitHubRepositoryIntelligenceResult {

        const structureAnalyzer =
            new GitHubStructureAnalyzer();

        const invariantExtractor =
            new GitHubInvariantExtractor();

        const executableTargetExtractor =
            new GitHubExecutableTargetExtractor();

        const structure =
            structureAnalyzer.analyze(
                files
            );

        const hasFoundry =
            structure.configFiles.some(
                file =>
                    file.path.endsWith(
                        "foundry.toml"
                    )
            );

        const hasHardhat =
            structure.configFiles.some(
                file =>
                    file.path.endsWith(
                        "hardhat.config.ts"
                    ) ||
                    file.path.endsWith(
                        "hardhat.config.js"
                    )
            );

        const toolchain:
            GitHubRepositoryIntelligenceResult[
                "toolchain"
            ] =
                hasFoundry &&
                hasHardhat
                    ? "MIXED"
                    : hasFoundry
                        ? "FOUNDRY"
                        : hasHardhat
                            ? "HARDHAT"
                            : "UNKNOWN";

        const invariants =
            invariantExtractor.extract(
                structure
            );

        const executableTargets =
            executableTargetExtractor.extract(
                structure
            );

        const intelligenceSignals = [

            structure.readmeFiles.length > 0
                ? "Repository contains README research context."
                : "Repository does not expose README research context.",

            structure.contractFiles.length > 0
                ? "Repository contains contract or interface material."
                : "Repository does not expose contract or interface material.",

            structure.testFiles.length > 0
                ? "Repository contains test evidence."
                : "Repository does not expose test evidence.",

            structure.documentationFiles.length > 0
                ? "Repository contains documentation material."
                : "Repository does not expose documentation material.",

            invariants.length > 0
                ? "Repository contains invariant-like statements."
                : "Repository does not expose invariant-like statements.",

            executableTargets.length > 0
                ? (
                    `Repository exposes ${executableTargets.length} ` +
                    `executable test or invariant target(s).`
                )
                : "Repository does not expose executable test or invariant targets.",

            toolchain === "FOUNDRY"
                ? "Repository uses the Foundry toolchain."
                : toolchain === "HARDHAT"
                    ? "Repository uses the Hardhat toolchain."
                    : toolchain === "MIXED"
                        ? "Repository exposes both Foundry and Hardhat configuration."
                        : "Repository toolchain could not be determined."

        ];

        return {

            structure: {

                readmes:
                    structure.readmeFiles.length,

                contracts:
                    structure.contractFiles.length,

                tests:
                    structure.testFiles.length,

                docs:
                    structure.documentationFiles.length,

                configs:
                    structure.configFiles.length,

                workflows:
                    structure.workflowFiles.length,

                totalFiles:
                    files.length

            },

            toolchain,

            invariants,

            executableTargets,

            intelligenceSignals

        };

    }

}