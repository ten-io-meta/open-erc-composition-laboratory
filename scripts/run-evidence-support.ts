import { mkdir, readFile, writeFile } from "fs/promises";

import type { ComposabilityEvidenceResult } from "../laboratory/composability-evidence/ComposabilityEvidenceResult.js";

import { EvidenceSupportEngine } from "../laboratory/evidence-support/EvidenceSupportEngine.js";

async function readJson(path: string): Promise<any> {
    return JSON.parse(
        await readFile(path, "utf8")
    );
}

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Evidence Support Engine");
    console.log("====================================");

    const composabilityEvidence = await readJson(
        "./composability-evidence-results/DOI-0001-composability-evidence.json"
    ) as ComposabilityEvidenceResult;

    const benchmark = await readJson(
        "./benchmark-results/benchmark.json"
    );

    const matrix = await readJson(
        "./matrix-results/composition-matrix.json"
    );

    const patterns = await readJson(
        "./pattern-results/patterns.json"
    );

    const engine = new EvidenceSupportEngine();

    const result = engine.build(
        composabilityEvidence.claims,
        benchmark,
        matrix,
        patterns
    );

    console.log("");
    console.log("Evidence Support");
    console.log("------------------------------");
    console.log(`Claims: ${result.claims.length}`);

    for (const claim of result.claims) {
        console.log("");
        console.log(`${claim.claimId}`);
        console.log(`${claim.protocolA} -> ${claim.relation} -> ${claim.protocolB}`);
        console.log(`Experimental support: ${claim.experimentalSupport}%`);
        console.log(`Statistical support: ${claim.statisticalSupport}%`);
        console.log(`Emergent pattern support: ${claim.emergentPatternSupport}%`);
        console.log(`Overall confidence: ${claim.overallConfidence}%`);
        console.log(`Status: ${claim.status}`);
    }

    await mkdir("./evidence-support-results", { recursive: true });

    await writeFile(
        "./evidence-support-results/DOI-0001-supported-composability-evidence.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("Evidence support exported:");
    console.log("./evidence-support-results/DOI-0001-supported-composability-evidence.json");

    console.log("");
    console.log("Evidence Support finished.");

}

main();