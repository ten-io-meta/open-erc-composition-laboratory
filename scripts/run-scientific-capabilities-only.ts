import {
    readFile,
    mkdir,
    writeFile
} from "fs/promises";

import {
    ScientificExecutionCapabilityEngine
} from "../laboratory/scientific-execution-capability/ScientificExecutionCapabilityEngine.js";

import type {
    ScientificExperimentExecutionResult
} from "../laboratory/scientific-experiment-execution/ScientificExperimentExecutionResult.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Capability Regeneration");
    console.log("====================================");

    const executionContent =
        await readFile(
            "./scientific-experiment-execution-results/" +
            "OECL-V2-SCIENTIFIC-EXPERIMENT-EXECUTION.json",
            "utf8"
        );

    const execution =
        JSON.parse(
            executionContent
        ) as ScientificExperimentExecutionResult;

    const result =
        new ScientificExecutionCapabilityEngine().build(
            execution.campaignId,
            execution
        );

    await mkdir(
        "./scientific-execution-capability-results",
        {
            recursive: true
        }
    );

    await writeFile(
        "./scientific-execution-capability-results/" +
        "OECL-V2-SCIENTIFIC-EXECUTION-CAPABILITIES.json",
        JSON.stringify(
            result,
            null,
            4
        )
    );

    console.log("");
    console.log(`Campaign: ${result.campaignId}`);
    console.log(`Capabilities: ${result.statistics.total}`);
    console.log(`STATIC_ANALYSIS: ${result.statistics.staticAnalysis}`);
    console.log(`TEST_EXECUTION: ${result.statistics.testExecution}`);
    console.log(
        `INVARIANT_VALIDATION: ${result.statistics.invariantValidation}`
    );
    console.log(
        `SOURCE_REINGESTION: ${result.statistics.sourceReingestion}`
    );
    console.log(`MANUAL_REVIEW: ${result.statistics.manualReview}`);

    console.log("");
    console.log("Capability regeneration finished.");
}

main();