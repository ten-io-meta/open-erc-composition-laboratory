import { mkdir, readFile, writeFile } from "fs/promises";

import { AdaptiveResearchPlanner } from "../laboratory/adaptive-research/AdaptiveResearchPlanner.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL Adaptive Research Planner");
    console.log("====================================");

    const knowledge = JSON.parse(
        await readFile(
            "./knowledge-results/research-knowledge.json",
            "utf8"
        )
    );

    const planner = new AdaptiveResearchPlanner();

    const plans = planner.plan(knowledge);

    console.log("");
    console.log("Adaptive Research Plans");
    console.log("------------------------------");

    for (const plan of plans) {

        console.log("");
        console.log(`Plan: ${plan.id}`);
        console.log(`Target: ${plan.target}`);
        console.log(`Priority: ${plan.priority}`);
        console.log(`Reason: ${plan.reason}`);
        console.log(
            `Scenario Types: ${plan.recommendedScenarioTypes.join(", ")}`
        );
        console.log(
            `Parameters: authority=${plan.parameters.authority}, reserve=${plan.parameters.reserve}, consume=${plan.parameters.consume}, settle=${plan.parameters.settle}`
        );

    }

    await mkdir(
        "./adaptive-research-results",
        { recursive: true }
    );

    await writeFile(
        "./adaptive-research-results/adaptive-plans.json",
        JSON.stringify(plans, null, 4)
    );

    await mkdir(
        "./scenarios/adaptive",
        { recursive: true }
    );

    for (const plan of plans) {

        for (const scenarioType of plan.recommendedScenarioTypes) {

            const consume =
                scenarioType === "cursor-failure"
                    ? plan.parameters.authority + 10
                    : plan.parameters.consume;

            const settle =
                scenarioType === "settlement-failure"
                    ? plan.parameters.reserve + 10
                    : plan.parameters.settle;

            await writeFile(
                `./scenarios/adaptive/${plan.id}-${scenarioType}.json`,
                JSON.stringify(
                    {
                        id: `${plan.id}-${scenarioType}`,

                        name: `Adaptive ${scenarioType} Scenario`,

                        description: plan.reason,

                        target: plan.target,

                        priority: plan.priority,

                        scenarioType,

                        parameters: {
                            authority: plan.parameters.authority,
                            reserve: plan.parameters.reserve,
                            consume,
                            settle
                        },

                        requiredCapabilities: [
                            "Authority",
                            "Reservation",
                            "Accounting",
                            "Cursor",
                            "Settlement"
                        ]
                    },
                    null,
                    4
                )
            );

        }

    }

    console.log("");
    console.log("Adaptive research plans exported:");
    console.log("./adaptive-research-results/adaptive-plans.json");

    console.log("");
    console.log("Adaptive executable scenarios exported:");
    console.log("./scenarios/adaptive");

    console.log("");
    console.log("Adaptive Research Planning finished.");

}

main();