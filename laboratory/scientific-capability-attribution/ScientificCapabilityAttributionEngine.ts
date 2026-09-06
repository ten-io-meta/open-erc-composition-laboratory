import type {
    ScientificSemanticDerivationResult
} from "../scientific-semantic-derivation/ScientificSemanticDerivationResult.js";

import type {
    ScientificSourceFact,
    ScientificSourceFactContainerKind,
    ScientificSourceFactKind
} from "../scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificAttributedCapability
} from "./ScientificAttributedCapability.js";

import type {
    ScientificCapabilityAttributionResult
} from "./ScientificCapabilityAttributionResult.js";


export interface ScientificCapabilityAttributionInput {

    derivation:
        ScientificSemanticDerivationResult;

    facts:
        ScientificSourceFact[];

}


interface AttributionAccumulator {

    capabilityId:
        string;

    label:
        string;

    observationId:
        string;

    containerKind:
        ScientificSourceFactContainerKind;

    containerSymbol:
        string;

    evidence:
        Set<string>;

}


export class ScientificCapabilityAttributionEngine {

    attribute(
        input:
            ScientificCapabilityAttributionInput
    ): ScientificCapabilityAttributionResult {

        const errors =
            this.boundaryErrors(
                input
            );


        if (
            errors.length >
            0
        ) {

            return {

                sourceId:
                    input.derivation.sourceId,

                sourceRevision:
                    input.derivation.sourceRevision,

                sourceModelId:
                    input.derivation.model.modelId,

                attributedCapabilities:
                    [],

                unattributedCapabilityIds:
                    input.derivation
                        .model
                        .capabilities
                        .map(
                            capability =>
                                capability.capabilityId
                        )
                        .sort(),

                errors

            };

        }


        const factsById =
            new Map<
                string,
                ScientificSourceFact
            >();


        for (
            const fact
            of input.facts
        ) {

            factsById.set(
                fact.factId,
                fact
            );

        }


        const accumulators =
            new Map<
                string,
                AttributionAccumulator
            >();


        const unattributedCapabilityIds =
            new Set<string>();


        for (
            const capability
            of input.derivation.model.capabilities
        ) {

            let attributedEvidenceCount =
                0;


            for (
                const factId
                of capability.evidence
            ) {

                const fact =
                    factsById.get(
                        factId
                    );


                if (
                    !fact
                ) {

                    /*
                     * Missing evidence is rejected during boundary
                     * validation and therefore cannot reach here.
                     */
                    continue;

                }


                if (
                    fact.containerKind ===
                        undefined ||
                    fact.containerSymbol ===
                        undefined
                ) {

                    unattributedCapabilityIds.add(
                        capability.capabilityId
                    );

                    continue;

                }


                attributedEvidenceCount++;


                const key =
                    [
                        capability.capabilityId,
                        fact.observationId,
                        fact.containerKind,
                        fact.containerSymbol
                    ].join(
                        "\u0000"
                    );


                let accumulator =
                    accumulators.get(
                        key
                    );


                if (
                    !accumulator
                ) {

                    accumulator = {

                        capabilityId:
                            capability.capabilityId,

                        label:
                            capability.label,

                        observationId:
                            fact.observationId,

                        containerKind:
                            fact.containerKind,

                        containerSymbol:
                            fact.containerSymbol,

                        evidence:
                            new Set<string>()

                    };


                    accumulators.set(
                        key,
                        accumulator
                    );

                }


                accumulator
                    .evidence
                    .add(
                        fact.factId
                    );

            }


            if (
                attributedEvidenceCount ===
                0
            ) {

                unattributedCapabilityIds.add(
                    capability.capabilityId
                );

            }

        }


        const attributedCapabilities:
            ScientificAttributedCapability[] =
            [...accumulators.values()]
                .map(
                    accumulator => ({

                        attributionId:
                            this.attributionId(
                                input,
                                accumulator
                            ),

                        capabilityId:
                            accumulator.capabilityId,

                        label:
                            accumulator.label,

                        observationId:
                            accumulator.observationId,

                        containerKind:
                            accumulator.containerKind,

                        containerSymbol:
                            accumulator.containerSymbol,

                        evidence:
                            [
                                ...accumulator.evidence
                            ].sort()

                    })
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        a.attributionId.localeCompare(
                            b.attributionId
                        )
                );


        return {

            sourceId:
                input.derivation.sourceId,

            sourceRevision:
                input.derivation.sourceRevision,

            sourceModelId:
                input.derivation.model.modelId,

            attributedCapabilities,

            unattributedCapabilityIds:
                [
                    ...unattributedCapabilityIds
                ].sort(),

            errors:
                []

        };

    }


