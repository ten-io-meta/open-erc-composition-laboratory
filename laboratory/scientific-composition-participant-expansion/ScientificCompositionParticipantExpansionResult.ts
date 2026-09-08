import type {
    ScientificExpandedCompositionParticipant
} from "./ScientificCompositionParticipantExpansion.js";


export interface ScientificCompositionParticipantExpansionResult {

    participants:
        ScientificExpandedCompositionParticipant[];

    unresolvedProtocolIds:
        string[];

    ambiguousProtocolIds:
        string[];

    unresolvedRelationEvidenceIds:
        string[];

    errors:
        string[];

}