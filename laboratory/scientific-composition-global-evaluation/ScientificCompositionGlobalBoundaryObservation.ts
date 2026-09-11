export type ScientificCompositionGlobalBoundaryVerdict =
    | "PRESERVED"
    | "VIOLATED";


export interface ScientificCompositionGlobalBoundaryObservation {

    observationId:
        string;

    graphId:
        string;

    /*
     * Observations only combine when they belong to the exact
     * same experimental run.
     */
    runId:
        string;

    boundaryId:
        string;

    verdict:
        ScientificCompositionGlobalBoundaryVerdict;

    evidenceIds:
        string[];

}
