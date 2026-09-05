import type {
    GitHubExecutableTarget
} from "../github-adapter/GitHubExecutableTargetExtractor.js";

export interface GitHubSourceBundle {

    sourceId:
        string;

    repository:
        string;

    localPath:
        string;

    url:
        string;

    commitSha?:
        string;

    worktreeClean?:
        boolean;

    title:
        string;

    description:
        string;

    toolchain:
        | "FOUNDRY"
        | "HARDHAT"
        | "MIXED"
        | "UNKNOWN";

    protocols:
        string[];

    capabilities:
        string[];

    claims:
        string[];

    /*
     * Concrete executable targets discovered
     * during repository intelligence analysis.
     *
     * Persisting them in source.json allows the
     * scientific execution pipeline to resolve
     * abstract experiments against real tests
     * and invariants without rescanning the repo.
     */
    executableTargets:
        GitHubExecutableTarget[];

    evidence?: {

        quality:
            string;

        confidenceWeight:
            number;

        reproducible:
            boolean;

        hasImplementation:
            boolean;

        hasTests:
            boolean;

        hasInvariants:
            boolean;

        hasCoverage:
            boolean;

        hasCitation:
            boolean;

        observations:
            string[];

    };

}