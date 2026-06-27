import type { HypothesisValidationPlan } from "./HypothesisValidationPlan.js";

export class HypothesisValidationEngine {
    buildPlans(hypotheses: any[]): HypothesisValidationPlan[] {
        return hypotheses.map(hypothesis => {
            const title = hypothesis.title as string;

            if (title.includes("high risk")) {
                return {
                    hypothesisTitle: title,
                    validationStrategy:
                        "Generate additional eligible scenarios that currently classify as high risk and test whether risk decreases with broader evidence.",
                    recommendedScenarios: [
                        "valid",
                        "boundary",
                        "settlement-failure",
                        "cursor-failure"
                    ],
                    priority: "High"
                };
            }

            if (title.includes("Strongest eligible")) {
                return {
                    hypothesisTitle: title,
                    validationStrategy:
                        "Use the strongest eligible pair as a baseline and expand it into higher-order compositions.",
                    recommendedScenarios: [
                        "valid",
                        "boundary"
                    ],
                    priority: "Medium"
                };
            }

            if (title.includes("Most observed protocol")) {
                return {
                    hypothesisTitle: title,
                    validationStrategy:
                        "Generate more scenarios around the most observed protocol to confirm whether it remains central as the dataset grows.",
                    recommendedScenarios: [
                        "valid",
                        "random",
                        "boundary"
                    ],
                    priority: "Medium"
                };
            }

            return {
                hypothesisTitle: title,
                validationStrategy:
                    "Generate additional scenarios and compare new evidence against the current hypothesis.",
                recommendedScenarios: [
                    "random"
                ],
                priority: "Low"
            };
        });
    }
}