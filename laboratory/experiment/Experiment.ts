import type { ExperimentConfiguration } from "./ExperimentConfiguration.js";
import type { ExperimentResult } from "./ExperimentResult.js";
import { ExperimentStatus } from "./ExperimentStatus.js";

export class Experiment {
    constructor(
        public readonly configuration: ExperimentConfiguration
    ) {}

    start(): ExperimentResult {
        return {
            experimentId: this.configuration.id,
            status: ExperimentStatus.Running,
            startedAt: new Date().toISOString(),
            metrics: {},
            logs: [
                `Experiment ${this.configuration.id} started`
            ]
        };
    }
}