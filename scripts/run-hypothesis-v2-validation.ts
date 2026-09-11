import { mkdir, readFile, writeFile } from "fs/promises";

import type { HypothesisResult } from "../laboratory/hypothesis/HypothesisResult.js";
import type { EvidenceSupportResult } from "../laboratory/evidence-support/EvidenceSupportResult.js";

import { HypothesisValidationEngine } from "../laboratory/hypothesis/HypothesisValidationEngine.js";

async function readJson(path: string): Promise<any> {
    return JSON.parse(await readFile(path, "utf8"));
}

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Hypothesis Validation Engine");
    console.log("====================================");

    const hypotheses = await readJson(
        "./hypothesis-results/DOI-0001-hypotheses.json"
    ) as HypothesisResult;

    const evidence = await readJson(
        "./analysis-results/DOI-0001/supported-composability-evidence.json"
    ) as EvidenceSupportResult;

    const engine = new HypothesisValidationEngine();

    const result = engine.validate(
        hypotheses,
        evidence
    );

    console.log("");
    console.log("Hypothesis Validation V2");
    console.log("------------------------------");
    console.log(`Validations: ${result.validations.length}`);

    for (const validation of result.validations) {
        console.log("");
        console.log(validation.hypothesisId);
        console.log(validation.relation);
        console.log(`Outcome: ${validation.validationOutcome}`);
        console.log(`Status: ${validation.statusBefore} -> ${validation.statusAfter}`);
        console.log(`Confidence: ${validation.confidenceBefore}% -> ${validation.confidenceAfter}%`);
        console.log(`Evidence matched: ${validation.evidenceMatched}`);
    }

    await mkdir("./hypothesis-validation-results", {
        recursive: true
    });

    await writeFile(
        "./hypothesis-validation-results/DOI-0001-v2-validation.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("Hypothesis validation exported:");
    console.log("./hypothesis-validation-results/DOI-0001-v2-validation.json");

    console.log("");
    console.log("Hypothesis Validation V2 finished.");

}

main();