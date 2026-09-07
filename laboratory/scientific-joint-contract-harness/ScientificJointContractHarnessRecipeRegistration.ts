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


export interface ScientificJointContractHarnessRecipeRegistration {

    registrationId:
        string;

    applicability:
        ScientificJointContractHarnessRecipeApplicability;

    buildRecipe:
        () => ScientificJointContractHarnessRecipe;

}
