import type {
    ScientificSourceObservation
} from "../scientific-source-observation/ScientificSourceObservation.js";

import type {
    ScientificSourceFact,
    ScientificSourceFactContainerKind,
    ScientificSourceFactKind
} from "./ScientificSourceFact.js";

import type {
    ScientificSourceExternalCall
} from "./ScientificSourceExternalCall.js";


interface PendingFact {

    kind:
        ScientificSourceFactKind;

    symbol?:
        string;

    containerKind?:
        ScientificSourceFactContainerKind;

    containerSymbol?:
        string;

    externalCall?:
        ScientificSourceExternalCall;

    line:
        number;

    /*
     * Structural facts may span multiple source lines.
     *
     * This is used when the complete observable source fragment
     * extends beyond the line on which the fact begins.
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
                lines,
                baseLine,
                pending
            );


            this.extractExternalCallFacts(
                clean,
                lineNumber,
                lines,
                baseLine,
                braceDepth,
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
                    fact.externalCall !==
                        undefined
                        ? {
                            externalCall: {
                                ...fact.externalCall
                            }
                        }
                        : {}
                ),

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


    /*
     * Recover the complete lexical source fragment for one Solidity
     * require(...) statement.
     *
     * Parenthesis depth is calculated from the sanitized lexical
     * view so parentheses and semicolons inside comments or quoted
     * literals cannot terminate the fact prematurely.
     *
     * The original unsanitized lines remain the scientific rawText.
     */
    private completeRequireStatement(
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


        /*
         * Reconstruct block-comment state at the exact starting
         * source line. This makes the helper independent of caller
         * state while preserving the same lexical rules used by the
         * main extractor.
         */
        let inBlockComment =
            false;


        for (
            let index =
                0;
            index <
                startIndex;
            index++
        ) {

            inBlockComment =
                this.sanitizeLine(
                    lines[index],
                    inBlockComment
                ).inBlockComment;

        }


        const fragments:
            string[] = [];

        let requireOpened =
            false;

        let parenthesisDepth =
            0;

        let callClosed =
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

            fragments.push(
                rawLine
            );


            const sanitized =
                this.sanitizeLine(
                    rawLine,
                    inBlockComment
                );

            inBlockComment =
                sanitized.inBlockComment;

            const code =
                sanitized.code;


            let scanStart =
                0;


            if (
                !requireOpened
            ) {

                const requireMatch =
                    /\brequire\s*\(/.exec(
                        code
                    );


                if (
                    !requireMatch
                ) {

                    return undefined;

                }


                scanStart =
                    requireMatch.index;

            }


            for (
                let characterIndex =
                    scanStart;
                characterIndex <
                    code.length;
                characterIndex++
            ) {

                const character =
                    code[
                        characterIndex
                    ];


                if (
                    !requireOpened
                ) {

                    if (
                        character ===
                        "("
                    ) {

                        requireOpened =
                            true;

                        parenthesisDepth =
                            1;

                    }


                    continue;

                }


                if (
                    callClosed
                ) {

                    if (
                        character ===
                        ";"
                    ) {

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


                    continue;

                }


                if (
                    character ===
                    "("
                ) {

                    parenthesisDepth++;

                    continue;

                }


                if (
                    character ===
                    ")"
                ) {

                    parenthesisDepth--;


                    if (
                        parenthesisDepth <
                        0
                    ) {

                        return undefined;

                    }


                    if (
                        parenthesisDepth ===
                        0
                    ) {

                        callClosed =
                            true;

                    }

                }

            }

        }


        return undefined;

    }

    private extractStatementFacts(
        clean:
            string,
        rawLine:
            string,
        lineNumber:
            number,
        lines:
            string[],
        baseLine:
            number,
        pending:
            PendingFact[]
    ): void {

        if (
            /\brequire\s*\(/.test(
                clean
            )
        ) {

            const complete =
                this.completeRequireStatement(
                    lines,
                    baseLine,
                    lineNumber
                );


            this.add(
                pending,
                "REQUIRE_STATEMENT",
                undefined,
                lineNumber,
                complete?.rawText ??
                    rawLine,
                complete?.endLine
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
            string,
        endLine?:
            number
    ): void {

        pending.push({

            kind,

            symbol,

            line,

            ...(
                endLine !==
                    undefined
                    ? {
                        endLine
                    }
                    : {}
            ),

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
    private extractExternalCallFacts(
        clean:
            string,
        lineNumber:
            number,
        lines:
            string[],
        baseLine:
            number,
        braceDepth:
            number,
        pending:
            PendingFact[]
    ): void {

        /*
         * External interactions are meaningful only from inside
         * an executable Solidity body. Top-level/interface
         * declarations are therefore outside this observation
         * boundary.
         */
        if (
            braceDepth <
            2
        ) {

            return;

        }


        /*
         * Detection begins only when the call head itself is
         * observed on this source line.
         *
         * Multiline arguments are completed by the helper below.
         * We intentionally do not manufacture a call whose callee
         * head begins on an unseen previous line.
         */
        const initialHead =
            this.externalCallHead(
                clean
            );


        if (
            initialHead ===
            undefined
        ) {

            return;

        }


        const complete =
            this.completeExternalCallExpression(
                lines,
                baseLine,
                lineNumber
            );


        if (
            complete ===
            undefined
        ) {

            /*
             * Fail closed when balanced call syntax cannot be
             * completely observed.
             */
            return;

        }


        pending.push(
            {
                kind:
                    "EXTERNAL_CALL_EXPRESSION",

                line:
                    lineNumber,

                endLine:
                    complete.endLine,

                rawText:
                    complete.rawText,

                externalCall:
                    complete.externalCall
            }
        );

    }


    private externalCallHead(
        code:
            string
    ): {
        startIndex:
            number;
        openParenthesisIndex:
            number;
        externalCall:
            ScientificSourceExternalCall;
    } | undefined {

        /*
         * Low-level Solidity forms:
         *
         * target.call(...)
         * target.staticcall(...)
         * target.delegatecall(...)
         *
         * A simple cast expression is also retained as the target,
         * e.g. payable(msg.sender).call{value: amount}(...).
         */
        const lowLevelMatch =
            /\b([A-Za-z_][A-Za-z0-9_.]*(?:\s*\([^()\n]*\))?)\s*\.\s*(call|staticcall|delegatecall)\s*(?:\{[^{}\n]*\})?\s*\(/.exec(
                code
            );


        /*
         * Syntactic typed/cast member call:
         *
         * SomeType(target).member(...)
         *
         * This is deliberately called CAST_MEMBER_CALL rather
         * than CALL because source syntax alone does not establish
         * the EVM opcode eventually used at runtime.
         */
        const castMemberMatch =
            /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*([A-Za-z_][A-Za-z0-9_.]*)\s*\)\s*\.\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(/.exec(
                code
            );


        const useLowLevel =
            lowLevelMatch !==
                null &&
            (
                castMemberMatch ===
                    null ||
                lowLevelMatch.index <=
                    castMemberMatch.index
            );


        if (
            useLowLevel &&
            lowLevelMatch
        ) {

            const lowLevelForm:
                ScientificSourceExternalCall["callForm"] =
                lowLevelMatch[2] ===
                    "call"
                    ? "LOW_LEVEL_CALL"
                    : lowLevelMatch[2] ===
                        "staticcall"
                        ? "LOW_LEVEL_STATICCALL"
                        : "LOW_LEVEL_DELEGATECALL";


            const encodedCallMatch =
                /\babi\s*\.\s*encodeCall\s*\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*([A-Za-z_][A-Za-z0-9_]*)\s*,/.exec(
                    code
                );


            return {

                startIndex:
                    lowLevelMatch.index,

                openParenthesisIndex:
                    lowLevelMatch.index +
                    lowLevelMatch[0]
                        .lastIndexOf(
                            "("
                        ),

                externalCall: {

                    callForm:
                        lowLevelForm,

                    targetExpression:
                        lowLevelMatch[1]
                            .replace(
                                /\s+/g,
                                " "
                            )
                            .trim(),

                    ...(
                        encodedCallMatch
                            ? {
                                encodedCallTypeSymbol:
                                    encodedCallMatch[1],

                                encodedCallMemberSymbol:
                                    encodedCallMatch[2]
                            }
                            : {}
                    )

                }

            };

        }


        if (
            castMemberMatch
        ) {

            return {

                startIndex:
                    castMemberMatch.index,

                openParenthesisIndex:
                    castMemberMatch.index +
                    castMemberMatch[0]
                        .lastIndexOf(
                            "("
                        ),

                externalCall: {

                    callForm:
                        "CAST_MEMBER_CALL",

                    targetExpression:
                        castMemberMatch[2],

                    castTypeSymbol:
                        castMemberMatch[1],

                    memberSymbol:
                        castMemberMatch[3]

                }

            };

        }


        return undefined;

    }


    private completeExternalCallExpression(
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
        externalCall:
            ScientificSourceExternalCall;
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


        /*
         * Reconstruct block-comment state at the exact call-site
         * line so completion uses the same lexical boundary as the
         * main extractor.
         */
        let inBlockComment =
            false;


        for (
            let index =
                0;
            index <
                startIndex;
            index++
        ) {

            inBlockComment =
                this.sanitizeLine(
                    lines[index],
                    inBlockComment
                ).inBlockComment;

        }


        const rawFragments:
            string[] =
            [];

        const codeFragments:
            string[] =
            [];


        for (
            let index =
                startIndex;
            index <
                lines.length;
            index++
        ) {

            const rawLine =
                lines[index];


            rawFragments.push(
                rawLine
            );


            const sanitized =
                this.sanitizeLine(
                    rawLine,
                    inBlockComment
                );


            inBlockComment =
                sanitized.inBlockComment;


            codeFragments.push(
                sanitized.code
            );


            const combinedCode =
                codeFragments.join(
                    "\n"
                );


            const head =
                this.externalCallHead(
                    combinedCode
                );


            if (
                head ===
                undefined
            ) {

                continue;

            }


            /*
             * Each fact begins on the line where its own call head
             * was directly observed.
             */
            const firstNewline =
                combinedCode.indexOf(
                    "\n"
                );

            if (
                firstNewline >=
                    0 &&
                head.startIndex >
                    firstNewline
            ) {

                return undefined;

            }


            if (
                !this.externalCallParenthesesClosed(
                    combinedCode,
                    head.openParenthesisIndex
                )
            ) {

                continue;

            }


            /*
             * Re-parse against the complete sanitized expression so
             * nested abi.encodeCall(...) metadata can be observed
             * even when it spans multiple lines.
             */
            const completeHead =
                this.externalCallHead(
                    combinedCode
                );


            if (
                completeHead ===
                undefined
            ) {

                return undefined;

            }


            return {

                rawText:
                    rawFragments.join(
                        "\n"
                    ),

                endLine:
                    baseLine +
                    index,

                externalCall:
                    completeHead.externalCall

            };

        }


        return undefined;

    }


    private externalCallParenthesesClosed(
        code:
            string,
        openParenthesisIndex:
            number
    ): boolean {

        if (
            openParenthesisIndex <
                0 ||
            openParenthesisIndex >=
                code.length ||
            code[
                openParenthesisIndex
            ] !==
                "("
        ) {

            return false;

        }


        let depth =
            0;


        for (
            let index =
                openParenthesisIndex;
            index <
                code.length;
            index++
        ) {

            const character =
                code[index];


            if (
                character ===
                "("
            ) {

                depth++;

                continue;

            }


            if (
                character !==
                ")"
            ) {

                continue;

            }


            depth--;


            if (
                depth ===
                0
            ) {

                return true;

            }


            if (
                depth <
                0
            ) {

                return false;

            }

        }


        return false;

    }

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