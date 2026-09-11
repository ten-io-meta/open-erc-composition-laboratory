import type {
    ScientificSourceObservation
} from "../scientific-source-observation/ScientificSourceObservation.js";

import type {
    ScientificSourceObservationLocator
} from "../scientific-source-observation/ScientificSourceObservationLocator.js";

import type {
    ScientificProtocolRelationEvidence,
    ScientificProtocolRelationEvidenceBasis,
    ScientificProtocolRelationKind
} from "./ScientificProtocolRelationEvidence.js";

import type {
    ScientificProtocolRelationEvidenceResult
} from "./ScientificProtocolRelationEvidenceResult.js";


export interface ScientificDocumentationProtocolRelationEvidenceInput {

    sourceId:
        string;

    sourceRevision?:
        string;

    observations:
        ScientificSourceObservation[];

}


interface MarkdownSubject {

    symbol:
        string;

    protocolId?:
        string;

    lineIndex:
        number;

    rawText:
        string;

}


interface ExplicitDocumentedRelation {

    relation:
        ScientificProtocolRelationKind;

    objectProtocolId:
        string;

    evidenceBasis:
        ScientificProtocolRelationEvidenceBasis;

    lineIndex:
        number;

    rawText:
        string;

}


export class ScientificDocumentationProtocolRelationEvidenceEngine {

    extract(
        input:
            ScientificDocumentationProtocolRelationEvidenceInput
    ): ScientificProtocolRelationEvidenceResult {

        const errors =
            this.boundaryErrors(
                input
            );


        const documentationObservations =
            input.observations
                .filter(
                    observation =>
                        observation.kind ===
                        "DOCUMENTATION"
                )
                .sort(
                    (a, b) =>
                        a.observationId.localeCompare(
                            b.observationId
                        )
                );


        if (
            errors.length >
            0
        ) {

            return {

                sourceId:
                    input.sourceId,

                sourceRevision:
                    input.sourceRevision,

                relations:
                    [],

                unresolvedObservationIds:
                    documentationObservations.map(
                        observation =>
                            observation.observationId
                    ),

                errors

            };

        }


        const relations:
            ScientificProtocolRelationEvidence[] = [];

        const unresolvedObservationIds =
            new Set<string>();


        for (
            const observation
            of documentationObservations
        ) {

            const lines =
                observation.rawText.split(
                    /\r?\n/
                );


            const subject =
                this.markdownTopLevelSubject(
                    lines
                );


            if (
                !subject
            ) {

                unresolvedObservationIds.add(
                    observation.observationId
                );

                continue;

            }


            const pathProtocolId =
                this.protocolIdFromExplicitSourcePathSegment(
                    observation.locator.filePath
                );


            /*
             * Explicit H1 identity and explicit path identity must
             * agree when both are present.
             */
            if (
                subject.protocolId !==
                    undefined &&
                pathProtocolId !==
                    undefined &&
                subject.protocolId !==
                    pathProtocolId
            ) {

                unresolvedObservationIds.add(
                    observation.observationId
                );

                continue;

            }


            const subjectProtocolId =
                subject.protocolId ??
                pathProtocolId;


            const explicitRelations =
                this.explicitDocumentedRelations(
                    lines
                );


            if (
                explicitRelations.length ===
                0
            ) {

                unresolvedObservationIds.add(
                    observation.observationId
                );

                continue;

            }


            for (
                const explicitRelation
                of explicitRelations
            ) {

                const subjectLocator =
                    this.lineLocator(
                        observation.locator,
                        subject.lineIndex
                    );


                const relationLocator =
                    this.lineLocator(
                        observation.locator,
                        explicitRelation.lineIndex
                    );


                relations.push({

                    relationEvidenceId:
                        this.relationEvidenceId(
                            input,
                            observation,
                            subject,
                            explicitRelation,
                            relationLocator
                        ),

                    sourceId:
                        input.sourceId,

                    sourceRevision:
                        input.sourceRevision,

                    observationId:
                        observation.observationId,

                    subjectSymbol:
                        subject.symbol,

                    ...(
                        subjectProtocolId !==
                            undefined
                            ? {
                                subjectProtocolId
                            }
                            : {}
                    ),

                    relation:
                        explicitRelation.relation,

                    objectProtocolId:
                        explicitRelation.objectProtocolId,

                    evidenceBasis:
                        explicitRelation.evidenceBasis,

                    subjectLocator,

                    subjectRawText:
                        subject.rawText,

                    locator:
                        relationLocator,

                    rawText:
                        explicitRelation.rawText

                });

            }

        }


        relations.sort(
            (a, b) =>
                a.relationEvidenceId.localeCompare(
                    b.relationEvidenceId
                )
        );


        return {

            sourceId:
                input.sourceId,

            sourceRevision:
                input.sourceRevision,

            relations,

            unresolvedObservationIds:
                [
                    ...unresolvedObservationIds
                ].sort(),

            errors:
                []

        };

    }


