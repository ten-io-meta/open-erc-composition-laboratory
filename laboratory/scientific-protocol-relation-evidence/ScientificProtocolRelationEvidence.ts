import type {
    ScientificSourceObservationLocator
} from "../scientific-source-observation/ScientificSourceObservationLocator.js";


export type ScientificProtocolRelationKind =
    "EXTENSION_FOR";


export type ScientificProtocolRelationEvidenceBasis =
    "MARKDOWN_H1_EXPLICIT_EXTENSION_FOR_ERC";


export interface ScientificProtocolRelationEvidence {

    /*
     * Deterministic identity of this exact observed relation
     * evidence occurrence.
     */
    relationEvidenceId:
        string;

    /*
     * Research source from which this documentary evidence
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
     * Documentation observation containing both the document
     * subject and the explicit relation statement.
     */
    observationId:
        string;

    /*
     * Exact symbolic subject observed in the Markdown H1.
     *
     * This is not automatically canonicalized into a protocol
     * identity.
     */
    subjectSymbol:
        string;

    /*
     * Explicit documentary relation observed in the source.
     */
    relation:
        ScientificProtocolRelationKind;

    /*
     * Canonicalized ERC identifier explicitly named as the
     * relation object.
     */
    objectProtocolId:
        string;

    /*
     * Exact extraction rule that established this evidence.
     */
    evidenceBasis:
        ScientificProtocolRelationEvidenceBasis;

    /*
     * Exact location of the Markdown H1 establishing the
     * documentary subject.
     */
    subjectLocator:
        ScientificSourceObservationLocator;

    /*
     * Exact H1 source line.
     */
    subjectRawText:
        string;

    /*
     * Exact location of the explicit relation statement.
     */
    locator:
        ScientificSourceObservationLocator;

    /*
     * Exact source line establishing the relation.
     */
    rawText:
        string;

}
