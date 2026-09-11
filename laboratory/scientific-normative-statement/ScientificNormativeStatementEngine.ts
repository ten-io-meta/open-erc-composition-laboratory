import type {
    ScientificSourceObservationLocator
} from "../scientific-source-observation/ScientificSourceObservationLocator.js";

import type {
    ScientificNormativeStatement,
    ScientificNormativeStatementBasis
} from "./ScientificNormativeStatement.js";

import type {
    ScientificNormativeStatementResult
} from "./ScientificNormativeStatementResult.js";


export interface ScientificNormativeStatementObservation {

    observationId: string;

    sourceId: string;

    sourceRevision?: string;

    locator:
        ScientificSourceObservationLocator;

    rawText: string;

}


export interface ScientificNormativeStatementEngineInput {

    observations:
        ScientificNormativeStatementObservation[];

}


interface MarkdownProseFragment {

    rawText: string;

    normalizedText: string;

    sourceLine: number;

}


function normalizeWhitespace(
    value: string
): string {

    return value
        .trim()
        .replace(
            /\s+/g,
            " "
        );

}


function endsSentence(
    value: string
): boolean {

    return /[.!?]["'`*_)\]]*$/.test(
        value.trim()
    );

}


function startsListItem(
    value: string
): boolean {

    return /^(?:[-*+]\s+|\d+[.)]\s+)/.test(
        value.trim()
    );

}


function relativeClauseBeforeModal(
    value: string,
    modalIndex: number
): boolean {

    const prefix =
        value
            .slice(
                Math.max(
                    0,
                    modalIndex - 40
                ),
                modalIndex
            )
            .toLowerCase();

    return /\b(?:that|which|who|whom|whose)\s+$/.test(
        prefix
    );

}


function classifyBasis(
    value: string
): ScientificNormativeStatementBasis | null {

    const mustNot =
        /\bmust\s+not\b/i.exec(
            value
        );

    if (
        mustNot &&
        !relativeClauseBeforeModal(
            value,
            mustNot.index
        )
    ) {

        return "MARKDOWN_PROTOCOL_MUST_NOT";

    }


    const must =
        /\bmust\b/i.exec(
            value
        );

    if (
        must &&
        !relativeClauseBeforeModal(
            value,
            must.index
        )
    ) {

        return "MARKDOWN_PROTOCOL_MUST";

    }


    return null;

}


function buildFragments(
    lines: string[]
): MarkdownProseFragment[] {

    const fragments:
        MarkdownProseFragment[] = [];

    let insideFence =
        false;

    let currentLines:
        string[] = [];

    let currentStartLine =
        0;


    const flush = () => {

        if (
            currentLines.length ===
            0
        ) {

            return;

        }


        const rawText =
            currentLines.join(
                "\n"
            );


        fragments.push({

            rawText,

            normalizedText:
                normalizeWhitespace(
                    rawText
                ),

            sourceLine:
                currentStartLine

        });


        currentLines =
            [];

        currentStartLine =
            0;

    };


    for (
        let lineIndex = 0;
        lineIndex < lines.length;
        lineIndex++
    ) {

        const rawLine =
            lines[lineIndex];

        const trimmed =
            rawLine.trim();


        if (
            trimmed.startsWith(
                "```"
            ) ||
            trimmed.startsWith(
                "~~~"
            )
        ) {

            flush();

            insideFence =
                !insideFence;

            continue;

        }


        if (
            insideFence
        ) {

            continue;

        }


        if (
            trimmed.length ===
                0 ||
            trimmed.startsWith(
                "#"
            ) ||
            trimmed.startsWith(
                ">"
            ) ||
            trimmed.startsWith(
                "|"
            )
        ) {

            flush();

            continue;

        }


        if (
            startsListItem(
                trimmed
            ) &&
            currentLines.length >
                0
        ) {

            flush();

        }


        if (
            currentLines.length >
                0 &&
            endsSentence(
                currentLines[
                    currentLines.length - 1
                ]
            )
        ) {

            flush();

        }


        if (
            currentLines.length ===
            0
        ) {

            currentStartLine =
                lineIndex + 1;

        }


        currentLines.push(
            rawLine
        );

    }


    flush();


    return fragments;

}


function statementId(
    input: {
        sourceId: string;
        sourceRevision?: string;
        observationId: string;
        protocolId: string;
        sourceLine: number;
        basis: ScientificNormativeStatementBasis;
    }
): string {

    return [
        "SCIENTIFIC-NORMATIVE-STATEMENT",
        input.sourceId,
        input.sourceRevision ??
            "NO-REVISION",
        input.observationId,
        input.protocolId,
        String(
            input.sourceLine
        ),
        input.basis
    ].join(
        "|"
    );

}


export class ScientificNormativeStatementEngine {

    extract(
        input:
            ScientificNormativeStatementEngineInput
    ): ScientificNormativeStatementResult {

        const statements:
            ScientificNormativeStatement[] = [];

        const errors:
            string[] = [];

        const seen =
            new Set<string>();


        const observations =
            [...input.observations]
                .sort(
                    (a, b) =>
                        [
                            a.sourceId,
                            a.sourceRevision ??
                                "",
                            a.observationId
                        ]
                            .join("|")
                            .localeCompare(
                                [
                                    b.sourceId,
                                    b.sourceRevision ??
                                        "",
                                    b.observationId
                                ].join("|")
                            )
                );


        for (
            const observation
            of observations
        ) {

            if (
                !observation.observationId ||
                !observation.sourceId
            ) {

                errors.push(
                    "Normative extraction requires observationId and sourceId."
                );

                continue;

            }


            const lines =
                observation.rawText
                    .split(
                        /\r?\n/
                    );


            let protocolId:
                string | null = null;


            for (
                const line
                of lines
            ) {

                const match =
                    line
                        .trim()
                        .match(
                            /^#\s+ERC-([1-9][0-9]*)\b/i
                        );


                if (
                    match
                ) {

                    protocolId =
                        `ERC-${match[1]}`;

                    break;

                }

            }


            if (
                !protocolId
            ) {

                continue;

            }


            const fragments =
                buildFragments(
                    lines
                );


            for (
                const fragment
                of fragments
            ) {

                const basis =
                    classifyBasis(
                        fragment.normalizedText
                    );


                if (
                    !basis
                ) {

                    continue;

                }


                const id =
                    statementId({

                        sourceId:
                            observation.sourceId,

                        sourceRevision:
                            observation.sourceRevision,

                        observationId:
                            observation.observationId,

                        protocolId,

                        sourceLine:
                            fragment.sourceLine,

                        basis

                    });


                if (
                    seen.has(
                        id
                    )
                ) {

                    continue;

                }


                seen.add(
                    id
                );


                statements.push({

                    statementId:
                        id,

                    sourceId:
                        observation.sourceId,

                    sourceRevision:
                        observation.sourceRevision,

                    observationId:
                        observation.observationId,

                    protocolId,

                    basis,

                    rawText:
                        fragment.rawText,

                    normalizedText:
                        fragment.normalizedText,

                    sourceLine:
                        fragment.sourceLine,

                    locator:
                        observation.locator

                });

            }

        }


        statements.sort(
            (a, b) =>
                a.statementId.localeCompare(
                    b.statementId
                )
        );


        return {
            statements,
            errors
        };

    }

}
