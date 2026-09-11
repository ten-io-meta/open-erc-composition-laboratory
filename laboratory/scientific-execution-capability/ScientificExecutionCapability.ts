export type ScientificExecutionCapabilityType =
    | "STATIC_ANALYSIS"
    | "TEST_EXECUTION"
    | "INVARIANT_VALIDATION"
    | "SOURCE_REINGESTION"
    | "MANUAL_REVIEW";

export interface ScientificExecutionCapability {

    capabilityId: string;

    executionTaskId: string;

    experimentId: string;

    targetId: string;

targetEvidenceIds: string[];


    capability:
        ScientificExecutionCapabilityType;

    confidence: number;

    reasons: string[];

    recommendedTools: string[];

}