import type {
    ScientificExecutableTargetIdentity
} from "../scientific-execution-target-resolution/ScientificExecutableTargetIdentity.js";


export type ScientificExecutionEvidenceStatus =
    | "SUPPORTING"
    | "CHALLENGING"
    | "INCONCLUSIVE";


export interface ScientificExecutionEvidence {

    evidenceId: string;

    campaignId: string;

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
        ScientificExecutionEvidenceStatus;

    statement: string;

    sourceEvidence: string[];

    sourceObservations: string[];

    generatedAt: string;

    explanation: string;

}