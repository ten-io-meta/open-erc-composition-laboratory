import type {
    ScientificSourceFactContainerKind
} from "../scientific-source-fact/ScientificSourceFact.js";


export interface ScientificAttributedCapability {

    /*
     * Deterministic identity of this structural attribution.
     */
    attributionId:
        string;

    /*
     * Lexical capability being structurally attributed.
     */
    capabilityId:
        string;

    /*
     * Original observed lexical label.
     */
    label:
        string;

    /*
     * Exact source observation containing this structural
     * Solidity container.
     *
     * This prevents equal container symbols in different source
     * observations from being merged accidentally.
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
     * Fact identities from this capability that were observed
     * inside this exact structural container.
     */
    evidence:
        string[];

}
