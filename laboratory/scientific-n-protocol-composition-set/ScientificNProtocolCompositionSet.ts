import type {
    ScientificCompositionCandidateKind
} from "../scientific-composition-candidate-set/ScientificCompositionCandidate.js";


export interface ScientificNProtocolCompositionSetParticipant {

    participantId:
        string;

    profileId:
        string;

    sourceId:
        string;

    sourceRevision?:
        string;

}


export interface ScientificNProtocolCompositionSetRelation {

    relationId:
        string;

    candidateGraphEdgeId:
        string;

    candidateId:
        string;

    kind:
        ScientificCompositionCandidateKind;

    sourceParticipantId:
        string;

    targetParticipantId:
        string;

    evidenceIds:
        string[];

    /*
     * This is the discovery status inherited from the candidate
     * graph. It is not a compatibility or harmony result.
     */
    evaluationStatus:
        "UNEVALUATED";

}


export interface ScientificNProtocolCompositionSet {

    setId:
        string;

    candidateGraphId:
        string;

    objectiveId:
        string;

    participants:
        ScientificNProtocolCompositionSetParticipant[];

    participantIds:
        string[];

    relations:
        ScientificNProtocolCompositionSetRelation[];

    candidateIds:
        string[];

    /*
     * DISCOVERED means only that these participants belong to
     * the same connected candidate component.
     *
     * It does not establish pairwise compatibility, global
     * compatibility, harmony, or demonstrated composition.
     */
    status:
        "DISCOVERED";

}


export interface ScientificNProtocolCompositionSetStatistics {

    candidateGraphParticipants:
        number;

    candidateGraphRelations:
        number;

    compositionSets:
        number;

    participantsInCompositionSets:
        number;

    isolatedParticipants:
        number;

    largestCompositionSet:
        number;

}


export interface ScientificNProtocolCompositionSetResult {

    candidateGraphId:
        string | null;

    objectiveId:
        string | null;

    sets:
        ScientificNProtocolCompositionSet[];

    isolatedParticipantIds:
        string[];

    statistics:
        ScientificNProtocolCompositionSetStatistics;

    errors:
        string[];

}