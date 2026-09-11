export type ScientificRevisionAction =
    | "KEEP"
    | "REVIEW"
    | "WEAKEN"
    | "CHALLENGE"
    | "RETEST"
    | "REFUTE_CANDIDATE";

export interface ScientificRevision {

    revisionId: string;

    targetId: string;

    targetEvidenceIds: string[];

    targetType:
        | "THEORY"
        | "KNOWLEDGE"
        | "EVIDENCE_HISTORY"
        | "DISCOVERY";

    statement: string;

    action:
        ScientificRevisionAction;

    priority:
        | "CRITICAL"
        | "HIGH"
        | "MEDIUM"
        | "LOW";

    critiqueCount: number;

    averageRobustnessScore: number;

    highestFalsificationRisk:
        | "VERY_HIGH"
        | "HIGH"
        | "MODERATE"
        | "LOW";

    reasons: string[];

    sourceCritiqueIds: string[];

    requiresExperiment: boolean;

    requiresHumanReview: boolean;

    explanation: string;

}