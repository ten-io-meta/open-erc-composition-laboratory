import { mkdir, readFile, writeFile } from "fs/promises";

import { ResearchSourceLoader } from "../laboratory/research-source/ResearchSourceLoader.js";
import { ResearchExtractionEngine } from "../laboratory/extraction/ResearchExtractionEngine.js";
import { ProtocolSemanticEngine } from "../laboratory/protocol-semantics/ProtocolSemanticEngine.js";
import { KnowledgeGraphBuilder } from "../laboratory/knowledge-graph/KnowledgeGraphBuilder.js";
import { DiscoveryEngine } from "../laboratory/discovery/DiscoveryEngine.js";
import { SemanticDiscoveryEngine } from "../laboratory/semantic-discovery/SemanticDiscoveryEngine.js";
import { SemanticReasoningEngine } from "../laboratory/reasoning/SemanticReasoningEngine.js";
import { ComposabilityEvidenceEngine } from "../laboratory/composability-evidence/ComposabilityEvidenceEngine.js";
import { EvidenceSupportEngine } from "../laboratory/evidence-support/EvidenceSupportEngine.js";

async function readJson(path: string): Promise<any> {
    return JSON.parse(await readFile(path, "utf8"));
}

async function main() {
    console.log("");
    console.log("====================================");
    console.log("OECL V2 Research Analysis Pipeline");
    console.log("====================================");

    const sourceId = "DOI-0001";
    const outputDir = `./analysis-results/${sourceId}`;

    const sourceLoader = new ResearchSourceLoader();
    const extractionEngine = new ResearchExtractionEngine();
    const protocolSemanticEngine = new ProtocolSemanticEngine();
    const graphBuilder = new KnowledgeGraphBuilder();
    const discoveryEngine = new DiscoveryEngine();
    const semanticDiscoveryEngine = new SemanticDiscoveryEngine();
    const semanticReasoningEngine = new SemanticReasoningEngine();
    const composabilityEvidenceEngine = new ComposabilityEvidenceEngine();
    const evidenceSupportEngine = new EvidenceSupportEngine();

    const source = await sourceLoader.load(`./sources/doi/${sourceId}.json`);

    const extractionResult = extractionEngine.extract(source);

    if (!extractionResult.success || !extractionResult.extraction) {
        throw new Error("Research extraction failed.");
    }

    const protocolSemanticResult = protocolSemanticEngine.extract(
        extractionResult.extraction
    );

    const graph = graphBuilder.build(
        extractionResult.extraction,
        protocolSemanticResult
    );

    const discoveryResult = discoveryEngine.discover(graph);
    const semanticDiscoveryResult = semanticDiscoveryEngine.discover(graph);

    const semanticReasoningResult = semanticReasoningEngine.reason(
        semanticDiscoveryResult
    );

    const composabilityEvidenceResult = composabilityEvidenceEngine.build(
        protocolSemanticResult,
        semanticReasoningResult
    );

    const benchmark = await readJson("./benchmark-results/benchmark.json");
    const matrix = await readJson("./matrix-results/composition-matrix.json");
    const patterns = await readJson("./pattern-results/patterns.json");

    const supportedComposabilityEvidenceResult = evidenceSupportEngine.build(
        composabilityEvidenceResult.claims,
        benchmark,
        matrix,
        patterns
    );

    await mkdir(outputDir, { recursive: true });

    await writeFile(`${outputDir}/extraction.json`, JSON.stringify(extractionResult, null, 4));
    await writeFile(`${outputDir}/protocol-semantics.json`, JSON.stringify(protocolSemanticResult, null, 4));
    await writeFile(`${outputDir}/graph.json`, JSON.stringify(graph, null, 4));
    await writeFile(`${outputDir}/findings.json`, JSON.stringify(discoveryResult, null, 4));
    await writeFile(`${outputDir}/semantic-model.json`, JSON.stringify(semanticDiscoveryResult, null, 4));
    await writeFile(`${outputDir}/reasoning.json`, JSON.stringify(semanticReasoningResult, null, 4));
    await writeFile(`${outputDir}/composability-evidence.json`, JSON.stringify(composabilityEvidenceResult, null, 4));
    await writeFile(`${outputDir}/supported-composability-evidence.json`, JSON.stringify(supportedComposabilityEvidenceResult, null, 4));

    console.log("");
    console.log("Research Analysis Summary");
    console.log("------------------------------");
    console.log(`Source: ${sourceId}`);
    console.log(`Protocols: ${extractionResult.extraction.protocols.length}`);
    console.log(`Capabilities: ${extractionResult.extraction.capabilities.length}`);
    console.log(`Protocol semantics: ${protocolSemanticResult.semantics.length}`);
    console.log(`Graph nodes: ${graph.nodes.length}`);
    console.log(`Graph edges: ${graph.edges.length}`);
    console.log(`Findings: ${discoveryResult.findings.length}`);
    console.log(`Semantic capabilities: ${semanticDiscoveryResult.model.capabilities.length}`);
    console.log(`Semantic relationships: ${semanticDiscoveryResult.model.relationships.length}`);
    console.log(`Semantic reasoning relations: ${semanticReasoningResult.relations.length}`);
    console.log(`Composability claims: ${composabilityEvidenceResult.claims.length}`);
    console.log(`Supported claims: ${supportedComposabilityEvidenceResult.claims.filter(claim => claim.status === "SUPPORTED").length}`);
    console.log(`Candidate claims: ${supportedComposabilityEvidenceResult.claims.filter(claim => claim.status === "CANDIDATE").length}`);
    console.log(`Inconclusive claims: ${supportedComposabilityEvidenceResult.claims.filter(claim => claim.status === "INCONCLUSIVE").length}`);

    console.log("");
    console.log("Analysis exported:");
    console.log(outputDir);

    console.log("");
    console.log("Research Analysis finished.");
}

main();