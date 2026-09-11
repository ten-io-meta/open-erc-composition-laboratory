export interface MachineReasoningInference {

    inferenceId: string;

    sourceId: string;

    subject: string;

    relation: string;

    object: string;

    reason: string;

    confidence: number;

    evidence: string[];

}