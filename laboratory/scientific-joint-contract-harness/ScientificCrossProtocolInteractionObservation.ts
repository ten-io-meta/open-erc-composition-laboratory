export type ScientificCrossProtocolInteractionSide =
    "A" | "B";


export type ScientificCrossProtocolInteractionCallKind =
    | "CALL"
    | "STATICCALL"
    | "DELEGATECALL";


export interface ScientificCrossProtocolInteractionObservation {

    observationId:
        string;

    candidateId:
        string;

    sourceSide:
        ScientificCrossProtocolInteractionSide;

    targetSide:
        ScientificCrossProtocolInteractionSide;

    callKind:
        ScientificCrossProtocolInteractionCallKind;

    sourceAddress:
        string;

    targetAddress:
        string;

    /*
     * OBSERVED means that the physical cross-participant call
     * itself was observed. It does not establish composition
     * compatibility or scientific polarity.
     */
    status:
        "OBSERVED";

    evidence:
        string[];

}