import { ScenarioLoader } from "../laboratory/scenario/ScenarioLoader.js";
import { ScenarioRunner } from "../laboratory/scenario/ScenarioRunner.js";

async function main() {

    const scenarioId = process.argv[2] ?? "STACK-0001";

    const loader = new ScenarioLoader();

    const scenario = await loader.load(
        `./scenarios/${scenarioId}.json`
    );

    const runner = new ScenarioRunner();

    const actions = runner.buildActions(scenario);

    console.log("");
    console.log("====================================");
    console.log("OECL Scenario Engine");
    console.log("====================================");
    console.log("");

    console.log("Scenario:");
    console.log(scenario.name);

    console.log("");
    console.log("Parameters:");
    console.log(scenario.parameters);

    console.log("");
    console.log("Generated actions:");

    for (const action of actions) {
        console.log(
            `${action.protocol}.${action.action}(${action.amount})`
        );
    }

}

main();