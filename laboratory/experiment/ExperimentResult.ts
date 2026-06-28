import { ExperimentStatus } from "./ExperimentStatus.js";

export interface ExperimentResult {
    experimentId: string;
    status: ExperimentStatus;
    startedAt: string;
    completedAt?: string;
    metrics: Record<string, unknown>;
    logs: string[];
}
