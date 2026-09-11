import type { EvidenceGraphResult } from "./EvidenceGraphResult.js";
import type { EvidenceNode } from "./EvidenceNode.js";
import type { EvidenceEdge } from "./EvidenceEdge.js";

export class EvidenceGraphEngine {

    build(
        conclusions: any
    ): EvidenceGraphResult {

        const nodes = new Map<string, EvidenceNode>();

        const edges: EvidenceEdge[] = [];

        let edgeId = 1;

        for (const conclusion of conclusions.conclusions ?? []) {

            const statement =
                String(conclusion.statement ?? "");

            const match =
                statement.match(/^(.+?)\s+appears to\s+(.+?)\s+(.+?)\s+across/i);

            if (!match) {
                continue;
            }

            const subject =
                match[1].trim();

            const relation =
                match[2].trim().toUpperCase();

            const object =
                match[3].trim();

            if (!nodes.has(subject)) {

                nodes.set(subject, {

                    nodeId: subject,

                    label: subject,

                    type: "CAPABILITY"

                });

            }

            if (!nodes.has(object)) {

                nodes.set(object, {

                    nodeId: object,

                    label: object,

                    type: "CAPABILITY"

                });

            }

            edges.push({

    edgeId:
        `EDGE-${String(edgeId++)
            .padStart(5, "0")}`,

    sourceConclusionId:
        String(
            conclusion.conclusionId ??
            ""
        ),

    from: subject,

                relation,

                to: object,

                confidence:
                    Number(conclusion.confidence ?? 0),

                sources:
                    conclusion.supportedBy ?? []

            });

        }

        return {

            generatedAt:
                new Date().toISOString(),

            nodes:
                [...nodes.values()],

            edges,

            statistics: {

                nodes:
                    nodes.size,

                edges:
                    edges.length,

                protocols: 0,

                capabilities:
                    nodes.size,

                conclusions:
                    edges.length

            },

            errors: []

        };

    }

}