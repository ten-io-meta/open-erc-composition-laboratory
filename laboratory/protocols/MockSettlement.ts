import type { ProtocolAdapter } from "../adapters/ProtocolAdapter.js";

export class MockSettlement implements ProtocolAdapter {
    readonly protocolId = "MockSettlement";

    async initialize(): Promise<void> {}

    async getState(): Promise<Record<string, unknown>> {
        return {
            settled: 40,
            reserved: 40
        };
    }

    async executeAction(
        action: string,
        params?: Record<string, unknown>
    ): Promise<void> {
        console.log(`MockSettlement action: ${action}`, params ?? {});
    }

    async collectEvents(): Promise<unknown[]> {
        return [];
    }

    async shutdown(): Promise<void> {}
}