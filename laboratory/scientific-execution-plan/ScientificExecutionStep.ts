export type ScientificExecutionStepType =
    | "SOURCE_REINGESTION"
    | "STATIC_ANALYSIS"
    | "TEST_EXECUTION"
    | "INVARIANT_VALIDATION"
    | "EVIDENCE_COLLECTION"
    | "MANUAL_REVIEW";

export interface ScientificExecutionStep {

    stepId: string;

    order: number;

    stepType:
        ScientificExecutionStepType;

    title: string;

    objective: string;

    tools: string[];

    requiredInputs: string[];

    expectedOutputs: string[];

    status:
        | "PENDING"
        | "READY"
        | "BLOCKED"
        | "COMPLETED"
        | "FAILED";

}