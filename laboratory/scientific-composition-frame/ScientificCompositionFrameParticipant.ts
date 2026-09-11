export type ScientificCompositionFrameParticipantKind =
    | "PROTOCOL"
    | "SYMBOLIC_SUBJECT";


export interface ScientificCompositionFrameParticipant {

    participantId:
        string;

    kind:
        ScientificCompositionFrameParticipantKind;

    sourceIds:
        string[];

    sourceRevisions:
        string[];

}
