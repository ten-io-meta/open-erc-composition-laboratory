import { readFile, mkdir, writeFile } from "fs/promises";
import { KnowledgeMergeEngine } from "../laboratory/research-knowledge/KnowledgeMergeEngine.js";
import type { ResearchKnowledge } from "../laboratory/research-knowledge/ResearchKnowledge.js";
import { readFile, mkdir, writeFile } from "fs/promises";

import { ResearchPipeline } from "../laboratory/pipeline/ResearchPipeline.js";
import { SourceManifestLoader } from "../laboratory/source-manifest/SourceManifestLoader.js";

async function main() {
    console.log("");
    console.log("====================================");
    console.log("OECL V2 Pipeline");
    console.log("====================================");

    const manifestLoader = new SourceManifestLoader();

    const manifest = await manifestLoader.load(
        "./sources/manifest.json"
    );

    const sources = manifestLoader.enabledSources(manifest);

    const pipeline = new ResearchPipeline();

    const results = [];

    for (const source of sources) {
        console.log("");
        console.log("------------------------------------");
        console.log(`Running source: ${source.sourceId}`);
        console.log("------------------------------------");

        const result = await pipeline.run(
    source.sourceId,
    source.path,
    source.evidencePath
);

        results.push(result);

        console.log("");
        console.log(`Source: ${result.sourceId}`);
        console.log(`Protocols: ${result.protocols}`);
        console.log(`Capabilities: ${result.capabilities}`);
        console.log(`Claims: ${result.claims}`);
        console.log(`Candidate claims: ${result.candidateClaims}`);
        console.log(`Inconclusive claims: ${result.inconclusiveClaims}`);
        console.log(`Knowledge entries: ${result.knowledgeEntries}`);
        console.log(`Supported knowledge: ${result.supportedKnowledge}`);
        console.log(`Emerging knowledge: ${result.emergingKnowledge}`);
        console.log(`Incremental observations: ${result.incrementalObservations}`);
        console.log(
    `Memory events: ${result.memoryEvents}`
);

console.log(
    `Research memory: ${result.memoryPath}`
);
    }
const partialKnowledgeBases: ResearchKnowledge[] = [];

for (const result of results) {
    if (!result.partialKnowledgePath || result.errors.length > 0) {
        continue;
    }

    const partialKnowledge = JSON.parse(
        await readFile(result.partialKnowledgePath, "utf8")
    ) as ResearchKnowledge;

    partialKnowledgeBases.push(partialKnowledge);
}

const knowledgeMergeEngine = new KnowledgeMergeEngine();

const mergedKnowledgeResult = knowledgeMergeEngine.merge(
    partialKnowledgeBases
);

await mkdir("./research-knowledge-results", { recursive: true });

await writeFile(
    "./research-knowledge-results/OECL-V2-MERGED-KNOWLEDGE.json",
    JSON.stringify(mergedKnowledgeResult, null, 4)
);
    await mkdir("./pipeline-results", { recursive: true });

    await writeFile(
        "./pipeline-results/OECL-V2-PIPELINE.json",
        JSON.stringify(
            {
                manifestId: manifest.manifestId,
                executedSources: results.length,
                generatedAt: new Date().toISOString(),
                results
            },
            null,
            4
        )
    );

    console.log("");
    console.log("OECL V2 Pipeline Summary");
    console.log("------------------------------");
    console.log(`Manifest: ${manifest.manifestId}`);
    console.log(`Executed sources: ${results.length}`);
    console.log(`Merged knowledge entries: ${mergedKnowledgeResult.mergedEntries}`);
console.log(`Merged sources: ${mergedKnowledgeResult.mergedSources.length}`);

    console.log("");
    console.log("Pipeline exported:");
    console.log("./pipeline-results/OECL-V2-PIPELINE.json");

    console.log("");
    console.log("OECL V2 finished.");
}

main();