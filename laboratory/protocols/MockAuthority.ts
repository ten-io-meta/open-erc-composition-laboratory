import type { ProtocolAdapter } from "../adapters/ProtocolAdapter.js";
import type { ExecutionContext } from "../runtime/ExecutionContext.js";

export class MockAuthority implements ProtocolAdapter {
    readonly protocolId = "MockAuthority";

    async initialize(context: ExecutionContext): Promise<void> {
        context.authorityLimit = 100;
        context.consumedAuthority = 0;
    }

    async execute(context: ExecutionContext): Promise<void> {
        context.consumedAuthority = 40;
    }

    async getState(context: ExecutionContext): Promise<Record<string, unknown>> {
        return {
            authorityLimit: context.authorityLimit,
            consumed: context.consumedAuthority
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