import { mkdir, writeFile } from "fs/promises";

import { ScenarioGenerator } from "../laboratory/scenario/ScenarioGenerator.js";
import type { ScenarioStrategy } from "../laboratory/scenario/strategies/ScenarioStrategy.js";

async function main() {
    const count = Number(process.argv[2] ?? 10);
    const strategy = (process.argv[3] ?? "random") as ScenarioStrategy;

    const generator = new ScenarioGenerator();
    const scenarios = generator.generate(count, strategy);

    await mkdir(`./scenarios/generated/${strategy}`, { recursive: true });

    for (const scenario of scenarios) {
        await writeFile(
            `./scenarios/generated/${strategy}/${scenario.id}.json`,
            JSON.stringify(
                {
                    id: scenario.id,
                    name: scenario.name,
                    parameters: scenario.parameters
                },
                null,
                2
            ),
            "utf8"
        );
    }

    console.log(`Generated ${scenarios.length} scenarios.`);
    console.log(`Strategy: ${strategy}`);
    console.log(`./scenarios/generated/${strategy}`);
}

main()
