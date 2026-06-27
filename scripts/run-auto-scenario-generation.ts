import { mkdir, readFile, writeFile } from "fs/promises";

import { ScenarioGenerationEngine } from "../laboratory/scenario-generation/ScenarioGenerationEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL Automatic Scenario Generator");
    console.log("====================================");

    const validationPlans = JSON.parse(
        await readFile(
            "./hypothesis-validation-results/validation-plans.json",
            "utf8"
        )
    );

    const engine = new ScenarioGenerationEngine();

    const scenarios = engine.generate(validationPlans);

    console.log("");
    console.log("Generated Scenarios");
    console.log("------------------------------");

    for (const scenario of scenarios) {

        console.log("");

        console.log(`Scenario: ${scenario.id}`);

        console.log(
            `Source Hypothesis: ${scenario.sourceHypothesis}`
        );

        console.log(
            `Priority: ${scenario.priority}`
        );

        console.log(
            `Scenario Type: ${scenario.scenarioType}`
        );

        console.log(
            `Protocols: ${scenario.protocols.join(" -> ")}`
        );

        console.log(
            `Reason: ${scenario.reason}`
        );

    }

    await mkdir(
        "./generated-scenarios",
        {
            recursive: true
        }
    );

    await writeFile(
        "./generated-scenarios/generated-scenarios.json",
        JSON.stringify(scenarios, null, 4)
    );

    console.log("");
    console.log("Generated scenarios exported:");
    console.log("./generated-scenarios/generated-scenarios.json");

    console.log("");
    console.log("Automatic Scenario Generation finished.");

}

main();