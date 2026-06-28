import type { AdaptiveResearchPlan } from "./AdaptiveResearchPlan.js";

export class AdaptiveResearchPlanner {
    plan(knowledge: any): AdaptiveResearchPlan[] {
        const plans: AdaptiveResearchPlan[] = [];

        const matrix = knowledge.compositionMatrix ?? [];

        let counter = 1;

        const highRiskEligible = matrix.filter(
            (entry: any) =>
                entry.eligibility === true &&
                entry.risk === "High"
        );

        for (const entry of highRiskEligible) {
            plans.push({

    id: `ADAPT-${String(counter).padStart(5,"0")}`,

    protocolA: entry.protocolA,

    protocolB: entry.protocolB,

    target: `${entry.protocolA}+${entry.protocolB}`,

    sourceHypothesis: "HYP-0001",

    validationTarget:
        "Reduce uncertainty around this high-risk eligible composition.",

    supportingEvidence: [

        `Compatibility: ${entry.compatibility}%`,
        `Safety: ${entry.safetyScore}%`,
        `Stability: ${entry.stabilityScore}%`,
        `Risk: ${entry.risk}`

    ],

    reason:
        "Eligible composition has high observed risk and requires additional validation.",

    priority: "High",

    recommendedScenarioTypes: [

        "valid",
        "boundary",
        "settlement-failure",
        "cursor-failure"

    ],

    parameters: {

        authority:40,
        reserve:40,
        consume:40,
        settle:40

    }

});
            counter++;
        }

        const mediumRiskEligible = matrix.filter(
            (entry: any) =>
                entry.eligibility === true &&
                entry.risk === "Medium"
        );

        for (const entry of mediumRiskEligible) {
           plans.push({
    id: `ADAPT-${String(counter).padStart(5, "0")}`,

    protocolA: entry.protocolA,
    protocolB: entry.protocolB,

    target: `${entry.protocolA}+${entry.protocolB}`,

    sourceHypothesis: "HYP-0002",

    validationTarget:
        "Increase confidence around this medium-risk eligible composition.",

    supportingEvidence: [
        `Compatibility: ${entry.compatibility}%`,
        `Safety: ${entry.safetyScore}%`,
        `Stability: ${entry.stabilityScore}%`,
        `Risk: ${entry.risk}`
    ],

    reason:
        "Eligible composition has medium observed risk and should be tested with boundary variation.",

    priority: "Medium",

    recommendedScenarioTypes: [
        "valid",
        "boundary"
    ],

    parameters: {
        authority: 60,
        reserve: 60,
        consume: 40,
        settle: 60
    }
});
            counter++;
        }

        return plans;
    }
}
