import type { ProtocolSemantic } from "./ProtocolSemantic.js";

export class ProtocolSemanticRegistry {

    private readonly semantics = new Map<string, ProtocolSemantic>();

    register(semantic: ProtocolSemantic): void {
        this.semantics.set(semantic.protocolId, semantic);
    }

    registerMany(semantics: ProtocolSemantic[]): void {
        for (const semantic of semantics) {
            this.register(semantic);
        }
    }

    get(protocolId: string): ProtocolSemantic | undefined {
        return this.semantics.get(protocolId);
    }

    getAll(): ProtocolSemantic[] {
        return [...this.semantics.values()];
    }

}