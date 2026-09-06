import type {
    ScientificProtocolAttributedCapability
} from "./ScientificProtocolAttributedCapability.js";


export interface ScientificProtocolIdentityAttributionResult {

    /*
     * Research source from which the scientific model originated.
     */
    sourceId:
        string;

    /*
     * Exact source revision when available.
     */
    sourceRevision?:
        string;

    /*
     * Scientific semantic model whose structural attributions
     * are being resolved.
     */
    sourceModelId:
        string;

    /*
     * Structural capability attributions for which an exact ERC
     * identifier was explicitly observable.
     */
    protocolAttributedCapabilities:
        ScientificProtocolAttributedCapability[];

    /*
     * Structural attribution identities whose container symbols
     * do not establish an exact ERC identifier.
     */
    unresolvedAttributionIds:
        string[];

    /*
     * Capabilities that had already failed to establish complete
     * structural attribution upstream.
     */
    structurallyUnattributedCapabilityIds:
        string[];

    /*
     * Fail-closed provenance or identity-boundary errors.
     */
    errors:
        string[];

}
