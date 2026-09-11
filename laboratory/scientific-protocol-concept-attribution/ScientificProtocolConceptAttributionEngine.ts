import type {
    ScientificConcept
} from "../scientific-concept-abstraction/ScientificConcept.js";

import type {
    ScientificConceptAbstractionResult
} from "../scientific-concept-abstraction/ScientificConceptAbstractionResult.js";

import type {
    ScientificProtocolAttributedCapability
} from "../scientific-protocol-identity/ScientificProtocolAttributedCapability.js";

import type {
    ScientificProtocolIdentityAttributionResult
} from "../scientific-protocol-identity/ScientificProtocolIdentityAttributionResult.js";

import type {
    ScientificProtocolConcept
} from "./ScientificProtocolConcept.js";

import type {
    ScientificProtocolConceptAttributionResult
} from "./ScientificProtocolConceptAttributionResult.js";


export interface ScientificProtocolConceptAttributionInput {

    concepts:
        ScientificConceptAbstractionResult;

    protocols:
        ScientificProtocolIdentityAttributionResult;

}


interface ProtocolConceptAccumulator {

    protocolId:
        string;

    lexicalCapabilityIds:
        Set<string>;

    protocolAttributionIds:
        Set<string>;

    evidence:
        Set<string>;

}


export class ScientificProtocolConceptAttributionEngine {

