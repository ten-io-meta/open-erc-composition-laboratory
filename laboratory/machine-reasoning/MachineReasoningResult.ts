import type { MachineReasoningInference } from "./MachineReasoningInference.js";

export interface MachineReasoningResult {

    generatedAt: string;

    sourceId: string;

    inferences: MachineReasoningInference[];

    errors: string[];

}