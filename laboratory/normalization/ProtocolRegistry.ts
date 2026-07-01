import type { ProtocolRegistryEntry } from "./ProtocolRegistryEntry.js";

export class ProtocolRegistry {

    private readonly entries: ProtocolRegistryEntry[] = [
        {
            canonicalId: "ERC8001",
            aliases: ["ERC8001Authority"],
            capability: "Authority",
            layer: "Authority",
            family: "Authorization",
            standard: "ERC"
        },
        {
            canonicalId: "ERC8312",
            aliases: ["ERC8312Cursor"],
            capability: "Cursor",
            layer: "Consumption",
            family: "Accounting",
            standard: "ERC"
        },
        {
            canonicalId: "ERC8275",
            aliases: ["ERC8275Settlement"],
            capability: "Settlement",
            layer: "Settlement",
            family: "Settlement",
            standard: "ERC"
        },
        {
            canonicalId: "IERC8060Reservable",
            aliases: ["ERC8060Reservable"],
            capability: "Reservation",
            layer: "Reservation",
            family: "Accounting",
            standard: "IERC"
        },
        {
            canonicalId: "ERC8060",
            aliases: [],
            capability: "EmbeddedValue",
            layer: "Value",
            family: "Accounting",
            standard: "ERC"
        }
    ];

    getAll(): ProtocolRegistryEntry[] {
        return this.entries;
    }

    find(protocolId: string): ProtocolRegistryEntry | undefined {
        return this.entries.find(entry =>
            entry.canonicalId === protocolId ||
            entry.aliases.includes(protocolId)
        );
    }

    normalize(protocolId: string): string {
        return this.find(protocolId)?.canonicalId ?? protocolId;
    }

    same(protocolA: string, protocolB: string): boolean {
        return this.normalize(protocolA) === this.normalize(protocolB);
    }

    samePair(
        protocolA: string,
        protocolB: string,
        candidateA: string,
        candidateB: string
    ): boolean {
        const a = this.normalize(protocolA);
        const b = this.normalize(protocolB);
        const ca = this.normalize(candidateA);
        const cb = this.normalize(candidateB);

        return (
            (a === ca && b === cb) ||
            (a === cb && b === ca)
        );
    }

}