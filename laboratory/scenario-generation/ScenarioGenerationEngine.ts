import type { GeneratedScenario } from "./GeneratedScenario.js";

export class ScenarioGenerationEngine {
    generate(validationPlans: any[]): GeneratedScenario[] {
        const scenarios: GeneratedScenario[] = [];

        let counter = 1;

        for (const plan of validationPlans) {
            for (const scenarioType of plan.recommendedScenarios ?? []) {
                scenarios.push({
                    id: `AUTO-${String(counter).padStart(5, "0")}`,
                    sourceHypothesis: plan.hypothesisTitle,
                    protocols: [
                        "ERC8001Authority",
                        "ERC8060Reservable",
                        "ERC8312Cursor",
                        "ERC8275Settlement"
                    ],
                    scenarioType,
                    priority: plan.priority,
                    reason: plan.validationStrategy
                });

                counter++;
            }
        }

        return scenarios;
    }
}