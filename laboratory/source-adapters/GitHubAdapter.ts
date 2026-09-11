import type {
    NormalizedSource
} from "../normalized-source/NormalizedSource.js";

export interface GitHubIngestionSource {

    sourceId: string;

    type:
        "GITHUB_REPOSITORY";

    title: string;

    description: string;

    repository: string;

    branch?: string;

    commit?: string;

    tags?: string[];

    protocols?: string[];

    capabilities?: string[];

    claims?: string[];

    metadata?: Record<
        string,
        string
    >;

}

export class GitHubAdapter {

    supports(
        source: unknown
    ): source is GitHubIngestionSource {

        if (
            typeof source !== "object" ||
            source === null
        ) {
            return false;
        }

        const candidate =
            source as Partial<
                GitHubIngestionSource
            >;

        return (
            candidate.type ===
                "GITHUB_REPOSITORY" &&
            typeof candidate.sourceId ===
                "string" &&
            typeof candidate.repository ===
                "string"
        );

    }

    normalize(
        source:
            GitHubIngestionSource
    ): NormalizedSource {

        return {

            sourceId:
                source.sourceId,

            sourceType:
                "GITHUB",

            title:
                source.title,

            description:
                source.description,

            location:
                `https://github.com/${source.repository}`,

            repository:
                source.repository,

            branch:
                source.branch,

            commit:
                source.commit,

            tags:
                source.tags ?? [],

            protocols:
                source.protocols ?? [],

            capabilities:
                source.capabilities ?? [],

            claims:
                source.claims ?? [],

            evidence: {

                quality:
                    "MEDIUM",

                reproducible:
                    true,

                implementation:
                    true,

                tests:
                    false,

                invariants:
                    false,

                formalSpecification:
                    false,

                citations:
                    false,

                confidenceWeight:
                    0.85

            },

            metadata:
                source.metadata ?? {},

            importedAt:
                new Date().toISOString()

        };

    }

}