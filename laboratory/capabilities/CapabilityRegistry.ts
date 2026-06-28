import type { Capability } from "./Capability.js";

export class CapabilityRegistry {
    private capabilities: Map<string, Capability> = new Map();

    register(capability: Capability): void {
        if (this.capabilities.has(capability.id)) {
            throw new Error(`Capability already registered: ${capability.id}`);
        }

        this.capabilities.set(capability.id, capability);
    }

    get(capabilityId: string): Capability | undefined {
        return this.capabilities.get(capabilityId);
    }

    list(): Capability[] {
        return Array.from(this.capabilities.values());
    }

    has(capabilityId: string): boolean {
        return this.capabilities.has(capabilityId);
    }
}
