import {
    GitHubAdapter
} from "../laboratory/github-adapter/GitHubAdapter.js";


interface RepositoryTarget {
    owner: string;
    repo: string;
}


const repositories:
    RepositoryTarget[] = [

        {
            owner:
                "OpenZeppelin",
            repo:
                "openzeppelin-contracts"
        },

        {
            owner:
                "thirdweb-dev",
            repo:
                "contracts"
        },

        {
            owner:
                "transmissions11",
            repo:
                "solmate"
        },

        {
            owner:
                "Vectorized",
            repo:
                "solady"
        }

    ];


async function main() {

    console.log("");
    console.log(
        "===================================="
    );
    console.log(
        "OECL Foundry Execution Bundle Refresh"
    );
    console.log(
        "===================================="
    );


    const adapter =
        new GitHubAdapter();


    for (
        const repository
        of repositories
    ) {

        console.log("");
        console.log(
            "------------------------------------"
        );

        console.log(
            `Refreshing ${repository.owner}/${repository.repo}`
        );

        console.log(
            "------------------------------------"
        );


        try {

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
                `Repository: ${result.repository.owner}/${result.repository.repo}`
            );

            console.log(
                `Toolchain: ${result.intelligence.toolchain}`
            );

            console.log(
                `Tests detected: ${result.intelligence.structure.tests}`
            );

            console.log(
                `Bundle path: ${result.bundlePath}`
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

        } catch (
            error
        ) {

            console.error(
                `FAILED: ${repository.owner}/${repository.repo}`
            );

            console.error(
                error
            );

        }

    }


    console.log("");
    console.log(
        "===================================="
    );
    console.log(
        "Refresh finished."
    );
    console.log(
        "===================================="
    );

}


main();