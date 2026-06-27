import { mkdir, readFile, writeFile } from "fs/promises";

import { CompositionIntelligenceEngine } from "../laboratory/intelligence/CompositionIntelligenceEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL Composition Intelligence Engine");
    console.log("====================================");

    const matrix = JSON.parse(
        await readFile(
            "./matrix-results/composition-matrix.json",
            "utf8"
        )
    );

    const engine = new CompositionIntelligenceEngine();

    const intelligence = engine.analyse(matrix);

    console.log("");
    console.log("Protocol Intelligence");
    console.log("------------------------------");

    for (const protocol of intelligence) {

        console.log("");

        console.log(protocol.protocolId);

        console.log(
            `Observations: ${protocol.observations}`
        );

        console.log(
            `Successful compositions: ${protocol.successfulCompositions}`
        );

        console.log(
            `Average compatibility: ${protocol.averageCompatibility}%`
        );

        console.log(
            `Average stability: ${protocol.averageStability}%`
        );

        console.log(
            `Average safety: ${protocol.averageSafety}%`
        );

        console.log(
            `Average risk: ${protocol.averageRisk}`
        );

        console.log(
            `Eligible relationships: ${protocol.eligibleRelationships}`
        );

    }

    await mkdir(
        "./intelligence-results",
        { recursive: true }
    );

    await writeFile(
        "./intelligence-results/protocol-intelligence.json",
        JSON.stringify(intelligence, null, 4)
    );

    console.log("");
    console.log("Intelligence exported:");
    console.log("./intelligence-results/protocol-intelligence.json");

    console.log("");
    console.log("Composition Intelligence finished.");

}

main();