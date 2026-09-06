import type {
    ScientificProtocolRelationEvidence
} from "./ScientificProtocolRelationEvidence.js";


export interface ScientificProtocolRelationEvidenceResult {

    /*
     * Research source whose documentation observations were
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
     * Explicit documentary protocol relation evidence.
     */
    relations:
        ScientificProtocolRelationEvidence[];

    /*
     * Documentation observations that did not establish a
     * relation under the current conservative extraction rule.
     *
     * Non-documentation observations are not included here.
     */
    unresolvedObservationIds:
        string[];

    /*
     * Fail-closed provenance or evidence-boundary errors.
     */
    errors:
        string[];

}
