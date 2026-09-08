import type {
    ScientificSourceFact
} from "../scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificSolidityInheritanceContainerOccurrence,
    ScientificSolidityInheritanceEdge,
    ScientificSolidityUnresolvedInheritanceReference
} from "./ScientificSolidityInheritanceEdge.js";

import type {
    ScientificSolidityInheritanceGraphResult
} from "./ScientificSolidityInheritanceGraphResult.js";


export interface ScientificSolidityInheritanceGraphInput {

    facts:
        ScientificSourceFact[];

}


export class ScientificSolidityInheritanceGraphEngine {

    build(
        input:
            ScientificSolidityInheritanceGraphInput
    ): ScientificSolidityInheritanceGraphResult {

        const errors =
            this.boundaryErrors(
                input
            );


        if (
            errors.length >
            0
        ) {

            return {

                containers:
                    [],

                edges:
                    [],

                unresolvedInheritanceReferences:
                    [],

                errors

            };

        }


        const declarationFacts =
            input.facts
                .filter(
                    fact =>
                        fact.kind ===
                            "CONTRACT_DECLARATION" ||
                        fact.kind ===
                            "INTERFACE_DECLARATION"
                )
                .sort(
                    (
                        left,
                        right
                    ) =>
                        left.factId.localeCompare(
                            right.factId
                        )
                );


        const containers:
            ScientificSolidityInheritanceContainerOccurrence[] =
            declarationFacts.map(
                fact => ({

                    containerOccurrenceId:
                        this.containerOccurrenceId(
                            fact
                        ),

                    declarationFactId:
                        fact.factId,

                    observationId:
                        fact.observationId,

                    sourceId:
                        fact.sourceId,

                    sourceRevision:
                        fact.sourceRevision,

                    containerKind:
                        fact.kind ===
                            "INTERFACE_DECLARATION"
                            ? "INTERFACE"
                            : "CONTRACT",

                    containerSymbol:
                        fact.symbol!

                })
            );


        const containersBySymbol =
            new Map<
                string,
                ScientificSolidityInheritanceContainerOccurrence[]
            >();


        for (
            const container
            of containers
        ) {

            const existing =
                containersBySymbol.get(
                    container.containerSymbol
                ) ??
                [];

            existing.push(
                container
            );

            containersBySymbol.set(
                container.containerSymbol,
                existing
            );

        }


        for (
            const occurrences
            of containersBySymbol.values()
        ) {

            occurrences.sort(
                (
                    left,
                    right
                ) =>
                    left.containerOccurrenceId.localeCompare(
                        right.containerOccurrenceId
                    )
            );

        }


        const factsById =
            new Map(
                declarationFacts.map(
                    fact => [
                        fact.factId,
                        fact
                    ]
                )
            );


        const edges:
            ScientificSolidityInheritanceEdge[] =
            [];

        const unresolvedInheritanceReferences:
            ScientificSolidityUnresolvedInheritanceReference[] =
            [];


        for (
            const subject
            of containers
        ) {

            const subjectFact =
                factsById.get(
                    subject.declarationFactId
                );


            if (
                !subjectFact
            ) {

                continue;

            }


            const inheritedSymbols =
                this.inheritedSymbols(
                    subjectFact.rawText
                );


            for (
                const inheritedSymbol
                of inheritedSymbols
            ) {

                const candidates =
                    containersBySymbol.get(
                        inheritedSymbol
                    ) ??
                    [];


                if (
                    candidates.length !==
                    1
                ) {

                    unresolvedInheritanceReferences.push({

                        inheritanceReferenceId:
                            this.inheritanceReferenceId(
                                subjectFact,
                                inheritedSymbol
                            ),

                        subjectDeclarationFactId:
                            subjectFact.factId,

                        subjectContainerSymbol:
                            subject.containerSymbol,

                        inheritedSymbol,

                        reason:
                            candidates.length ===
                                0
                                ? "NO_DECLARATION_MATCH"
                                : "AMBIGUOUS_DECLARATION_MATCH"

                    });

                    continue;

                }


                const object =
                    candidates[0];


                edges.push({

                    inheritanceEdgeId:
                        this.inheritanceEdgeId(
                            subjectFact,
                            object,
                            inheritedSymbol
                        ),

                    subjectDeclarationFactId:
                        subject.declarationFactId,

                    subjectObservationId:
                        subject.observationId,

                    subjectSourceId:
                        subject.sourceId,

                    subjectSourceRevision:
                        subject.sourceRevision,

                    subjectContainerKind:
                        subject.containerKind,

                    subjectContainerSymbol:
                        subject.containerSymbol,

                    inheritedSymbol,

                    objectDeclarationFactId:
                        object.declarationFactId,

                    objectObservationId:
                        object.observationId,

                    objectSourceId:
                        object.sourceId,

                    objectSourceRevision:
                        object.sourceRevision,

                    objectContainerKind:
                        object.containerKind,

                    objectContainerSymbol:
                        object.containerSymbol,

                    resolutionBasis:
                        "UNIQUE_DECLARATION_SYMBOL_IN_INPUT",

                    locator:
                        subjectFact.locator,

                    rawText:
                        subjectFact.rawText

                });

            }

        }


        containers.sort(
            (
                left,
                right
            ) =>
                left.containerOccurrenceId.localeCompare(
                    right.containerOccurrenceId
                )
        );

        edges.sort(
            (
                left,
                right
            ) =>
                left.inheritanceEdgeId.localeCompare(
                    right.inheritanceEdgeId
                )
        );

        unresolvedInheritanceReferences.sort(
            (
                left,
                right
            ) =>
                left.inheritanceReferenceId.localeCompare(
                    right.inheritanceReferenceId
                )
        );


        return {

            containers,

            edges,

            unresolvedInheritanceReferences,

            errors:
                []

        };

    }


