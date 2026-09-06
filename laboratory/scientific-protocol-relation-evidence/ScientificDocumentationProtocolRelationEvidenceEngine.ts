import type {
    ScientificSourceObservation
} from "../scientific-source-observation/ScientificSourceObservation.js";

import type {
    ScientificSourceObservationLocator
} from "../scientific-source-observation/ScientificSourceObservationLocator.js";

import type {
    ScientificProtocolRelationEvidence
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

    lineIndex:
        number;

    rawText:
        string;

}


interface ExplicitExtensionRelation {

    objectProtocolId:
        string;

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
                    (
                        a,
                        b
                    ) =>
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
                    documentationObservations
                        .map(
                            observation =>
                                observation.observationId
                        ),

                errors

            };

        }


        const relations:
            ScientificProtocolRelationEvidence[] =
            [];

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


            const explicitRelations =
                this.explicitExtensionRelations(
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

                    relation:
                        "EXTENSION_FOR",

                    objectProtocolId:
                        explicitRelation.objectProtocolId,

                    evidenceBasis:
                        "MARKDOWN_H1_EXPLICIT_EXTENSION_FOR_ERC",

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
            (
                a,
                b
            ) =>
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


        return errors;

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


            /*
             * Only an actual Markdown H1 is eligible.
             * Lower-level headings and free prose are excluded.
             */
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
                    headingMatch[1]
                        .trim()
                );


            /*
             * The document subject must be a single observed
             * symbol rather than a descriptive title.
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


    private explicitExtensionRelations(
        lines:
            string[]
    ): ExplicitExtensionRelation[] {

        const relations:
            ExplicitExtensionRelation[] =
            [];

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


            /*
             * Deliberately narrow documentary grammar.
             *
             * A co-mention of two standards is not a relation.
             * A table row is not a relation.
             * Only the explicit phrase below is evidence.
             */
            const relationPattern =
                /\bextension\s+for\s+ERC-([1-9][0-9]*)\b/g;


            for (
                const match
                of rawLine.matchAll(
                    relationPattern
                )
            ) {

                relations.push({

                    objectProtocolId:
                        `ERC-${match[1]}`,

                    lineIndex,

                    rawText:
                        rawLine

                });

            }

        }


        return relations;

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

        const observationStartLine =
            observationLocator.startLine ??
            1;

        const exactLine =
            observationStartLine +
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
            ExplicitExtensionRelation,
        locator:
            ScientificSourceObservationLocator
    ): string {

        const revisionPresence =
            input.sourceRevision ===
                undefined
                ? "REVISION-ABSENT"
                : "REVISION-PRESENT";

        const revisionValue =
            input.sourceRevision ??
            "";

        const filePathPresence =
            locator.filePath ===
                undefined
                ? "FILE-PATH-ABSENT"
                : "FILE-PATH-PRESENT";

        const filePathValue =
            locator.filePath ??
            "";

        const startLinePresence =
            locator.startLine ===
                undefined
                ? "START-LINE-ABSENT"
                : "START-LINE-PRESENT";

        const startLineValue =
            locator.startLine ===
                undefined
                ? ""
                : String(
                    locator.startLine
                );


        const identityComponents =
            [
                "PROTOCOL-RELATION-EVIDENCE",
                input.sourceId,
                revisionPresence,
                revisionValue,
                observation.observationId,
                subject.symbol,
                "EXTENSION_FOR",
                relation.objectProtocolId,
                locator.sourceLocation,
                filePathPresence,
                filePathValue,
                startLinePresence,
                startLineValue,
                relation.rawText
            ];


        return identityComponents
            .map(
                component =>
                    `${component.length}:${component}`
            )
            .join(
                "|"
            );

    }

}
