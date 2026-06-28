import { CapabilityRegistry } from "./CapabilityRegistry.js";
import { ProtocolRegistry } from "../registry/ProtocolRegistry.js";
import type { ProtocolDefinition } from "../registry/ProtocolDefinition.js";

export class CapabilityResolver {
    constructor(
        private readonly capabilityRegistry: CapabilityRegistry,
        private readonly protocolRegistry: ProtocolRegistry
    ) {}

    resolve(capabilities: string[]): ProtocolDefinition[] {
        const resolved = new Map<string, ProtocolDefinition>();

        for (const capability of capabilities) {
            if (!this.capabilityRegistry.has(capability)) {
                throw new Error(`Unknown capability: ${capability}`);
            }

            const protocols =
                this.protocolRegistry.findByCapability(capability);

            if (protocols.length === 0) {
                throw new Error(
                    `No protocol implements capability: ${capability}`
                );
            }

            const protocol = protocols[0];
            resolved.set(protocol.id, protocol);
        }

        return Array.from(resolved.values());
    }
}
