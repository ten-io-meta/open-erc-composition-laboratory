import type { ConfidenceAssessmentResult } from "../confidence-engine/ConfidenceAssessmentResult.js";

import type { ScientificConsensus } from "./ScientificConsensus.js";
import type { ScientificConsensusResult } from "./ScientificConsensusResult.js";

export class ScientificConsensusEngine {

    build(
        confidence: ConfidenceAssessmentResult
    ): ScientificConsensusResult {

        const consensus: ScientificConsensus[] =
            (confidence.assessments ?? []).map((assessment, index) => {

                const level =
                    assessment.maturity === "ESTABLISHED"
                        ? "STRONG"
                        : assessment.maturity === "SUPPORTED"
                            ? "MODERATE"
                            : "WEAK";

                return {
                    consensusId: `CONSENSUS-${String(index + 1).padStart(5, "0")}`,
                    statement: assessment.statement,
                    consensusLevel: level,
                    confidence: assessment.calculatedConfidence,
                    supportingSources: assessment.independentSources,
                    maturity: assessment.maturity
                };

            });

        return {
            generatedAt: new Date().toISOString(),
            consensus,
            statistics: {
                total: consensus.length,
                weak: consensus.filter(c => c.consensusLevel === "WEAK").length,
                moderate: consensus.filter(c => c.consensusLevel === "MODERATE").length,
                strong: consensus.filter(c => c.consensusLevel === "STRONG").length
            },
            errors: []
        };

    }

}