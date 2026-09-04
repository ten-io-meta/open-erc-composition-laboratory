export interface ScientificDiscovery {

    discoveryId: string;

    discoveryType:
        | "CENTRAL_CAPABILITY"
        | "BRIDGE_NODE"
        | "EVIDENCE_CLUSTER"
        | "COMPOSITION_PATH";

    statement: string;

    relatedNodes: string[];

    relatedEdges: string[];

    confidence: number;

    importance: "HIGH" | "MEDIUM" | "LOW";

}