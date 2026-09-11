import type {
    ScientificAttributedCapability
} from "./ScientificAttributedCapability.js";


export interface ScientificCapabilityAttributionResult {

    /*
     * Research source from which the scientific semantic model
     * originated.
     */
    sourceId:
        string;

    /*
     * Exact source revision when available.
     */
    sourceRevision?:
        string;

    /*
     * Scientific semantic model being structurally attributed.
     */
    sourceModelId:
        string;

    /*
     * Capability fragments whose fact evidence demonstrates a
     * concrete Solidity structural container.
     */
    attributedCapabilities:
        ScientificAttributedCapability[];

    /*
     * Capability identities for which at least one evidence fact
     * cannot currently be assigned to a complete structural
     * container.
     */
    unattributedCapabilityIds:
        string[];

    /*
     * Fail-closed provenance or structural-boundary errors.
     */
    errors:
        string[];

}
