import type { ResearchExtraction } from "../extraction/ResearchExtraction.js";
import type { ProtocolSemanticResult } from "../protocol-semantics/ProtocolSemanticResult.js";

import type { KnowledgeGraph } from "./KnowledgeGraph.js";
import type { KnowledgeGraphNode } from "./KnowledgeGraphNode.js";
import type { KnowledgeGraphEdge } from "./KnowledgeGraphEdge.js";

export class KnowledgeGraphBuilder {

    build(
        extraction: ResearchExtraction,
        semantics?: ProtocolSemanticResult
    ): KnowledgeGraph {

        const nodes: KnowledgeGraphNode[] = [];
        const edges: KnowledgeGraphEdge[] = [];

        const addNode = (node: KnowledgeGraphNode): void => {
            if (!nodes.some(existing => existing.id === node.id)) {
                nodes.push(node);
            }
        };

        const addEdge = (edge: KnowledgeGraphEdge): void => {
            if (
                !edges.some(existing =>
                    existing.from === edge.from &&
                    existing.to === edge.to &&
                    existing.relation === edge.relation
                )
            ) {
                edges.push(edge);
            }
        };

        addNode({
            id: extraction.sourceId,
            type: "ResearchSource",
            label: extraction.sourceId
        });

        for (const protocol of extraction.protocols) {

            addNode({
                id: protocol,
                type: "Protocol",
                label: protocol
            });

            addEdge({
                from: extraction.sourceId,
                to: protocol,
                relation: "MENTIONS_PROTOCOL",
                evidence: extraction.sourceId
            });

        }

        for (const capability of extraction.capabilities) {

            addNode({
                id: capability,
                type: "Capability",
                label: capability
            });

            addEdge({
                from: extraction.sourceId,
                to: capability,
                relation: "MENTIONS_CAPABILITY",
                evidence: extraction.sourceId
            });

        }

        for (const semantic of semantics?.semantics ?? []) {

            addNode({
                id: semantic.protocolId,
                type: "Protocol",
                label: semantic.protocolId
            });

            for (const capability of semantic.capabilities) {

                addNode({
                    id: capability,
                    type: "Capability",
                    label: capability
                });

                addEdge({
                    from: semantic.protocolId,
                    to: capability,
                    relation: "IMPLEMENTS_CAPABILITY",
                    evidence: semantic.evidence.join(", ")
                });

            }

        }

        for (const claim of extraction.claims) {

            addNode({
                id: claim.claimId,
                type: "Claim",
                label: claim.text
            });

            addEdge({
                from: extraction.sourceId,
                to: claim.claimId,
                relation: "SUPPORTS_CLAIM",
                evidence: claim.evidence
            });

        }

        return {
            graphId: `GRAPH-${extraction.sourceId}`,
            generatedAt: new Date().toISOString(),
            nodes,
            edges
        };

    }

}