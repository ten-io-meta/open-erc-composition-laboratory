import type {
    GitHubSourceBundle
} from "./GitHubSourceBundle.js";

export class GitHubSourceAdapter {

    create(
        repository: string,
        localPath: string
    ): GitHubSourceBundle {

        const sourceId =
            `GITHUB-${repository
                .replace("/", "-")
                .replace(/[^a-zA-Z0-9-]/g, "-")
                .toUpperCase()}`;

        return {

            sourceId,

            repository,

            localPath,

            url:
                `https://github.com/${repository}`,

            title:
                `GitHub Repository: ${repository}`,

            description:
                `Research source generated from GitHub repository ${repository}.`,

            toolchain:
                "UNKNOWN",

            protocols:
                [],

            capabilities:
                [],

            claims:
                [],

            executableTargets:
                []

        };

    }

}