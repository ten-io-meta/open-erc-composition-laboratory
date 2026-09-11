import type {
    ScientificSourceFact
} from "../scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificProtocolAttributedCapability
} from "../scientific-protocol-identity/ScientificProtocolAttributedCapability.js";

import type {
    ScientificStructuralProtocolRelationEvidence
} from "./ScientificStructuralProtocolRelationEvidence.js";

import type {
    ScientificStructuralProtocolRelationEvidenceResult
} from "./ScientificStructuralProtocolRelationEvidenceResult.js";


export interface ScientificStructuralProtocolRelationEvidenceInput {

    sourceId:
        string;

    sourceRevision?:
        string;

    facts:
        ScientificSourceFact[];

    /*
     * Protocol identities must already have been established by
     * the independent protocol identity boundary.
     *
     * This engine does not infer protocol identity from a base
     * class or interface name.
     */
    protocolAttributedCapabilities:
        ScientificProtocolAttributedCapability[];

}


export class ScientificStructuralProtocolRelationEvidenceEngine {

    extract(
        input:
            ScientificStructuralProtocolRelationEvidenceInput
    ): ScientificStructuralProtocolRelationEvidenceResult {

        const boundaryErrors =
            this.boundaryErrors(
                input
            );


        if (
            boundaryErrors.length >
            0
        ) {

            return {

                sourceId:
                    input.sourceId,

                sourceRevision:
                    input.sourceRevision,

                relations:
                    [],

                unresolvedFactIds:
                    [],

                errors:
                    boundaryErrors

            };

        }


        const protocolIdsByContainerOccurrence =
            new Map<
                string,
                Set<string>
            >();


        for (
            const attribution
            of input.protocolAttributedCapabilities
        ) {

            const key =
                this.containerOccurrenceKey(
                    attribution.observationId,
                    attribution.containerSymbol
                );


            let protocolIds =
                protocolIdsByContainerOccurrence.get(
                    key
                );


            if (
                !protocolIds
            ) {

                protocolIds =
                    new Set<string>();

                protocolIdsByContainerOccurrence.set(
                    key,
                    protocolIds
                );

            }


            protocolIds.add(
                attribution.protocolId
            );

        }


        const ambiguityErrors:
            string[] =
            [];


        for (
            const [
                key,
                protocolIds
            ]
            of protocolIdsByContainerOccurrence
        ) {

            if (
                protocolIds.size <=
                1
            ) {

                continue;

            }


            ambiguityErrors.push(
                `Structural protocol relation evidence received multiple protocol identities for container occurrence ${key}.`
            );

        }


        if (
            ambiguityErrors.length >
            0
        ) {

            return {

                sourceId:
                    input.sourceId,

                sourceRevision:
                    input.sourceRevision,

                relations:
                    [],

                unresolvedFactIds:
                    [],

                errors:
                    ambiguityErrors.sort()

            };

        }


        const relations:
            ScientificStructuralProtocolRelationEvidence[] =
            [];

        const unresolvedFactIds =
            new Set<string>();


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


        for (
            const fact
            of declarationFacts
        ) {

            const symbol =
                fact.symbol;


            if (
                !symbol
            ) {

                /*
                 * Boundary validation already rejects this case.
                 */
                continue;

            }


            const containerKey =
                this.containerOccurrenceKey(
                    fact.observationId,
                    symbol
                );


            const protocolIds =
                protocolIdsByContainerOccurrence.get(
                    containerKey
                );


            if (
                !protocolIds ||
                protocolIds.size !==
                    1
            ) {

                unresolvedFactIds.add(
                    fact.factId
                );

                continue;

            }


            const subjectProtocolId =
                [
                    ...protocolIds
                ][0];


            const inheritedSymbols =
                this.inheritedSymbols(
                    fact.rawText
                );


            let emitted =
                false;


            for (
                const inheritedSymbol
                of inheritedSymbols
            ) {

                const objectProtocolId =
                    this.protocolIdFromInheritedSymbol(
                        inheritedSymbol
                    );


                if (
                    !objectProtocolId
                ) {

                    continue;

                }


                /*
                 * An ERC-family base belonging to the already
                 * identified subject protocol is not an external
                 * protocol dependency.
                 *
                 * Example:
                 *
                 * ERC-8060 subject inheriting IERC8060MintBurn
                 * must not generate ERC-8060 -> ERC-8060.
                 */
                if (
                    objectProtocolId ===
                    subjectProtocolId
                ) {

                    continue;

                }


                const relationEvidenceId =
                    this.relationEvidenceId(
                        input.sourceId,
                        input.sourceRevision,
                        fact.factId,
                        subjectProtocolId,
                        objectProtocolId,
                        inheritedSymbol
                    );


                relations.push({

                    relationEvidenceId,

                    sourceId:
                        input.sourceId,

                    sourceRevision:
                        input.sourceRevision,

                    factId:
                        fact.factId,

                    observationId:
                        fact.observationId,

                    subjectProtocolId,

                    subjectContainerKind:
                        fact.kind ===
                            "INTERFACE_DECLARATION"
                            ? "INTERFACE"
                            : "CONTRACT",

                    subjectContainerSymbol:
                        symbol,

                    relation:
                        "DEPENDS_ON",

                    objectProtocolId,

                    inheritedSymbol,

                    evidenceBasis:
                        "SOLIDITY_INHERITANCE_ERC_FAMILY",

                    locator:
                        fact.locator,

                    rawText:
                        fact.rawText

                });


                emitted =
                    true;

            }


            if (
                !emitted
            ) {

                unresolvedFactIds.add(
                    fact.factId
                );

            }

        }


        relations.sort(
            (
                left,
                right
            ) =>
                left.relationEvidenceId.localeCompare(
                    right.relationEvidenceId
                )
        );


        return {

            sourceId:
                input.sourceId,

            sourceRevision:
                input.sourceRevision,

            relations,

            unresolvedFactIds:
                [
                    ...unresolvedFactIds
                ].sort(),

            errors:
                []

        };

    }


