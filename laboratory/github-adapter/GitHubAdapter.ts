import { GitHubRepositoryLoader } from "./GitHubRepositoryLoader.js";
import { GitHubFileScanner } from "./GitHubFileScanner.js";
import { GitHubSemanticExtractor } from "./GitHubSemanticExtractor.js";
import { GitHubClaimExtractor } from "./GitHubClaimExtractor.js";
import { GitHubEvidenceExtractor } from "./GitHubEvidenceExtractor.js";
import { GitHubRepositoryIntelligence } from "./GitHubRepositoryIntelligence.js";
import { GitHubBundleBuilder } from "./GitHubBundleBuilder.js";
import { SourceBundleWriter } from "../source-adapters/SourceBundleWriter.js";

import type { GitHubAdapterResult } from "./GitHubAdapterResult.js";

export class GitHubAdapter {

    async run(params: {
        owner: string;
        repo: string;
        forceFresh?: boolean;
    }): Promise<GitHubAdapterResult> {

        try {
            const loader = new GitHubRepositoryLoader();
            const scanner = new GitHubFileScanner();
            const semanticExtractor = new GitHubSemanticExtractor();
            const claimExtractor = new GitHubClaimExtractor();
            const evidenceExtractor = new GitHubEvidenceExtractor();
            const repositoryIntelligence = new GitHubRepositoryIntelligence();
            const bundleBuilder = new GitHubBundleBuilder();
            const writer = new SourceBundleWriter();

            const repository = await loader.load(params);
            const files = await scanner.scan(repository.localPath);

            const intelligence = repositoryIntelligence.analyze(files);

            const protocols = semanticExtractor.extractProtocols(files);
            const capabilities = semanticExtractor.extractCapabilities(files);

            const claims = [
                ...claimExtractor.extract(files),
                ...intelligence.invariants,
                ...intelligence.intelligenceSignals
            ];

            const evidence = evidenceExtractor.extract(files);

            const bundle = bundleBuilder.build({
                repository,
                protocols,
                capabilities,
                claims,
                evidence
            });

            await writer.write({
                sourceId: bundle.sourceId,
                repository: bundle.repository,
                url: bundle.url,
                title: bundle.title,
                description: bundle.description,
                protocols: bundle.protocols,
                capabilities: bundle.capabilities,
                claims: bundle.claims,
                evidence
            });

            return {
                generatedAt: new Date().toISOString(),
                repository,
                sourceId: bundle.sourceId,
                bundlePath: `./sources/research/${bundle.sourceId}`,
                protocols,
                capabilities,
                claims,
                evidenceQuality: evidence.quality,
                confidenceWeight: evidence.confidenceWeight,
                errors: []
            };

        } catch (error) {
            return {
                generatedAt: new Date().toISOString(),
                repository: {
                    owner: params.owner,
                    repo: params.repo,
                    url: `https://github.com/${params.owner}/${params.repo}`,
                    localPath: ""
                },
                sourceId: "",
                bundlePath: "",
                protocols: [],
                capabilities: [],
                claims: [],
                evidenceQuality: "SUSPICIOUS",
                confidenceWeight: 0,
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown GitHub adapter error"
                ]
            };
        }

    }

}