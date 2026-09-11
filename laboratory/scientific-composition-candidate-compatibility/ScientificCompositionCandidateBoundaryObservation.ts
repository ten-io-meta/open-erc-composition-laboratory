export type ScientificCompositionCandidateBoundaryObservationVerdict =
    | "PRESERVED"
    | "VIOLATED";


export interface ScientificCompositionCandidateBoundaryObservation {

    observationId:
        string;

    /*
     * Exact generic composition candidate being evaluated.
     *
     * Evidence for one candidate must never silently evaluate
     * another candidate, even when participant identities match.
     */
    candidateId:
        string;

    /*
     * Exact known participant boundary observed in the context
     * of this candidate.
     */
    boundaryId:
        string;

    verdict:
        ScientificCompositionCandidateBoundaryObservationVerdict;

    evidenceIds:
        string[];

}