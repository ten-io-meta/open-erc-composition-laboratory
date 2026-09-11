export interface KnowledgeGraphNode {

    id: string;

    type:
        | "ResearchSource"
        | "Protocol"
        | "Capability"
        | "Invariant"
        | "Claim";

    label: string;

}