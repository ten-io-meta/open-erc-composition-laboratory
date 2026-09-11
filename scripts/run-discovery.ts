import { mkdir, readFile, writeFile } from "fs/promises";

import type { KnowledgeGraph } from "../laboratory/knowledge-graph/KnowledgeGraph.js";
import { DiscoveryEngine } from "../laboratory/discovery/DiscoveryEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Discovery Engine");
    console.log("====================================");

    const graph = JSON.parse(
        await readFile(
            "./knowledge-graph-results/GRAPH-DOI-0001.json",
            "utf8"
        )
    ) as KnowledgeGraph;

    const engine = new DiscoveryEngine();

    const result = engine.discover(graph);

    console.log("");
    console.log("Discovery Result");
    console.log("------------------------------");
    console.log(`Graph: ${result.graphId}`);
    console.log(`Findings: ${result.findings.length}`);

    for (const finding of result.findings) {
        console.log("");
        console.log(`${finding.findingId}`);
        console.log(`${finding.title}`);
        console.log(`Type: ${finding.type}`);
        console.log(`Confidence: ${finding.confidence}%`);
        console.log(`Evidence: ${finding.evidence.length}`);
    }

    await mkdir("./discovery-results", { recursive: true });

    await writeFile(
        "./discovery-results/DOI-0001-findings.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("Discovery findings exported:");
    console.log("./discovery-results/DOI-0001-findings.json");

    console.log("");
    console.log("Discovery finished.");

}

main();