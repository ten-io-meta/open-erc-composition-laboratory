import { mkdir, readFile, writeFile } from "fs/promises";

import type { CompositionLearningResult } from "../laboratory/composition-learning/CompositionLearningResult.js";

import { HypothesisEngine } from "../laboratory/hypothesis/HypothesisEngine.js";

async function readJson(path: string): Promise<any> {

    return JSON.parse(
        await readFile(path, "utf8")
    );

}

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Hypothesis Engine");
    console.log("====================================");

    const learning =
        await readJson(
            "./composition-learning-results/DOI-0001-composition-learning.json"
        ) as CompositionLearningResult;

    const engine = new HypothesisEngine();

    const result = engine.generate(learning);

    console.log("");
    console.log("Research Hypotheses");
    console.log("------------------------------");
    console.log(`Hypotheses: ${result.hypotheses.length}`);

    for (const hypothesis of result.hypotheses) {

        console.log("");
        console.log(hypothesis.hypothesisId);
        console.log(hypothesis.statement);
        console.log(`Confidence: ${hypothesis.confidence}%`);
        console.log(`Evidence: ${hypothesis.evidence}`);
        console.log(`Status: ${hypothesis.status}`);

    }

    await mkdir("./hypothesis-results", {
        recursive: true
    });

    await writeFile(
        "./hypothesis-results/DOI-0001-hypotheses.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("Hypotheses exported:");
    console.log("./hypothesis-results/DOI-0001-hypotheses.json");

    console.log("");
    console.log("Hypothesis generation finished.");

}

main();