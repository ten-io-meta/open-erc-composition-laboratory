import type {
    ScientificStructuralProtocolRelationEvidence
} from "./ScientificStructuralProtocolRelationEvidence.js";


export interface ScientificStructuralProtocolRelationEvidenceResult {

    /*
     * Research source whose Solidity declaration facts were
     * inspected.
     */
    sourceId:
        string;

    /*
     * Exact source revision when available.
     */
    sourceRevision?:
        string;

    /*
     * Explicit structural protocol dependency evidence.
     */
    relations:
        ScientificStructuralProtocolRelationEvidence[];

    /*
     * Declaration facts that did not establish an external
     * ERC-family dependency under the current conservative rule.
     */
    unresolvedFactIds:
        string[];

    /*
     * Fail-closed provenance or structural-boundary errors.
     */
    errors:
        string[];

}
