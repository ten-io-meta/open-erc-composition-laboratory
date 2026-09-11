import { mkdir, writeFile } from "fs/promises";

import { ResearchSourceLoader } from "../laboratory/research-source/ResearchSourceLoader.js";
import { EvidenceEvaluator } from "../laboratory/evidence/EvidenceEvaluator.js";

async function main() {
    console.log("");
    console.log("====================================");
    console.log("OECL V2 Evidence Evaluation Engine");
    console.log("====================================");

    const loader = new ResearchSourceLoader();
    const evaluator = new EvidenceEvaluator();

    const source = await loader.load("./sources/doi/DOI-0001.json");

    const result = evaluator.evaluate(source);

    console.log("");
    console.log("Evidence Evaluation");
    console.log("------------------------------");
    console.log(`Source: ${result.sourceId}`);
    console.log(`Quality: ${result.assessment.quality}`);
    console.log(`Confidence: ${result.assessment.confidence}%`);
    console.log(`Reproducible: ${result.assessment.reproducible}`);
    console.log(`Implementation: ${result.assessment.hasImplementation}`);
    console.log(`Tests: ${result.assessment.hasTests}`);
    console.log(`Invariants: ${result.assessment.hasFormalInvariants}`);
    console.log(`Citation: ${result.assessment.peerReviewed}`);

    await mkdir("./evidence-results", { recursive: true });

    await writeFile(
        "./evidence-results/DOI-0001-evidence.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("Evidence evaluation exported:");
    console.log("./evidence-results/DOI-0001-evidence.json");

    console.log("");
    console.log("Evidence Evaluation finished.");
}

main();