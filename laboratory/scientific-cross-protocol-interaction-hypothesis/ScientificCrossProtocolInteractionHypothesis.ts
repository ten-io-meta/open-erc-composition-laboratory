import type {
    ScientificSourceExternalCall
} from "../scientific-source-fact/ScientificSourceExternalCall.js";


export type ScientificCrossProtocolInteractionHypothesisSide =
    | "A"
    | "B";


export type ScientificCrossProtocolInteractionBehaviorEvidenceKind =
    | "DIRECT_PROTOCOL_CALL"
    | "INHERITED_PROTOCOL_BEHAVIOR";


export type ScientificCrossProtocolInteractionHypothesisBasis =
    | "DIRECT_CALL_SITE_WITH_CANDIDATE_PEER"
    | "INHERITED_CALL_SITE_WITH_CANDIDATE_PEER";


export interface ScientificCrossProtocolInteractionHypothesis {

    hypothesisId:
        string;

    candidateId:
        string;

    sourceSide:
        ScientificCrossProtocolInteractionHypothesisSide;

    targetSide:
        ScientificCrossProtocolInteractionHypothesisSide;

    /*
     * Protocol whose participant execution may issue the call.
     */
    sourceParticipantProtocolId:
        string;

    /*
     * The opposite protocol participant from the already-discovered
     * composition candidate.
     *
     * This is a hypothesized runtime target, not an observed target.
     */
    hypothesizedTargetParticipantProtocolId:
        string;

    /*
     * Protocol identity of the source container in which the call-site
     * was actually observed.
     *
     * For direct calls this normally equals sourceParticipantProtocolId.
     * For inherited behavior it may differ and must remain preserved.
     */
    originProtocolId:
        string;

    behaviorEvidenceKind:
        ScientificCrossProtocolInteractionBehaviorEvidenceKind;

    hypothesisBasis:
        ScientificCrossProtocolInteractionHypothesisBasis;

    protocolCallAttributionId:
        string;

    sourceCallFactId:
        string;

    behaviorReachabilityId?:
        string;

    externalCall:
        ScientificSourceExternalCall;

    candidateProvenanceEvidenceIds:
        string[];

    behaviorEvidenceIds:
        string[];

    evaluationStatus:
        "UNEVALUATED";

}
