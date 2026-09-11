import type { KnowledgeGraph } from "../knowledge-graph/KnowledgeGraph.js";
import type { SemanticCapability } from "./SemanticCapability.js";
import type { SemanticModel } from "./SemanticModel.js";
import type { SemanticRelationship } from "./SemanticRelationship.js";

export class SemanticModelBuilder {

    build(graph: KnowledgeGraph): SemanticModel {

        const sourceNodes = graph.nodes.filter(
            node => node.type === "ResearchSource"
        );

        const capabilityNodes = graph.nodes.filter(
            node => node.type === "Capability"
        );

        const implementationEdges = graph.edges.filter(
            edge => edge.relation === "IMPLEMENTS_CAPABILITY"
        );

        const sourceIds = sourceNodes.map(node => node.id);

        const capabilities: SemanticCapability[] = capabilityNodes.map(
            capability => {

                const implementingProtocols = implementationEdges
                    .filter(edge => edge.to === capability.id)
                    .map(edge => edge.from);

                const evidence = implementationEdges
                    .filter(edge => edge.to === capability.id)
                    .map(edge => edge.evidence);

                return {
                    capabilityId: capability.id,
                    label: capability.label,
                    protocols: [...new Set(implementingProtocols)],
                    evidence: [...new Set([...sourceIds, ...evidence])]
                };

            }
        );

        const activeCapabilities = capabilities.filter(
            capability => capability.protocols.length > 0
        );

        const relationships: SemanticRelationship[] = [];

        for (let i = 0; i < activeCapabilities.length; i++) {

            for (let j = i + 1; j < activeCapabilities.length; j++) {

                relationships.push({
                    fromCapability: activeCapabilities[i].capabilityId,
                    toCapability: activeCapabilities[j].capabilityId,
                    relation: "CO_OCCURS_WITH",
                    evidence: [
                        ...new Set([
                            ...activeCapabilities[i].evidence,
                            ...activeCapabilities[j].evidence
                        ])
                    ],
                    confidence: 75
                });

            }

        }

        return {
            modelId: `SEMANTIC-${graph.graphId}`,
            generatedAt: new Date().toISOString(),
            capabilities,
            relationships
        };

    }

}