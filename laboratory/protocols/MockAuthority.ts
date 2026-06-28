import type { ProtocolAdapter } from "../adapters/ProtocolAdapter.js";
import type { ExecutionContext } from "../runtime/ExecutionContext.js";
import type { ExecutionAction } from "../runtime/ExecutionAction.js";

export class MockAuthority implements ProtocolAdapter {
    readonly protocolId = "MockAuthority";

    async initialize(context: ExecutionContext): Promise<void> {
        context.authorityLimit = 100;
        context.consumedAuthority = 0;
    }

    async execute(
        context: ExecutionContext,
        action: ExecutionAction
    ): Promise<void> {
        if (action.action !== "authorize") {
            return;
        }

        context.consumedAuthority = action.amount ?? 0;
    }

    async getState(context: ExecutionContext): Promise<Record<string, unknown>> {
        return {
            authorityLimit: context.authorityLimit,
            consumed: context.consumedAuthority
        };
    }

    async collectEvents(): Promise<unknown[]> {
        return [];
    }

    async shutdown(): Promise<void> {}
}
