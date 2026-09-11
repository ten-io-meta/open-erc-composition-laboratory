import type {
    ScientificSourceFact,
    ScientificSourceFactKind
} from "../scientific-source-fact/ScientificSourceFact.js";

import type {
    SemanticCapability
} from "../semantic-discovery/SemanticCapability.js";

import type {
    ScientificSemanticDerivationResult
} from "./ScientificSemanticDerivationResult.js";


export interface ScientificSemanticDerivationInput {

    sourceId:
        string;

    sourceRevision?:
        string;

    facts:
        ScientificSourceFact[];

}


interface CapabilityAccumulator {

    capabilityId:
        string;

    label:
        string;

    evidence:
        Set<string>;

}


export class ScientificSemanticDerivationEngine {

    derive(
        input:
            ScientificSemanticDerivationInput
    ): ScientificSemanticDerivationResult {

        const provenanceErrors =
            this.provenanceErrors(
                input
            );


        if (
            provenanceErrors.length >
            0
        ) {

            return {

                sourceId:
                    input.sourceId,

                sourceRevision:
                    input.sourceRevision,

                model: {

                    modelId:
                        this.modelId(
                            input
                        ),

                    generatedAt:
                        new Date().toISOString(),

                    capabilities:
                        [],

                    relationships:
                        []

                },

                errors:
                    provenanceErrors

            };

        }


        const accumulators =
            new Map<
                string,
                CapabilityAccumulator
            >();


        for (
            const fact
            of input.facts
        ) {

            if (
                !this.isLocallySemanticFact(
                    fact.kind
                )
            ) {

                continue;

            }


            const symbol =
                fact.symbol?.trim();


            if (
                !symbol
            ) {

                continue;

            }


            const tokens =
                this.lexicalTokens(
                    symbol
                );


            if (
                tokens.length ===
                0
            ) {

                continue;

            }


            const capabilityId =
                this.capabilityId(
                    tokens
                );

            const label =
                tokens.join(
                    " "
                );


            const existing =
                accumulators.get(
                    capabilityId
                );


            if (
                existing
            ) {

                existing.evidence.add(
                    fact.factId
                );

                continue;

            }


            accumulators.set(
                capabilityId,
                {

                    capabilityId,

                    label,

                    evidence:
                        new Set(
                            [
                                fact.factId
                            ]
                        )

                }
            );

        }


        const capabilities:
            SemanticCapability[] =
            [...accumulators.values()]
                .map(
                    accumulator => ({

                        capabilityId:
                            accumulator
                                .capabilityId,

                        label:
                            accumulator
                                .label,

                        /*
                         * Protocol ownership has not been
                         * demonstrated at this layer.
                         */
                        protocols:
                            [],

                        evidence:
                            [...accumulator.evidence]
                                .sort()

                    })
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        a.capabilityId.localeCompare(
                            b.capabilityId
                        )
                );


        return {

            sourceId:
                input.sourceId,

            sourceRevision:
                input.sourceRevision,

            model: {

                modelId:
                    this.modelId(
                        input
                    ),

                generatedAt:
                    new Date().toISOString(),

                capabilities,

                /*
                 * Local lexical derivation establishes
                 * no relationship between capabilities.
                 */
                relationships:
                    []

            },

            errors:
                []

        };

    }


    private provenanceErrors(
        input:
            ScientificSemanticDerivationInput
    ): string[] {

        const errors:
            string[] = [];


        for (
            const fact
            of input.facts
        ) {

            if (
                fact.sourceId !==
                input.sourceId
            ) {

                errors.push(
                    `Fact ${fact.factId} belongs to source ${fact.sourceId}, expected ${input.sourceId}.`
                );

            }


            if (
                fact.sourceRevision !==
                input.sourceRevision
            ) {

                errors.push(
                    `Fact ${fact.factId} has a different source revision.`
                );

            }

        }


        return errors;

    }


    private isLocallySemanticFact(
        kind:
            ScientificSourceFactKind
    ): boolean {

        return (
            kind ===
                "FUNCTION_DECLARATION" ||
            kind ===
                "MODIFIER_DECLARATION" ||
            kind ===
                "EVENT_DECLARATION" ||
            kind ===
                "STATE_VARIABLE_DECLARATION"
        );

    }


    private lexicalTokens(
        symbol:
            string
    ): string[] {

        const separated =
            symbol
                .replace(
                    /([a-z0-9])([A-Z])/g,
                    "$1 $2"
                )
                .replace(
                    /([A-Z]+)([A-Z][a-z])/g,
                    "$1 $2"
                )
                .replace(
                    /[_-]+/g,
                    " "
                )
                .trim();


        if (
            separated.length ===
            0
        ) {

            return [];

        }


        return separated
            .split(
                /\s+/
            )
            .map(
                token =>
                    token.toLowerCase()
            )
            .filter(
                token =>
                    token.length >
                    0
            );

    }


    private capabilityId(
        tokens:
            string[]
    ): string {

        return (
            "LEXICAL-" +
            tokens
                .join(
                    "-"
                )
                .toUpperCase()
        );

    }


    private modelId(
        input:
            ScientificSemanticDerivationInput
    ): string {

        const revision =
            input.sourceRevision ??
            "UNVERSIONED";


        return (
            `SCIENTIFIC-SEMANTIC-${input.sourceId}-${revision}`
        );

    }

}
