import type { KnowledgeGraphNode } from "./KnowledgeGraphNode.js";
import type { KnowledgeGraphEdge } from "./KnowledgeGraphEdge.js";

export interface KnowledgeGraph {

    graphId: string;

    generatedAt: string;

    nodes: KnowledgeGraphNode[];

    edges: KnowledgeGraphEdge[];

}