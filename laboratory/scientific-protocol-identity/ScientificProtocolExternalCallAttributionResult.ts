import type {
    ScientificProtocolAttributedExternalCall
} from "./ScientificProtocolAttributedExternalCall.js";


export interface ScientificProtocolExternalCallAttributionResult {

    /*
     * Research source from which the call facts originated.
     */
    sourceId:
        string;

    /*
     * Exact source revision when available.
     */
    sourceRevision?:
        string;

    /*
     * External-call facts for which structural protocol identity
     * was established.
     */
    protocolAttributedExternalCalls:
        ScientificProtocolAttributedExternalCall[];

    /*
     * External-call fact identities whose structural evidence did
     * not establish a protocol identifier.
     */
    unresolvedExternalCallFactIds:
        string[];

    /*
     * Fail-closed provenance or structural-boundary errors.
     */
    errors:
        string[];

}
