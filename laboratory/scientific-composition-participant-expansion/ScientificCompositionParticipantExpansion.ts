export interface ScientificCompositionParticipantSource {

    protocolId:
        string;

    sourceId:
        string;

    sourceRevision?:
        string;

}


export type ScientificCompositionParticipantExpansionBasis =
    | "INITIAL_PARTICIPANT"
    | "DOCUMENTARY_RELATION";


export interface ScientificExpandedCompositionParticipant
    extends ScientificCompositionParticipantSource {

    expansionBasis:
        ScientificCompositionParticipantExpansionBasis;

    evidenceIds:
        string[];

}