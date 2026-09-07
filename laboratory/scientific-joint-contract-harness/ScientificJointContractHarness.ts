import type {
    ScientificCompositionWorkspaceSourceMaterialization
} from "../scientific-composition-workspace-materialization/ScientificCompositionWorkspaceMaterialization.js";

import type {
    ScientificCompositionConstraintObservation
} from "../scientific-composition-constraint-evaluation/ScientificCompositionConstraintObservation.js";


export type ScientificJointContractHarnessParticipantSide =
    "A" | "B";


export interface ScientificJointContractHarnessPreparationStep {

    stepId:
        string;

    participantSide:
        ScientificJointContractHarnessParticipantSide;

    command:
        string;

    args:
        string[];

    env?:
        Record<string, string>;

}


export interface ScientificJointContractHarnessDriver {

    participantSide:
        ScientificJointContractHarnessParticipantSide;

    fileName:
        string;

    source:
        string;

    env?:
        Record<string, string>;

}


export interface ScientificJointContractHarnessRecipe {

    recipeId:
        string;

    preparationSteps:
        ScientificJointContractHarnessPreparationStep[];

    driver:
        ScientificJointContractHarnessDriver;

}


export interface ScientificJointContractHarnessDriverParticipantReport {

    executed:
        boolean;

    contractAddresses:
        string[];

    transactionHashes:
        string[];

}


export interface ScientificJointContractHarnessDriverReport {

    executionKind:
        string;

    chainId:
        string | number;

    sharedRuntime:
        boolean;

    participantA:
        ScientificJointContractHarnessDriverParticipantReport;

    participantB:
        ScientificJointContractHarnessDriverParticipantReport;

    observations:
        string[];

    /*
     * Structured runtime evidence attributed to exact composition
     * constraints. Presence alone cannot establish polarity.
     */
    constraintObservations?:
        ScientificCompositionConstraintObservation[];

    scientificPolarity:
        "NEUTRAL";

    conclusion:
        string;

}


export type ScientificJointContractHarnessExecutionStatus =
    | "EXECUTED"
    | "REJECTED";


export interface ScientificJointContractHarnessExecution {

    recipeId:
        string;

    status:
        ScientificJointContractHarnessExecutionStatus;

    workspacePath:
        string | null;

    participantSources:
        ScientificCompositionWorkspaceSourceMaterialization[];

    driverReport:
        ScientificJointContractHarnessDriverReport | null;

    startedAt:
        string | null;

    finishedAt:
        string | null;

    stdout:
        string;

    stderr:
        string;

    errors:
        string[];

    /*
     * Generic joint execution cannot establish composition
     * scientific polarity by itself.
     */
    scientificPolarity:
        "NEUTRAL";

    explanation:
        string;

}