    private boundaryErrors(
        input:
            ScientificDocumentationProtocolRelationEvidenceInput
    ): string[] {

        const errors:
            string[] = [];


        if (
            input.sourceId.trim().length ===
            0
        ) {

            errors.push(
                "Documentation protocol relation evidence requires a non-empty source identity."
            );

        }


        const observationIds =
            new Set<string>();


        for (
            const observation
            of input.observations.filter(
                observation =>
                    observation.kind ===
                    "DOCUMENTATION"
            )
        ) {

            if (
                observation.observationId.trim().length ===
                0
            ) {

                errors.push(
                    "Documentation protocol relation evidence received an empty observation identity."
                );

                continue;

            }


            if (
                observationIds.has(
                    observation.observationId
                )
            ) {

                errors.push(
                    `Duplicate observation identity ${observation.observationId}.`
                );

                continue;

            }


            observationIds.add(
                observation.observationId
            );


            if (
                observation.sourceId !==
                input.sourceId
            ) {

                errors.push(
                    `Observation ${observation.observationId} belongs to source ${observation.sourceId}, expected ${input.sourceId}.`
                );

            }


            if (
                observation.sourceRevision !==
                input.sourceRevision
            ) {

                errors.push(
                    `Observation ${observation.observationId} has a different source revision.`
                );

            }


            if (
                observation.rawText.length ===
                0
            ) {

                errors.push(
                    `Observation ${observation.observationId} has empty raw source text.`
                );

            }


            if (
                observation.locator.sourceLocation.trim().length ===
                0
            ) {

                errors.push(
                    `Observation ${observation.observationId} has an empty source location.`
                );

            }

        }


        return errors.sort();

    }


    private markdownTopLevelSubject(
        lines:
            string[]
    ): MarkdownSubject | undefined {

        let insideFence =
            false;


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

                insideFence =
                    !insideFence;

                continue;

            }


            if (
                insideFence
            ) {

                continue;

            }


