import { readFile } from "fs/promises";

import type { NormalizedSource } from "../normalized-source/NormalizedSource.js";

import {
    GitHubAdapter,
    type GitHubIngestionSource
} from "../source-adapters/GitHubAdapter.js";

export class SourceLoader {

    private readonly githubAdapter = new GitHubAdapter();

    async load(path: string): Promise<NormalizedSource> {

        const raw = JSON.parse(
            await readFile(path, "utf8")
        );

        if (this.githubAdapter.supports(raw)) {
            return this.githubAdapter.normalize(
                raw as GitHubIngestionSource
            );
        }

        throw new Error(
            `Unsupported source type: ${path}`
        );

    }

}