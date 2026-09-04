import type { PredictionResult } from "../prediction-engine/PredictionResult.js";
import type { RepositoryIntelligenceResult } from "../repository-intelligence/RepositoryIntelligenceResult.js";
import type { ResearchPlan } from "../research-planner/ResearchPlan.js";

import type { ResearchStrategy } from "./ResearchStrategy.js";
import type { ResearchStrategyResult } from "./ResearchStrategyResult.js";

export class ResearchStrategyEngine {

    build(
        predictions: PredictionResult,
        repositoryIntelligence: RepositoryIntelligenceResult,
        plan: ResearchPlan
    ): ResearchStrategyResult {

        const strategies: ResearchStrategy[] = [];

        let counter = 1;

        const bestHistorical =
            repositoryIntelligence.repositories?.[0]?.sourceId ?? null;

        for (const prediction of predictions.predictions ?? []) {

            const matchingTask =
                plan.tasks.find(task =>
                    task.priority === "HIGH"
                ) ?? plan.tasks[0];

            strategies.push({
                strategyId: `STRATEGY-${String(counter++).padStart(5, "0")}`,
                objective: prediction.prediction,
                recommendedAction: "Ingest the highest-value repository candidate and rerun OECL V2.",
                targetRepositories: matchingTask?.recommendedRepositories ?? [],
                expectedKnowledgeGain:
                    prediction.expectedValue === "HIGH"
                        ? 90
                        : prediction.expectedValue === "MEDIUM"
                            ? 60
                            : 30,
                priority: prediction.expectedValue,
                rationale:
                    bestHistorical
                        ? `Prediction is ${prediction.confidence}% confident. Historically strong source: ${bestHistorical}.`
                        : `Prediction is ${prediction.confidence}% confident. No repository history available yet.`
            });

        }

        return {
            generatedAt: new Date().toISOString(),
            strategies,
            statistics: {
                strategies: strategies.length,
                high: strategies.filter(s => s.priority === "HIGH").length,
                medium: strategies.filter(s => s.priority === "MEDIUM").length,
                low: strategies.filter(s => s.priority === "LOW").length
            },
            errors: []
        };

    }

}