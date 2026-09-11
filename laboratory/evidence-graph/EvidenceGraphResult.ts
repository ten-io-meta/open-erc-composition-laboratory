import type { EvidenceNode } from "./EvidenceNode.js";
import type { EvidenceEdge } from "./EvidenceEdge.js";

export interface EvidenceGraphResult {

    generatedAt: string;

    nodes: EvidenceNode[];

    edges: EvidenceEdge[];

    statistics: {

        nodes: number;

        edges: number;

        protocols: number;

        capabilities: number;

        conclusions: number;

    };

    errors: string[];

}