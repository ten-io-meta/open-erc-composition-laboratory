import { ScenarioLoader } from "../laboratory/scenario/ScenarioLoader.js";
import { ScenarioRunner } from "../laboratory/scenario/ScenarioRunner.js";
import { ExperimentBuilder } from "../laboratory/scenario/ExperimentBuilder.js";
import { ExperimentExecutor } from "../laboratory/engine/ExperimentExecutor.js";

async function main() {

    const scenarioId = process.argv[2] ?? "STACK-0001";

    const loader = new ScenarioLoader();

    const scenario = await loader.load(
        `./scenarios/${scenarioId}.json`
    );

    const runner = new ScenarioRunner();
    const experimentBuilder = new ExperimentBuilder();
const experiment = experimentBuilder.build(scenario);

    const actions = runner.buildActions(scenario);
    experiment.actions = actions;

experiment.metrics = [
    "Safety",
    "Isolation",
    "Determinism",
    "Composability",
    "ScenarioGeneration"
];

experiment.benchmark = {
    generated: true,
    scenario: scenario.id
};

    console.log("");
    console.log("====================================");
    console.log("OECL Scenario Engine");
    console.log("====================================");
    console.log("");

    console.log("Scenario:");
    console.log(scenario.name);

    console.log("");
    console.log("Parameters:");
    console.log("");
console.log("Generated experiment:");
console.log(experiment);
    console.log(scenario.parameters);

    console.log("");
    console.log("Generated actions:");

    for (const action of actions) {
        console.log(
            `${action.protocol}.${action.action}(${action.amount})`
        );
    }
console.log("");

const executor = new ExperimentExecutor();

await executor.execute(experiment);
}

main();