import type {
    ScientificCompositionMechanism,
    ScientificCompositionParticipantKind
} from "../scientific-cross-protocol-composition/ScientificCompositionCandidate.js";

import type {
    ScientificJointContractHarnessRecipe
} from "./ScientificJointContractHarness.js";


export interface ScientificJointContractHarnessRecipeParticipantBinding {

    participantKind:
        ScientificCompositionParticipantKind;

    participantId:
        string;

    repository:
        string;

    sourceRevision:
        string;

}


export interface ScientificJointContractHarnessRecipeApplicability {

    mechanism:
        ScientificCompositionMechanism;

    foundationProtocolId?:
        string;

    participantA:
        ScientificJointContractHarnessRecipeParticipantBinding;

    participantB:
        ScientificJointContractHarnessRecipeParticipantBinding;

}


export type ScientificJointContractHarnessEvaluationSurfaceCompleteness =
    | "COMPLETE_FOR_CANDIDATE_EVALUATION"
    | "PARTIAL";


export interface ScientificJointContractHarnessParticipantEvaluationSurface {

    participantSide:
        "A" | "B";

    participantKind:
        ScientificCompositionParticipantKind;

    participantId:
        string;

    completeness:
        ScientificJointContractHarnessEvaluationSurfaceCompleteness;

    includedContainerSymbols:
        string[];

    evidenceIds:
        string[];

}


export interface ScientificJointContractHarnessEvaluationSurface {

    participantSurfaces:
        ScientificJointContractHarnessParticipantEvaluationSurface[];

}


export interface ScientificJointContractHarnessRecipeRegistration {

    registrationId:
        string;

    applicability:
        ScientificJointContractHarnessRecipeApplicability;

    /*
     * Optional operational declaration.
     *
     * This defines the exact container surface evaluated by this
     * registered recipe. It does not claim global protocol scope.
     */
    evaluationSurface?:
        ScientificJointContractHarnessEvaluationSurface;

    buildRecipe:
        () => ScientificJointContractHarnessRecipe;

}
