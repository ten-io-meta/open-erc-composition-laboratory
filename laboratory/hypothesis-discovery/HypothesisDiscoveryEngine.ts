import type { ResearchKnowledge } from "../research-knowledge/ResearchKnowledge.js";
import type { ResearchHypothesis } from "../hypothesis/ResearchHypothesis.js";

export class HypothesisDiscoveryEngine {

    discover(
        knowledge: ResearchKnowledge,
        startIndex = 0
    ): ResearchHypothesis[] {

        const machineEntries = knowledge.entries.filter(entry =>
            entry.evidence.some(evidence => evidence === "machine-reasoning")
        );

        return machineEntries.map((entry, index) => {

            const hypothesisId =
                `HYP-DERIVED-${String(startIndex + index + 1).padStart(5, "0")}`;

            return {
                hypothesisId,

                statement:
                    `${entry.relation} may represent an emergent composition constraint derived from machine reasoning.`,

                relation:
                    entry.relation,

                confidence:
                    entry.averageConfidence,

                evidence:
                    entry.observations,

                status:
                    entry.status === "CANONICAL"
                        ? "VALIDATED"
                        : entry.status === "VALIDATED"
                            ? "SUPPORTED"
                            : "EMERGING"
            };

        });

    }

}