import type {
    ScientificRevisionAction
} from "../scientific-revision/ScientificRevision.js";

export interface ScientificRetestPlan {

    retestPlanId: string;

    targetId: string;

    targetEvidenceIds: string[];

    targetType:
        | "THEORY"
        | "KNOWLEDGE"
        | "EVIDENCE_HISTORY"
        | "DISCOVERY";

    statement: string;

    triggerAction:
        ScientificRevisionAction;

    priority:
        | "CRITICAL"
        | "HIGH"
        | "MEDIUM"
        | "LOW";

    objective: string;

    hypothesis: string;

    falsificationStrategy: string[];

    requiredEvidence: string[];

    successCriteria: string[];

    failureCriteria: string[];

    sourceRevisionId: string;

    sourceCritiqueIds: string[];

    experimentRequired: boolean;

    explanation: string;

}