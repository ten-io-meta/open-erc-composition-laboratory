import {
    readFile
} from "fs/promises";

import {
    GitHubAdapter
} from "../laboratory/github-adapter/GitHubAdapter.js";


async function main() {

    const adapter =
        new GitHubAdapter();


    console.log("");
    console.log(
        "=== FULL SOLADY REFRESH TEST ==="
    );


    const result =
        await adapter.run({

            owner:
                "Vectorized",

            repo:
                "solady",

            forceFresh:
                true

        });


    console.log("");
    console.log(
        "=== ADAPTER RESULT ==="
    );

    console.log(
        "Source ID:",
        result.sourceId
    );

    console.log(
        "Bundle path:",
        result.bundlePath
    );

    console.log(
        "Executable targets:",
        result.intelligence.executableTargets.length
    );


    const sourcePath =
        `${result.bundlePath}/source.json`;


    console.log(
        "Source JSON:",
        sourcePath
    );


    const source =
        JSON.parse(
            await readFile(
                sourcePath,
                "utf8"
            )
        );


    const target =
        source.executableTargets?.find(
            (candidate: any) =>
                candidate.selector ===
                "testPRNGNext"
        );


    console.log("");
    console.log(
        "=== PERSISTED TARGET ==="
    );

    console.log(
        "Found:",
        Boolean(target)
    );


    if (target) {

        console.log(
            "Length:",
            target.semanticContext.length
        );

        console.log("");
        console.log(
            target.semanticContext
        );

    }


    if (
        result.errors.length > 0
    ) {

        console.log("");
        console.log(
            "=== ADAPTER ERRORS ==="
        );

        for (
            const error
            of result.errors
        ) {

            console.log(
                error
            );

        }

    }

}


main();
