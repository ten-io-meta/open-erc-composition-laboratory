import type {
    ScientificCapabilityAttributionResult
} from "../scientific-capability-attribution/ScientificCapabilityAttributionResult.js";

import type {
    ScientificAttributedCapability
} from "../scientific-capability-attribution/ScientificAttributedCapability.js";

import type {
    ScientificSourceObservation
} from "../scientific-source-observation/ScientificSourceObservation.js";

import type {
    ScientificProtocolAttributedCapability
} from "./ScientificProtocolAttributedCapability.js";

import type {
    ScientificProtocolIdentityAttributionResult
} from "./ScientificProtocolIdentityAttributionResult.js";


export interface ScientificProtocolIdentityAttributionInput {

    attribution:
        ScientificCapabilityAttributionResult;

    /*
     * Optional direct source observations from the exact source
     * revision that produced the structural attribution.
     *
     * These observations may establish additional explicit
     * structural identity bases. They must never be interpreted
     * through repository names, URLs or generic co-mentions.
     */
    observations?:
        ScientificSourceObservation[];

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


        const observationsById =
            new Map<
                string,
                ScientificSourceObservation
            >(
                (
                    input.observations ??
                    []
                ).map(
                    observation => [
                        observation.observationId,
                        observation
                    ]
                )
            );


        for (
            const attribution
            of input.attribution.attributedCapabilities
        ) {

            const exactContainerProtocolId =
                this.protocolIdFromExactContainerSymbol(
                    attribution
                );


            const exactReferenceProtocolId =
                exactContainerProtocolId ===
                    undefined
                    ? this.protocolIdFromExactReferenceContainerSymbol(
                        attribution
                    )
                    : undefined;


            const storageNamespaceProtocolId =
                exactContainerProtocolId ===
                    undefined &&
                exactReferenceProtocolId ===
                    undefined
                    ? this.protocolIdFromExplicitStorageNamespace(
                        attribution,
                        observationsById
                    )
                    : undefined;


            const protocolId =
                exactContainerProtocolId ??
                exactReferenceProtocolId ??
                storageNamespaceProtocolId;


            const identityBasis =
                exactContainerProtocolId !==
                    undefined
                    ? "EXACT_ERC_CONTAINER_SYMBOL"
                    : exactReferenceProtocolId !==
                        undefined
                        ? "EXACT_ERC_REFERENCE_CONTAINER_SYMBOL"
                        : storageNamespaceProtocolId !==
                            undefined
                            ? "EXPLICIT_ERC_STORAGE_NAMESPACE"
                            : undefined;


            if (
                protocolId ===
                    undefined ||
                identityBasis ===
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

                identityBasis,

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


        const observationIds =
            new Set<string>();


        for (
            const observation
            of input.observations ??
            []
        ) {

            if (
                observation.observationId
                    .trim()
                    .length ===
                0
            ) {

                errors.push(
                    "Protocol identity attribution received an observation with an empty identity."
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
                input.attribution.sourceId
            ) {

                errors.push(
                    `Observation ${observation.observationId} belongs to source ${observation.sourceId}, expected ${input.attribution.sourceId}.`
                );

            }


            if (
                observation.sourceRevision !==
                input.attribution.sourceRevision
            ) {

                errors.push(
                    `Observation ${observation.observationId} has a different source revision.`
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


    private protocolIdFromExactReferenceContainerSymbol(
        attribution:
            ScientificAttributedCapability
    ): string | undefined {

        /*
         * Deliberately narrow structural self-identification.
         *
         * Accepted:
         *
         * ERC8060Reference
         * ERC165Reference
         *
         * Rejected:
         *
         * IERC8060Reference
         * IERC8060MintBurn
         * ERC8060ReferenceHelper
         * MyERC8060Reference
         * ERC0Reference
         *
         * This basis identifies only the exact reference
         * implementation container. It does not propagate protocol
         * identity to sibling contracts, interfaces or helpers.
         */
        const match =
            /^ERC([1-9][0-9]*)Reference$/.exec(
                attribution.containerSymbol
            );


        if (
            !match
        ) {

            return undefined;

        }


        return `ERC-${match[1]}`;

    }


    private protocolIdFromExplicitStorageNamespace(
        attribution:
            ScientificAttributedCapability,
        observationsById:
            Map<
                string,
                ScientificSourceObservation
            >
    ): string | undefined {

        /*
         * Identity from storage namespaces is deliberately narrow.
         *
         * Accepted structural form:
         *
         * @custom:storage-location erc7201:erc8004.identity.registry
         *
         * Rejected as identity evidence:
         *
         * repository names
         * repository URLs
         * generic ERC co-mentions
         * arbitrary strings such as "ERC8004IdentityRegistry"
         * namespaces from another source observation
         *
         * Multiple distinct ERC namespace identifiers in the same
         * observation are ambiguous and therefore fail closed.
         */
        const observation =
            observationsById.get(
                attribution.observationId
            );


        if (
            !observation
        ) {

            return undefined;

        }


        const protocolIds =
            new Set<string>();


        const pattern =
            /@custom:storage-location[ \t]+erc7201:erc([1-9][0-9]*)(?=\.|[ \t\r\n]|$)/g;


        let match:
            RegExpExecArray | null;


        while (
            (
                match =
                    pattern.exec(
                        observation.rawText
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
