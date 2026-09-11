import type { ProtocolAlias } from "./ProtocolAlias.js";

export class ProtocolNormalizer {

    private readonly aliases: ProtocolAlias[] = [
        {
            raw: "ERC8001Authority",
            canonical: "ERC8001"
        },
        {
            raw: "ERC8312Cursor",
            canonical: "ERC8312"
        },
        {
            raw: "ERC8275Settlement",
            canonical: "ERC8275"
        },
        {
            raw: "ERC8060Reservable",
            canonical: "IERC8060Reservable"
        }
    ];

    normalize(protocolId: string): string {
        const match = this.aliases.find(
            alias => alias.raw === protocolId || alias.canonical === protocolId
        );

        return match?.canonical ?? protocolId;
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