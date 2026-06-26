import type { ExecutionContext } from "../runtime/ExecutionContext.js";

export interface ProtocolAdapter {
    readonly protocolId: string;

    initialize(context: ExecutionContext): Promise<void>;

    execute(context: ExecutionContext): Promise<void>;

    getState(context: ExecutionContext): Promise<Record<string, unknown>>;

    collectEvents(): Promise<unknown[]>;

    shutdown(): Promise<void>;
}