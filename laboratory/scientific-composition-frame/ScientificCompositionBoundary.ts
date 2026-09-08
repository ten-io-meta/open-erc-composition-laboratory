export type ScientificCompositionBoundaryKind =
    | "SOURCE_CONSTRAINT"
    | "REQUIRED_INTERFACE"
    | "AUTHORITY_BOUNDARY"
    | "VALUE_BOUNDARY"
    | "STATE_BOUNDARY"
    | "OTHER";


export interface ScientificCompositionBoundary {

    boundaryId:
        string;

    participantId:
        string;

    kind:
        ScientificCompositionBoundaryKind;

    /*
     * What the participant requires to remain true.
     *
     * This is a scientific boundary, not automatically a
     * compatibility verdict.
     */
    subject:
        string;

    evidenceIds:
        string[];

}
