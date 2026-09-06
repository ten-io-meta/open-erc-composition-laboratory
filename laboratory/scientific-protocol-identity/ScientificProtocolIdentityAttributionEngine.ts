import type {
    ScientificCapabilityAttributionResult
} from "../scientific-capability-attribution/ScientificCapabilityAttributionResult.js";

import type {
    ScientificAttributedCapability
} from "../scientific-capability-attribution/ScientificAttributedCapability.js";

import type {
    ScientificProtocolAttributedCapability
} from "./ScientificProtocolAttributedCapability.js";

import type {
    ScientificProtocolIdentityAttributionResult
} from "./ScientificProtocolIdentityAttributionResult.js";


export interface ScientificProtocolIdentityAttributionInput {

    attribution:
        ScientificCapabilityAttributionResult;

}


export class ScientificProtocolIdentityAttributionEngine {

    attribute(
        input:
            ScientificProtocolIdentityAttributionInput
    ): ScientificProtocolIdentityAttributionResult {

        const errors =
            this.boundaryErrors(
                input
            );


        const allStructuralAttributionIds =
            input.attribution
                .attributedCapabilities
                .map(
                    attribution =>
                        attribution.attributionId
                )
                .sort();


        if (
            errors.length >
            0
        ) {

            return {

                sourceId:
                    input.attribution.sourceId,

                sourceRevision:
                    input.attribution.sourceRevision,

                sourceModelId:
                    input.attribution.sourceModelId,

                protocolAttributedCapabilities:
                    [],

                unresolvedAttributionIds:
                    allStructuralAttributionIds,

                structurallyUnattributedCapabilityIds:
                    [
                        ...input.attribution
                            .unattributedCapabilityIds
                    ].sort(),

                errors

            };

        }


        const protocolAttributedCapabilities:
            ScientificProtocolAttributedCapability[] =
            [];

        const unresolvedAttributionIds =
            new Set<string>();


        for (
            const attribution
            of input.attribution.attributedCapabilities
        ) {

            const protocolId =
                this.protocolIdFromExactContainerSymbol(
                    attribution
                );


            if (
                protocolId ===
                undefined
            ) {

                unresolvedAttributionIds.add(
                    attribution.attributionId
                );

                continue;

            }


            protocolAttributedCapabilities.push({

                protocolAttributionId:
                    this.protocolAttributionId(
                        input.attribution,
                        attribution,
                        protocolId
                    ),

                protocolId,

                identityBasis:
                    "EXACT_ERC_CONTAINER_SYMBOL",

                capabilityAttributionId:
                    attribution.attributionId,

                capabilityId:
                    attribution.capabilityId,

                label:
                    attribution.label,

                observationId:
                    attribution.observationId,

                containerKind:
                    attribution.containerKind,

                containerSymbol:
                    attribution.containerSymbol,

                evidence:
                    [
                        ...attribution.evidence
                    ].sort()

            });

        }


        protocolAttributedCapabilities.sort(
            (
                a,
                b
            ) =>
                a.protocolAttributionId.localeCompare(
                    b.protocolAttributionId
                )
        );


        return {

            sourceId:
                input.attribution.sourceId,

            sourceRevision:
                input.attribution.sourceRevision,

            sourceModelId:
                input.attribution.sourceModelId,

            protocolAttributedCapabilities,

            unresolvedAttributionIds:
                [
                    ...unresolvedAttributionIds
                ].sort(),

            structurallyUnattributedCapabilityIds:
                [
                    ...input.attribution
                        .unattributedCapabilityIds
                ].sort(),

            errors:
                []

        };

    }


