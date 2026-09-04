import type { EvidenceGraphResult } from "../evidence-graph/EvidenceGraphResult.js";
import type { InferenceResult } from "./InferenceResult.js";
import type { InferredRelationship } from "./InferredRelationship.js";

export class InferenceEngine {

    build(
        graph: EvidenceGraphResult
    ): InferenceResult {

        const inferredRelationships: InferredRelationship[] = [];

        let counter = 1;

        const edges = graph.edges ?? [];

        for (const first of edges) {

            for (const second of edges) {

                if (first.to !== second.from) {
                    continue;
                }

                if (first.from === second.to) {
                    continue;
                }

                if (
                    edges.some(edge =>
                        edge.from === first.from &&
                        edge.to === second.to
                    )
                ) {
                    continue;
                }

                const confidence =
                    Math.round(
                        (
                            first.confidence +
                            second.confidence
                        ) / 2
                    );

                inferredRelationships.push({

                    inferenceId:
                        `INFERENCE-${String(counter++).padStart(5, "0")}`,

                    from:
                        first.from,

                    relation:
                        "LIKELY_SUPPORTS",

                    to:
                        second.to,

                    inferredFrom: [
                        first.edgeId,
                        second.edgeId
                    ],

                    confidence,

                    rationale:
                        `${first.from} -> ${first.to} and ${first.to} -> ${second.to} suggest an implicit relationship.`

                });

            }

        }

        return {

            generatedAt:
                new Date().toISOString(),

            inferredRelationships,

            statistics: {

                inferred:
                    inferredRelationships.length

            },

            errors: []

        };

    }

}