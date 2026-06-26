import { Laboratory } from "../core/Laboratory.js";

export class ExperimentRunner {

    constructor(
        private readonly laboratory: Laboratory
    ) {}

    async run(): Promise<void> {

        console.log("OECL Experiment Runner");

        console.log(
            `Loaded adapters: ${this.laboratory.getAdapters().length}`
        );

    }

}