            const headingMatch =
                /^#\s+(.+?)\s*$/.exec(
                    rawLine
                );


            if (
                !headingMatch
            ) {

                continue;

            }


            const candidate =
                this.unwrapInlineCode(
                    headingMatch[1].trim()
                );


            /*
             * Explicit ERC documentary heading.
             *
             * Accepted:
             *
             * # ERC-8301
             * # ERC-8301: AI Agent Execution
             * # ERC-8312 — Bounded Agent Actions
             *
             * The descriptive suffix carries no identity meaning.
             */
            const ercHeading =
                /^ERC-([1-9][0-9]*)(?:\s*(?::|—|-)\s*.+)?$/
                    .exec(
                        candidate
                    );


            if (
                ercHeading
            ) {

                const protocolId =
                    `ERC-${ercHeading[1]}`;


                return {

                    symbol:
                        protocolId,

                    protocolId,

                    lineIndex,

                    rawText:
                        rawLine

                };

            }


            /*
             * Preserve the existing conservative symbolic H1 rule.
             */
            if (
                !/^[A-Za-z_][A-Za-z0-9_]*$/.test(
                    candidate
                )
            ) {

                return undefined;

            }


            return {

                symbol:
                    candidate,

                lineIndex,

                rawText:
                    rawLine

            };

        }


        return undefined;

    }


    private explicitDocumentedRelations(
        lines:
            string[]
    ): ExplicitDocumentedRelation[] {

        const relations:
            ExplicitDocumentedRelation[] = [];

        const seen =
            new Set<string>();

        let insideFence =
            false;


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

                insideFence =
                    !insideFence;

                continue;

            }


            /*
             * Examples, diagrams, blockquotes and tables remain
             * excluded. A plain ERC co-mention is never enough.
             */
            if (
                insideFence ||
                trimmed.startsWith(
                    "|"
                ) ||
                trimmed.startsWith(
                    ">"
                )
            ) {

                continue;

            }


            const grammars = [

                {
                    relation:
                        "EXTENSION_FOR" as const,

                    evidenceBasis:
                        "MARKDOWN_H1_EXPLICIT_EXTENSION_FOR_ERC" as const,

                    pattern:
                        /\bextension\s+for\s+(?:\[\s*)?ERC-([1-9][0-9]*)(?:\s*\])?/gi
                },

                {
                    relation:
                        "COMPOSES_WITH" as const,

                    evidenceBasis:
                        "MARKDOWN_H1_EXPLICIT_COMPOSES_WITH_ERC" as const,

                    pattern:
                        /\bcomposes?\s+with\s+(?:\[\s*)?ERC-([1-9][0-9]*)(?:\s*\])?/gi
                },

                {
                    relation:
                        "COMPOSES_WITH" as const,

                    evidenceBasis:
                        "MARKDOWN_H1_EXPLICIT_COMPOSES_WITH_ERC" as const,

                    pattern:
                        /\bcomposing\b[^.\r\n]{0,160}?\bwith\s+(?:\[\s*)?ERC-([1-9][0-9]*)(?:\s*\])?/gi
                }

            ];


            for (
                const grammar
                of grammars
            ) {

                for (
                    const match
                    of rawLine.matchAll(
                        grammar.pattern
                    )
                ) {

                    const objectProtocolId =
                        `ERC-${match[1]}`;


                    const key =
                        [
                            grammar.relation,
                            objectProtocolId,
                            String(
                                lineIndex
                            )
                        ].join(
                            "|"
                        );


                    if (
                        seen.has(
                            key
                        )
                    ) {

                        continue;

                    }


                    seen.add(
                        key
                    );


                    relations.push({

                        relation:
                            grammar.relation,

                        objectProtocolId,

                        evidenceBasis:
                            grammar.evidenceBasis,

                        lineIndex,

                        rawText:
                            rawLine

                    });

                }

            }

        }


        return relations.sort(
            (a, b) =>
                [
                    a.lineIndex,
                    a.relation,
                    a.objectProtocolId
                ]
                    .join("|")
                    .localeCompare(
                        [
                            b.lineIndex,
                            b.relation,
                            b.objectProtocolId
                        ].join("|")
                    )
        );

    }


    private protocolIdFromExplicitSourcePathSegment(
        filePath:
            string | undefined
    ): string | undefined {

        if (
            filePath ===
            undefined
        ) {

            return undefined;

        }


        const normalized =
            filePath.replace(
                /\\/g,
                "/"
            );


        const protocolIds =
            new Set<string>();


        const pattern =
            /(?:^|\/)ERC([1-9][0-9]*)(?=\/|$)/g;


        let match:
            RegExpExecArray | null;


        while (
            (
                match =
                    pattern.exec(
                        normalized
                    )
            ) !==
            null
        ) {

            protocolIds.add(
                `ERC-${match[1]}`
            );

        }


        if (
            protocolIds.size !==
            1
        ) {

            return undefined;

        }


        return [
            ...protocolIds
        ][0];

    }


    private unwrapInlineCode(
        value:
            string
    ): string {

        if (
            value.length >=
                2 &&
            value.startsWith(
                "`"
            ) &&
            value.endsWith(
                "`"
            )
        ) {

            return value.slice(
                1,
                -1
            );

        }


        return value;

    }


    private lineLocator(
        observationLocator:
            ScientificSourceObservationLocator,
        zeroBasedLineIndex:
            number
    ): ScientificSourceObservationLocator {

        const exactLine =
            (
                observationLocator.startLine ??
                1
            ) +
            zeroBasedLineIndex;


        return {

            sourceLocation:
                observationLocator.sourceLocation,

            ...(
                observationLocator.filePath !==
                    undefined
                    ? {
                        filePath:
                            observationLocator.filePath
                    }
                    : {}
            ),

            startLine:
                exactLine,

            endLine:
                exactLine

        };

    }


    private relationEvidenceId(
        input:
            ScientificDocumentationProtocolRelationEvidenceInput,
        observation:
            ScientificSourceObservation,
        subject:
            MarkdownSubject,
        relation:
            ExplicitDocumentedRelation,
        locator:
            ScientificSourceObservationLocator
    ): string {

        const components =
            [
                "PROTOCOL-RELATION-EVIDENCE",
                input.sourceId,
                input.sourceRevision ===
                    undefined
                    ? "REVISION-ABSENT"
                    : "REVISION-PRESENT",
                input.sourceRevision ??
                    "",
                observation.observationId,
                subject.symbol,
                relation.relation,
                relation.objectProtocolId,
                relation.evidenceBasis,
                locator.sourceLocation,
                locator.filePath ??
                    "",
                locator.startLine ===
                    undefined
                    ? ""
                    : String(
                        locator.startLine
                    ),
                relation.rawText
            ];


        return components
            .map(
                component =>
                    `${component.length}:${component}`
            )
            .join("|");

    }

}
