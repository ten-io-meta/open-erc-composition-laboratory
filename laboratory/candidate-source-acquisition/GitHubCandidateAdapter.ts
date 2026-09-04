import type {
    GitHubAdapterResult
} from "../github-adapter/GitHubAdapterResult.js";

export interface GitHubCandidateAdapter {

    run(params: {
        owner: string;
        repo: string;
        forceFresh?: boolean;
    }): Promise<GitHubAdapterResult>;
}