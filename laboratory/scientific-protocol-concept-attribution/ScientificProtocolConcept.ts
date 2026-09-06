export interface ScientificProtocolConcept {

    /*
     * Deterministic identity of this concept as supported within
     * one explicitly attributed protocol.
     */
    protocolConceptId:
        string;

    /*
     * Original scientific concept identity.
     */
    conceptId:
        string;

    /*
     * Original recurrent observed concept label.
     */
    label:
        string;

    /*
     * Explicitly attributed protocol identity.
     */
    protocolId:
        string;

    /*
     * Distinct lexical capabilities from this protocol that
     * independently participate in the recurrent concept.
     */
    lexicalCapabilityIds:
        string[];

    /*
     * Exact protocol attribution identities establishing those
     * lexical capabilities within this protocol.
     */
    protocolAttributionIds:
        string[];

    /*
     * Exact fact evidence carried by those protocol-attributed
     * lexical capabilities.
     */
    evidence:
        string[];

}
