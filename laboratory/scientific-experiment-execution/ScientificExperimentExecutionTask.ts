import type {
    ScientificCompositionExecutionRequirement
} from "../scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";
import type {
    ScientificExperimentOrigin
} from "../scientific-experiment-queue/ScientificExperimentQueueItem.js";

export interface ScientificExperimentExecutionTask {

    executionTaskId: string;

    queueItemId: string;

    experimentId: string;

    origin:
        ScientificExperimentOrigin;

    targetType: string;

    targetId: string;

    sourcePatternRelation?:
    string;

    sourceConclusionId?: string;

    sourceIds: string[];

    targetEvidenceIds: string[];

    compositionExecutionRequirement?:
        ScientificCompositionExecutionRequirement;

    title: string;

    objective: string;

    hypothesis: string;

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

    priority:
        | "HIGH"
        | "MEDIUM"
        | "LOW";

    queueScore: number;

    recommendedRepositories: string[];

    procedure: string[];

    requiredEvidence: string[];

    successCriteria: string[];

    failureCriteria: string[];

    executionStatus:
        | "PENDING"
        | "READY"
        | "BLOCKED"
        | "COMPLETED"
        | "FAILED";

    blockReasons: string[];

    explanation: string;

}