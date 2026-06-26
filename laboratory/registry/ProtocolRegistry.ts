import type { ProtocolDefinition } from "./ProtocolDefinition.js";

export class ProtocolRegistry {
    private protocols: Map<string, ProtocolDefinition> = new Map();

    register(protocol: ProtocolDefinition): void {
        if (this.protocols.has(protocol.id)) {
            throw new Error(`Protocol already registered: ${protocol.id}`);
        }

        this.protocols.set(protocol.id, protocol);
    }

    get(protocolId: string): ProtocolDefinition | undefined {
        return this.protocols.get(protocolId);
    }

    list(): ProtocolDefinition[] {
        return Array.from(this.protocols.values());
    }

    findByCapability(capabilityId: string): ProtocolDefinition[] {
        return this.list().filter(protocol =>
            protocol.capabilities.includes(capabilityId)
        );
    }
}