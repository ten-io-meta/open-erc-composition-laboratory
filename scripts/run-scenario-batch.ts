import { readFile } from "fs/promises";

import { ScenarioLoader } from "../laboratory/scenario/ScenarioLoader.js";
import { ScenarioRunner } from "../laboratory/scenario/ScenarioRunner.js";
import { ExperimentBuilder } from "../laboratory/scenario/ExperimentBuilder.js";
import {
    ExperimentExecutor,
    type ExperimentExecutionResult
} from "../laboratory/engine/ExperimentExecutor.js";

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

    const results: ExperimentExecutionResult[] = [];

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

        const result = await executor.execute(experiment);
        results.push(result);
    }

    const passed = results.filter(result => result.validationPassed).length;
    const failed = results.length - passed;

    const validationRulesChecked = results.reduce(
        (total, result) => total + result.validationResults.length,
        0
    );

    const compositionPropertiesEvaluated = results.reduce(
        (total, result) => total + result.propertyResults.length,
        0
    );

    const protocolsUsed = new Set(
        results.flatMap(result => result.resolvedProtocols)
    ).size;

    const capabilitiesResolved = results.reduce(
        (total, result) => total + result.requiredCapabilities.length,
        0
    );

    const validationPassedCount = results.reduce(
        (total, result) =>
            total +
            result.validationResults.filter((rule: any) => rule.passed).length,
        0
    );

    const validationFailedCount =
        validationRulesChecked - validationPassedCount;

    console.log("");
    console.log("====================================");
    console.log("Batch Summary");
    console.log("====================================");
    console.log(`Scenarios executed: ${results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Validation rules checked: ${validationRulesChecked}`);
    console.log(`Composition properties evaluated: ${compositionPropertiesEvaluated}`);
    console.log(`Datasets generated: ${results.length}`);
    console.log(`Reports generated: ${results.length}`);
    console.log(`Protocols used: ${protocolsUsed}`);
    console.log(`Capabilities resolved: ${capabilitiesResolved}`);
    console.log(`Validation passed: ${validationPassedCount}`);
    console.log(`Validation failed: ${validationFailedCount}`);

    console.log("");
    console.log("Batch finished.");
}

main();