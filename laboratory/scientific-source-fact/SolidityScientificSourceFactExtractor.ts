import type {
    ScientificSourceObservation
} from "../scientific-source-observation/ScientificSourceObservation.js";

import type {
    ScientificSourceFact,
    ScientificSourceFactContainerKind,
    ScientificSourceFactKind
} from "./ScientificSourceFact.js";


interface PendingFact {

    kind:
        ScientificSourceFactKind;

    symbol?:
        string;

    containerKind?:
        ScientificSourceFactContainerKind;

    containerSymbol?:
        string;

    line:
        number;

    /*
     * Declaration facts may span multiple source lines.
     *
     * Non-declaration facts remain single-line and therefore leave
     * this absent.
     */
    endLine?:
        number;

    rawText:
        string;

}


interface SanitizedLineResult {

    code:
        string;

    inBlockComment:
        boolean;

}


export class SolidityScientificSourceFactExtractor {

    extract(
        observation:
            ScientificSourceObservation
    ): ScientificSourceFact[] {

        if (
            observation.kind !==
            "CONTRACT_SOURCE"
        ) {

            return [];

        }

        const lines =
            observation.rawText.split(
                /\r?\n/
            );

        const baseLine =
            observation.locator.startLine ??
            1;

        const pending:
            PendingFact[] = [];

        let braceDepth =
            0;

        let inBlockComment =
            false;

        let activeContainerKind:
            ScientificSourceFactContainerKind | undefined;

        let activeContainerSymbol:
            string | undefined;

        let pendingContainerKind:
            ScientificSourceFactContainerKind | undefined;

        let pendingContainerSymbol:
            string | undefined;


        for (
            let index = 0;
            index < lines.length;
            index++
        ) {

            const rawLine =
                lines[index];

            const sanitized =
                this.sanitizeLine(
                    rawLine,
                    inBlockComment
                );

            inBlockComment =
                sanitized.inBlockComment;

            const codeLine =
                sanitized.code;

            const clean =
                codeLine.trim();

            const lineNumber =
                baseLine +
                index;


            if (
                clean.length ===
                0
            ) {

                braceDepth +=
                    this.braceDelta(
                        codeLine
                    );

                continue;

            }


            const interfaceContainerMatch =
                /\binterface\s+([A-Za-z_][A-Za-z0-9_]*)\b/.exec(
                    clean
                );

            const contractContainerMatch =
                /\bcontract\s+([A-Za-z_][A-Za-z0-9_]*)\b/.exec(
                    clean
                );


            const declaredContainerKind:
                ScientificSourceFactContainerKind | undefined =
                interfaceContainerMatch
                    ? "INTERFACE"
                    : contractContainerMatch
                        ? "CONTRACT"
                        : undefined;

            const declaredContainerSymbol =
                interfaceContainerMatch?.[1] ??
                contractContainerMatch?.[1];


            /*
             * A declaration may open its body on this line or on
             * a later line. For facts observed on the same line,
             * the declared container is already structurally known.
             */
            const lineContainerKind =
                activeContainerKind ??
                declaredContainerKind ??
                pendingContainerKind;

            const lineContainerSymbol =
                activeContainerSymbol ??
                declaredContainerSymbol ??
                pendingContainerSymbol;


            const firstPendingIndex =
                pending.length;


            this.extractDeclarationFacts(
                clean,
                rawLine,
                lineNumber,
                braceDepth,
                pending
            );


            this.extractStatementFacts(
                clean,
                rawLine,
                lineNumber,
                pending
            );


            /*
             * Attach only observable structural containment.
             *
             * The container declaration itself remains top-level;
             * member declarations and statements inherit the
             * currently observed interface or contract scope.
             */
            if (
                lineContainerKind &&
                lineContainerSymbol
            ) {

                for (
                    let pendingIndex =
                        firstPendingIndex;
                    pendingIndex <
                        pending.length;
                    pendingIndex++
                ) {

                    const fact =
                        pending[pendingIndex];


                    if (
                        fact.kind ===
                            "INTERFACE_DECLARATION" ||
                        fact.kind ===
                            "CONTRACT_DECLARATION"
                    ) {

                        continue;

                    }


                    fact.containerKind =
                        lineContainerKind;

                    fact.containerSymbol =
                        lineContainerSymbol;

                }

            }


            const opensBrace =
                codeLine.includes(
                    "{"
                );

            const lineBraceDelta =
                this.braceDelta(
                    codeLine
                );


            braceDepth +=
                lineBraceDelta;


            /*
             * Leaving the top-level Solidity body closes the
             * active interface or contract scope.
             */
            if (
                activeContainerKind &&
                braceDepth ===
                    0
            ) {

                activeContainerKind =
                    undefined;

                activeContainerSymbol =
                    undefined;

            }


            /*
             * A newly observed declaration starts its structural
             * scope either immediately or when a later opening
             * brace is encountered.
             */
            if (
                !activeContainerKind &&
                declaredContainerKind &&
                declaredContainerSymbol
            ) {

                if (
                    opensBrace
                ) {

                    if (
                        braceDepth >
                        0
                    ) {

                        activeContainerKind =
                            declaredContainerKind;

                        activeContainerSymbol =
                            declaredContainerSymbol;

                    }


                    pendingContainerKind =
                        undefined;

                    pendingContainerSymbol =
                        undefined;

                } else {

                    pendingContainerKind =
                        declaredContainerKind;

                    pendingContainerSymbol =
                        declaredContainerSymbol;

                }

            } else if (
                !activeContainerKind &&
                pendingContainerKind &&
                pendingContainerSymbol &&
                opensBrace
            ) {

                if (
                    braceDepth >
                    0
                ) {

                    activeContainerKind =
                        pendingContainerKind;

                    activeContainerSymbol =
                        pendingContainerSymbol;

                }


                pendingContainerKind =
                    undefined;

                pendingContainerSymbol =
                    undefined;

            }

        }


        /*
         * Preserve the complete observable Solidity declaration
         * header through its structural opening brace.
         *
         * Declaration detection remains line-local. This enrichment
         * only expands raw provenance for declarations that were
         * already independently observed.
         */
        for (
            const fact
            of pending
        ) {

            if (
                fact.kind !==
                    "INTERFACE_DECLARATION" &&
                fact.kind !==
                    "CONTRACT_DECLARATION"
            ) {

                continue;

            }


            const declarationHeader =
                this.completeDeclarationHeader(
                    lines,
                    baseLine,
                    fact.line
                );


            if (
                declarationHeader ===
                undefined
            ) {

                /*
                 * Fail closed: retain the original line-local fact
                 * rather than manufacture a multiline fragment when
                 * no structural opening brace can be observed.
                 */
                continue;

            }


            fact.rawText =
                declarationHeader.rawText;

            fact.endLine =
                declarationHeader.endLine;

        }

        pending.sort(
            (
                a,
                b
            ) => {

                if (
                    a.line !==
                    b.line
                ) {

                    return (
                        a.line -
                        b.line
                    );

                }


                const kindOrder =
                    a.kind.localeCompare(
                        b.kind
                    );

                if (
                    kindOrder !==
                    0
                ) {

                    return kindOrder;

                }


                return (
                    a.symbol ??
                    ""
                ).localeCompare(
                    b.symbol ??
                    ""
                );

            }
        );


        return pending.map(
            (
                fact,
                index
            ) => ({

                factId:
                    `${observation.observationId}-FACT-${String(
                        index + 1
                    ).padStart(
                        5,
                        "0"
                    )}`,

                observationId:
                    observation.observationId,

                sourceId:
                    observation.sourceId,

                sourceRevision:
                    observation.sourceRevision,

                kind:
                    fact.kind,

                symbol:
                    fact.symbol,

                ...(
                    fact.containerKind !==
                        undefined &&
                    fact.containerSymbol !==
                        undefined
                        ? {
                            containerKind:
                                fact.containerKind,

                            containerSymbol:
                                fact.containerSymbol
                        }
                        : {}
                ),

                locator: {

                    sourceLocation:
                        observation
                            .locator
                            .sourceLocation,

                    filePath:
                        observation
                            .locator
                            .filePath,

                    startLine:
                        fact.line,

                    endLine:
                        fact.endLine ??
                        fact.line

                },

                rawText:
                    fact.rawText

            })
        );

    }


