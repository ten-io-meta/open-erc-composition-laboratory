import type {
    GitHubRepositoryStructure
} from "./GitHubStructureAnalyzer.js";


export type GitHubExecutableTargetType =
    | "TEST"
    | "INVARIANT";


export interface GitHubExecutableTarget {

    type:
        GitHubExecutableTargetType;

    filePath:
        string;

    selector:
        string;

    semanticContext:
        string;

    framework:
        | "FOUNDRY"
        | "HARDHAT"
        | "UNKNOWN";

}


export class GitHubExecutableTargetExtractor {

    extract(
        structure:
            GitHubRepositoryStructure
    ): GitHubExecutableTarget[] {

        const targets:
            GitHubExecutableTarget[] = [];


        for (
            const file
            of structure.testFiles
        ) {

            /*
             * Foundry / Solidity
             *
             * Each executable target receives only its own
             * Solidity function body as semanticContext.
             *
             * This prevents unrelated tests in the same file
             * from contaminating scientific polarity.
             */

            if (
                file.path.endsWith(".sol")
            ) {

                const functionPattern =
                    /\bfunction\s+([A-Za-z0-9_]+)\s*\(/g;


                let match:
                    RegExpExecArray | null;


                while (
                    (
                        match =
                            functionPattern.exec(
                                file.content
                            )
                    ) !== null
                ) {

                    const functionName =
                        match[1];


                    const semanticContext =
                        this.extractSolidityFunctionContext(
                            file.content,
                            match.index
                        );


                    if (
                        functionName.startsWith(
                            "invariant_"
                        )
                    ) {

                        targets.push({

                            type:
                                "INVARIANT",

                            filePath:
                                file.path,

                            selector:
                                functionName,

                            semanticContext,

                            framework:
                                "FOUNDRY"

                        });


                        continue;

                    }


                    if (
                        functionName.startsWith(
                            "test"
                        )
                    ) {

                        targets.push({

                            type:
                                "TEST",

                            filePath:
                                file.path,

                            selector:
                                functionName,

                            semanticContext,

                            framework:
                                "FOUNDRY"

                        });

                    }

                }

            }


            /*
             * Hardhat / JavaScript / TypeScript
             */

            if (
                file.path.endsWith(".ts") ||
                file.path.endsWith(".js")
            ) {

                const testPattern =
                    /\b(?:it|test)\s*\(\s*["'`]([^"'`]+)["'`]/g;


                let match:
                    RegExpExecArray | null;


                while (
                    (
                        match =
                            testPattern.exec(
                                file.content
                            )
                    ) !== null
                ) {

                    const testStart =
                        match.index;


                    const remainingContent =
                        file.content.slice(
                            testStart
                        );


                    const nextTestMatch =
                        remainingContent
                            .slice(
                                match[0].length
                            )
                            .search(
                                /\b(?:it|test)\s*\(\s*["'`]/
                            );


                    const semanticContext =
                        nextTestMatch >= 0
                            ? remainingContent.slice(
                                0,
                                match[0].length +
                                    nextTestMatch
                            )
                            : remainingContent;


                    targets.push({

                        type:
                            "TEST",

                        filePath:
                            file.path,

                        semanticContext,

                        selector:
                            match[1],

                        framework:
                            "HARDHAT"

                    });

                }

            }

        }


        return targets;

    }


    /*
     * Extract one Solidity function, including its complete
     * body, while respecting nested blocks.
     *
     * Example:
     *
     * function testSomething() public {
     *
     *     unchecked {
     *
     *         if (...) {
     *             ...
     *         }
     *
     *     }
     *
     * }
     *
     * A simple "slice until next function" is not enough,
     * because Solidity functions contain nested braces.
     */

    private extractSolidityFunctionContext(
        content:
            string,
        functionStart:
            number
    ): string {

        const openingBrace =
            this.findSolidityOpeningBrace(
                content,
                functionStart
            );


        if (
            openingBrace < 0
        ) {

            /*
             * Defensive fallback.
             *
             * This can happen for malformed/incomplete source
             * or declarations without a body.
             */

            return content.slice(
                functionStart,
                this.findNextSolidityFunctionStart(
                    content,
                    functionStart + 1
                )
            );

        }


        const closingBrace =
            this.findMatchingSolidityBrace(
                content,
                openingBrace
            );


        if (
            closingBrace < 0
        ) {

            /*
             * Never return the whole remaining file merely
             * because a function is malformed.
             */

            const nextFunctionStart =
                this.findNextSolidityFunctionStart(
                    content,
                    functionStart + 1
                );


            return content.slice(
                functionStart,
                nextFunctionStart
            );

        }


        return content.slice(
            functionStart,
            closingBrace + 1
        );

    }


