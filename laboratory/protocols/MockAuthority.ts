import type { ProtocolAdapter } from "../adapters/ProtocolAdapter.js";

export class MockAuthority implements ProtocolAdapter {
    readonly protocolId = "MockAuthority";

    async initialize(): Promise<void> {}

    async getState(): Promise<Record<string, unknown>> {
        return {
            authorityLimit: 100,
            consumed: 0
        };
    }

    async executeAction(
        action: string,
        params?: Record<string, unknown>
    ): Promise<void> {
        console.log(`MockAuthority action: ${action}`, params ?? {});
    }

    async collectEvents(): Promise<unknown[]> {
        return [];
    }

    async shutdown(): Promise<void> {}
}