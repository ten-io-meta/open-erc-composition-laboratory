import type { CompositionStatistics } from "../composition-learning/CompositionStatistics.js";
import type { ResearchHypothesis } from "./ResearchHypothesis.js";

/**
 * Learning statistics can PROPOSE hypotheses, never validate themselves.
 * Independent falsification and provenance-backed testing must be separate.
 */
export class HypothesisGenerator {
    generate(statistics: CompositionStatistics[]): ResearchHypothesis[] {
        return statistics.map((entry,index) => ({
            hypothesisId: `HYP-${String(index + 1).padStart(5,"0")}`,
            statement: `${entry.relationKey} may be a candidate composition relation; independent tests are still required.`,
            relation: entry.relationKey,
            confidence: entry.averageConfidence,
            evidence: entry.observations,
            // Even STABLE learning statistics are not external validation.
            status: "EMERGING"
        }));
    }
}
