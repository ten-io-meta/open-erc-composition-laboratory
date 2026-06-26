import type { ProtocolAdapter } from "../../adapters/ProtocolAdapter.js";

export class ERC8060ReservableAdapter implements ProtocolAdapter {
    readonly protocolId = "ERC8060Reservable";

    private state = {
        lockedValue: 40,
        availableValue: 60,
        totalValue: 100
    };

    async initialize(): Promise<void> {
        // Future: connect to real ERC8060 Reservable contract or Foundry fixture.
    }

    async getState(): Promise<Record<string, unknown>> {
        return this.state;
    }

    async executeAction(
        action: string,
        params?: Record<string, unknown>
    ): Promise<void> {
        console.log(`ERC8060Reservable action: ${action}`, params ?? {});
    }

    async collectEvents(): Promise<unknown[]> {
        return [];
    }

    async shutdown(): Promise<void> {}
}