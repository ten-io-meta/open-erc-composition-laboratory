import { mkdir, readFile, writeFile } from "fs/promises";

import type { SemanticDiscoveryResult } from "../laboratory/semantic-discovery/SemanticDiscoveryResult.js";
import { SemanticReasoningEngine } from "../laboratory/reasoning/SemanticReasoningEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Semantic Reasoning Engine");
    console.log("====================================");

    const semanticResult = JSON.parse(
        await readFile(
            "./analysis-results/DOI-0001/semantic-model.json",
            "utf8"
        )
    ) as SemanticDiscoveryResult;

    const engine = new SemanticReasoningEngine();

    const result = engine.reason(semanticResult);

    console.log("");
    console.log("Semantic Reasoning Result");
    console.log("------------------------------");
    console.log(`Source: ${result.sourceId}`);
    console.log(`Relations: ${result.relations.length}`);

    for (const relation of result.relations) {
        console.log("");
        console.log(`${relation.fromCapability} -> ${relation.relation} -> ${relation.toCapability}`);
        console.log(`Confidence: ${relation.confidence}%`);
    }

    await mkdir("./reasoning-results", { recursive: true });

    await writeFile(
        "./reasoning-results/DOI-0001-reasoning.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("Semantic reasoning exported:");
    console.log("./reasoning-results/DOI-0001-reasoning.json");

    console.log("");
    console.log("Semantic Reasoning finished.");

}

main();