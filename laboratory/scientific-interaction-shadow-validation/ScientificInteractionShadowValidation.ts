import type {
    ScientificCrossProtocolInteractionCallKind,
    ScientificCrossProtocolInteractionSide
} from "../scientific-joint-contract-harness/ScientificCrossProtocolInteractionObservation.js";


export type ScientificInteractionShadowCallKindAssessment =
    | "CONFIRMED"
    | "CONTRADICTED"
    | "SOURCE_CALL_KIND_NOT_DETERMINED";


export interface ScientificInteractionShadowValidation {

    shadowValidationId:
        string;

    hypothesisId:
        string;

    observationId:
        string;

    candidateId:
        string;

    sourceSide:
        ScientificCrossProtocolInteractionSide;

    targetSide:
        ScientificCrossProtocolInteractionSide;

    /*
     * Exact runtime direction from the hypothesis was physically
     * observed by the joint harness.
     *
     * This is not a composition compatibility conclusion.
     */
    directionStatus:
        "OBSERVED";

    /*
     * Present only when source syntax directly determines the
     * low-level EVM call family.
     */
    predictedCallKind?:
        ScientificCrossProtocolInteractionCallKind;

    observedCallKind:
        ScientificCrossProtocolInteractionCallKind;

    callKindAssessment:
        ScientificInteractionShadowCallKindAssessment;

    hypothesisEvidenceIds:
        string[];

    runtimeEvidence:
        string[];

}