    private boundaryErrors(
        input:
            ScientificCapabilityAttributionInput
    ): string[] {

        const errors:
            string[] = [];


        if (
            input.derivation.errors.length >
            0
        ) {

            errors.push(
                ...input.derivation.errors
            );

        }


        if (
            input.derivation
                .model
                .relationships
                .length >
            0
        ) {

            errors.push(
                "Scientific capability attribution requires an upstream model without semantic relationships."
            );

        }


        const factsById =
            new Map<
                string,
                ScientificSourceFact
            >();


        for (
            const fact
            of input.facts
        ) {

            if (
                factsById.has(
                    fact.factId
                )
            ) {

                errors.push(
                    `Duplicate fact identity ${fact.factId}.`
                );

                continue;

            }


            factsById.set(
                fact.factId,
                fact
            );


            if (
                fact.sourceId !==
                input.derivation.sourceId
            ) {

                errors.push(
                    `Fact ${fact.factId} belongs to source ${fact.sourceId}, expected ${input.derivation.sourceId}.`
                );

            }


            if (
                fact.sourceRevision !==
                input.derivation.sourceRevision
            ) {

                errors.push(
                    `Fact ${fact.factId} has a different source revision.`
                );

            }


            const hasContainerKind =
                fact.containerKind !==
                undefined;

            const hasContainerSymbol =
                fact.containerSymbol !==
                undefined;


            if (
                hasContainerKind !==
                hasContainerSymbol
            ) {

                errors.push(
                    `Fact ${fact.factId} has incomplete structural container evidence.`
                );

            }


            if (
                fact.containerSymbol !==
                    undefined &&
                fact.containerSymbol.trim().length ===
                    0
            ) {

                errors.push(
                    `Fact ${fact.factId} has an empty structural container symbol.`
                );

            }

        }


        const factCapabilityOwners =
            new Map<
                string,
                string
            >();


        const capabilityIds =
            new Set<string>();


        for (
            const capability
            of input.derivation.model.capabilities
        ) {

            if (
                capabilityIds.has(
                    capability.capabilityId
                )
            ) {

                errors.push(
                    `Duplicate capability identity ${capability.capabilityId}.`
                );

            } else {

                capabilityIds.add(
                    capability.capabilityId
                );

            }


            if (
                !capability.capabilityId.startsWith(
                    "LEXICAL-"
                )
            ) {

                errors.push(
                    `Capability ${capability.capabilityId} is outside the lexical attribution boundary.`
                );

            }


            if (
                capability.protocols.length >
                0
            ) {

                errors.push(
                    `Capability ${capability.capabilityId} already carries semantic ownership.`
                );

            }


            if (
                capability.evidence.length ===
                0
            ) {

                errors.push(
                    `Capability ${capability.capabilityId} has no structural fact evidence.`
                );

            }


            for (
                const factId
                of capability.evidence
            ) {

                const fact =
                    factsById.get(
                        factId
                    );


                if (
                    !fact
                ) {

                    errors.push(
                        `Capability ${capability.capabilityId} references missing fact ${factId}.`
                    );

                    continue;

                }


                if (
                    !this.isSemanticFactKind(
                        fact.kind
                    )
                ) {

                    errors.push(
                        `Capability ${capability.capabilityId} references non-semantic fact ${factId}.`
                    );

                }


                const existingCapabilityId =
                    factCapabilityOwners.get(
                        factId
                    );


                if (
                    existingCapabilityId &&
                    existingCapabilityId !==
                        capability.capabilityId
                ) {

                    errors.push(
                        `Fact ${factId} is assigned to multiple lexical capabilities: ${existingCapabilityId} and ${capability.capabilityId}.`
                    );

                    continue;

                }


                factCapabilityOwners.set(
                    factId,
                    capability.capabilityId
                );

            }

        }


        return errors;

    }


    private isSemanticFactKind(
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


    private attributionId(
        input:
            ScientificCapabilityAttributionInput,
        accumulator:
            AttributionAccumulator
    ): string {

        const revisionPresence =
            input.derivation.sourceRevision ===
                undefined
                ? "REVISION-ABSENT"
                : "REVISION-PRESENT";

        const revisionValue =
            input.derivation.sourceRevision ??
            "";


        const identityComponents =
            [
                "ATTRIBUTION",
                input.derivation.sourceId,
                revisionPresence,
                revisionValue,
                accumulator.observationId,
                accumulator.containerKind,
                accumulator.containerSymbol,
                accumulator.capabilityId
            ];


        /*
         * Length-prefix every identity component instead of
         * joining raw values with a delimiter.
         *
         * This preserves deterministic tuple identity even when
         * source IDs, revisions, observations, containers, or
         * capability IDs themselves contain delimiter characters.
         */
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