    private findSolidityOpeningBrace(
        content:
            string,
        start:
            number
    ): number {

        let inSingleQuote =
            false;

        let inDoubleQuote =
            false;

        let inLineComment =
            false;

        let inBlockComment =
            false;

        let escaped =
            false;


        for (
            let index = start;
            index < content.length;
            index++
        ) {

            const character =
                content[index];

            const nextCharacter =
                content[index + 1] ?? "";


            if (
                inLineComment
            ) {

                if (
                    character === "\n"
                ) {

                    inLineComment =
                        false;

                }


                continue;

            }


            if (
                inBlockComment
            ) {

                if (
                    character === "*" &&
                    nextCharacter === "/"
                ) {

                    inBlockComment =
                        false;

                    index++;

                }


                continue;

            }


            if (
                inSingleQuote
            ) {

                if (
                    escaped
                ) {

                    escaped =
                        false;

                    continue;

                }


                if (
                    character === "\\"
                ) {

                    escaped =
                        true;

                    continue;

                }


                if (
                    character === "'"
                ) {

                    inSingleQuote =
                        false;

                }


                continue;

            }


            if (
                inDoubleQuote
            ) {

                if (
                    escaped
                ) {

                    escaped =
                        false;

                    continue;

                }


                if (
                    character === "\\"
                ) {

                    escaped =
                        true;

                    continue;

                }


                if (
                    character === '"'
                ) {

                    inDoubleQuote =
                        false;

                }


                continue;

            }


            if (
                character === "/" &&
                nextCharacter === "/"
            ) {

                inLineComment =
                    true;

                index++;

                continue;

            }


            if (
                character === "/" &&
                nextCharacter === "*"
            ) {

                inBlockComment =
                    true;

                index++;

                continue;

            }


            if (
                character === "'"
            ) {

                inSingleQuote =
                    true;

                continue;

            }


            if (
                character === '"'
            ) {

                inDoubleQuote =
                    true;

                continue;

            }


            if (
                character === ";"
            ) {

                /*
                 * A declaration without a function body.
                 */

                return -1;

            }


            if (
                character === "{"
            ) {

                return index;

            }

        }


        return -1;

    }


    private findMatchingSolidityBrace(
        content:
            string,
        openingBrace:
            number
    ): number {

        let depth =
            0;

        let inSingleQuote =
            false;

        let inDoubleQuote =
            false;

        let inLineComment =
            false;

        let inBlockComment =
            false;

        let escaped =
            false;


        for (
            let index = openingBrace;
            index < content.length;
            index++
        ) {

            const character =
                content[index];

            const nextCharacter =
                content[index + 1] ?? "";


            if (
                inLineComment
            ) {

                if (
                    character === "\n"
                ) {

                    inLineComment =
                        false;

                }


                continue;

            }


            if (
                inBlockComment
            ) {

                if (
                    character === "*" &&
                    nextCharacter === "/"
                ) {

                    inBlockComment =
                        false;

                    index++;

                }


                continue;

            }


            if (
                inSingleQuote
            ) {

                if (
                    escaped
                ) {

                    escaped =
                        false;

                    continue;

                }


                if (
                    character === "\\"
                ) {

                    escaped =
                        true;

                    continue;

                }


                if (
                    character === "'"
                ) {

                    inSingleQuote =
                        false;

                }


                continue;

            }


            if (
                inDoubleQuote
            ) {

                if (
                    escaped
                ) {

                    escaped =
                        false;

                    continue;

                }


                if (
                    character === "\\"
                ) {

                    escaped =
                        true;

                    continue;

                }


                if (
                    character === '"'
                ) {

                    inDoubleQuote =
                        false;

                }


                continue;

            }


            if (
                character === "/" &&
                nextCharacter === "/"
            ) {

                inLineComment =
                    true;

                index++;

                continue;

            }


            if (
                character === "/" &&
                nextCharacter === "*"
            ) {

                inBlockComment =
                    true;

                index++;

                continue;

            }


            if (
                character === "'"
            ) {

                inSingleQuote =
                    true;

                continue;

            }


            if (
                character === '"'
            ) {

                inDoubleQuote =
                    true;

                continue;

            }


            if (
                character === "{"
            ) {

                depth++;

                continue;

            }


            if (
                character === "}"
            ) {

                depth--;


                if (
                    depth === 0
                ) {

                    return index;

                }

            }

        }


        return -1;

    }


    private findNextSolidityFunctionStart(
        content:
            string,
        start:
            number
    ): number {

        const remaining =
            content.slice(
                start
            );


        const match =
            /\bfunction\s+[A-Za-z0-9_]+\s*\(/.exec(
                remaining
            );


        if (
            !match ||
            match.index === undefined
        ) {

            return content.length;

        }


        return (
            start +
            match.index
        );

    }

}