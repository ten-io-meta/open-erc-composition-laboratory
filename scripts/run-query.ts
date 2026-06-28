import { readFile } from "fs/promises";

import { CompositionQueryEngine } from "../laboratory/query/CompositionQueryEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL Composition Query Engine");
    console.log("====================================");

    const matrix = JSON.parse(
        await readFile(
            "./matrix-results/composition-matrix.json",
            "utf8"
        )
    );

    const mode = process.argv[2] ?? "eligible";

    const engine = new CompositionQueryEngine();

    let query: any = {};

    switch (mode) {

        case "eligible":

            query = {
                eligibleOnly: true
            };

            break;

        case "stable":

            query = {
                minStabilityScore: 70
            };

            break;

        case "low-risk":

            query = {
                maxRisk: "Low"
            };

            break;

        case "evidence":

            query = {
                minEvidence: 5
            };

            break;

        default:

            query = {};

    }

    const results = engine.query(
        matrix,
        query
    );

    console.log("");
    console.log(`Query mode: ${mode}`);
    console.log("------------------------------");

    for (const row of results) {

        console.log("");

        console.log(
            `${row.protocolA} <-> ${row.protocolB}`
        );

        console.log(
            `Compatibility: ${row.compatibility}%`
        );

        console.log(
            `Evidence: ${row.evidence}`
        );

        console.log(
            `Stability: ${row.stabilityScore}%`
        );

        console.log(
            `Risk: ${row.risk}`
        );

    }

    console.log("");
    console.log(`Results: ${results.length}`);

}

main();
