import { mkdir, writeFile } from "fs/promises";

import { ResearchPipeline } from "../laboratory/pipeline/ResearchPipeline.js";

async function main() {
    console.log("");
    console.log("====================================");
    console.log("OECL V2 Pipeline");
    console.log("====================================");

    const pipeline = new ResearchPipeline();

    const result = await pipeline.run("DOI-0001");

    await mkdir("./pipeline-results", { recursive: true });

    await writeFile(
        "./pipeline-results/OECL-V2-PIPELINE.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("OECL V2 Pipeline Summary");
    console.log("------------------------------");
    console.log(`Source: ${result.sourceId}`);
    console.log(`Protocols: ${result.protocols}`);
    console.log(`Capabilities: ${result.capabilities}`);
    console.log(`Claims: ${result.claims}`);
    console.log(`Candidate claims: ${result.candidateClaims}`);
    console.log(`Inconclusive claims: ${result.inconclusiveClaims}`);
    console.log(`Knowledge entries: ${result.knowledgeEntries}`);

    console.log("");
    console.log("Pipeline exported:");
    console.log("./pipeline-results/OECL-V2-PIPELINE.json");

    console.log("");
    console.log("OECL V2 finished.");
}

main();