import type {
    ScientificSourceFactContainerKind
} from "../scientific-source-fact/ScientificSourceFact.js";


export type ScientificProtocolIdentityBasis =
    "EXACT_ERC_CONTAINER_SYMBOL";


export interface ScientificProtocolAttributedCapability {

    /*
     * Deterministic identity of this protocol identifier
     * attribution.
     */
    protocolAttributionId:
        string;

    /*
     * Canonicalized ERC identifier observed explicitly in the
     * structural container symbol.
     *
     * Example:
     * IERC165 -> ERC-165
     *
     * This records explicit structural self-identification.
     * It does not by itself establish repository authority or
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
     * Original lexical capability label.
     */
    label:
        string;

    /*
     * Exact source observation containing the structural
     * container.
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
     */
    containerSymbol:
        string;

    /*
     * Original fact evidence preserved from structural
     * capability attribution.
     */
    evidence:
        string[];

}
