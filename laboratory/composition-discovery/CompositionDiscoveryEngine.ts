import type { KnowledgeGraph } from "../knowledge-graph/KnowledgeGraph.js";
import type { CompositionCandidate } from "./CompositionCandidate.js";
import type { CompositionDiscoveryResult } from "./CompositionDiscoveryResult.js";

export class CompositionDiscoveryEngine {

    discover(graph: KnowledgeGraph): CompositionDiscoveryResult {

        const protocolNodes = graph.nodes.filter(
            node => node.type === "Protocol"
        );

        const capabilityNodes = graph.nodes.filter(
            node => node.type === "Capability"
        );

        const capabilities = capabilityNodes.map(node => node.id);

        const candidates: CompositionCandidate[] = [];

        let counter = 1;

        for (let i = 0; i < protocolNodes.length; i++) {

            for (let j = i + 1; j < protocolNodes.length; j++) {

                const protocolA = protocolNodes[i];
                const protocolB = protocolNodes[j];

                candidates.push({
                    candidateId: `COMP-${String(counter).padStart(5, "0")}`,
                    sourceGraphId: graph.graphId,
                    protocolA: protocolA.id,
                    protocolB: protocolB.id,
                    reason:
                        "Both protocols are mentioned by the same research source and may require composition feasibility analysis.",
                    supportingCapabilities: capabilities,
                    evidence: [
                        graph.graphId,
                        protocolA.id,
                        protocolB.id
                    ],
                    confidence: 50
                });

                counter++;

            }

        }

        return {
            graphId: graph.graphId,
            discoveredAt: new Date().toISOString(),
            candidates
        };

    }

}