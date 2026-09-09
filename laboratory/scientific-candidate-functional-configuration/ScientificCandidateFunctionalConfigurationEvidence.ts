export type ScientificObservedFunctionalCallKind =
    | "CALL"
    | "STATICCALL"
    | "DELEGATECALL";


export interface ScientificObservedFunctionalInteraction {

    observationId:
        string;

    runtimeCandidateId:
        string;

    sourceParticipantId:
        string;

    targetParticipantId:
        string;

    callKind:
        ScientificObservedFunctionalCallKind;

    sourceAddress:
        string;

    targetAddress:
        string;

    evidenceIds:
        string[];

}


export interface ScientificObservedFunctionalParticipant {

    participantId:
        string;

    executed:
        boolean;

    contractAddresses:
        string[];

}


export interface ScientificCandidateRuntimeBinding {

    genericCandidateId:
        string;

    runtimeCandidateId:
        string;

    evidenceIds:
        string[];

}


export interface ScientificCandidateCompatibilitySupportProjection {

    candidateId:
        string;

    scientificPolarity:
        "SUPPORT" | "CHALLENGE" | "INCONCLUSIVE";

    total:
        number;

    preserved:
        number;

    violated:
        number;

    unevaluated:
        number;

    unresolvedRelevance:
        number;

}


export interface ScientificCandidateFunctionalConfigurationEvidence {

    configurationId:
        string;

    candidateId:
        string;

    runtimeCandidateId:
        string;

    kind:
        "OBSERVED_RUNTIME_CONFIGURATION";

    status:
        "EVIDENCED";

    chainId:
        string | number;

    sharedRuntime:
        true;

    participantIds:
        string[];

    participantContractAddresses:
        {
            participantId:
                string;

            contractAddresses:
                string[];
        }[];

    interactionObservationIds:
        string[];

    bindingEvidenceIds:
        string[];

    /*
     * This is an evidence projection only.
     *
     * It does not change candidate kind, enter the functional
     * solver, establish global composition, or create scientific
     * polarity.
     */
    interpretation:
        "CANDIDATE_SCOPED_OBSERVED_FUNCTIONAL_CONFIGURATION";

}