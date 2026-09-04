import type {
    ScientificExecutionOutcomeScientificResult
} from "../scientific-execution-outcome/ScientificExecutionOutcome.js";

export interface ScientificExecutionResultEvaluation {

    evaluationId: string;

    outcomeId: string;

    executionPlanId: string;

    executionTaskId: string;

    experimentId: string;

    targetType: string;

    targetId: string;

    scientificResult:
        ScientificExecutionOutcomeScientificResult;

    matchedSuccessCriteria: string[];

    matchedFailureCriteria: string[];

    explanation: string;

    generatedAt: string;

}