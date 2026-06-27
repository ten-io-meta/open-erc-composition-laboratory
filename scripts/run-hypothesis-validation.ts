import { mkdir, readFile, writeFile } from "fs/promises";

import { HypothesisValidationEngine } from "../laboratory/hypothesis-validation/HypothesisValidationEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL Hypothesis Validation Engine");
    console.log("====================================");

    const hypotheses = JSON.parse(
        await readFile(
            "./hypothesis-results/composition-hypotheses.json",
            "utf8"
        )
    );

    const engine = new HypothesisValidationEngine();

    const plans = engine.buildPlans(hypotheses);

    console.log("");
    console.log("Validation Plans");
    console.log("------------------------------");

    for (const plan of plans) {

        console.log("");

        console.log(plan.hypothesisTitle);

        console.log(
            `Priority: ${plan.priority}`
        );

        console.log(
            `Strategy: ${plan.validationStrategy}`
        );

        console.log("Recommended Scenarios:");

        for (const scenario of plan.recommendedScenarios) {
            console.log(`- ${scenario}`);
        }

    }

    await mkdir(
        "./hypothesis-validation-results",
        { recursive: true }
    );

    await writeFile(
        "./hypothesis-validation-results/validation-plans.json",
        JSON.stringify(plans, null, 4)
    );

    console.log("");
    console.log("Validation plans exported:");
    console.log("./hypothesis-validation-results/validation-plans.json");

    console.log("");
    console.log("Hypothesis Validation finished.");

}

main();