import {
    readFile,
    writeFile,
    mkdir
} from "fs/promises";

import {
    ScientificExecutionPlanEngine
} from "../laboratory/scientific-execution-plan/ScientificExecutionPlanEngine.js";

import type {
    ScientificExperimentExecutionResult
} from "../laboratory/scientific-experiment-execution/ScientificExperimentExecutionResult.js";

import type {
    ScientificExecutionCapabilityResult
} from "../laboratory/scientific-execution-capability/ScientificExecutionCapabilityResult.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Plan Regeneration");
    console.log("====================================");

    const executionRaw =
        await readFile(
            "./scientific-experiment-execution-results/" +
            "OECL-V2-SCIENTIFIC-EXPERIMENT-EXECUTION.json",
            "utf8"
        );

    const capabilitiesRaw =
        await readFile(
            "./scientific-execution-capability-results/" +
            "OECL-V2-SCIENTIFIC-EXECUTION-CAPABILITIES.json",
            "utf8"
        );

    const execution =
        JSON.parse(
            executionRaw
        ) as ScientificExperimentExecutionResult;

    const capabilities =
        JSON.parse(
            capabilitiesRaw
        ) as ScientificExecutionCapabilityResult;

    const result =
        new ScientificExecutionPlanEngine().build(
            execution.campaignId,
            execution,
            capabilities
        );

    await mkdir(
        "./scientific-execution-plan-results",
        {
            recursive: true
        }
    );

    await writeFile(
        "./scientific-execution-plan-results/" +
        "OECL-V2-SCIENTIFIC-EXECUTION-PLANS.json",
        JSON.stringify(
            result,
            null,
            4
        )
    );

    console.log("");
    console.log(`Campaign: ${result.campaignId}`);
    console.log(`Plans: ${result.statistics.plans}`);
    console.log(`Total steps: ${result.statistics.totalSteps}`);
    console.log(
        `SOURCE_REINGESTION: ${result.statistics.sourceReingestionSteps}`
    );
    console.log(
        `STATIC_ANALYSIS: ${result.statistics.staticAnalysisSteps}`
    );
    console.log(
        `TEST_EXECUTION: ${result.statistics.testExecutionSteps}`
    );
    console.log(
        `INVARIANT_VALIDATION: ${result.statistics.invariantValidationSteps}`
    );
    console.log(
        `EVIDENCE_COLLECTION: ${result.statistics.evidenceCollectionSteps}`
    );
    console.log(
        `MANUAL_REVIEW: ${result.statistics.manualReviewSteps}`
    );

    console.log("");
    console.log("Plan regeneration finished.");
}

main();