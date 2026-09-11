import type {
    ScientificExecutableTargetIdentity
} from "../scientific-execution-target-resolution/ScientificExecutableTargetIdentity.js";


export type ScientificExecutionObservationStatus =
    | "SUPPORTED"
    | "CHALLENGED"
    | "INCONCLUSIVE";


export interface ScientificExecutionObservation {

    observationId: string;

    outcomeId: string;

    executionPlanId: string;

    executionTaskId: string;

    experimentId: string;

    targetType: string;

    targetId: string;

    sourceConclusionId?: string;

    sourceIds: string[];

    targetEvidenceIds: string[];

    stepId: string;

    stepType: string;

    repository:
        string | null;

    selectedExecutableTarget:
        ScientificExecutableTargetIdentity | null;

    status:
        ScientificExecutionObservationStatus;

    statement: string;

    evidence: string[];

    observations: string[];

    generatedAt: string;

    explanation: string;

}