import { mkdir, writeFile } from "fs/promises";

import { ResearchSourceLoader } from "../laboratory/research-source/ResearchSourceLoader.js";
import { ResearchExtractionEngine } from "../laboratory/extraction/ResearchExtractionEngine.js";

async function main() {
    console.log("");
    console.log("====================================");
    console.log("OECL V2 Research Extraction Engine");
    console.log("====================================");

    const loader = new ResearchSourceLoader();
    const engine = new ResearchExtractionEngine();

    const source = await loader.load("./sources/doi/DOI-0001.json");

    const result = engine.extract(source);

    console.log("");
    console.log("Extraction Result");
    console.log("------------------------------");
    console.log(`Source: ${result.sourceId}`);
    console.log(`Success: ${result.success}`);

    if (result.extraction) {
        console.log(`Protocols: ${result.extraction.protocols.length}`);
        console.log(`Capabilities: ${result.extraction.capabilities.length}`);
        console.log(`Claims: ${result.extraction.claims.length}`);
    }

    await mkdir("./extraction-results", { recursive: true });

    await writeFile(
        "./extraction-results/DOI-0001-extraction.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("Extraction exported:");
    console.log("./extraction-results/DOI-0001-extraction.json");

    console.log("");
    console.log("Research Extraction finished.");
}

main();