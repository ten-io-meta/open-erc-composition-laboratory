import type { KnowledgeGraph } from "../knowledge-graph/KnowledgeGraph.js";
import type { SemanticDiscoveryResult } from "./SemanticDiscoveryResult.js";

import { SemanticModelBuilder } from "./SemanticModelBuilder.js";

export class SemanticDiscoveryEngine {

    discover(graph: KnowledgeGraph): SemanticDiscoveryResult {

        const builder = new SemanticModelBuilder();

        const model = builder.build(graph);

        return {
            graphId: graph.graphId,
            discoveredAt: new Date().toISOString(),
            model
        };

    }

}