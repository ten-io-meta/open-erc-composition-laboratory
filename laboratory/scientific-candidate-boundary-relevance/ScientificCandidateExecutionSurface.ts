export interface ScientificCandidateBoundaryContainerBinding {

    boundaryId:
        string;

    participantId:
        string;

    containerSymbol:
        string;

}


export interface ScientificCandidateExecutionSurface {

    surfaceId:
        string;

    candidateId:
        string;

    participantId:
        string;

    /*
     * Exclusion evidence is legal only when the producer can
     * explicitly establish that this is the complete container
     * surface for the exact candidate evaluation being assessed.
     */
    completeness:
        | "COMPLETE_FOR_CANDIDATE_EVALUATION"
        | "PARTIAL";

    includedContainerSymbols:
        string[];

    evidenceIds:
        string[];

}