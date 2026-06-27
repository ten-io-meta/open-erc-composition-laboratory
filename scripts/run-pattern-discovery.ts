import { mkdir, writeFile } from "fs/promises";

import { DatasetLoader } from "../laboratory/emergent/DatasetLoader.js";
import { PatternDiscoveryEngine } from "../laboratory/patterns/PatternDiscoveryEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL Pattern Discovery Engine");
    console.log("====================================");

    const loader = new DatasetLoader();

    const datasets = await loader.loadAll();

    console.log("");
    console.log(`Datasets analysed: ${datasets.length}`);

    const engine = new PatternDiscoveryEngine();

    const patterns = engine.discover(datasets);

    console.log("");
    console.log("Patterns");
    console.log("------------------------------");

    for (const pattern of patterns) {

        console.log("");

        console.log(pattern.name);

        console.log(
            `Confidence: ${pattern.confidence}%`
        );

        console.log(
            `Evidence: ${pattern.evidence}`
        );

        console.log(pattern.description);

    }

    await mkdir("./pattern-results", { recursive: true });

    await writeFile(
        "./pattern-results/patterns.json",
        JSON.stringify(patterns, null, 4)
    );

    console.log("");
    console.log("Patterns exported:");
    console.log("./pattern-results/patterns.json");

    console.log("");
    console.log("Pattern discovery finished.");

}

main();