import type { EvidenceGraphResult } from "../evidence-graph/EvidenceGraphResult.js";
import type { ConfidenceAssessmentResult } from "../confidence-engine/ConfidenceAssessmentResult.js";
import type { InferenceResult } from "../inference-engine/InferenceResult.js";

import type { KnowledgeGap } from "./KnowledgeGap.js";
import type { KnowledgeGapResult } from "./KnowledgeGapResult.js";

export class KnowledgeGapEngine {

    build(
        graph: EvidenceGraphResult,
        confidence: ConfidenceAssessmentResult,
        inferences: InferenceResult
    ): KnowledgeGapResult {

        const gaps: KnowledgeGap[] = [];

        let counter = 1;

        for (const assessment of confidence.assessments ?? []) {

            if (assessment.maturity !== "PRELIMINARY") {
                continue;
            }

            gaps.push({
                gapId: `GAP-${String(counter++).padStart(5, "0")}`,
                sourceConclusionId: assessment.sourceConclusionId,
                gapType: "LOW_CONFIDENCE",
                statement: `Low-confidence conclusion: ${assessment.statement}`,
                relatedNodes: [],
                relatedEdges: [],
                priority: assessment.calculatedConfidence < 60 ? "HIGH" : "MEDIUM",
                recommendation: "Collect additional independent evidence from implementation-heavy repositories."
            });

        }

        for (const inference of inferences.inferredRelationships ?? []) {

            gaps.push({
                gapId: `GAP-${String(counter++).padStart(5, "0")}`,
                gapType: "INFERRED_ONLY",
                statement: `Inference requires validation: ${inference.from} ${inference.relation} ${inference.to}`,
                relatedNodes: [inference.from, inference.to],
                relatedEdges: inference.inferredFrom,
                priority: inference.confidence >= 60 ? "HIGH" : "MEDIUM",
                recommendation: "Search for direct evidence confirming or rejecting this inferred relationship."
            });

        }

        for (const edge of graph.edges ?? []) {

            if ((edge.sources?.length ?? 0) < 2) {
                gaps.push({
                    gapId: `GAP-${String(counter++).padStart(5, "0")}`,
                    gapType: "WEAK_EVIDENCE",
                    statement: `Weak evidence edge: ${edge.from} ${edge.relation} ${edge.to}`,
                    relatedNodes: [edge.from, edge.to],
                    relatedEdges: [edge.edgeId],
                    priority: "MEDIUM",
                    recommendation: "Find at least one additional independent source supporting this edge."
                });
            }

        }

        return {
            generatedAt: new Date().toISOString(),
            gaps,
            statistics: {
                gaps: gaps.length,
                high: gaps.filter(gap => gap.priority === "HIGH").length,
                medium: gaps.filter(gap => gap.priority === "MEDIUM").length,
                low: gaps.filter(gap => gap.priority === "LOW").length
            },
            errors: []
        };

    }

}