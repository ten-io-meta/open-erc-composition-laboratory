import type { ProtocolAdapter } from "../../adapters/ProtocolAdapter.js";
import type { ExecutionContext } from "../../runtime/ExecutionContext.js";
import type { ExecutionAction } from "../../runtime/ExecutionAction.js";

export class ERC8275SettlementAdapter implements ProtocolAdapter {
    readonly protocolId = "ERC8275Settlement";

    async initialize(_context: ExecutionContext): Promise<void> {}

    async execute(
        context: ExecutionContext,
        action: ExecutionAction
    ): Promise<void> {
        if (action.action !== "settle") {
            return;
        }

        context.settledValue = action.amount ?? context.lockedValue;
    }

    async getState(context: ExecutionContext): Promise<Record<string, unknown>> {
        return {
            settled: context.settledValue,
            reserved: context.lockedValue
        };
    }

    async collectEvents(): Promise<unknown[]> {
        return [];
    }

    async shutdown(): Promise<void> {}
}
