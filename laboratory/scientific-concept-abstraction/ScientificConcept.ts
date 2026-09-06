export interface ScientificConcept {

    /*
     * Deterministic identity derived only from the observed token.
     */
    conceptId:
        string;

    /*
     * Observed lexical token shared by distinct capabilities.
     */
    label:
        string;

    /*
     * Distinct lexical capabilities that independently contain
     * this observed token.
     */
    lexicalCapabilityIds:
        string[];

    /*
     * Structural fact identities supporting those capabilities.
     */
    evidence:
        string[];

}
