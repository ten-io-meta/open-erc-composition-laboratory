import type { EvidenceGraphResult } from "../evidence-graph/EvidenceGraphResult.js";
import type { ScientificDiscovery } from "./ScientificDiscovery.js";
import type { ScientificDiscoveryResult } from "./ScientificDiscoveryResult.js";

export class ScientificDiscoveryEngine {

    build(
        graph: EvidenceGraphResult
    ): ScientificDiscoveryResult {

        const discoveries: ScientificDiscovery[] = [];

        let counter = 1;

        const degree = new Map<string, number>();

        for (const edge of graph.edges ?? []) {
            degree.set(edge.from, (degree.get(edge.from) ?? 0) + 1);
            degree.set(edge.to, (degree.get(edge.to) ?? 0) + 1);
        }

        const centralNodes = [...degree.entries()]
            .filter(([, count]) => count >= 4)
            .sort((a, b) => b[1] - a[1]);

        for (const [node, count] of centralNodes) {
            discoveries.push({
                discoveryId: `DISCOVERY-${String(counter++).padStart(5, "0")}`,
                discoveryType: "CENTRAL_CAPABILITY",
                statement: `${node} behaves as a central capability with ${count} graph connections.`,
                relatedNodes: [node],
                relatedEdges: this.edgeIdsForNode(graph, node),
                confidence: Math.min(100, count * 12),
                importance: count >= 6 ? "HIGH" : "MEDIUM"
            });
        }

        const bridgeCandidates = graph.nodes
            .map(node => node.nodeId)
            .filter(node =>
                this.outgoing(graph, node).length > 0 &&
                this.incoming(graph, node).length > 0
            );

        for (const node of bridgeCandidates) {
            discoveries.push({
                discoveryId: `DISCOVERY-${String(counter++).padStart(5, "0")}`,
                discoveryType: "BRIDGE_NODE",
                statement: `${node} acts as a bridge between upstream and downstream protocol relations.`,
                relatedNodes: [node],
                relatedEdges: this.edgeIdsForNode(graph, node),
                confidence: Math.min(
                    100,
                    (this.incoming(graph, node).length + this.outgoing(graph, node).length) * 10
                ),
                importance:
                    this.edgeIdsForNode(graph, node).length >= 4
                        ? "HIGH"
                        : "MEDIUM"
            });
        }

        const highEvidenceEdges = graph.edges.filter(edge =>
            (edge.sources?.length ?? 0) >= 4
        );

        if (highEvidenceEdges.length > 0) {
            discoveries.push({
                discoveryId: `DISCOVERY-${String(counter++).padStart(5, "0")}`,
                discoveryType: "EVIDENCE_CLUSTER",
                statement: `${highEvidenceEdges.length} relations are supported by four or more independent sources.`,
                relatedNodes: [
                    ...new Set(
                        highEvidenceEdges.flatMap(edge => [
                            edge.from,
                            edge.to
                        ])
                    )
                ],
                relatedEdges: highEvidenceEdges.map(edge => edge.edgeId),
                confidence: Math.min(100, highEvidenceEdges.length * 8),
                importance: "HIGH"
            });
        }

        const compositionPaths = this.findTwoStepPaths(graph);

        for (const path of compositionPaths.slice(0, 10)) {
            discoveries.push({
                discoveryId: `DISCOVERY-${String(counter++).padStart(5, "0")}`,
                discoveryType: "COMPOSITION_PATH",
                statement: `${path.nodes.join(" -> ")} forms a two-step composition path.`,
                relatedNodes: path.nodes,
                relatedEdges: path.edges,
                confidence: path.confidence,
                importance: path.confidence >= 70 ? "HIGH" : "MEDIUM"
            });
        }

        return {
            generatedAt: new Date().toISOString(),
            discoveries,
            statistics: {
                discoveries: discoveries.length,
                centralCapabilities: discoveries.filter(d => d.discoveryType === "CENTRAL_CAPABILITY").length,
                bridgeNodes: discoveries.filter(d => d.discoveryType === "BRIDGE_NODE").length,
                evidenceClusters: discoveries.filter(d => d.discoveryType === "EVIDENCE_CLUSTER").length,
                compositionPaths: discoveries.filter(d => d.discoveryType === "COMPOSITION_PATH").length
            },
            errors: []
        };

    }

    private incoming(
        graph: EvidenceGraphResult,
        node: string
    ) {
        return graph.edges.filter(edge => edge.to === node);
    }

    private outgoing(
        graph: EvidenceGraphResult,
        node: string
    ) {
        return graph.edges.filter(edge => edge.from === node);
    }

    private edgeIdsForNode(
        graph: EvidenceGraphResult,
        node: string
    ): string[] {

        return graph.edges
            .filter(edge => edge.from === node || edge.to === node)
            .map(edge => edge.edgeId);

    }

    private findTwoStepPaths(
        graph: EvidenceGraphResult
    ): Array<{
        nodes: string[];
        edges: string[];
        confidence: number;
    }> {

        const paths: Array<{
            nodes: string[];
            edges: string[];
            confidence: number;
        }> = [];

        for (const first of graph.edges) {
            for (const second of graph.edges) {
                if (first.to !== second.from) {
                    continue;
                }

                paths.push({
                    nodes: [
                        first.from,
                        first.to,
                        second.to
                    ],
                    edges: [
                        first.edgeId,
                        second.edgeId
                    ],
                    confidence: Math.round(
                        (first.confidence + second.confidence) / 2
                    )
                });
            }
        }

        return paths.sort(
            (a, b) => b.confidence - a.confidence
        );

    }

}