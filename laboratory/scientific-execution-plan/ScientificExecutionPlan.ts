import type {
    ScientificExecutionStep
} from "./ScientificExecutionStep.js";

export interface ScientificExecutionPlan {

    executionPlanId: string;

    executionTaskId: string;

    experimentId: string;

    targetType: string;

    targetId: string;

    sourcePatternRelation?:
    string;

    sourceConclusionId?: string;

    sourceIds: string[];

    targetEvidenceIds: string[];

    supportCondition:
    string | null;

challengeCondition:
    string | null;

    scientificCriteria?: {
    relation: string;

    support: {
        expectedPolarity: "SUPPORT";
        condition: string;
    };

    challenge: {
        expectedPolarity: "CHALLENGE";
        condition: string;
    };

    inconclusive: {
        whenNoScientificPolarity: true;
    };
};

    successCriteria: string[];

failureCriteria: string[];

    origin:
        | "AUTONOMOUS"
        | "RETEST";

    priority:
        | "HIGH"
        | "MEDIUM"
        | "LOW";

    queueScore: number;

    steps:
        ScientificExecutionStep[];

    totalSteps: number;

    readySteps: number;

    blockedSteps: number;

    executionReady: boolean;

    explanation: string;

}