import type { KnowledgeGraph } from "../knowledge-graph/KnowledgeGraph.js";

import type { DiscoveryResult } from "./DiscoveryResult.js";
import type { ResearchFinding } from "./ResearchFinding.js";

import { ResearchFindingType } from "./ResearchFindingType.js";

export class DiscoveryEngine {

    discover(graph: KnowledgeGraph): DiscoveryResult {

        const findings: ResearchFinding[] = [];

        const protocolNodes = graph.nodes.filter(
            node => node.type === "Protocol"
        );

        const capabilityNodes = graph.nodes.filter(
            node => node.type === "Capability"
        );

        const claimNodes = graph.nodes.filter(
            node => node.type === "Claim"
        );

        if (protocolNodes.length > 1) {

            findings.push({

                findingId: `${graph.graphId}-FINDING-0001`,

                type: ResearchFindingType.PROTOCOL_CLUSTER,

                title: "Protocol cluster detected",

                description:
                    `The research source mentions ${protocolNodes.length} protocols, indicating a multi-protocol composition context.`,

                evidence: protocolNodes.map(node => node.id),

                confidence: 100

            });

        }

        if (capabilityNodes.length > 1) {

            findings.push({

                findingId: `${graph.graphId}-FINDING-0002`,

                type: ResearchFindingType.CAPABILITY_CLUSTER,

                title: "Capability cluster detected",

                description:
                    `The research source mentions ${capabilityNodes.length} capabilities, indicating layered protocol behavior.`,

                evidence: capabilityNodes.map(node => node.id),

                confidence: 100

            });

        }

        for (const claim of claimNodes) {

            findings.push({

                findingId: `${graph.graphId}-CLAIM-${claim.id}`,

                type: ResearchFindingType.SOURCE_CLAIM,

                title: "Research claim detected",

                description: claim.label,

                evidence: [claim.id],

                confidence: 100

            });

        }

        return {

            graphId: graph.graphId,

            discoveredAt: new Date().toISOString(),

            findings

        };

    }

}