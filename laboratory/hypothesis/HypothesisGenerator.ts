import type { CompositionStatistics } from "../composition-learning/CompositionStatistics.js";

import type { ResearchHypothesis } from "./ResearchHypothesis.js";

export class HypothesisGenerator {

    generate(
        statistics: CompositionStatistics[]
    ): ResearchHypothesis[] {

        return statistics.map((entry, index) => ({

            hypothesisId:
                `HYP-${String(index + 1).padStart(5, "0")}`,

            statement:
                `${entry.relationKey} appears to represent a reproducible protocol composition.`,

            relation:
                entry.relationKey,

            confidence:
                entry.averageConfidence,

            evidence:
                entry.observations,

            status:
                entry.status === "STABLE"
                    ? "VALIDATED"
                    : entry.status === "EMERGING"
                        ? "SUPPORTED"
                        : "EMERGING"

        }));

    }

}