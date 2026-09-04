import {
    readFile
} from "fs/promises";


interface ExecutableTarget {
    type: string;
    filePath: string;
    selector: string;
    framework: string;
    semanticContext: string;
}


interface RepositoryDefinition {
    repository: string;
    sourcePath: string;
}


const repositories: RepositoryDefinition[] = [

    {
        repository:
            "ethereum/EIPs",

        sourcePath:
            "./sources/research/GITHUB-ETHEREUM-EIPS/source.json"
    },

    {
        repository:
            "OpenZeppelin/openzeppelin-contracts",

        sourcePath:
            "./sources/research/GITHUB-OPENZEPPELIN-OPENZEPPELIN-CONTRACTS/source.json"
    },

    {
        repository:
            "ten-io-meta/erc8060-reservable",

        sourcePath:
            "./sources/research/GITHUB-TEN-IO-META-ERC8060-RESERVABLE/source.json"
    },

    {
        repository:
            "thirdweb-dev/contracts",

        sourcePath:
            "./sources/research/GITHUB-THIRDWEB-DEV-CONTRACTS/source.json"
    },

    {
        repository:
            "transmissions11/solmate",

        sourcePath:
            "./sources/research/GITHUB-TRANSMISSIONS11-SOLMATE/source.json"
    },

    {
        repository:
            "Vectorized/solady",

        sourcePath:
            "./sources/research/GITHUB-VECTORIZED-SOLADY/source.json"
    }

];


function tokenize(
    value: string
): string[] {

    return value
        .replace(
            /([a-z])([A-Z])/g,
            "$1 $2"
        )
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            " "
        )
        .split(
            /\s+/
        )
        .map(
            token =>
                token.trim()
        )
        .filter(
            Boolean
        );

}


function conceptTokenMatches(
    relationToken: string,
    semanticToken: string
): boolean {

    if (
        relationToken ===
        semanticToken
    ) {

        return true;

    }


    const minimumSharedPrefix =
        5;


    const maximumComparableLength =
        Math.min(
            relationToken.length,
            semanticToken.length
        );


    if (
        maximumComparableLength <
        minimumSharedPrefix
    ) {

        return false;

    }


    let sharedPrefixLength =
        0;


    while (
        sharedPrefixLength <
            maximumComparableLength &&
        relationToken[
            sharedPrefixLength
        ] ===
            semanticToken[
                sharedPrefixLength
            ]
    ) {

        sharedPrefixLength++;

    }


    return (
        sharedPrefixLength >=
        minimumSharedPrefix
    );

}


function tokenPresent(
    relationToken: string,
    semanticTokens: string[]
): boolean {

    return semanticTokens.some(
        semanticToken =>
            conceptTokenMatches(
                relationToken,
                semanticToken
            )
    );

}


function matchingSemanticTokens(
    relationToken: string,
    semanticTokens: string[]
): string[] {

    return [
        ...new Set(
            semanticTokens.filter(
                semanticToken =>
                    conceptTokenMatches(
                        relationToken,
                        semanticToken
                    )
            )
        )
    ];

}


async function main() {

    const rows: any[] =
        [];


    for (
        const repository
        of repositories
    ) {

        const source =
            JSON.parse(
                await readFile(
                    repository.sourcePath,
                    "utf8"
                )
            );


        const targets:
            ExecutableTarget[] =
                source.executableTargets ?? [];


        for (
            const target
            of targets
        ) {

            const semanticTokens =
                tokenize(
                    [
                        target.selector,
                        target.semanticContext
                    ].join(
                        " "
                    )
                );


            /*
             * Relation under investigation:
             *
             * INVARIANT VALIDATION
             *     VALIDATES
             * ACCOUNTING
             */

            const invariant =
                tokenPresent(
                    "invariant",
                    semanticTokens
                );

            const validation =
                tokenPresent(
                    "validation",
                    semanticTokens
                );

            const accounting =
                tokenPresent(
                    "accounting",
                    semanticTokens
                );


            /*
             * Current resolver:
             *
             * subject tokens use some().
             */

            const currentSubjectMatched =
                invariant ||
                validation;


            /*
             * Candidate strict interpretation:
             *
             * every subject token must be represented.
             */

            const strictSubjectMatched =
                invariant &&
                validation;


            const currentObjectMatched =
                accounting;


            /*
             * Only print targets that can currently
             * establish both relation concepts.
             *
             * This is the population capable of reaching
             * relation-level polarity in the resolver.
             */

            if (
                !currentSubjectMatched ||
                !currentObjectMatched
            ) {

                continue;

            }


            rows.push({

                repository:
                    repository.repository,

                selector:
                    target.selector,

                invariant,

                validation,

                accounting,

                currentSubject:
                    currentSubjectMatched,

                strictSubject:
                    strictSubjectMatched,

                invariantMatches:
                    matchingSemanticTokens(
                        "invariant",
                        semanticTokens
                    ).join(
                        ","
                    ),

                validationMatches:
                    matchingSemanticTokens(
                        "validation",
                        semanticTokens
                    ).join(
                        ","
                    ),

                accountingMatches:
                    matchingSemanticTokens(
                        "accounting",
                        semanticTokens
                    ).join(
                        ","
                    )

            });

        }

    }


    console.log("");
    console.log(
        "=== COMPOUND CONCEPT MATCHING ==="
    );

    console.table(
        rows
    );


    const current =
        rows.length;


    const strict =
        rows.filter(
            row =>
                row.strictSubject
        ).length;


    const partial =
        rows.filter(
            row =>
                !row.strictSubject
        ).length;


    console.log("");
    console.log(
        "=== SUMMARY ==="
    );

    console.log(
        "Current subject+object matches:",
        current
    );

    console.log(
        "Strict subject+object matches:",
        strict
    );

    console.log(
        "Partial compound-subject matches:",
        partial
    );


    console.log("");
    console.log(
        "=== PARTIAL MATCHES ==="
    );

    console.table(
        rows.filter(
            row =>
                !row.strictSubject
        )
    );

}


main();