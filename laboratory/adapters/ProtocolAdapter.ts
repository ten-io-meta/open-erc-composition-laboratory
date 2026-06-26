export interface ProtocolAdapter {
    readonly protocolId: string;

    initialize(): Promise<void>;

    getState(): Promise<Record<string, unknown>>;

    executeAction(
        action: string,
        params?: Record<string, unknown>
    ): Promise<void>;

    collectEvents(): Promise<unknown[]>;

    shutdown(): Promise<void>;
}