import type {
    ScientificSourceFact
} from "../scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificSourceObservation
} from "../scientific-source-observation/ScientificSourceObservation.js";

import type {
    ScientificProtocolAttributedExternalCall
} from "./ScientificProtocolAttributedExternalCall.js";

import type {
    ScientificProtocolExternalCallAttributionResult
} from "./ScientificProtocolExternalCallAttributionResult.js";

import {
    ScientificProtocolStructuralIdentityResolver
} from "./ScientificProtocolStructuralIdentityResolver.js";


export interface ScientificProtocolExternalCallAttributionInput {

    sourceId:
        string;

    sourceRevision?:
        string;

    facts:
        ScientificSourceFact[];

    observations:
        ScientificSourceObservation[];

}


export class ScientificProtocolExternalCallAttributionEngine {

    private readonly structuralIdentityResolver =
        new ScientificProtocolStructuralIdentityResolver();


    attribute(
        input:
            ScientificProtocolExternalCallAttributionInput
    ): ScientificProtocolExternalCallAttributionResult {

        const externalCallFacts =
            input.facts
                .filter(
                    fact =>
                        fact.kind ===
                            "EXTERNAL_CALL_EXPRESSION"
                );


        const externalCallFactIds =
            externalCallFacts
                .map(
                    fact =>
                        fact.factId
                )
                .sort();


        const errors =
            this.boundaryErrors(
                input,
                externalCallFacts
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

                protocolAttributedExternalCalls:
                    [],

                unresolvedExternalCallFactIds:
                    externalCallFactIds,

                errors

            };

        }


        const observationsById =
            new Map<
                string,
                ScientificSourceObservation
            >(
                input.observations.map(
                    observation =>
                        [
                            observation.observationId,
                            observation
                        ]
                )
            );


        const protocolAttributedExternalCalls:
            ScientificProtocolAttributedExternalCall[] =
            [];

        const unresolvedExternalCallFactIds =
            new Set<string>();


        for (
            const fact
            of externalCallFacts
        ) {

            if (
                fact.containerKind ===
                    undefined ||
                fact.containerSymbol ===
                    undefined ||
                fact.externalCall ===
                    undefined
            ) {

                /*
                 * boundaryErrors already prevents this path from being
                 * scientifically accepted. Keep the runtime branch
                 * fail closed as an additional guard.
                 */
                unresolvedExternalCallFactIds.add(
                    fact.factId
                );

                continue;

            }


            const identityResolution =
                this.structuralIdentityResolver.resolve(
                    {
                        observationId:
                            fact.observationId,

                        containerSymbol:
                            fact.containerSymbol
                    },
                    observationsById
                );


            if (
                identityResolution ===
                    undefined
            ) {

                unresolvedExternalCallFactIds.add(
                    fact.factId
                );

                continue;

            }


            protocolAttributedExternalCalls.push({

                protocolCallAttributionId:
                    this.protocolCallAttributionId(
                        input,
                        fact,
                        identityResolution.protocolId
                    ),

                protocolId:
                    identityResolution.protocolId,

                identityBasis:
                    identityResolution.identityBasis,

                sourceFactId:
                    fact.factId,

                observationId:
                    fact.observationId,

                containerKind:
                    fact.containerKind,

                containerSymbol:
                    fact.containerSymbol,

                externalCall: {
                    ...fact.externalCall
                }

            });

        }


        protocolAttributedExternalCalls.sort(
            (
                a,
                b
            ) =>
                a.protocolCallAttributionId.localeCompare(
                    b.protocolCallAttributionId
                )
        );


        return {

            sourceId:
                input.sourceId,

            sourceRevision:
                input.sourceRevision,

            protocolAttributedExternalCalls,

            unresolvedExternalCallFactIds:
                [
                    ...unresolvedExternalCallFactIds
                ].sort(),

            errors:
                []

        };

    }


    private boundaryErrors(
        input:
            ScientificProtocolExternalCallAttributionInput,
        externalCallFacts:
            ScientificSourceFact[]
    ): string[] {

        const errors:
            string[] =
            [];


        if (
            input.sourceId.trim().length ===
            0
        ) {

            errors.push(
                "External-call protocol attribution requires a non-empty source identity."
            );

        }


        const observationIds =
            new Set<string>();


        for (
            const observation
            of input.observations
        ) {

            if (
                observation.observationId.trim().length ===
                0
            ) {

                errors.push(
                    "External-call protocol attribution received an observation with an empty identity."
                );

                continue;

            }


            if (
                observationIds.has(
                    observation.observationId
                )
            ) {

                errors.push(
                    `Duplicate source observation identity ${observation.observationId}.`
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

        }


        const factIds =
            new Set<string>();


        for (
            const fact
            of externalCallFacts
        ) {

            if (
                fact.factId.trim().length ===
                0
            ) {

                errors.push(
                    "External-call protocol attribution received an empty fact identity."
                );

                continue;

            }


            if (
                factIds.has(
                    fact.factId
                )
            ) {

                errors.push(
                    `Duplicate external-call fact identity ${fact.factId}.`
                );

                continue;

            }


            factIds.add(
                fact.factId
            );


            if (
                fact.sourceId !==
                input.sourceId
            ) {

                errors.push(
                    `External-call fact ${fact.factId} belongs to source ${fact.sourceId}, expected ${input.sourceId}.`
                );

            }


            if (
                fact.sourceRevision !==
                input.sourceRevision
            ) {

                errors.push(
                    `External-call fact ${fact.factId} has a different source revision.`
                );

            }


            if (
                fact.observationId.trim().length ===
                0
            ) {

                errors.push(
                    `External-call fact ${fact.factId} has an empty observation identity.`
                );

            } else if (
                !observationIds.has(
                    fact.observationId
                )
            ) {

                errors.push(
                    `External-call fact ${fact.factId} refers to missing observation ${fact.observationId}.`
                );

            }


            if (
                fact.containerKind ===
                    undefined ||
                fact.containerSymbol ===
                    undefined ||
                fact.containerSymbol.trim().length ===
                    0
            ) {

                errors.push(
                    `External-call fact ${fact.factId} has no complete structural container.`
                );

            }


            if (
                fact.externalCall ===
                    undefined
            ) {

                errors.push(
                    `External-call fact ${fact.factId} has no structured external-call payload.`
                );

            } else if (
                fact.externalCall.targetExpression
                    .trim()
                    .length ===
                    0
            ) {

                errors.push(
                    `External-call fact ${fact.factId} has an empty target expression.`
                );

            }

        }


        return errors;

    }


    private protocolCallAttributionId(
        source:
            ScientificProtocolExternalCallAttributionInput,
        fact:
            ScientificSourceFact,
        protocolId:
            string
    ): string {

        const revisionPresence =
            source.sourceRevision ===
                undefined
                ? "REVISION-ABSENT"
                : "REVISION-PRESENT";

        const revisionValue =
            source.sourceRevision ??
            "";


        const identityComponents =
            [
                "PROTOCOL-EXTERNAL-CALL-ATTRIBUTION",
                source.sourceId,
                revisionPresence,
                revisionValue,
                fact.factId,
                protocolId
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