    private boundaryErrors(
        input:
            ScientificProtocolIdentityAttributionInput
    ): string[] {

        const errors:
            string[] = [];


        if (
            input.attribution.errors.length >
            0
        ) {

            errors.push(
                ...input.attribution.errors
            );

        }


        if (
            input.attribution.sourceId.trim().length ===
            0
        ) {

            errors.push(
                "Protocol identity attribution requires a non-empty source identity."
            );

        }


        if (
            input.attribution.sourceModelId.trim().length ===
            0
        ) {

            errors.push(
                "Protocol identity attribution requires a non-empty source model identity."
            );

        }


        const structuralAttributionIds =
            new Set<string>();


        for (
            const attribution
            of input.attribution.attributedCapabilities
        ) {

            if (
                structuralAttributionIds.has(
                    attribution.attributionId
                )
            ) {

                errors.push(
                    `Duplicate structural attribution identity ${attribution.attributionId}.`
                );

                continue;

            }


            structuralAttributionIds.add(
                attribution.attributionId
            );


            if (
                attribution.attributionId.trim().length ===
                0
            ) {

                errors.push(
                    "Protocol identity attribution received an empty structural attribution identity."
                );

            }


            if (
                attribution.capabilityId.trim().length ===
                0
            ) {

                errors.push(
                    `Structural attribution ${attribution.attributionId} has an empty capability identity.`
                );

            }


            if (
                attribution.observationId.trim().length ===
                0
            ) {

                errors.push(
                    `Structural attribution ${attribution.attributionId} has an empty observation identity.`
                );

            }


            if (
                attribution.containerSymbol.trim().length ===
                0
            ) {

                errors.push(
                    `Structural attribution ${attribution.attributionId} has an empty container symbol.`
                );

            }


            if (
                attribution.evidence.length ===
                0
            ) {

                errors.push(
                    `Structural attribution ${attribution.attributionId} has no fact evidence.`
                );

            }


            const evidenceIds =
                new Set<string>();


            for (
                const factId
                of attribution.evidence
            ) {

                if (
                    factId.trim().length ===
                    0
                ) {

                    errors.push(
                        `Structural attribution ${attribution.attributionId} contains an empty fact identity.`
                    );

                    continue;

                }


                if (
                    evidenceIds.has(
                        factId
                    )
                ) {

                    errors.push(
                        `Structural attribution ${attribution.attributionId} contains duplicate fact evidence ${factId}.`
                    );

                    continue;

                }


                evidenceIds.add(
                    factId
                );

            }

        }


        const structurallyUnattributedIds =
            new Set<string>();


        for (
            const capabilityId
            of input.attribution.unattributedCapabilityIds
        ) {

            if (
                capabilityId.trim().length ===
                0
            ) {

                errors.push(
                    "Protocol identity attribution received an empty structurally unattributed capability identity."
                );

                continue;

            }


            if (
                structurallyUnattributedIds.has(
                    capabilityId
                )
            ) {

                errors.push(
                    `Duplicate structurally unattributed capability identity ${capabilityId}.`
                );

                continue;

            }


            structurallyUnattributedIds.add(
                capabilityId
            );

        }


        return errors;

    }


    private protocolIdFromExactContainerSymbol(
        attribution:
            ScientificAttributedCapability
    ): string | undefined {

        /*
         * Deliberately exact and case-sensitive.
         *
         * Accepted examples:
         * IERC165
         * ERC165
         *
         * Rejected examples:
         * IERC165Metadata
         * IERC999Extension
         * MyERC165
         * ERC0
         */
        const match =
            /^(?:I)?ERC([1-9][0-9]*)$/.exec(
                attribution.containerSymbol
            );


        if (
            !match
        ) {

            return undefined;

        }


        return `ERC-${match[1]}`;

    }


    private protocolAttributionId(
        source:
            ScientificCapabilityAttributionResult,
        attribution:
            ScientificAttributedCapability,
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
                "PROTOCOL-ATTRIBUTION",
                source.sourceId,
                revisionPresence,
                revisionValue,
                source.sourceModelId,
                attribution.attributionId,
                protocolId
            ];


        /*
         * Length-prefixed tuple encoding makes the protocol
         * attribution identity source-global and prevents
         * collisions caused by delimiter characters inside any
         * component.
         *
         * The protocol identity layer therefore does not depend
         * on an upstream structural attribution ID being globally
         * unique by itself.
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
