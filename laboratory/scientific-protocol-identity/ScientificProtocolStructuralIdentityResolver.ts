import type {
    ScientificSourceObservation
} from "../scientific-source-observation/ScientificSourceObservation.js";

import type {
    ScientificProtocolIdentityBasis
} from "./ScientificProtocolAttributedCapability.js";


export interface ScientificProtocolStructuralIdentitySubject {

    /*
     * Exact source observation containing the structural subject.
     */
    observationId:
        string;

    /*
     * Directly observed Solidity container symbol.
     */
    containerSymbol:
        string;

}


export interface ScientificProtocolStructuralIdentityResolution {

    /*
     * Canonical ERC identifier established strictly from structural
     * identity evidence.
     */
    protocolId:
        string;

    /*
     * Exact structural basis that established the identifier.
     */
    identityBasis:
        ScientificProtocolIdentityBasis;

}


export class ScientificProtocolStructuralIdentityResolver {

    resolve(
        subject:
            ScientificProtocolStructuralIdentitySubject,
        observationsById:
            Map<
                string,
                ScientificSourceObservation
            >
    ): ScientificProtocolStructuralIdentityResolution | undefined {

        const exactContainerProtocolId =
            this.protocolIdFromExactContainerSymbol(
                subject.containerSymbol
            );


        if (
            exactContainerProtocolId !==
            undefined
        ) {

            return {

                protocolId:
                    exactContainerProtocolId,

                identityBasis:
                    "EXACT_ERC_CONTAINER_SYMBOL"

            };

        }


        const exactReferenceProtocolId =
            this.protocolIdFromExactReferenceContainerSymbol(
                subject.containerSymbol
            );


        if (
            exactReferenceProtocolId !==
            undefined
        ) {

            return {

                protocolId:
                    exactReferenceProtocolId,

                identityBasis:
                    "EXACT_ERC_REFERENCE_CONTAINER_SYMBOL"

            };

        }


        const storageNamespaceProtocolId =
            this.protocolIdFromExplicitStorageNamespace(
                subject.observationId,
                observationsById
            );


        if (
            storageNamespaceProtocolId !==
            undefined
        ) {

            return {

                protocolId:
                    storageNamespaceProtocolId,

                identityBasis:
                    "EXPLICIT_ERC_STORAGE_NAMESPACE"

            };

        }


        return undefined;

    }


    private protocolIdFromExactReferenceContainerSymbol(
        containerSymbol:
            string
    ): string | undefined {

        /*
         * Deliberately narrow structural self-identification.
         *
         * Accepted:
         *
         * ERC123Reference
         * ERC165Reference
         *
         * Rejected:
         *
         * IERC123Reference
         * IERC123Extension
         * ERC123ReferenceHelper
         * MyERC123Reference
         * ERC0Reference
         */
        const match =
            /^ERC([1-9][0-9]*)Reference$/.exec(
                containerSymbol
            );


        if (
            !match
        ) {

            return undefined;

        }


        return `ERC-${match[1]}`;

    }


    private protocolIdFromExplicitStorageNamespace(
        observationId:
            string,
        observationsById:
            Map<
                string,
                ScientificSourceObservation
            >
    ): string | undefined {

        /*
         * Identity from storage namespaces is deliberately narrow.
         *
         * Accepted:
         *
         * @custom:storage-location erc7201:erc1234.example.storage
         *
         * Repository names, URLs, co-mentions and arbitrary ERC-like
         * strings are not identity evidence.
         *
         * Multiple distinct ERC namespace identifiers in one
         * observation remain ambiguous and therefore fail closed.
         */
        const observation =
            observationsById.get(
                observationId
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
        containerSymbol:
            string
    ): string | undefined {

        /*
         * Deliberately exact and case-sensitive.
         *
         * Accepted:
         *
         * IERC165
         * ERC165
         *
         * Rejected:
         *
         * IERC165Metadata
         * IERC999Extension
         * MyERC165
         * ERC0
         */
        const match =
            /^(?:I)?ERC([1-9][0-9]*)$/.exec(
                containerSymbol
            );


        if (
            !match
        ) {

            return undefined;

        }


        return `ERC-${match[1]}`;

    }

}