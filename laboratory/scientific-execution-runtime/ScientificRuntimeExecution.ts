import type {
    ScientificExecutableTargetIdentity
} from "../scientific-execution-target-resolution/ScientificExecutableTargetIdentity.js";

import type {
    ScientificCompositionExecutionRequirement
} from "../scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

import type {
    ScientificCompositionWorkspaceMaterialization
} from "../scientific-composition-workspace-materialization/ScientificCompositionWorkspaceMaterialization.js";


export type ScientificRuntimeExecutionStatus =
    | "SUCCESS"
    | "FAILURE"
    | "INCONCLUSIVE"
    | "UNSUPPORTED"
    | "SKIPPED";


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

    /*
     * Joint scientific execution identity.
     *
     * Present for COMPOSITION_EXECUTION runtime records.
     * It is deliberately separate from repository and executable
     * target identity because a composition is not one repository
     * or one selected test.
     */
    compositionExecutionRequirement?:
        ScientificCompositionExecutionRequirement;

    /*
     * Physical bilateral workspace materialization.
     *
     * Presence proves only that OECL attempted the dedicated
     * composition workspace boundary. MATERIALIZED means both
     * participant source revisions were pinned atomically.
     *
     * It does not mean participant contracts were executed.
     */
    compositionWorkspaceMaterialization?:
        ScientificCompositionWorkspaceMaterialization;

    /*
     * Concrete repository associated with this runtime
     * execution when one has been operationally resolved.
     *
     * COMPOSITION_EXECUTION deliberately keeps this null because
     * its physical identity spans multiple participant sources.
     */
    repository:
        string | null;

    /*
     * Exact individual executable target selected upstream when
     * one exists.
     *
     * Null is required for joint composition execution boundaries.
     */
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
