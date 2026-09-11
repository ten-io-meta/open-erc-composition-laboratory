import {
    GitHubAdapter
} from "../laboratory/github-adapter/GitHubAdapter.js";


const repositories = [

    {
        owner: "OpenZeppelin",
        repo: "openzeppelin-contracts"
    },

    {
        owner: "thirdweb-dev",
        repo: "contracts"
    },

    {
        owner: "transmissions11",
        repo: "solmate"
    }

];


async function main() {

    const adapter =
        new GitHubAdapter();


    console.log("");
    console.log(
        "===================================="
    );
    console.log(
        "OECL Execution Bundle Refresh"
    );
    console.log(
        "===================================="
    );


    for (
        const repository
        of repositories
    ) {

        console.log("");
        console.log(
            `Refreshing ${repository.owner}/${repository.repo}`
        );


        const result =
            await adapter.run({

                owner:
                    repository.owner,

                repo:
                    repository.repo,

                forceFresh:
                    true

            });


        console.log(
            `Source: ${result.sourceId}`
        );

        console.log(
            `Toolchain: ${result.intelligence.toolchain}`
        );

        console.log(
            `Executable targets: ${result.intelligence.executableTargets.length}`
        );

        console.log(
            `Bundle: ${result.bundlePath}`
        );


        if (
            result.errors.length > 0
        ) {

            console.log(
                "Errors:"
            );

            for (
                const error
                of result.errors
            ) {

                console.log(
                    `- ${error}`
                );

            }

        }

    }


    console.log("");
    console.log(
        "===================================="
    );
    console.log(
        "Refresh complete"
    );
    console.log(
        "===================================="
    );

}


main();
