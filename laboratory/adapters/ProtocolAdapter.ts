import type { ExecutionContext } from "../runtime/ExecutionContext.js";
import type { ExecutionAction } from "../runtime/ExecutionAction.js";

export interface ProtocolAdapter {
    readonly protocolId: string;

    initialize(context: ExecutionContext): Promise<void>;

    execute(
        context: ExecutionContext,
        action: ExecutionAction
    ): Promise<void>;

    getState(context: ExecutionContext): Promise<Record<string, unknown>>;

    collectEvents(): Promise<unknown[]>;

    shutdown(): Promise<void>;
}
