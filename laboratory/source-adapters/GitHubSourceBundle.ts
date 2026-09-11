import type {
    GitHubExecutableTarget
} from "../github-adapter/GitHubExecutableTargetExtractor.js";

import type {
    ScientificSourceObservation
} from "../scientific-source-observation/ScientificSourceObservation.js";

import type {
    ScientificSourceFact
} from "../scientific-source-fact/ScientificSourceFact.js";


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

    /*
     * Pre-reasoning observations extracted directly
     * from source material.
     *
     * Optional for compatibility with legacy bundle
     * producers. The scientific GitHub adapter should
     * populate these when available.
     */
    sourceObservations?:
        ScientificSourceObservation[];

    /*
     * Structural facts derived only from concrete
     * scientific source observations.
     *
     * These facts must not encode composition answers.
     */
    sourceFacts?:
        ScientificSourceFact[];

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