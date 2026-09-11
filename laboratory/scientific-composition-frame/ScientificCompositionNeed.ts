export interface ScientificCompositionNeed {

    needId:
        string;

    participantId:
        string;

    /*
     * Functionality required outside the participant's own
     * responsibility boundary.
     */
    subject:
        string;

    evidenceIds:
        string[];

    status:
        "UNRESOLVED" | "CANDIDATE_PROVIDER_FOUND";

    candidateProviderParticipantIds:
        string[];

}
