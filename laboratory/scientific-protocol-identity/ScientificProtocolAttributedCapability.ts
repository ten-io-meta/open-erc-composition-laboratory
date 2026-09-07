import type {
    ScientificSourceFactContainerKind
} from "../scientific-source-fact/ScientificSourceFact.js";


export type ScientificProtocolIdentityBasis =
    | "EXACT_ERC_CONTAINER_SYMBOL"
    | "EXACT_ERC_REFERENCE_CONTAINER_SYMBOL"
    | "EXPLICIT_ERC_STORAGE_NAMESPACE";


export interface ScientificProtocolAttributedCapability {

    /*
     * Deterministic identity of this protocol identifier
     * attribution.
     */
    protocolAttributionId:
        string;

    /*
     * Canonicalized ERC identifier established through direct
     * structural evidence.
     *
     * Examples:
     *
     * IERC165
     *     -> ERC-165
     *     via EXACT_ERC_CONTAINER_SYMBOL
     *
     * @custom:storage-location erc7201:erc8004.identity.registry
     *     -> ERC-8004
     *     via EXPLICIT_ERC_STORAGE_NAMESPACE
     *
     * These bases record explicit structural protocol identity
     * evidence. They do not establish repository authority or
     * canonical implementation status.
     */
    protocolId:
        string;

    /*
     * Exact basis used to establish the identifier.
     */
    identityBasis:
        ScientificProtocolIdentityBasis;

    /*
     * Structural attribution from which this protocol identifier
     * was derived.
     */
    capabilityAttributionId:
        string;

    /*
     * Original lexical capability identity.
     */
    capabilityId:
        string;

    /*
     * Original observed lexical label.
     */
    label:
        string;

    /*
     * Exact source observation containing the structural
     * attribution and, when applicable, the explicit ERC storage
     * namespace.
     */
    observationId:
        string;

    /*
     * Directly observed Solidity container category.
     */
    containerKind:
        ScientificSourceFactContainerKind;

    /*
     * Exact directly observed structural container symbol.
     *
     * The symbol itself does not need to encode an ERC number when
     * identityBasis is EXPLICIT_ERC_STORAGE_NAMESPACE.
     */
    containerSymbol:
        string;

    /*
     * Original fact evidence preserved from structural capability
     * attribution.
     */
    evidence:
        string[];

}