    private boundaryErrors(
        input:
            ScientificSolidityInheritanceGraphInput
    ): string[] {

        const errors:
            string[] =
            [];

        const factIds =
            new Set<string>();


        for (
            const fact
            of input.facts
        ) {

            if (
                fact.factId.trim().length ===
                0
            ) {

                errors.push(
                    "Solidity inheritance graph received an empty fact identity."
                );

                continue;

            }


            if (
                factIds.has(
                    fact.factId
                )
            ) {

                errors.push(
                    `Duplicate scientific source fact identity ${fact.factId}.`
                );

            }

            factIds.add(
                fact.factId
            );


            if (
                fact.sourceId.trim().length ===
                0
            ) {

                errors.push(
                    `Scientific source fact ${fact.factId} has an empty source identity.`
                );

            }


            if (
                fact.observationId.trim().length ===
                0
            ) {

                errors.push(
                    `Scientific source fact ${fact.factId} has an empty observation identity.`
                );

            }


            if (
                (
                    fact.kind ===
                        "CONTRACT_DECLARATION" ||
                    fact.kind ===
                        "INTERFACE_DECLARATION"
                ) &&
                (
                    !fact.symbol ||
                    fact.symbol.trim().length ===
                        0
                )
            ) {

                errors.push(
                    `Declaration fact ${fact.factId} has no structural symbol.`
                );

            }

        }


        return errors.sort();

    }


    private inheritedSymbols(
        rawText:
            string
    ): string[] {

        const openingBraceIndex =
            rawText.indexOf(
                "{"
            );

        const header =
            openingBraceIndex >=
                0
                ? rawText.slice(
                    0,
                    openingBraceIndex
                )
                : rawText;


        const inheritanceMatch =
            /\bis\b([\s\S]*)$/m.exec(
                header
            );


        if (
            !inheritanceMatch
        ) {

            return [];

        }


        const segments =
            this.splitTopLevelCommaSeparated(
                inheritanceMatch[1]
            );


        const symbols =
            new Set<string>();


        for (
            const segment
            of segments
        ) {

            const match =
                /^\s*([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)/
                    .exec(
                        segment
                    );


            if (
                !match
            ) {

                continue;

            }


            const pieces =
                match[1].split(
                    "."
                );

            symbols.add(
                pieces[
                    pieces.length -
                    1
                ]
            );

        }


        return [
            ...symbols
        ].sort();

    }


    private splitTopLevelCommaSeparated(
        value:
            string
    ): string[] {

        const result:
            string[] =
            [];

        let current =
            "";

        let parenthesisDepth =
            0;


        for (
            const character
            of value
        ) {

            if (
                character ===
                    "("
            ) {

                parenthesisDepth++;

                current +=
                    character;

                continue;

            }


            if (
                character ===
                    ")"
            ) {

                if (
                    parenthesisDepth >
                    0
                ) {

                    parenthesisDepth--;

                }

                current +=
                    character;

                continue;

            }


            if (
                character ===
                    "," &&
                parenthesisDepth ===
                    0
            ) {

                result.push(
                    current
                );

                current =
                    "";

                continue;

            }


            current +=
                character;

        }


        if (
            current.trim().length >
                0
        ) {

            result.push(
                current
            );

        }


        return result;

    }


    private containerOccurrenceId(
        fact:
            ScientificSourceFact
    ): string {

        return this.tupleId([
            "SOLIDITY-INHERITANCE-CONTAINER",
            fact.sourceId,
            fact.sourceRevision ??
                "",
            fact.observationId,
            fact.factId,
            fact.symbol ??
                ""
        ]);

    }


    private inheritanceReferenceId(
        fact:
            ScientificSourceFact,
        inheritedSymbol:
            string
    ): string {

        return this.tupleId([
            "SOLIDITY-INHERITANCE-REFERENCE",
            fact.sourceId,
            fact.sourceRevision ??
                "",
            fact.observationId,
            fact.factId,
            inheritedSymbol
        ]);

    }


    private inheritanceEdgeId(
        fact:
            ScientificSourceFact,
        object:
            ScientificSolidityInheritanceContainerOccurrence,
        inheritedSymbol:
            string
    ): string {

        return this.tupleId([
            "SOLIDITY-INHERITANCE-EDGE",
            fact.sourceId,
            fact.sourceRevision ??
                "",
            fact.observationId,
            fact.factId,
            inheritedSymbol,
            object.sourceId,
            object.sourceRevision ??
                "",
            object.observationId,
            object.declarationFactId
        ]);

    }


    private tupleId(
        components:
            string[]
    ): string {

        return components
            .map(
                component =>
                    `${component.length}:${component}`
            )
            .join(
                "|"
            );

    }

}
