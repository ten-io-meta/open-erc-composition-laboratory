import type {
    ScientificExecutableTargetIdentity
} from "../scientific-execution-target-resolution/ScientificExecutableTargetIdentity.js";

import type {
    ScientificCompositionExecutionRequirement
} from "../scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";


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
     * Concrete repository associated with this runtime
     * execution when one has been operationally resolved.
     *
     * This identifies execution provenance. It must not be
     * interpreted by itself as an independent scientific
     * source or as evidence of increased confidence.
     */
    repository:
        string | null;

    /*
     * Exact executable target selected upstream and used
     * for this runtime execution when one exists.
     *
     * Null is valid for non-target runtime operations such
     * as source reingestion, evidence collection and joint
     * composition admission.
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
