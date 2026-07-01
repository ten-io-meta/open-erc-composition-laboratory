export interface ProtocolRegistryEntry {

    canonicalId: string;

    aliases: string[];

    capability: string;

    layer: string;

    family: string;

    standard: "ERC" | "IERC" | "OTHER";

}