    private boundaryErrors(
        input:
            ScientificStructuralProtocolRelationEvidenceInput
    ): string[] {

        const errors:
            string[] =
            [];


        if (
            input.sourceId.trim().length ===
            0
        ) {

            errors.push(
                "Structural protocol relation evidence received an empty source identity."
            );

        }


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
                    "Structural protocol relation evidence received an empty fact identity."
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
                fact.sourceId !==
                input.sourceId
            ) {

                errors.push(
                    `Scientific source fact ${fact.factId} source does not match structural relation evidence source.`
                );

            }


            if (
                fact.sourceRevision !==
                input.sourceRevision
            ) {

                errors.push(
                    `Scientific source fact ${fact.factId} revision does not match structural relation evidence revision.`
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


        const protocolAttributionIds =
            new Set<string>();


        for (
            const attribution
            of input.protocolAttributedCapabilities
        ) {

            if (
                attribution.protocolAttributionId.trim().length ===
                0
            ) {

                errors.push(
                    "Structural protocol relation evidence received an empty protocol attribution identity."
                );

                continue;

            }


            if (
                protocolAttributionIds.has(
                    attribution.protocolAttributionId
                )
            ) {

                errors.push(
                    `Duplicate protocol attribution identity ${attribution.protocolAttributionId}.`
                );

            }


            protocolAttributionIds.add(
                attribution.protocolAttributionId
            );


            if (
                !/^ERC-[1-9][0-9]*$/.test(
                    attribution.protocolId
                )
            ) {

                errors.push(
                    `Protocol attribution ${attribution.protocolAttributionId} has an unsupported protocol identity ${attribution.protocolId}.`
                );

            }


            if (
                attribution.observationId.trim().length ===
                0
            ) {

                errors.push(
                    `Protocol attribution ${attribution.protocolAttributionId} has an empty observation identity.`
                );

            }


            if (
                attribution.containerSymbol.trim().length ===
                0
            ) {

                errors.push(
                    `Protocol attribution ${attribution.protocolAttributionId} has an empty container symbol.`
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


        const inheritanceText =
            inheritanceMatch[1];

        const segments =
            this.splitTopLevelCommaSeparated(
                inheritanceText
            );

        const inheritedSymbols =
            new Set<string>();


        for (
            const segment
            of segments
        ) {

            const symbolMatch =
                /^\s*([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)/
                    .exec(
                        segment
                    );


            if (
                !symbolMatch
            ) {

                continue;

            }


            const qualifiedSymbol =
                symbolMatch[1];

            const pieces =
                qualifiedSymbol.split(
                    "."
                );

            const symbol =
                pieces[
                    pieces.length -
                    1
                ];


            inheritedSymbols.add(
                symbol
            );

        }


        return [
            ...inheritedSymbols
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


    private protocolIdFromInheritedSymbol(
        symbol:
            string
    ): string | undefined {

        /*
         * This is deliberately broader than protocol identity.
         *
         * An inherited symbol such as ERC721URIStorageUpgradeable
         * or IERC721Value is direct structural evidence that the
         * already-identified subject container depends on the
         * ERC-721 family.
         *
         * It does NOT establish that the inherited symbol itself is
         * a canonical protocol implementation.
         */
        const match =
            /^(?:I)?ERC([1-9][0-9]*)(?:[A-Za-z_][A-Za-z0-9_]*)?$/
                .exec(
                    symbol
                );


        if (
            !match
        ) {

            return undefined;

        }


        return `ERC-${match[1]}`;

    }


    private containerOccurrenceKey(
        observationId:
            string,
        containerSymbol:
            string
    ): string {

        return [
            observationId,
            containerSymbol
        ]
            .map(
                component =>
                    `${component.length}:${component}`
            )
            .join(
                "|"
            );

    }


    private relationEvidenceId(
        sourceId:
            string,
        sourceRevision:
            string | undefined,
        factId:
            string,
        subjectProtocolId:
            string,
        objectProtocolId:
            string,
        inheritedSymbol:
            string
    ): string {

        const components =
            [
                "SCIENTIFIC-STRUCTURAL-PROTOCOL-RELATION-EVIDENCE",
                sourceId,
                sourceRevision ===
                    undefined
                    ? "REVISION-ABSENT"
                    : "REVISION-PRESENT",
                sourceRevision ??
                    "",
                factId,
                subjectProtocolId,
                "DEPENDS_ON",
                objectProtocolId,
                inheritedSymbol
            ];


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
