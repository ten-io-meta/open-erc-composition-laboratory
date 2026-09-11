import {
    readFile
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

    const ids =
        new Set([
            "AUTO-EXPERIMENT-00004",
            "AUTO-EXPERIMENT-00016",
            "AUTO-EXPERIMENT-00022"
        ]);

    const filteredPlans:
        ScientificExecutionPlanResult = {
            ...plans,

            plans:
                plans.plans.filter(
                    plan =>
                        ids.has(
                            plan.experimentId
                        )
                ),

            statistics:
                plans.statistics
        };

    const runtime =
        await new ScientificExecutionRuntimeEngine().build(
            plans.campaignId,
            filteredPlans,
            specifications
        );

    console.log("");
    console.log("====================================");
    console.log("SOURCE EVIDENCE CHECK");
    console.log("====================================");
    console.log("");

    for (
        const execution
        of runtime.executions
    ) {

        console.log(
            `${execution.experimentId} | ` +
            `${execution.stepType} | ` +
            `${execution.status}`
        );

    }

    console.log("");
}

main();