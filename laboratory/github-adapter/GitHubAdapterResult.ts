import type { GitHubRepositoryMetadata } from "./GitHubRepositoryMetadata.js";

export interface GitHubAdapterResult {

    generatedAt: string;

    repository: GitHubRepositoryMetadata;

    sourceId: string;

    bundlePath: string;

    protocols: string[];

    capabilities: string[];

    claims: string[];

    evidenceQuality: string;

    confidenceWeight: number;

    errors: string[];

}