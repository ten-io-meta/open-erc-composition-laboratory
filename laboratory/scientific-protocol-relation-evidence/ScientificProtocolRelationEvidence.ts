import type {
    ScientificSourceObservationLocator
} from "../scientific-source-observation/ScientificSourceObservationLocator.js";


export type ScientificProtocolRelationKind =
    | "EXTENSION_FOR"
    | "COMPOSES_WITH";


export type ScientificProtocolRelationEvidenceBasis =
    | "MARKDOWN_H1_EXPLICIT_EXTENSION_FOR_ERC"
    | "MARKDOWN_H1_EXPLICIT_COMPOSES_WITH_ERC";


export interface ScientificProtocolRelationEvidence {

    relationEvidenceId:
        string;

    sourceId:
        string;

    sourceRevision?:
        string;

    observationId:
        string;

    /*
     * Exact documentary subject observed in the H1.
     */
    subjectSymbol:
        string;

    /*
     * Canonical protocol identity only when the documentation
     * establishes it directly through an explicit ERC H1 or an
     * unambiguous ERC<number> source-path segment.
     *
     * Its absence does not invalidate the documentary relation,
     * but prevents protocol-owned composition use downstream.
     */
    subjectProtocolId?:
        string;

    relation:
        ScientificProtocolRelationKind;

    objectProtocolId:
        string;

    evidenceBasis:
        ScientificProtocolRelationEvidenceBasis;

    subjectLocator:
        ScientificSourceObservationLocator;

    subjectRawText:
        string;

    locator:
        ScientificSourceObservationLocator;

    rawText:
        string;

}
