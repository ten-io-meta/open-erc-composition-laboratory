import { mkdir, readFile, writeFile } from "fs/promises";

import type { EvidenceSupportResult } from "../laboratory/evidence-support/EvidenceSupportResult.js";

import { CompositionLearningEngine } from "../laboratory/composition-learning/CompositionLearningEngine.js";

async function readJson(path: string): Promise<any> {
    return JSON.parse(await readFile(path, "utf8"));
}

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Composition Learning Engine");
    console.log("====================================");

    const support = await readJson(
        "./analysis-results/DOI-0001/supported-composability-evidence.json"
    ) as EvidenceSupportResult;

    const engine = new CompositionLearningEngine();

    const result = engine.learn(support.claims);

    console.log("");
    console.log("Composition Learning");
    console.log("------------------------------");
    console.log(`Observations: ${result.observations.length}`);
    console.log(`Knowledge entries: ${result.knowledge.statistics.length}`);

    for (const stat of result.knowledge.statistics) {
        console.log("");
        console.log(`${stat.relationKey}`);
        console.log(`${stat.protocolPair}`);
        console.log(`Observations: ${stat.observations}`);
        console.log(`Average confidence: ${stat.averageConfidence}%`);
        console.log(`Status: ${stat.status}`);
    }

    await mkdir("./composition-learning-results", { recursive: true });

    await writeFile(
        "./composition-learning-results/DOI-0001-composition-learning.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("Composition learning exported:");
    console.log("./composition-learning-results/DOI-0001-composition-learning.json");

    console.log("");
    console.log("Composition Learning finished.");

}

main();