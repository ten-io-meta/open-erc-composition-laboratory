import type { KnowledgeGapResult } from "../knowledge-gap/KnowledgeGapResult.js";
import type { ScientificDiscoveryResult } from "../scientific-discovery/ScientificDiscoveryResult.js";

import type { Prediction } from "./Prediction.js";
import type { PredictionResult } from "./PredictionResult.js";

export class PredictionEngine {

    build(
        gaps: KnowledgeGapResult,
        discoveries: ScientificDiscoveryResult
    ): PredictionResult {

        const predictions: Prediction[] = [];

        let counter = 1;

        for (const gap of gaps.gaps ?? []) {

            if (gap.priority === "LOW") {
                continue;
            }

            predictions.push({
                predictionId: `PREDICTION-${String(counter++).padStart(5, "0")}`,
                prediction: `Additional evidence is likely to strengthen: ${gap.statement}`,
                basedOn: [gap.gapId],
                confidence: gap.priority === "HIGH" ? 75 : 60,
                expectedValue: gap.priority === "HIGH" ? "HIGH" : "MEDIUM",
                validationTarget: gap.recommendation
            });

        }

        for (const discovery of discoveries.discoveries ?? []) {

            if (discovery.importance !== "HIGH") {
                continue;
            }

            predictions.push({
                predictionId: `PREDICTION-${String(counter++).padStart(5, "0")}`,
                prediction: `Future sources are likely to reinforce discovery: ${discovery.statement}`,
                basedOn: [discovery.discoveryId],
                confidence: discovery.confidence,
                expectedValue: "HIGH",
                validationTarget: "Prioritize repositories connected to the related nodes of this discovery."
            });

        }

        return {
            generatedAt: new Date().toISOString(),
            predictions,
            statistics: {
                predictions: predictions.length,
                highValue: predictions.filter(p => p.expectedValue === "HIGH").length,
                mediumValue: predictions.filter(p => p.expectedValue === "MEDIUM").length,
                lowValue: predictions.filter(p => p.expectedValue === "LOW").length
            },
            errors: []
        };

    }

}