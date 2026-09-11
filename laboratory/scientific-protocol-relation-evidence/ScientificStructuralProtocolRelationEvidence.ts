import type {
    ScientificSourceFactContainerKind
} from "../scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificSourceObservationLocator
} from "../scientific-source-observation/ScientificSourceObservationLocator.js";


export type ScientificStructuralProtocolRelationKind =
    "DEPENDS_ON";


export type ScientificStructuralProtocolRelationEvidenceBasis =
    "SOLIDITY_INHERITANCE_ERC_FAMILY";


export interface ScientificStructuralProtocolRelationEvidence {

    /*
     * Deterministic identity of this exact structural evidence
     * occurrence.
     */
    relationEvidenceId:
        string;

    /*
     * Research source from which the Solidity declaration
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
     * Exact declaration fact establishing the inheritance.
     */
    factId:
        string;

    /*
     * Observation containing the declaration fact.
     */
    observationId:
        string;

    /*
     * Protocol identity already established independently for
     * the subject container.
     *
     * This engine never infers subject protocol identity from
     * inheritance.
     */
    subjectProtocolId:
        string;

    /*
     * Exact Solidity container carrying the observed inheritance.
     */
    subjectContainerKind:
        ScientificSourceFactContainerKind;

    subjectContainerSymbol:
        string;

    /*
     * Structural relation observed in Solidity.
     */
    relation:
        ScientificStructuralProtocolRelationKind;

    /*
     * ERC family named by the inherited Solidity base.
     *
     * Examples:
     *
     * ERC721URIStorageUpgradeable -> ERC-721
     * ERC721URIStorage            -> ERC-721
     * IERC721Value                -> ERC-721
     */
    objectProtocolId:
        string;

    /*
     * Exact inherited Solidity symbol that established the
     * dependency.
     */
    inheritedSymbol:
        string;

    /*
     * Exact conservative extraction basis.
     */
    evidenceBasis:
        ScientificStructuralProtocolRelationEvidenceBasis;

    /*
     * Exact declaration location.
     */
    locator:
        ScientificSourceObservationLocator;

    /*
     * Exact declaration source fragment.
     */
    rawText:
        string;

}
