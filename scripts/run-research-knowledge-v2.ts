import { mkdir, readFile, writeFile } from "fs/promises";

import type { CompositionLearningResult } from "../laboratory/composition-learning/CompositionLearningResult.js";
import type { HypothesisValidationResult } from "../laboratory/hypothesis/HypothesisValidationResult.js";

import { KnowledgeEngine } from "../laboratory/research-knowledge/KnowledgeEngine.js";

async function readJson(path: string): Promise<any> {
    return JSON.parse(await readFile(path, "utf8"));
}

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Research Knowledge Base");
    console.log("====================================");

    const learning = await readJson(
        "./composition-learning-results/DOI-0001-composition-learning.json"
    ) as CompositionLearningResult;

    const validation = await readJson(
        "./hypothesis-validation-results/DOI-0001-v2-validation.json"
    ) as HypothesisValidationResult;

    const engine = new KnowledgeEngine();

    const result = engine.build(
        learning,
        validation
    );

    await mkdir("./research-knowledge-results", {
        recursive: true
    });

    await writeFile(
        "./research-knowledge-results/OECL-V2-RESEARCH-KNOWLEDGE.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("Research Knowledge Base");
    console.log("------------------------------");
    console.log(`Entries: ${result.knowledge.statistics.entries}`);
    console.log(`Observations: ${result.knowledge.statistics.totalObservations}`);
    console.log(`Emerging: ${result.knowledge.statistics.emerging}`);
    console.log(`Supported: ${result.knowledge.statistics.supported}`);
    console.log(`Validated: ${result.knowledge.statistics.validated}`);
    console.log(`Canonical: ${result.knowledge.statistics.canonical}`);
    console.log(`Rejected: ${result.knowledge.statistics.rejected}`);

    console.log("");
    console.log("Research knowledge exported:");
    console.log("./research-knowledge-results/OECL-V2-RESEARCH-KNOWLEDGE.json");

    console.log("");
    console.log("Research Knowledge finished.");

}

main();