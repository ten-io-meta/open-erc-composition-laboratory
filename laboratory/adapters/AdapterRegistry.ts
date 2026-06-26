import type { ProtocolAdapter } from "./ProtocolAdapter.js";

export class AdapterRegistry {
    private adapters: Map<string, ProtocolAdapter> = new Map();

    register(adapter: ProtocolAdapter): void {
        if (this.adapters.has(adapter.protocolId)) {
            throw new Error(`Adapter already registered: ${adapter.protocolId}`);
        }

        this.adapters.set(adapter.protocolId, adapter);
    }

    get(protocolId: string): ProtocolAdapter | undefined {
        return this.adapters.get(protocolId);
    }

    list(): ProtocolAdapter[] {
        return Array.from(this.adapters.values());
    }
}