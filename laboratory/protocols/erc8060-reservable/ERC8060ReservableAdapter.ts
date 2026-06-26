import type { ProtocolAdapter } from "../../adapters/ProtocolAdapter.js";
import type { ExecutionContext } from "../../runtime/ExecutionContext.js";

export class ERC8060ReservableAdapter implements ProtocolAdapter {
    readonly protocolId = "ERC8060Reservable";

    async initialize(context: ExecutionContext): Promise<void> {
        context.totalValue = 100;
        context.lockedValue = 0;
        context.availableValue = 100;
    }

    async execute(context: ExecutionContext): Promise<void> {
        const amountToReserve = context.consumedAuthority;

        context.lockedValue = amountToReserve;
        context.availableValue = context.totalValue - amountToReserve;
    }

    async getState(context: ExecutionContext): Promise<Record<string, unknown>> {
        return {
            lockedValue: context.lockedValue,
            availableValue: context.availableValue,
            totalValue: context.totalValue
        };
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