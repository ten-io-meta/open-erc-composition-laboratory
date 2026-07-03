import type { GitHubScannedFile } from "./GitHubFileScanner.js";

import { GitHubStructureAnalyzer } from "./GitHubStructureAnalyzer.js";
import { GitHubInvariantExtractor } from "./GitHubInvariantExtractor.js";

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

    invariants: string[];

    intelligenceSignals: string[];

}

export class GitHubRepositoryIntelligence {

    analyze(files: GitHubScannedFile[]): GitHubRepositoryIntelligenceResult {

        const structureAnalyzer = new GitHubStructureAnalyzer();

        const invariantExtractor = new GitHubInvariantExtractor();

        const structure = structureAnalyzer.analyze(files);

        const invariants = invariantExtractor.extract(structure);

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
                : "Repository does not expose invariant-like statements."
        ];

        return {

            structure: {
                readmes: structure.readmeFiles.length,
                contracts: structure.contractFiles.length,
                tests: structure.testFiles.length,
                docs: structure.documentationFiles.length,
                configs: structure.configFiles.length,
                workflows: structure.workflowFiles.length,
                totalFiles: files.length
            },

            invariants,

            intelligenceSignals

        };

    }

}