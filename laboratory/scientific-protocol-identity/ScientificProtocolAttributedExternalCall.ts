import type {
    ScientificSourceExternalCall
} from "../scientific-source-fact/ScientificSourceExternalCall.js";

import type {
    ScientificSourceFactContainerKind
} from "../scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificProtocolIdentityBasis
} from "./ScientificProtocolIdentityBasis.js";


export interface ScientificProtocolAttributedExternalCall {

    /*
     * Deterministic source-global identity of this protocol
     * attribution of an observed external-call fact.
     */
    protocolCallAttributionId:
        string;

    /*
     * Canonical protocol identifier established only from direct
     * structural protocol identity evidence.
     */
    protocolId:
        string;

    /*
     * Exact structural basis used to establish protocol identity.
     */
    identityBasis:
        ScientificProtocolIdentityBasis;

    /*
     * Exact source fact containing the observed external call.
     */
    sourceFactId:
        string;

    /*
     * Exact source observation from which that fact originated.
     */
    observationId:
        string;

    /*
     * Directly observed Solidity container category.
     */
    containerKind:
        ScientificSourceFactContainerKind;

    /*
     * Exact directly observed Solidity container symbol.
     */
    containerSymbol:
        string;

    /*
     * Original structured external-call syntax.
     *
     * This does not identify another protocol as the target and does
     * not establish runtime success, compatibility, interaction
     * polarity, or composition.
     */
    externalCall:
        ScientificSourceExternalCall;

}
