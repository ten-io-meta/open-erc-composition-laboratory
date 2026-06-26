import type { ProtocolAdapter } from "../adapters/ProtocolAdapter.js";

export class MockReservation implements ProtocolAdapter {
    readonly protocolId = "MockReservation";

    async initialize(): Promise<void> {}

    async getState(): Promise<Record<string, unknown>> {
        return {
            lockedValue: 40,
            availableValue: 60,
            totalValue: 100
        };
    }

    async executeAction(
        action: string,
        params?: Record<string, unknown>
    ): Promise<void> {
        console.log(`MockReservation action: ${action}`, params ?? {});
    }

    async collectEvents(): Promise<unknown[]> {
        return [];
    }

    async shutdown(): Promise<void> {}
}