export type ScientificCompositionBoundaryObservationVerdict =
    | "PRESERVED"
    | "VIOLATED";


export interface ScientificCompositionBoundaryObservation {

    observationId:
        string;

    /*
     * Exact complementarity edge being experimentally evaluated.
     *
     * Boundary evidence from one edge must never silently prove
     * compatibility for another edge.
     */
    matchId:
        string;

    boundaryId:
        string;

    verdict:
        ScientificCompositionBoundaryObservationVerdict;

    evidenceIds:
        string[];

}