    private completeDeclarationHeader(
        lines:
            string[],
        baseLine:
            number,
        startLine:
            number
    ): {
        rawText:
            string;

        endLine:
            number;
    } | undefined {

        const startIndex =
            startLine -
            baseLine;


        if (
            startIndex <
                0 ||
            startIndex >=
                lines.length
        ) {

            return undefined;

        }


        const fragments:
            string[] =
            [];

        let inBlockComment =
            false;


        for (
            let index =
                startIndex;
            index <
                lines.length;
            index++
        ) {

            const rawLine =
                lines[index];

            const sanitized =
                this.sanitizeLine(
                    rawLine,
                    inBlockComment
                );


            inBlockComment =
                sanitized.inBlockComment;


            const openingBraceIndex =
                sanitized.code.indexOf(
                    "{"
                );


            if (
                openingBraceIndex >=
                0
            ) {

                /*
                 * sanitizeLine is used as the lexical authority for
                 * whether a brace belongs to Solidity code rather
                 * than a comment or string.
                 *
                 * Its code representation is position-preserving for
                 * structural characters; refuse expansion otherwise.
                 */
                if (
                    sanitized.code.length !==
                    rawLine.length
                ) {

                    return undefined;

                }


                fragments.push(
                    rawLine.slice(
                        0,
                        openingBraceIndex +
                        1
                    )
                );


                return {

                    rawText:
                        fragments.join(
                            "\n"
                        ),

                    endLine:
                        baseLine +
                        index

                };

            }


            fragments.push(
                rawLine
            );

        }


        return undefined;

    }

