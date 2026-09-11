import { ResearchPlannerEngine } from "../laboratory/research-planner/ResearchPlannerEngine.js";

import type { CrossSourcePatternResult } from "../laboratory/cross-source-patterns/CrossSourcePatternResult.js";

const patterns = {
    generatedAt: "2026-09-04T00:00:00.000Z",
    patterns: [],
    statistics: {
        patterns: 0,
        supported: 0,
        emerging: 0,
        weak: 0
    },
    errors: []
} as unknown as CrossSourcePatternResult;

const previousStrategy = {
    generatedAt: "2026-09-03T00:00:00.000Z",
    strategies: [
        {
            strategyId: "STRATEGY-00001",
            objective: "Investigate reservation semantics",
            recommendedAction:
                "Ingest the highest-value repository candidate and rerun OECL V2.",
            targetRepositories: [
                "Vectorized/solady"
            ],
            expectedKnowledgeGain: 90,
            priority: "HIGH",
            rationale:
                "Previous campaign identified a high-value research direction."
        }
    ],
    statistics: {
        strategies: 1,
        high: 1,
        medium: 0,
        low: 0
    },
    errors: []
};

const planner = new ResearchPlannerEngine();

const baseline = planner.build(
    patterns,
    []
);

if (baseline.tasks.length !== 0) {
    throw new Error(
        "Expected empty baseline plan with no current patterns."
    );
}

const feedbackPlan = planner.build(
    patterns,
    [],
    previousStrategy
);

if (feedbackPlan.tasks.length !== 1) {
    throw new Error(
        `Expected 1 strategy-feedback task, got ${feedbackPlan.tasks.length}.`
    );
}

const task = feedbackPlan.tasks[0];

if (task.priority !== "HIGH") {
    throw new Error(
        `Expected HIGH priority, got ${task.priority}.`
    );
}

if (
    task.recommendedRepositories.length !== 1 ||
    task.recommendedRepositories[0] !== "Vectorized/solady"
) {
    throw new Error(
        "Previous strategy target repository was not propagated."
    );
}

if (
    !task.reason.includes("Investigate reservation semantics")
) {
    throw new Error(
        "Previous strategy objective was not preserved in task reason."
    );
}

const alreadyUsedPlan = planner.build(
    patterns,
    ["Vectorized/solady"],
    previousStrategy
);

if (alreadyUsedPlan.tasks.length !== 0) {
    throw new Error(
        "Strategy feedback must not recommend an already-used repository."
    );
}

console.log(
    "PASS: cross-campaign research strategy feedback contract"
);
