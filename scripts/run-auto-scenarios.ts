import { readdir } from "fs/promises";

import { ScenarioLoader } from "../laboratory/scenario/ScenarioLoader.js";
import { ScenarioRunner } from "../laboratory/scenario/ScenarioRunner.js";
import { ExperimentBuilder } from "../laboratory/scenario/ExperimentBuilder.js";
import {
    ExperimentExecutor,
    type ExperimentExecutionResult
} from "../laboratory/engine/ExperimentExecutor.js";

async function main() {
    console.log("");
    console.log("====================================");
    console.log("OECL Auto Scenario Runner");
    console.log("====================================");

    const files = await readdir("./scenarios/auto");

    const scenarioFiles = files
        .filter(file => file.endsWith(".json"))
        .sort();

    const scenarioLoader = new ScenarioLoader();
    const scenarioRunner = new ScenarioRunner();
    const experimentBuilder = new ExperimentBuilder();
    const executor = new ExperimentExecutor();

    const results: ExperimentExecutionResult[] = [];

    for (const file of scenarioFiles) {
        console.log("");
        console.log("------------------------------------");
        console.log(`Running auto scenario: ${file}`);
        console.log("------------------------------------");

        const scenario = await scenarioLoader.load(
            `./scenarios/auto/${file}`
        );

        const experiment = experimentBuilder.build(scenario);
        const actions = scenarioRunner.buildActions(scenario);

        experiment.actions = actions;
        experiment.metrics = [
            "Safety",
            "Isolation",
            "Determinism",
            "Composability",
            "AutoScenario"
        ];

        experiment.benchmark = {
            generated: true,
            source: "auto-scenario-runner",
            scenario: scenario.id,
            priority: scenario.priority,
            scenarioType: scenario.scenarioType
        };

        const result = await executor.execute(experiment);
        results.push(result);
    }

    const passed = results.filter(result => result.validationPassed).length;
    const failed = results.length - passed;

    console.log("");
    console.log("====================================");
    console.log("Auto Scenario Summary");
    console.log("====================================");
    console.log(`Scenarios executed: ${results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    console.log("");
    console.log("Auto scenario run finished.");
}

main();
