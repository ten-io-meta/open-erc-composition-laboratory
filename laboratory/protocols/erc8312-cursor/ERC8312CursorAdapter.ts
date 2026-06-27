import type { ProtocolAdapter } from "../../adapters/ProtocolAdapter.js";
import type { ExecutionContext } from "../../runtime/ExecutionContext.js";
import type { ExecutionAction } from "../../runtime/ExecutionAction.js";

export class ERC8312CursorAdapter implements ProtocolAdapter {
    readonly protocolId = "ERC8312Cursor";

    async initialize(context: ExecutionContext): Promise<void> {
        context.cursor = 0;
    }

    async execute(
        context: ExecutionContext,
        action: ExecutionAction
    ): Promise<void> {

        if (action.action !== "consume") {
            return;
        }

        context.cursor += action.amount ?? 0;
    }

    async getState(context: ExecutionContext): Promise<Record<string, unknown>> {

        return {
            cursor: context.cursor,
            consumedAuthority: context.consumedAuthority
        };

    }

    async collectEvents(): Promise<unknown[]> {
        return [];
    }

    async shutdown(): Promise<void> {}
}