import { mkdir, writeFile } from "fs/promises";

import { ResearchSourceLoader } from "../laboratory/research-source/ResearchSourceLoader.js";
import { ResearchExtractionEngine } from "../laboratory/extraction/ResearchExtractionEngine.js";
import { ProtocolSemanticEngine } from "../laboratory/protocol-semantics/ProtocolSemanticEngine.js";
import { KnowledgeGraphBuilder } from "../laboratory/knowledge-graph/KnowledgeGraphBuilder.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Knowledge Graph Engine");
    console.log("====================================");

    const loader = new ResearchSourceLoader();
    const extractionEngine = new ResearchExtractionEngine();
    const semanticEngine = new ProtocolSemanticEngine();
    const graphBuilder = new KnowledgeGraphBuilder();

    const source = await loader.load("./sources/doi/DOI-0001.json");

    const extractionResult = extractionEngine.extract(source);

    if (!extractionResult.success || !extractionResult.extraction) {
        throw new Error("Extraction failed.");
    }

    const semanticResult = semanticEngine.extract(
        extractionResult.extraction
    );

    const graph = graphBuilder.build(
        extractionResult.extraction,
        semanticResult
    );

    console.log("");
    console.log("Knowledge Graph");
    console.log("------------------------------");
    console.log(`Nodes: ${graph.nodes.length}`);
    console.log(`Edges: ${graph.edges.length}`);

    await mkdir("./knowledge-graph-results", { recursive: true });

    await writeFile(
        "./knowledge-graph-results/GRAPH-DOI-0001.json",
        JSON.stringify(graph, null, 4)
    );

    console.log("");
    console.log("Knowledge graph exported:");
    console.log("./knowledge-graph-results/GRAPH-DOI-0001.json");

    console.log("");
    console.log("Knowledge Graph finished.");

}

main();