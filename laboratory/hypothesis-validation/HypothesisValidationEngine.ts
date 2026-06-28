import type { HypothesisValidationPlan } from "./HypothesisValidationPlan.js";

export class HypothesisValidationEngine {
    buildPlans(hypotheses: any[]): HypothesisValidationPlan[] {
        return hypotheses.map(hypothesis => {
            const hypothesisId = hypothesis.hypothesisId ?? "HYP-UNKNOWN";
            const title = hypothesis.title as string;
            const validationTarget =
                hypothesis.validationTarget ??
                "Generate additional scenarios and compare new evidence against the current hypothesis.";

            switch (hypothesisId) {
                case "HYP-0001":
                    return {
                        hypothesisId,
                        hypothesisTitle: title,
                        validationTarget,
                        validationStrategy:
                            "Generate additional eligible scenarios currently classified as high risk and test whether risk decreases with broader evidence.",
                        recommendedScenarios: [
                            "valid",
                            "boundary",
                            "settlement-failure",
                            "cursor-failure"
                        ],
                        priority: "High"
                    };

                case "HYP-0002":
                    return {
                        hypothesisId,
                        hypothesisTitle: title,
                        validationTarget,
                        validationStrategy:
                            "Use the strongest eligible pair as a baseline and expand it into higher-order compositions.",
                        recommendedScenarios: [
                            "valid",
                            "boundary"
                        ],
                        priority: "Medium"
                    };

                case "HYP-0003":
                    return {
                        hypothesisId,
                        hypothesisTitle: title,
                        validationTarget,
                        validationStrategy:
                            "Generate more scenarios around the most observed protocol to confirm whether it remains central as the dataset grows.",
                        recommendedScenarios: [
                            "valid",
                            "random",
                            "boundary"
                        ],
                        priority: "Medium"
                    };

                default:
                    return {
                        hypothesisId,
                        hypothesisTitle: title,
                        validationTarget,
                        validationStrategy:
                            "Generate additional scenarios and compare new evidence against the current hypothesis.",
                        recommendedScenarios: [
                            "random"
                        ],
                        priority: "Low"
                    };
            }
        });
    }
}
