export type ScientificEvidenceFeedbackAction =
    | "STRENGTHEN"
    | "CHALLENGE"
    | "HOLD";

export interface ScientificEvidenceFeedback {

    feedbackId: string;

    campaignId: string;

    evidenceId: string;

    observationId: string;

    outcomeId: string;

    experimentId: string;

    targetType: string;

    targetId: string;

    sourceConclusionId?: string;

    sourceIds: string[];

    targetEvidenceIds: string[];

    executionPlanId: string;

    executionTaskId: string;

    stepId: string;

      stepType: string;

    /*
     * Concrete repository associated with the runtime
     * execution from which this feedback was derived,
     * when one repository was operationally resolved.
     *
     * This is execution provenance only. Repository
     * identity must not by itself be interpreted as
     * scientific source independence.
     */
    repository:
        string | null;

    action:
        ScientificEvidenceFeedbackAction;

    statement: string;

    sourceEvidence: string[];

    sourceObservations: string[];

    generatedAt: string;

    explanation: string;

}