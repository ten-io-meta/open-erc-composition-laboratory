export type ScientificExecutionReferentialIntegrityStatus =
    | "VALID"
    | "BROKEN_TASK_QUEUE_REFERENCE"
    | "TASK_QUEUE_EXPERIMENT_MISMATCH"
    | "BROKEN_PLAN_TASK_REFERENCE"
    | "BROKEN_SPECIFICATION_PLAN_REFERENCE"
    | "BROKEN_SPECIFICATION_STEP_REFERENCE"
    | "BROKEN_SPECIFICATION_TASK_REFERENCE"
    | "SPECIFICATION_LINEAGE_MISMATCH"
    | "BROKEN_RUNTIME_PLAN_REFERENCE"
    | "BROKEN_RUNTIME_TASK_REFERENCE"
    | "BROKEN_RUNTIME_STEP_REFERENCE"
    | "RUNTIME_LINEAGE_MISMATCH"
    | "BROKEN_OUTCOME_PLAN_REFERENCE"
    | "BROKEN_OUTCOME_TASK_REFERENCE"
    | "BROKEN_OUTCOME_STEP_REFERENCE"
    | "OUTCOME_LINEAGE_MISMATCH"
    | "BROKEN_OBSERVATION_OUTCOME_REFERENCE"
    | "BROKEN_EVIDENCE_OBSERVATION_REFERENCE"
    | "BROKEN_EVIDENCE_OUTCOME_REFERENCE"
    | "SCIENTIFIC_PROVENANCE_MISMATCH"
    | "EXECUTABLE_TARGET_PROVENANCE_MISMATCH";

export interface ScientificExecutionReferentialIntegrityIssue {

    status:
        ScientificExecutionReferentialIntegrityStatus;

    entityType:
        | "TASK"
        | "PLAN"
        | "SPECIFICATION"
        | "RUNTIME"
        | "OUTCOME"
        | "OBSERVATION"
        | "EVIDENCE";

    entityId: string;

    referenceType: string;

    referenceId:
        string | null;

    explanation: string;
}


