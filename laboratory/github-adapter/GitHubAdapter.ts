import { GitHubRepositoryLoader } from "./GitHubRepositoryLoader.js";
import { GitHubFileScanner } from "./GitHubFileScanner.js";
import { GitHubSemanticExtractor } from "./GitHubSemanticExtractor.js";
import { GitHubClaimExtractor } from "./GitHubClaimExtractor.js";
import { GitHubEvidenceExtractor } from "./GitHubEvidenceExtractor.js";
import { GitHubRepositoryIntelligence } from "./GitHubRepositoryIntelligence.js";
import { GitHubBundleBuilder } from "./GitHubBundleBuilder.js";
import { GitHubScientificSourceObservationExtractor } from "./GitHubScientificSourceObservationExtractor.js";
import { SolidityScientificSourceFactExtractor } from "../scientific-source-fact/SolidityScientificSourceFactExtractor.js";
import { SourceBundleWriter } from "../source-adapters/SourceBundleWriter.js";

import type {
    GitHubAdapterResult
} from "./GitHubAdapterResult.js";

export class GitHubAdapter {

    async run(params: {
        owner: string;
        repo: string;
        forceFresh?: boolean;
    }): Promise<GitHubAdapterResult> {

        try {

            const loader =
                new GitHubRepositoryLoader();

            const scanner =
                new GitHubFileScanner();

            const semanticExtractor =
                new GitHubSemanticExtractor();

            const claimExtractor =
                new GitHubClaimExtractor();

            const evidenceExtractor =
                new GitHubEvidenceExtractor();

            const repositoryIntelligence =
                new GitHubRepositoryIntelligence();

            const bundleBuilder =
                new GitHubBundleBuilder();

            const scientificSourceObservationExtractor =
                new GitHubScientificSourceObservationExtractor();

            const solidityScientificSourceFactExtractor =
                new SolidityScientificSourceFactExtractor();

            const writer =
                new SourceBundleWriter();

            console.log(
                "[GitHubAdapter] loading repository..."
            );

            const repository =
                await loader.load(params);

            console.log(
                `[GitHubAdapter] repository loaded: ${repository.localPath}`
            );

            console.log(
                "[GitHubAdapter] scanning files..."
            );

            const files =
                await scanner.scan(
                    repository.localPath
                );

            console.log(
                `[GitHubAdapter] files scanned: ${files.length}`
            );

            console.log(
                "[GitHubAdapter] analyzing repository intelligence..."
            );

            const intelligence =
                repositoryIntelligence.analyze(
                    files
                );

            console.log(
                `[GitHubAdapter] toolchain detected: ${intelligence.toolchain}`
            );

            console.log(
                "[GitHubAdapter] extracting protocols..."
            );

            const protocols =
                semanticExtractor.extractProtocols(
                    files
                );

            console.log(
                `[GitHubAdapter] protocols extracted: ${protocols.length}`
            );

            console.log(
                "[GitHubAdapter] extracting capabilities..."
            );

            const capabilities =
                semanticExtractor.extractCapabilities(
                    files
                );

            console.log(
                `[GitHubAdapter] capabilities extracted: ${capabilities.length}`
            );

            console.log(
                "[GitHubAdapter] extracting claims..."
            );

            const claims = [
                ...claimExtractor.extract(files),
                ...intelligence.invariants,
                ...intelligence.intelligenceSignals
            ];

            console.log(
                `[GitHubAdapter] claims extracted: ${claims.length}`
            );

            console.log(
                "[GitHubAdapter] extracting evidence..."
            );

            const evidence =
                evidenceExtractor.extract(
                    files
                );

            console.log(
                "[GitHubAdapter] evidence extracted."
            );

            console.log(
                "[GitHubAdapter] building bundle..."
            );

            const bundle =
                bundleBuilder.build({
                    repository,
                    protocols,
                    capabilities,
                    claims,
                    evidence
                });
            const sourceObservations =
                scientificSourceObservationExtractor.extract({
                    sourceId:
                        bundle.sourceId,

                    sourceRevision:
                        repository.commitSha,

                    sourceLocation:
                        bundle.url,

                    files:
                        files
                });

            const sourceFacts =
                sourceObservations.flatMap(
                    observation =>
                        solidityScientificSourceFactExtractor.extract(
                            observation
                        )
                );

            console.log(
                `[GitHubAdapter] bundle built: ${bundle.sourceId}`
            );

            console.log(
                "[GitHubAdapter] writing source bundle..."
            );

            await writer.write({
    sourceId:
        bundle.sourceId,

    repository:
        bundle.repository,

    localPath:
        repository.localPath,

    url:
        bundle.url,

    commitSha:
        repository.commitSha,

worktreeClean:
    repository.worktreeClean,

title:
    bundle.title,

                description:
                    bundle.description,

                toolchain:
                    intelligence.toolchain,

                protocols:
                    bundle.protocols,

                capabilities:
                    bundle.capabilities,

                claims:
    bundle.claims,

executableTargets:
        intelligence.executableTargets,

    sourceObservations,

    sourceFacts,

    evidence
});

            console.log(
                "[GitHubAdapter] source bundle written."
            );

            return {

                generatedAt:
                    new Date().toISOString(),

                repository,

                intelligence,

                sourceId:
                    bundle.sourceId,

                bundlePath:
                    `./sources/research/${bundle.sourceId}`,

                protocols,

                capabilities,

                claims,

                sourceObservations,

                sourceFacts,

                evidenceQuality:
                    evidence.quality,

                confidenceWeight:
                    evidence.confidenceWeight,

                errors: []

            };

        } catch (error) {

            console.error(
                "[GitHubAdapter] error:",
                error
            );

            return {

                generatedAt:
                    new Date().toISOString(),

                repository: {
                    owner:
                        params.owner,

                    repo:
                        params.repo,

                    url:
                        `https://github.com/${params.owner}/${params.repo}`,

                    localPath:
                        ""
                },

                intelligence: {
    structure: {
        readmes: 0,
        contracts: 0,
        tests: 0,
        docs: 0,
        configs: 0,
        workflows: 0,
        totalFiles: 0
    },

    toolchain:
        "UNKNOWN",

    invariants: [],

    executableTargets: [],

    intelligenceSignals: []
},

                sourceId:
                    "",

                bundlePath:
                    "",

                protocols:
                    [],

                capabilities:
                    [],

                claims:
                    [],

                sourceObservations:
                    [],

                sourceFacts:
                    [],

                evidenceQuality:
                    "SUSPICIOUS",

                confidenceWeight:
                    0,

                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown GitHub adapter error"
                ]

            };

        }

    }

}