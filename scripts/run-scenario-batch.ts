import { readFile } from "fs/promises";

import { ScenarioLoader } from "../laboratory/scenario/ScenarioLoader.js";
import { ScenarioRunner } from "../laboratory/scenario/ScenarioRunner.js";
import { ExperimentBuilder } from "../laboratory/scenario/ExperimentBuilder.js";
import { ExperimentExecutor } from "../laboratory/engine/ExperimentExecutor.js";

async function main() {
    const batchId = process.argv[2] ?? "BATCH-0001";

    const batch = JSON.parse(
        await readFile(`./scenario-batches/${batchId}.json`, "utf8")
    );

    console.log("");
    console.log("====================================");
    console.log("OECL Scenario Batch Runner");
    console.log("====================================");
    console.log("");
    console.log("Batch:");
    console.log(batch.name);

    const scenarioLoader = new ScenarioLoader();
    const scenarioRunner = new ScenarioRunner();
    const experimentBuilder = new ExperimentBuilder();
    const executor = new ExperimentExecutor();

    for (const scenarioId of batch.scenarios) {
        console.log("");
        console.log("------------------------------------");
        console.log(`Running scenario: ${scenarioId}`);
        console.log("------------------------------------");

        const scenario = await scenarioLoader.load(
            `./scenarios/${scenarioId}.json`
        );

        const experiment = experimentBuilder.build(scenario);
        const actions = scenarioRunner.buildActions(scenario);

        experiment.actions = actions;
        experiment.metrics = [
            "Safety",
            "Isolation",
            "Determinism",
            "Composability",
            "ScenarioBatch"
        ];
        experiment.benchmark = {
            generated: true,
            batch: batch.id,
            scenario: scenario.id
        };

        await executor.execute(experiment);
    }

    console.log("");
    console.log("Batch finished.");
}

main();