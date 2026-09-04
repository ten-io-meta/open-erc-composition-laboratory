import type { ConfidenceAssessmentResult } from "../confidence-engine/ConfidenceAssessmentResult.js";
import type { KnowledgeConsolidation } from "./KnowledgeConsolidation.js";
import type { KnowledgeConsolidationResult } from "./KnowledgeConsolidationResult.js";

export class KnowledgeConsolidationEngine {

    build(
        confidence: ConfidenceAssessmentResult
    ): KnowledgeConsolidationResult {

        const consolidations: KnowledgeConsolidation[] = [];

        let counter = 1;

        for (const assessment of confidence.assessments ?? []) {

            const previousStatus = "EMERGING";

            let newStatus: KnowledgeConsolidation["newStatus"] =
                "EMERGING";

            let action: KnowledgeConsolidation["action"] =
                "RETAINED";

            if (assessment.calculatedConfidence >= 95) {

                newStatus = "CANONICAL";
                action = "PROMOTED";

            }
            else if (assessment.calculatedConfidence >= 85) {

                newStatus = "ESTABLISHED";
                action = "PROMOTED";

            }
            else if (assessment.calculatedConfidence >= 70) {

                newStatus = "SUPPORTED";
                action = "PROMOTED";

            }

            consolidations.push({

                consolidationId:
                    `CONSOLIDATION-${String(counter++).padStart(5, "0")}`,

                knowledgeId:
                    assessment.statement.replace(/\s+/g, "-"),

                    sourceConclusionId:
    assessment.sourceConclusionId,

    sourcePatternId:
    assessment.sourcePatternId,

sourcePatternRelation:
    assessment.sourcePatternRelation,

                statement:
                    assessment.statement,

                previousStatus,

                newStatus,

                confidenceBefore: 0,

                confidenceAfter:
                    assessment.calculatedConfidence,

                confidenceDelta:
                    assessment.calculatedConfidence,

                /*
 * Evidence quantity is not reconstructed by this
 * consolidation stage. Do not use source independence
 * as a proxy for evidence count.
 */
evidenceBefore: 0,

evidenceAfter: 0,

evidenceDelta: 0,

independentSources:
    assessment.independentSources,

campaignsObserved: 1,

                action,

                explanation:
    `Consolidated with ${assessment.independentSources} explicitly established independent source(s) and confidence ${assessment.calculatedConfidence}.`
            });

        }

        return {

            generatedAt:
                new Date().toISOString(),

            consolidations,

            statistics: {

                promoted:
                    consolidations.filter(
                        item => item.action === "PROMOTED"
                    ).length,

                retained:
                    consolidations.filter(
                        item => item.action === "RETAINED"
                    ).length,

                degraded:
                    consolidations.filter(
                        item => item.action === "DEGRADED"
                    ).length,

                archived:
                    consolidations.filter(
                        item => item.action === "ARCHIVED"
                    ).length,

                canonical:
                    consolidations.filter(
                        item => item.newStatus === "CANONICAL"
                    ).length

            },

            errors: []

        };

    }

}