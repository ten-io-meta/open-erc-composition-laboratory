import type {
    ScientificExecutableTargetIdentity
} from "../scientific-execution-target-resolution/ScientificExecutableTargetIdentity.js";

import type {
    ScientificCompositionExecutionRequirement
} from "../scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

import type {
    ScientificCompositionWorkspaceMaterialization
} from "../scientific-composition-workspace-materialization/ScientificCompositionWorkspaceMaterialization.js";

import type {
    ScientificJointContractHarnessExecution
} from "../scientific-joint-contract-harness/ScientificJointContractHarness.js";


export type ScientificRuntimeExecutionStatus =
    | "SUCCESS"
    | "FAILURE"
    | "INCONCLUSIVE"
    | "UNSUPPORTED"
    | "SKIPPED";


export interface ScientificCompositionRecipeSelectionSnapshot {

    status:
        "SELECTED" | "NO_MATCH" | "AMBIGUOUS";

    selectedRegistrationId:
        string | null;

    matchingRegistrationIds:
        string[];

    reasons:
        string[];

}


export interface ScientificRuntimeExecution {

    runtimeExecutionId: string;

    executionPlanId: string;

    executionTaskId: string;

    experimentId: string;

    targetId: string;

    sourceConclusionId?: string;

    sourceIds: string[];

    targetEvidenceIds: string[];

    stepId: string;

    stepType: string;

    status:
        ScientificRuntimeExecutionStatus;

    runtime:
        string;

    compositionExecutionRequirement?:
        ScientificCompositionExecutionRequirement;

    compositionWorkspaceMaterialization?:
        ScientificCompositionWorkspaceMaterialization;

    /*
     * Serializable post-discovery operational selection.
     *
     * No buildRecipe function is preserved here.
     */
    compositionRecipeSelection?:
        ScientificCompositionRecipeSelectionSnapshot;

    /*
     * Structured bilateral contract execution evidence.
     *
     * Presence proves that a selected recipe entered the generic
     * joint executor. It does not establish composition polarity.
     */
    jointContractHarnessExecution?:
        ScientificJointContractHarnessExecution;

    repository:
        string | null;

    selectedExecutableTarget:
        ScientificExecutableTargetIdentity | null;

    startedAt:
        string | null;

    finishedAt:
        string | null;

    evidence: string[];

    observations: string[];

    errors: string[];

    explanation: string;

}