    attribute(
        input:
            ScientificProtocolConceptAttributionInput
    ): ScientificProtocolConceptAttributionResult {

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
                    input.concepts.sourceId,

                sourceRevision:
                    input.concepts.sourceRevision,

                sourceModelId:
                    input.concepts.sourceModelId,

                protocolConcepts:
                    [],

                unattributedConceptIds:
                    input.concepts
                        .concepts
                        .map(
                            concept =>
                                concept.conceptId
                        )
                        .sort(),

                errors

            };

        }


        const capabilitiesById =
            new Map<
                string,
                ScientificProtocolAttributedCapability[]
            >();


        for (
            const capability
            of input.protocols.protocolAttributedCapabilities
        ) {

            const existing =
                capabilitiesById.get(
                    capability.capabilityId
                ) ??
                [];


            existing.push(
                capability
            );


            capabilitiesById.set(
                capability.capabilityId,
                existing
            );

        }


        const protocolConcepts:
            ScientificProtocolConcept[] =
            [];

        const unattributedConceptIds =
            new Set<string>();


        for (
            const concept
            of input.concepts.concepts
        ) {

            const accumulators =
                new Map<
                    string,
                    ProtocolConceptAccumulator
                >();


            for (
                const lexicalCapabilityId
                of concept.lexicalCapabilityIds
            ) {

                const capabilities =
                    capabilitiesById.get(
                        lexicalCapabilityId
                    ) ??
                    [];


                for (
                    const capability
                    of capabilities
                ) {

                    let accumulator =
                        accumulators.get(
                            capability.protocolId
                        );


                    if (
                        !accumulator
                    ) {

                        accumulator = {

                            protocolId:
                                capability.protocolId,

                            lexicalCapabilityIds:
                                new Set<string>(),

                            protocolAttributionIds:
                                new Set<string>(),

                            evidence:
                                new Set<string>()

                        };


                        accumulators.set(
                            capability.protocolId,
                            accumulator
                        );

                    }


                    accumulator
                        .lexicalCapabilityIds
                        .add(
                            capability.capabilityId
                        );

                    accumulator
                        .protocolAttributionIds
                        .add(
                            capability.protocolAttributionId
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


            let conceptAttributed =
                false;


            for (
                const accumulator
                of accumulators.values()
            ) {

                const lexicalCapabilityIds =
                    accumulator.lexicalCapabilityIds;


                /*
                 * Recurrent concept membership must be proven
                 * inside the same protocol. One lexical
                 * capability alone cannot inherit recurrence
                 * observed elsewhere.
                 */
                if (
                    lexicalCapabilityIds.size >= 2
                ) {

                    const sortedLexicalCapabilityIds =
                        [
                            ...lexicalCapabilityIds
                        ].sort();

                    const sortedProtocolAttributionIds =
                        [
                            ...accumulator.protocolAttributionIds
                        ].sort();

                    const sortedEvidence =
                        [
                            ...accumulator.evidence
                        ].sort();


                    protocolConcepts.push({

                        protocolConceptId:
                            this.protocolConceptId(
                                input,
                                concept,
                                accumulator.protocolId,
                                sortedLexicalCapabilityIds,
                                sortedProtocolAttributionIds
                            ),

                        conceptId:
                            concept.conceptId,

                        label:
                            concept.label,

                        protocolId:
                            accumulator.protocolId,

                        lexicalCapabilityIds:
                            sortedLexicalCapabilityIds,

                        protocolAttributionIds:
                            sortedProtocolAttributionIds,

                        evidence:
                            sortedEvidence

                    });


                    conceptAttributed =
                        true;

                }

            }


            if (
                !conceptAttributed
            ) {

                unattributedConceptIds.add(
                    concept.conceptId
                );

            }

        }


        protocolConcepts.sort(
            (
                a,
                b
            ) =>
                a.protocolConceptId.localeCompare(
                    b.protocolConceptId
                )
        );


        return {

            sourceId:
                input.concepts.sourceId,

            sourceRevision:
                input.concepts.sourceRevision,

            sourceModelId:
                input.concepts.sourceModelId,

            protocolConcepts,

            unattributedConceptIds:
                [
                    ...unattributedConceptIds
                ].sort(),

            errors:
                []

        };

    }


    private boundaryErrors(
        input:
            ScientificProtocolConceptAttributionInput
    ): string[] {

        const errors:
            string[] = [];

        const concepts =
            input.concepts;

        const protocols =
            input.protocols;


        if (
            concepts.errors.length >
            0
        ) {

            errors.push(
                ...concepts.errors
            );

        }


        if (
            protocols.errors.length >
            0
        ) {

            errors.push(
                ...protocols.errors
            );

        }


        if (
            concepts.sourceId !==
            protocols.sourceId
        ) {

            errors.push(
                `Scientific concept source ${concepts.sourceId} does not match protocol attribution source ${protocols.sourceId}.`
            );

        }


        if (
            concepts.sourceRevision !==
            protocols.sourceRevision
        ) {

            errors.push(
                "Scientific concept and protocol attribution source revisions do not match."
            );

        }


        if (
            concepts.sourceModelId !==
            protocols.sourceModelId
        ) {

            errors.push(
                `Scientific concept model ${concepts.sourceModelId} does not match protocol attribution model ${protocols.sourceModelId}.`
            );

        }


        if (
            concepts.sourceId.trim().length ===
            0
        ) {

            errors.push(
                "Protocol concept attribution requires a non-empty source identity."
            );

        }


        if (
            concepts.sourceModelId.trim().length ===
            0
        ) {

            errors.push(
                "Protocol concept attribution requires a non-empty source model identity."
            );

        }


        const conceptIds =
            new Set<string>();


        for (
            const concept
            of concepts.concepts
        ) {

            if (
                conceptIds.has(
                    concept.conceptId
                )
            ) {

                errors.push(
                    `Duplicate scientific concept identity ${concept.conceptId}.`
                );

                continue;

            }


            conceptIds.add(
                concept.conceptId
            );


            if (
                concept.conceptId.trim().length ===
                0
            ) {

                errors.push(
                    "Protocol concept attribution received an empty concept identity."
                );

            }


            if (
                concept.label.trim().length ===
                0
            ) {

                errors.push(
                    `Scientific concept ${concept.conceptId} has an empty label.`
                );

            }


            if (
                concept.lexicalCapabilityIds.length <
                2
            ) {

                errors.push(
                    `Scientific concept ${concept.conceptId} does not contain recurrent lexical capabilities.`
                );

            }


            const lexicalCapabilityIds =
                new Set<string>();


            for (
                const lexicalCapabilityId
                of concept.lexicalCapabilityIds
            ) {

                if (
                    lexicalCapabilityId.trim().length ===
                    0
                ) {

                    errors.push(
                        `Scientific concept ${concept.conceptId} contains an empty lexical capability identity.`
                    );

                    continue;

                }


                if (
                    lexicalCapabilityIds.has(
                        lexicalCapabilityId
                    )
                ) {

                    errors.push(
                        `Scientific concept ${concept.conceptId} contains duplicate lexical capability ${lexicalCapabilityId}.`
                    );

                    continue;

                }


                lexicalCapabilityIds.add(
                    lexicalCapabilityId
                );

            }


            if (
                concept.evidence.length ===
                0
            ) {

                errors.push(
                    `Scientific concept ${concept.conceptId} has no fact evidence.`
                );

            }


            const conceptEvidence =
                new Set<string>();


            for (
                const factId
                of concept.evidence
            ) {

                if (
                    factId.trim().length ===
                    0
                ) {

                    errors.push(
                        `Scientific concept ${concept.conceptId} contains an empty fact identity.`
                    );

                    continue;

                }


                if (
                    conceptEvidence.has(
                        factId
                    )
                ) {

                    errors.push(
                        `Scientific concept ${concept.conceptId} contains duplicate fact evidence ${factId}.`
                    );

                    continue;

                }


                conceptEvidence.add(
                    factId
                );

            }

        }


        const protocolAttributionIds =
            new Set<string>();


        for (
            const capability
            of protocols.protocolAttributedCapabilities
        ) {

            if (
                protocolAttributionIds.has(
                    capability.protocolAttributionId
                )
            ) {

                errors.push(
                    `Duplicate protocol attribution identity ${capability.protocolAttributionId}.`
                );

                continue;

            }


            protocolAttributionIds.add(
                capability.protocolAttributionId
            );


            if (
                capability.protocolAttributionId.trim().length ===
                0
            ) {

                errors.push(
                    "Protocol concept attribution received an empty protocol attribution identity."
                );

            }


            if (
                capability.protocolId.trim().length ===
                0
            ) {

                errors.push(
                    `Protocol attribution ${capability.protocolAttributionId} has an empty protocol identity.`
                );

            }


            if (
                capability.capabilityId.trim().length ===
                0
            ) {

                errors.push(
                    `Protocol attribution ${capability.protocolAttributionId} has an empty lexical capability identity.`
                );

            }


            if (
                capability.evidence.length ===
                0
            ) {

                errors.push(
                    `Protocol attribution ${capability.protocolAttributionId} has no fact evidence.`
                );

            }


            const capabilityEvidence =
                new Set<string>();


            for (
                const factId
                of capability.evidence
            ) {

                if (
                    factId.trim().length ===
                    0
                ) {

                    errors.push(
                        `Protocol attribution ${capability.protocolAttributionId} contains an empty fact identity.`
                    );

                    continue;

                }


                if (
                    capabilityEvidence.has(
                        factId
                    )
                ) {

                    errors.push(
                        `Protocol attribution ${capability.protocolAttributionId} contains duplicate fact evidence ${factId}.`
                    );

                    continue;

                }


                capabilityEvidence.add(
                    factId
                );

            }

        }


        /*
         * For every protocol-attributed capability participating
         * in a scientific concept, its fact evidence must already
         * be present in that concept's upstream evidence.
         *
         * This prevents protocol attribution from injecting new
         * support into an existing concept.
         */
        for (
            const concept
            of concepts.concepts
        ) {

            const conceptEvidence =
                new Set(
                    concept.evidence
                );


            for (
                const capability
                of protocols.protocolAttributedCapabilities
            ) {

                if (
                    !concept.lexicalCapabilityIds.includes(
                        capability.capabilityId
                    )
                ) {

                    continue;

                }


                for (
                    const factId
                    of capability.evidence
                ) {

                    if (
                        !conceptEvidence.has(
                            factId
                        )
                    ) {

                        errors.push(
                            `Protocol attribution ${capability.protocolAttributionId} introduces fact ${factId} outside scientific concept ${concept.conceptId}.`
                        );

                    }

                }

            }

        }


        return errors;

    }


    private protocolConceptId(
        input:
            ScientificProtocolConceptAttributionInput,
        concept:
            ScientificConcept,
        protocolId:
            string,
        lexicalCapabilityIds:
            string[],
        protocolAttributionIds:
            string[]
    ): string {

        const revisionPresence =
            input.concepts.sourceRevision ===
                undefined
                ? "REVISION-ABSENT"
                : "REVISION-PRESENT";

        const revisionValue =
            input.concepts.sourceRevision ??
            "";


        const identityComponents =
            [
                "PROTOCOL-CONCEPT",
                input.concepts.sourceId,
                revisionPresence,
                revisionValue,
                input.concepts.sourceModelId,
                concept.conceptId,
                protocolId,
                ...lexicalCapabilityIds,
                ...protocolAttributionIds
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
