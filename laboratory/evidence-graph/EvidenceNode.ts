export interface EvidenceNode {

    nodeId: string;

    label: string;

    type:
        | "PROTOCOL"
        | "CAPABILITY"
        | "CLAIM"
        | "CONCLUSION";

}