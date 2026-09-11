export interface SemanticReasoningRelation {

    fromCapability: string;

    toCapability: string;

    relation:
        | "ENABLES"
        | "DEPENDS_ON"
        | "REQUIRES"
        | "CONSTRAINS"
        | "PRODUCES"
        | "CONSUMES"
        | "SETTLES"
        | "PROTECTS"
        | "VALIDATES"
        | "ANCHORS"
        | "RESERVES"
        | "ACCOUNTS_FOR";

    reason: string;

    evidence: string[];

    confidence: number;

}