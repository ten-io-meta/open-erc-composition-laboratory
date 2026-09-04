import { GitHubAdapter } from "../laboratory/github-adapter/GitHubAdapter.js";

async function main() {

    const adapter =
        new GitHubAdapter();

    const result =
        await adapter.run({
            owner:
                "thirdweb-dev",

            repo:
                "contracts",

            forceFresh:
                true
        });

    console.log({
        sourceId:
            result.sourceId,

        repository:
            result.repository,

        toolchain:
            result.intelligence.toolchain,

        errors:
            result.errors
    });

}

main();