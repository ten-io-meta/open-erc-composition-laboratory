import { mkdir, readFile, writeFile } from "fs/promises";

import { ResearchKnowledgeEngine } from "../laboratory/knowledge/ResearchKnowledgeEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL Research Knowledge Engine");
    console.log("====================================");

    const benchmark = JSON.parse(
        await readFile(
            "./benchmark-results/benchmark.json",
            "utf8"
        )
    );

    const requirements = JSON.parse(
        await readFile(
            "./requirements-results/protocols.json",
            "utf8"
        )
    );

    const emergent = JSON.parse(
        await readFile(
            "./emergent-results/properties.json",
            "utf8"
        )
    );

    const patterns = JSON.parse(
        await readFile(
            "./pattern-results/patterns.json",
            "utf8"
        )
    );

    const relationships = JSON.parse(
        await readFile(
            "./relationship-results/relationships.json",
            "utf8"
        )
    );

    const matrix = JSON.parse(
        await readFile(
            "./matrix-results/composition-matrix.json",
            "utf8"
        )
    );

    const engine = new ResearchKnowledgeEngine();

    const knowledge = engine.build(
        benchmark,
        requirements,
        emergent,
        patterns,
        relationships,
        matrix
    );

    await mkdir("./knowledge-results", {
        recursive: true
    });

    await writeFile(
        "./knowledge-results/research-knowledge.json",
        JSON.stringify(knowledge, null, 4)
    );

    console.log("");
    console.log("Knowledge exported:");
    console.log("./knowledge-results/research-knowledge.json");

    console.log("");
    console.log("Research Knowledge finished.");

}

main();