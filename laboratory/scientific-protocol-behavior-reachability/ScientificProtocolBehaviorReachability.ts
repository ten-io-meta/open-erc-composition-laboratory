import type {
    ScientificSourceExternalCall
} from "../scientific-source-fact/ScientificSourceExternalCall.js";


export type ScientificProtocolBehaviorReachabilityEvidenceBasis =
    "EXACT_SOLIDITY_INHERITANCE_PATH_WITH_PROTOCOL_DEPENDENCY";


export interface ScientificProtocolBehaviorReachability {

    behaviorReachabilityId:
        string;

    /*
     * Protocol whose concrete participant container can reach the
     * inherited behavior.
     */
    participantProtocolId:
        string;

    /*
     * Protocol identity of the source container in which the
     * external-call fact was actually observed.
     *
     * This value is deliberately not rewritten to the participant.
     */
    originProtocolId:
        string;

    participantDeclarationFactId:
        string;

    participantObservationId:
        string;

    participantContainerSymbol:
        string;

    originDeclarationFactId:
        string;

    originObservationId:
        string;

    originContainerSymbol:
        string;

    protocolCallAttributionId:
        string;

    sourceCallFactId:
        string;

    externalCall:
        ScientificSourceExternalCall;

    protocolRelationEvidenceIds:
        string[];

    inheritanceEdgeIds:
        string[];

    containerPath:
        string[];

    evidenceBasis:
        ScientificProtocolBehaviorReachabilityEvidenceBasis;

}
