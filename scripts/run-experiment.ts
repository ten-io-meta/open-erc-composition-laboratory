import { readFile } from "fs/promises";

import { ExperimentExecutor } from "../laboratory/engine/ExperimentExecutor.js";

async function main() {
    const experimentId = process.argv[2] ?? "CASE-0001";

    console.log("====================================");
    console.log("Open ERC Composition Laboratory");
    console.log("====================================");
    console.log("");
    console.log(`Selected experiment: ${experimentId}`);

    const experiment = JSON.parse(
        await readFile(`./experiments/${experimentId}.json`, "utf8")
    );

    const executor = new ExperimentExecutor();

    await executor.execute(experiment);

    console.log("");
    console.log("Experiment finished.");
}

main();