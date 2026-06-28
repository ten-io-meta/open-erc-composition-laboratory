import { mkdir, writeFile } from "fs/promises";

import { DatasetLoader } from "../laboratory/emergent/DatasetLoader.js";
import { EmergentPropertyEngine } from "../laboratory/emergent/EmergentPropertyEngine.js";

import { ReservationIntegrityProperty } from "../laboratory/emergent/ReservationIntegrityProperty.js";
import { CursorAuthorityCorrelationProperty } from "../laboratory/emergent/CursorAuthorityCorrelationProperty.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL Emergent Properties Engine");
    console.log("====================================");

    const loader = new DatasetLoader();

    const datasets = await loader.loadAll();

    console.log("");
    console.log(`Datasets analysed: ${datasets.length}`);

    const engine = new EmergentPropertyEngine();

    engine.register(
        new ReservationIntegrityProperty()
    );

    engine.register(
        new CursorAuthorityCorrelationProperty()
    );

    const properties = engine.evaluate(datasets);

    console.log("");
    console.log("Emergent Properties");
    console.log("------------------------------");

    for (const property of properties) {

        console.log("");

        console.log(property.property);

        console.log(
            `Confidence: ${property.confidence}%`
        );

        console.log(
            `Evidence: ${property.evidence}`
        );

        console.log(property.description);

    }

    await mkdir("./emergent-results", {
        recursive: true
    });

    await writeFile(
        "./emergent-results/properties.json",
        JSON.stringify(properties, null, 4)
    );

    console.log("");
    console.log("Emergent properties exported:");
    console.log("./emergent-results/properties.json");

    console.log("");
    console.log("Emergent analysis finished.");

}

main();
