import type {
    ScientificProtocolConcept
} from "./ScientificProtocolConcept.js";


export interface ScientificProtocolConceptAttributionResult {

    /*
     * Research source from which both upstream scientific
     * derivations originated.
     */
    sourceId:
        string;

    /*
     * Exact source revision when available.
     */
    sourceRevision?:
        string;

    /*
     * Scientific semantic model shared by concepts and protocol
     * capability attribution.
     */
    sourceModelId:
        string;

    /*
     * Concepts whose recurrence is independently demonstrated
     * inside one explicitly attributed protocol.
     */
    protocolConcepts:
        ScientificProtocolConcept[];

    /*
     * Scientific concepts for which no protocol provides at
     * least two distinct supporting lexical capabilities.
     */
    unattributedConceptIds:
        string[];

    /*
     * Fail-closed provenance or evidence-boundary errors.
     */
    errors:
        string[];

}
