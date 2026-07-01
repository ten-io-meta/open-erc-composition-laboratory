import { mkdir, readFile, writeFile } from "fs/promises";

import type { KnowledgeResult } from "../laboratory/research-knowledge/KnowledgeResult.js";

import { ResearchMemoryEngine } from "../laboratory/research-memory/ResearchMemoryEngine.js";
import { ResearchMemoryLoader } from "../laboratory/research-memory/ResearchMemoryLoader.js";

async function readJson(path: string): Promise<any> {
    return JSON.parse(
        await readFile(path, "utf8")
    );
}

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Research Memory Engine");
    console.log("====================================");

    const sourceId = "DOI-0001";

    const knowledge = await readJson(
        "./research-knowledge-results/OECL-V2-RESEARCH-KNOWLEDGE.json"
    ) as KnowledgeResult;

    const memoryPath =
        "./research-memory-results/OECL-V2-RESEARCH-MEMORY.json";

    const loader = new ResearchMemoryLoader();
    const previous = await loader.load(memoryPath);

    const engine = new ResearchMemoryEngine();

    const result = engine.update(
        previous,
        knowledge.knowledge,
        sourceId
    );

    await mkdir("./research-memory-results", {
        recursive: true
    });

    await writeFile(
        memoryPath,
        JSON.stringify(result.memory, null, 4)
    );

    await writeFile(
        "./research-memory-results/OECL-V2-RESEARCH-MEMORY-RESULT.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("Research Memory");
    console.log("------------------------------");
    console.log(`Events: ${result.memory.statistics.events}`);
    console.log(`Timelines: ${result.memory.statistics.timelines}`);
    console.log(`Sources: ${result.memory.statistics.sources}`);
    console.log(`Average confidence: ${result.memory.statistics.averageConfidence}%`);
    console.log(`Supported events: ${result.memory.statistics.supportedEvents}`);
    console.log(`Emerging events: ${result.memory.statistics.emergingEvents}`);
    console.log(`Rejected events: ${result.memory.statistics.rejectedEvents}`);

    console.log("");
    console.log("Research memory exported:");
    console.log(memoryPath);

    console.log("");
    console.log("Research Memory finished.");

}

main();