import {
    readFile,
    writeFile,
    mkdir
} from "fs/promises";

import {
    ScientificExecutionRuntimeEngine
} from "../laboratory/scientific-execution-runtime/ScientificExecutionRuntimeEngine.js";

import type {
    ScientificExecutionPlanResult
} from "../laboratory/scientific-execution-plan/ScientificExecutionPlanResult.js";

import type {
    ScientificExecutionSpecificationResult
} from "../laboratory/scientific-execution-specification/ScientificExecutionSpecificationResult.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Runtime Regeneration");
    console.log("====================================");

    const plansRaw =
        await readFile(
            "./scientific-execution-plan-results/" +
            "OECL-V2-SCIENTIFIC-EXECUTION-PLANS.json",
            "utf8"
        );

    const specificationsRaw =
        await readFile(
            "./scientific-execution-specification-results/" +
            "OECL-V2-SCIENTIFIC-EXECUTION-SPECIFICATIONS.json",
            "utf8"
        );

    const plans =
        JSON.parse(
            plansRaw
        ) as ScientificExecutionPlanResult;

    const specifications =
        JSON.parse(
            specificationsRaw
        ) as ScientificExecutionSpecificationResult;

    const result =
        await new ScientificExecutionRuntimeEngine().build(
            plans.campaignId,
            plans,
            specifications
        );

    await mkdir(
        "./scientific-execution-runtime-results",
        {
            recursive: true
        }
    );

    await writeFile(
        "./scientific-execution-runtime-results/" +
        "OECL-V2-SCIENTIFIC-EXECUTION-RUNTIME.json",
        JSON.stringify(
            result,
            null,
            4
        )
    );

    console.log("");
    console.log(`Campaign: ${result.campaignId}`);
    console.log(`Runtime executions: ${result.statistics.total}`);
    console.log(`SUCCESS: ${result.statistics.success}`);
    console.log(`FAILURE: ${result.statistics.failure}`);
    console.log(`INCONCLUSIVE: ${result.statistics.inconclusive}`);
    console.log(`UNSUPPORTED: ${result.statistics.unsupported}`);
    console.log(`SKIPPED: ${result.statistics.skipped}`);

    console.log("");
    console.log("Runtime regeneration finished.");

}

main();