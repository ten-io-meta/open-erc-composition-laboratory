import type { GitHubRepositoryMetadata } from "./GitHubRepositoryMetadata.js";

export class GitHubBundleBuilder {

    build(params: {
        repository: GitHubRepositoryMetadata;
        protocols: string[];
        capabilities: string[];
        claims: string[];
        evidence: any;
    }) {
        const sourceId =
            `GITHUB-${params.repository.owner}-${params.repository.repo}`
                .replace(/[^A-Za-z0-9-]/g, "-")
                .toUpperCase();

        return {
            sourceId,
            title: `${params.repository.owner}/${params.repository.repo}`,
            type: "GITHUB_REPOSITORY",
            repository: `${params.repository.owner}/${params.repository.repo}`,
            url: params.repository.url,
            description: `Automatically generated OECL research bundle from GitHub repository ${params.repository.owner}/${params.repository.repo}.`,
            protocols: params.protocols,
            capabilities: params.capabilities,
            claims: params.claims,
            evidence: params.evidence
        };
    }

}