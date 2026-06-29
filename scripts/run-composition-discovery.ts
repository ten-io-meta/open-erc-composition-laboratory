import { mkdir, readFile, writeFile } from "fs/promises";

import type { KnowledgeGraph } from "../laboratory/knowledge-graph/KnowledgeGraph.js";
import { CompositionDiscoveryEngine } from "../laboratory/composition-discovery/CompositionDiscoveryEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Composition Discovery Engine");
    console.log("====================================");

    const graph = JSON.parse(
        await readFile(
            "./knowledge-graph-results/GRAPH-DOI-0001.json",
            "utf8"
        )
    ) as KnowledgeGraph;

    const engine = new CompositionDiscoveryEngine();

    const result = engine.discover(graph);

    console.log("");
    console.log("Composition Discovery Result");
    console.log("------------------------------");
    console.log(`Graph: ${result.graphId}`);
    console.log(`Candidates: ${result.candidates.length}`);

    for (const candidate of result.candidates.slice(0, 10)) {
        console.log("");
        console.log(`${candidate.candidateId}`);
        console.log(`${candidate.protocolA} + ${candidate.protocolB}`);
        console.log(`Confidence: ${candidate.confidence}%`);
    }

    await mkdir("./composition-discovery-results", { recursive: true });

    await writeFile(
        "./composition-discovery-results/DOI-0001-composition-candidates.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("Composition candidates exported:");
    console.log("./composition-discovery-results/DOI-0001-composition-candidates.json");

    console.log("");
    console.log("Composition Discovery finished.");

}

main();