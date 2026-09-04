import {
    GitHubCandidateRepositoryAcquirer
} from "../laboratory/candidate-source-acquisition/GitHubCandidateRepositoryAcquirer.js";

import type {
    GitHubCandidateAdapter
} from "../laboratory/candidate-source-acquisition/GitHubCandidateAdapter.js";

import type {
    GitHubAdapterResult
} from "../laboratory/github-adapter/GitHubAdapterResult.js";

function result(
    repository: string,
    errors: string[] = []
): GitHubAdapterResult {

    const [owner, repo] =
        repository.split("/");

    return {
        generatedAt:
            "2026-09-04T00:00:00.000Z",

        repository: {
            owner,
            repo,
            url:
                `https://github.com/${repository}`,
            localPath:
                `external/github/${owner}/${repo}`
        },

        intelligence: {} as GitHubAdapterResult["intelligence"],

        sourceId:
            `GITHUB-${owner}-${repo}`.toUpperCase(),

        bundlePath:
            `sources/research/GITHUB-${owner}-${repo}`,

        protocols: [],
        capabilities: [],
        claims: [],
        evidenceQuality: "HIGH",
        confidenceWeight: 0.85,
        errors
    };
}

async function main(): Promise<void> {

    const calls: Array<{
        owner: string;
        repo: string;
        forceFresh?: boolean;
    }> = [];

    const adapter: GitHubCandidateAdapter = {

        async run(params) {

            calls.push(params);

            if(params.repo === "broken"){
                return result(
                    `${params.owner}/${params.repo}`,
                    ["Synthetic adapter failure"]
                );
            }

            return result(
                `${params.owner}/${params.repo}`
            );
        }
    };

    const acquirer =
        new GitHubCandidateRepositoryAcquirer(
            adapter
        );

    const acquired =
        await acquirer.acquire(
            "Vectorized/solady"
        );

    const failed =
        await acquirer.acquire(
            "example/broken"
        );

    const pass =
        calls.length === 2 &&
        calls[0]?.owner === "Vectorized" &&
        calls[0]?.repo === "solady" &&
        calls[0]?.forceFresh === false &&
        acquired.status === "ACQUIRED" &&
        acquired.repository === "Vectorized/solady" &&
        acquired.enabled === false &&
        acquired.errors.length === 0 &&
        failed.status === "FAILED" &&
        failed.repository === "example/broken" &&
        failed.enabled === false &&
        failed.errors.length === 1;

    console.log("");
    console.log(
        "GITHUB CANDIDATE REPOSITORY ACQUIRER"
    );
    console.log(
        "------------------------------------"
    );
    console.log(
        `ADAPTER CALLS: ${calls.length}`
    );
    console.log(
        `ACQUIRED STATUS: ${acquired.status}`
    );
    console.log(
        `FAILED STATUS: ${failed.status}`
    );
    console.log(
        `ACQUIRED ENABLED: ${acquired.enabled}`
    );
    console.log(
        `FAILED ENABLED: ${failed.enabled}`
    );
    console.log(
        `RESULT: ${pass ? "PASS" : "FAIL"}`
    );

    if(!pass){
        process.exitCode = 1;
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});