import { mkdir, readFile, writeFile } from "fs/promises";

import type { ProtocolSemanticResult } from "../laboratory/protocol-semantics/ProtocolSemanticResult.js";
import type { SemanticReasoningResult } from "../laboratory/reasoning/SemanticReasoningResult.js";

import { ComposabilityEvidenceEngine } from "../laboratory/composability-evidence/ComposabilityEvidenceEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Composability Evidence Engine");
    console.log("====================================");

    const semantics = JSON.parse(
        await readFile(
            "./analysis-results/DOI-0001/protocol-semantics.json",
            "utf8"
        )
    ) as ProtocolSemanticResult;

    const reasoning = JSON.parse(
        await readFile(
            "./analysis-results/DOI-0001/reasoning.json",
            "utf8"
        )
    ) as SemanticReasoningResult;

    const engine = new ComposabilityEvidenceEngine();

    const result = engine.build(
        semantics,
        reasoning
    );

    console.log("");
    console.log("Composability Evidence");
    console.log("------------------------------");
    console.log(`Source: ${result.sourceId}`);
    console.log(`Claims: ${result.claims.length}`);

    for (const claim of result.claims) {

        console.log("");
        console.log(`${claim.claimId}`);
        console.log(`${claim.protocolA} -> ${claim.relation} -> ${claim.protocolB}`);
        console.log(`${claim.capabilityA} -> ${claim.capabilityB}`);
        console.log(`Status: ${claim.status}`);
        console.log(`Overall confidence: ${claim.overallConfidence}%`);

    }

    await mkdir("./composability-evidence-results", { recursive: true });

    await writeFile(
        "./composability-evidence-results/DOI-0001-composability-evidence.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("Composability evidence exported:");
    console.log("./composability-evidence-results/DOI-0001-composability-evidence.json");

    console.log("");
    console.log("Composability Evidence finished.");

}

main();