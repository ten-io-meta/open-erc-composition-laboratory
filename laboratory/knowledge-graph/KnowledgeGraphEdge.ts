export interface KnowledgeGraphEdge {

    from: string;

    to: string;

    relation:
        | "MENTIONS_PROTOCOL"
        | "MENTIONS_CAPABILITY"
        | "IMPLEMENTS_CAPABILITY"
        | "SUPPORTS_CLAIM"
        | "RELATES_TO";

    evidence: string;

}