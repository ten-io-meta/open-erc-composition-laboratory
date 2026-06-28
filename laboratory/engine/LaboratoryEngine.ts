import { Experiment } from "../experiment/Experiment.js";
import { ExperimentResult } from "../experiment/ExperimentResult.js";

export class LaboratoryEngine {

    async execute(experiment: Experiment): Promise<ExperimentResult> {

        console.log("==================================");
        console.log("OECL Laboratory Engine");
        console.log("==================================");

        return experiment.start();

    }

}
