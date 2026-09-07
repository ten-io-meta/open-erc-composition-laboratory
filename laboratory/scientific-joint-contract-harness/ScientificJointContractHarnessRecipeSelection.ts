import type {
    ScientificJointContractHarnessRecipeRegistration
} from "./ScientificJointContractHarnessRecipeRegistration.js";


export type ScientificJointContractHarnessRecipeSelectionStatus =
    | "SELECTED"
    | "NO_MATCH"
    | "AMBIGUOUS";


export interface ScientificJointContractHarnessRecipeSelection {

    status:
        ScientificJointContractHarnessRecipeSelectionStatus;

    selectedRegistration:
        ScientificJointContractHarnessRecipeRegistration | null;

    matchingRegistrationIds:
        string[];

    reasons:
        string[];

}
