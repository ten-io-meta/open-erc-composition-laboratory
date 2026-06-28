import { mkdir, readFile, writeFile } from "fs/promises";

import { CompositionHypothesisEngine } from "../laboratory/hypotheses/CompositionHypothesisEngine.js";

async function main() {
    console.log("");
    console.log("====================================");
    console.log("OECL Composition Hypothesis Engine");
    console.log("====================================");

    const matrix = JSON.parse(
        await readFile(
            "./matrix-results/composition-matrix.json",
            "utf8"
        )
    );

    const intelligence = JSON.parse(
        await readFile(
            "./intelligence-results/protocol-intelligence.json",
            "utf8"
        )
    );

    const knowledge = {
        compositionMatrix: matrix,
        protocolIntelligence: intelligence
    };

    const engine = new CompositionHypothesisEngine();

    const hypotheses = engine.generate(knowledge);

    console.log("");
    console.log("Composition Hypotheses");
    console.log("------------------------------");

    for (const hypothesis of hypotheses) {
        console.log("");
        console.log(`${hypothesis.hypothesisId}: ${hypothesis.title}`);
        console.log(`Confidence: ${hypothesis.confidence}%`);
        console.log(`Evidence: ${hypothesis.evidence}`);
        console.log(`Falsifiable: ${hypothesis.falsifiable}`);
        console.log(`Validation target: ${hypothesis.validationTarget}`);
        console.log(hypothesis.description);
        console.log(`Recommendation: ${hypothesis.recommendation}`);

        console.log("Supporting evidence:");
        for (const evidence of hypothesis.supportingEvidence ?? []) {
            console.log(`- ${evidence}`);
        }
    }

    await mkdir("./hypothesis-results", {
        recursive: true
    });

    await writeFile(
        "./hypothesis-results/composition-hypotheses.json",
        JSON.stringify(hypotheses, null, 4)
    );

    console.log("");
    console.log("Hypotheses exported:");
    console.log("./hypothesis-results/composition-hypotheses.json");

    console.log("");
    console.log("Composition Hypothesis finished.");
}

main();
