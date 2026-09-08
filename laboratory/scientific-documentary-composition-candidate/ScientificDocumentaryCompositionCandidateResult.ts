import type {
    ScientificDocumentaryCompositionCandidate
} from "./ScientificDocumentaryCompositionCandidate.js";


export interface ScientificDocumentaryCompositionCandidateResult {

    candidates:
        ScientificDocumentaryCompositionCandidate[];

    /*
     * Explicitly referenced object protocols for which no
     * participant profile was supplied.
     */
    unresolvedObjectProtocolIds:
        string[];

    /*
     * Documentary relation evidence occurrences that could not
     * become a candidate under the current participant set.
     */
    unresolvedRelationEvidenceIds:
        string[];

    /*
     * Fail-closed provenance or identity-boundary errors.
     */
    errors:
        string[];

}