    private extractDeclarationFacts(
        clean:
            string,
        rawLine:
            string,
        lineNumber:
            number,
        braceDepth:
            number,
        pending:
            PendingFact[]
    ): void {

        const interfaceMatch =
            /\binterface\s+([A-Za-z_][A-Za-z0-9_]*)\b/.exec(
                clean
            );

        if (
            interfaceMatch
        ) {

            this.add(
                pending,
                "INTERFACE_DECLARATION",
                interfaceMatch[1],
                lineNumber,
                rawLine
            );

        }


        const contractMatch =
            /\bcontract\s+([A-Za-z_][A-Za-z0-9_]*)\b/.exec(
                clean
            );

        if (
            contractMatch
        ) {

            this.add(
                pending,
                "CONTRACT_DECLARATION",
                contractMatch[1],
                lineNumber,
                rawLine
            );

        }


        const functionMatch =
            /\bfunction\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/.exec(
                clean
            );

        if (
            functionMatch
        ) {

            this.add(
                pending,
                "FUNCTION_DECLARATION",
                functionMatch[1],
                lineNumber,
                rawLine
            );

        }


        const modifierMatch =
            /\bmodifier\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(|\{)/.exec(
                clean
            );

        if (
            modifierMatch
        ) {

            this.add(
                pending,
                "MODIFIER_DECLARATION",
                modifierMatch[1],
                lineNumber,
                rawLine
            );

        }


        const eventMatch =
            /\bevent\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/.exec(
                clean
            );

        if (
            eventMatch
        ) {

            this.add(
                pending,
                "EVENT_DECLARATION",
                eventMatch[1],
                lineNumber,
                rawLine
            );

        }


        if (
            braceDepth ===
                1 &&
            !functionMatch &&
            !modifierMatch &&
            !eventMatch &&
            !interfaceMatch &&
            !contractMatch
        ) {

            const stateVariableMatch =
                /^(?:mapping\s*\([^;]+\)|[A-Za-z_][A-Za-z0-9_]*(?:\s*\[[^\]]*\])?)\s+(?:(?:public|private|internal|constant|immutable)\s+)*([A-Za-z_][A-Za-z0-9_]*)\s*(?:=[^;]+)?;$/.exec(
                    clean
                );

            if (
                stateVariableMatch
            ) {

                this.add(
                    pending,
                    "STATE_VARIABLE_DECLARATION",
                    stateVariableMatch[1],
                    lineNumber,
                    rawLine
                );

            }

        }

    }


