import { mkdir, readFile, writeFile } from "fs/promises";

import type { KnowledgeGraph } from "../laboratory/knowledge-graph/KnowledgeGraph.js";
import { SemanticDiscoveryEngine } from "../laboratory/semantic-discovery/SemanticDiscoveryEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Semantic Discovery Engine");
    console.log("====================================");

    const graph = JSON.parse(
        await readFile(
            "./knowledge-graph-results/GRAPH-DOI-0001.json",
            "utf8"
        )
    ) as KnowledgeGraph;

    const engine = new SemanticDiscoveryEngine();

    const result = engine.discover(graph);

    console.log("");
    console.log("Semantic Model");
    console.log("------------------------------");
    console.log(`Capabilities: ${result.model.capabilities.length}`);
    console.log(`Relationships: ${result.model.relationships.length}`);

    await mkdir("./semantic-discovery-results", { recursive: true });

    await writeFile(
        "./semantic-discovery-results/SEMANTIC-DOI-0001.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("Semantic model exported:");
    console.log("./semantic-discovery-results/SEMANTIC-DOI-0001.json");

    console.log("");
    console.log("Semantic Discovery finished.");

}

main();