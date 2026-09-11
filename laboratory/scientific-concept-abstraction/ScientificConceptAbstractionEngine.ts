import type {
    ScientificSemanticDerivationResult
} from "../scientific-semantic-derivation/ScientificSemanticDerivationResult.js";

import type {
    ScientificConcept
} from "./ScientificConcept.js";

import type {
    ScientificConceptAbstractionResult
} from "./ScientificConceptAbstractionResult.js";


interface ConceptAccumulator {

    token:
        string;

    lexicalCapabilityIds:
        Set<string>;

    evidence:
        Set<string>;

}


export class ScientificConceptAbstractionEngine {

    abstract(
        derivation:
            ScientificSemanticDerivationResult
    ): ScientificConceptAbstractionResult {

        const errors =
            this.boundaryErrors(
                derivation
            );


        if (
            errors.length >
            0
        ) {

            return {

                sourceId:
                    derivation.sourceId,

                sourceRevision:
                    derivation.sourceRevision,

                sourceModelId:
                    derivation.model.modelId,

                concepts:
                    [],

                errors

            };

        }


        const accumulators =
            new Map<
                string,
                ConceptAccumulator
            >();


        for (
            const capability
            of derivation.model.capabilities
        ) {

            const tokens =
                this.observedTokens(
                    capability.label
                );


            for (
                const token
                of tokens
            ) {

                let accumulator =
                    accumulators.get(
                        token
                    );


                if (
                    !accumulator
                ) {

                    accumulator = {

                        token,

                        lexicalCapabilityIds:
                            new Set<string>(),

                        evidence:
                            new Set<string>()

                    };


                    accumulators.set(
                        token,
                        accumulator
                    );

                }


                accumulator
                    .lexicalCapabilityIds
                    .add(
                        capability.capabilityId
                    );


                for (
                    const factId
                    of capability.evidence
                ) {

                    accumulator
                        .evidence
                        .add(
                            factId
                        );

                }

            }

        }


        const concepts:
            ScientificConcept[] =
            [...accumulators.values()]
                .filter(
                    accumulator =>
                        accumulator
                            .lexicalCapabilityIds
                            .size >=
                        2
                )
                .map(
                    accumulator => ({

                        conceptId:
                            this.conceptId(
                                accumulator.token
                            ),

                        label:
                            accumulator.token,

                        lexicalCapabilityIds:
                            [
                                ...accumulator
                                    .lexicalCapabilityIds
                            ].sort(),

                        evidence:
                            [
                                ...accumulator
                                    .evidence
                            ].sort()

                    })
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        a.conceptId.localeCompare(
                            b.conceptId
                        )
                );


        return {

            sourceId:
                derivation.sourceId,

            sourceRevision:
                derivation.sourceRevision,

            sourceModelId:
                derivation.model.modelId,

            concepts,

            errors:
                []

        };

    }


    private boundaryErrors(
        derivation:
            ScientificSemanticDerivationResult
    ): string[] {

        const errors:
            string[] = [];

        const factCapabilityOwners =
            new Map<
                string,
                string
            >();


        if (
            derivation.errors.length >
            0
        ) {

            errors.push(
                ...derivation.errors
            );

        }


        /*
         * Scientific lexical derivation establishes no semantic
         * relationships. Any upstream relationship therefore
         * represents contamination from a different reasoning layer.
         */
        if (
            derivation
                .model
                .relationships
                .length >
            0
        ) {

            errors.push(
                "Scientific concept abstraction requires an upstream model without relationships."
            );

        }


        for (
            const capability
            of derivation.model.capabilities
        ) {

            if (
                !capability.capabilityId.startsWith(
                    "LEXICAL-"
                )
            ) {

                errors.push(
                    `Capability ${capability.capabilityId} is outside the lexical abstraction boundary.`
                );

            }


            if (
                capability.protocols.length >
                0
            ) {

                errors.push(
                    `Capability ${capability.capabilityId} already carries protocol ownership.`
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


    private observedTokens(
        label:
            string
    ): string[] {

        const tokens =
            label
                .trim()
                .split(
                    /\s+/
                )
                .map(
                    token =>
                        token
                            .trim()
                            .toLowerCase()
                )
                .filter(
                    token =>
                        token.length >
                        0
                );


        return [
            ...new Set(
                tokens
            )
        ].sort();

    }


    private conceptId(
        token:
            string
    ): string {

        return (
            "CONCEPT-" +
            token.toUpperCase()
        );

    }

}