    private extractStatementFacts(
        clean:
            string,
        rawLine:
            string,
        lineNumber:
            number,
        pending:
            PendingFact[]
    ): void {

        if (
            /\brequire\s*\(/.test(
                clean
            )
        ) {

            this.add(
                pending,
                "REQUIRE_STATEMENT",
                undefined,
                lineNumber,
                rawLine
            );

        }


        if (
            /\brevert\b/.test(
                clean
            )
        ) {

            this.add(
                pending,
                "REVERT_STATEMENT",
                undefined,
                lineNumber,
                rawLine
            );

        }

    }


    private add(
        pending:
            PendingFact[],
        kind:
            ScientificSourceFactKind,
        symbol:
            string | undefined,
        line:
            number,
        rawText:
            string
    ): void {

        pending.push({

            kind,

            symbol,

            line,

            rawText

        });

    }


    /*
     * Produce a lexical view of one Solidity source line.
     *
     * Comments and quoted literal contents are replaced with
     * spaces so they cannot create structural scientific facts.
     *
     * The original source line is preserved separately as
     * rawText and remains the evidence associated with a fact.
     *
     * Block-comment state is carried across source lines.
     */
    private sanitizeLine(
        line:
            string,
        initialBlockComment:
            boolean
    ): SanitizedLineResult {

        const output:
            string[] = [];

        let inBlockComment =
            initialBlockComment;

        let inSingleQuote =
            false;

        let inDoubleQuote =
            false;

        let escaped =
            false;


        for (
            let index = 0;
            index < line.length;
            index++
        ) {

            const character =
                line[index];

            const nextCharacter =
                line[
                    index + 1
                ] ??
                "";


            if (
                inBlockComment
            ) {

                output.push(
                    " "
                );


                if (
                    character === "*" &&
                    nextCharacter === "/"
                ) {

                    output.push(
                        " "
                    );

                    index++;

                    inBlockComment =
                        false;

                }


                continue;

            }


            if (
                inSingleQuote
            ) {

                output.push(
                    " "
                );


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

                output.push(
                    " "
                );


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

                while (
                    index <
                    line.length
                ) {

                    output.push(
                        " "
                    );

                    index++;

                }


                break;

            }


            if (
                character === "/" &&
                nextCharacter === "*"
            ) {

                output.push(
                    " "
                );

                output.push(
                    " "
                );

                index++;

                inBlockComment =
                    true;

                continue;

            }


            if (
                character === "'"
            ) {

                output.push(
                    " "
                );

                inSingleQuote =
                    true;

                continue;

            }


            if (
                character === '"'
            ) {

                output.push(
                    " "
                );

                inDoubleQuote =
                    true;

                continue;

            }


            output.push(
                character
            );

        }


        return {

            code:
                output.join(
                    ""
                ),

            inBlockComment

        };

    }


    /*
     * Comments and literals have already been removed from the
     * lexical view before brace depth is calculated.
     */
    private braceDelta(
        line:
            string
    ): number {

        let delta =
            0;


        for (
            const character
            of line
        ) {

            if (
                character ===
                "{"
            ) {

                delta++;

            } else if (
                character ===
                "}"
            ) {

                delta--;

            }

        }


        return delta;

    }

}