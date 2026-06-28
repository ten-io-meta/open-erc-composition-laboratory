import { mkdir, writeFile } from "fs/promises";

import { DatasetLoader } from "../laboratory/emergent/DatasetLoader.js";
import { CompositionRelationshipEngine } from "../laboratory/relationships/CompositionRelationshipEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL Composition Relationship Engine");
    console.log("====================================");

    const loader = new DatasetLoader();

    const datasets = await loader.loadAll();

    console.log("");
    console.log(`Datasets analysed: ${datasets.length}`);

    const engine = new CompositionRelationshipEngine();

    const relationships = engine.discover(datasets);

    console.log("");
    console.log("Relationships");
    console.log("------------------------------");

    for (const relationship of relationships) {

        console.log("");

        console.log(
            `${relationship.from} -> ${relationship.to}`
        );

        console.log(
            `Occurrences: ${relationship.occurrences}`
        );

        console.log(
            `Successful compositions: ${relationship.successfulCompositions}`
        );

        console.log(
            `Confidence: ${relationship.confidence}%`
        );

    }

    await mkdir("./relationship-results", {
        recursive: true
    });

    await writeFile(
        "./relationship-results/relationships.json",
        JSON.stringify(relationships, null, 4)
    );

    console.log("");
    console.log("Relationships exported:");
    console.log("./relationship-results/relationships.json");

    console.log("");
    console.log("Relationship analysis finished.");

}

main();
