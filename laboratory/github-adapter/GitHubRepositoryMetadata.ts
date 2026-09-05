export interface GitHubRepositoryMetadata {
    owner: string;
    repo: string;
    url: string;
    localPath: string;
    defaultBranch?: string;
    commitSha?: string;
    worktreeClean?: boolean;
}