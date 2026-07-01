import { access, mkdir, readFile, writeFile } from "fs/promises";

import type { KnowledgeResult } from "../laboratory/research-knowledge/KnowledgeResult.js";
import type { ResearchKnowledge } from "../laboratory/research-knowledge/ResearchKnowledge.js";

import { IncrementalKnowledgeEngine } from "../laboratory/incremental-knowledge/IncrementalKnowledgeEngine.js";

async function readJson(path: string): Promise<any> {
    return JSON.parse(await readFile(path, "utf8"));
}

async function exists(path: string): Promise<boolean> {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Incremental Knowledge Engine");
    console.log("====================================");

    const incomingPath =
        "./research-knowledge-results/OECL-V2-RESEARCH-KNOWLEDGE.json";

    const persistentPath =
        "./research-knowledge-results/OECL-V2-KNOWLEDGE-BASE.json";

    const incomingResult = await readJson(
        incomingPath
    ) as KnowledgeResult;

    const previousKnowledge: ResearchKnowledge | null =
        await exists(persistentPath)
            ? await readJson(persistentPath) as ResearchKnowledge
            : null;

    const engine = new IncrementalKnowledgeEngine();

    const result = engine.build(
        previousKnowledge,
        incomingResult.knowledge
    );

    await mkdir("./research-knowledge-results", {
        recursive: true
    });

    await writeFile(
        persistentPath,
        JSON.stringify(result.knowledge, null, 4)
    );

    await writeFile(
        "./research-knowledge-results/OECL-V2-INCREMENTAL-KNOWLEDGE.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("Incremental Knowledge");
    console.log("------------------------------");
    console.log(`Entries: ${result.knowledge.statistics.entries}`);
    console.log(`Observations: ${result.knowledge.statistics.totalObservations}`);
    console.log(`Emerging: ${result.knowledge.statistics.emerging}`);
    console.log(`Supported: ${result.knowledge.statistics.supported}`);
    console.log(`Validated: ${result.knowledge.statistics.validated}`);
    console.log(`Canonical: ${result.knowledge.statistics.canonical}`);
    console.log(`Rejected: ${result.knowledge.statistics.rejected}`);
    console.log(`Merges: ${result.merges.length}`);
    console.log(`Conflicts: ${result.conflicts.length}`);
    console.log(`Evolution events: ${result.evolution.length}`);

    console.log("");
    console.log("Persistent knowledge base exported:");
    console.log(persistentPath);

    console.log("");
    console.log("Incremental knowledge result exported:");
    console.log("./research-knowledge-results/OECL-V2-INCREMENTAL-KNOWLEDGE.json");

    console.log("");
    console.log("Incremental Knowledge finished.");

}

main();