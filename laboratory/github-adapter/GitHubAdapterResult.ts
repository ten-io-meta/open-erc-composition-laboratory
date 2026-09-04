import type {
    GitHubRepositoryIntelligenceResult
} from "./GitHubRepositoryIntelligence.js";

import type { GitHubRepositoryMetadata } from "./GitHubRepositoryMetadata.js";

export interface GitHubAdapterResult {

    generatedAt: string;

    repository: GitHubRepositoryMetadata;

    intelligence:
    GitHubRepositoryIntelligenceResult;

    sourceId: string;

    bundlePath: string;

    protocols: string[];

    capabilities: string[];

    claims: string[];

    evidenceQuality: string;

    confidenceWeight: number;

    errors: string[];

}