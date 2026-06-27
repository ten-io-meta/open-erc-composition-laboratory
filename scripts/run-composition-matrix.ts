import { mkdir, readFile, writeFile } from "fs/promises";

import { CompositionMatrixEngine } from "../laboratory/matrix/CompositionMatrixEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL Composition Matrix Engine");
    console.log("====================================");

    const relationships = JSON.parse(
        await readFile(
            "./relationship-results/relationships.json",
            "utf8"
        )
    );

    const requirements = JSON.parse(
        await readFile(
            "./requirements-results/protocols.json",
            "utf8"
        )
    );

    const engine = new CompositionMatrixEngine();

    const matrix = engine.build(
        relationships,
        requirements
    );

    console.log("");
    console.log("Composition Matrix");
    console.log("------------------------------");

    for (const row of matrix) {

        console.log("");

        console.log(
            `${row.protocolA} <-> ${row.protocolB}`
        );

        console.log(
            `Occurrences: ${row.occurrences}`
        );

        console.log(
            `Successful: ${row.successfulCompositions}`
        );

        console.log(
            `Compatibility: ${row.compatibility}%`
        );

        console.log(
            `Eligible: ${row.eligibility ? "YES" : "NO"}`
        );
console.log(
    `Evidence: ${row.evidence}`
);

console.log(
    `Stability Score: ${row.stabilityScore}%`
);

console.log(
    `Safety Score: ${row.safetyScore}%`
);

console.log(
    `Risk: ${row.risk}`
);
    }

    await mkdir(
        "./matrix-results",
        {
            recursive: true
        }
    );

    await writeFile(

        "./matrix-results/composition-matrix.json",

        JSON.stringify(matrix, null, 4)

    );

    console.log("");
    console.log("Composition Matrix exported:");
    console.log("./matrix-results/composition-matrix.json");

    console.log("");
    console.log("Matrix generation finished.");

}

main();