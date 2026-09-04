import { GitHubAdapter } from "../github-adapter/GitHubAdapter.js";

import type {
    CandidateRepositoryAcquirer
} from "./CandidateRepositoryAcquirer.js";

import type {
    CandidateSourceAcquisition
} from "./CandidateSourceAcquisitionResult.js";

import type {
    GitHubCandidateAdapter
} from "./GitHubCandidateAdapter.js";

export class GitHubCandidateRepositoryAcquirer
implements CandidateRepositoryAcquirer {

    constructor(
        private readonly adapter:
            GitHubCandidateAdapter =
                new GitHubAdapter()
    ) {}

    async acquire(
        repository: string
    ): Promise<CandidateSourceAcquisition> {

        const [owner, repo] =
            repository.split("/");

        const result =
            await this.adapter.run({
                owner,
                repo,
                forceFresh: false
            });

        if (result.errors.length > 0) {

            return {
                repository,
                sourceId:
                    result.sourceId || null,
                status: "FAILED",
                enabled: false,
                errors:
                    [...result.errors]
            };
        }

        return {
            repository,
            sourceId:
                result.sourceId,
            status: "ACQUIRED",
            enabled: false,
            errors: []
        };
    }
}