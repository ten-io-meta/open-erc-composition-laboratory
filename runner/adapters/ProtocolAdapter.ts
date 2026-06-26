export interface ProtocolAdapter {

    readonly id: string;

    readonly name: string;

    readonly version: string;

    initialize(): Promise<void>;

    execute(): Promise<void>;

    collectMetrics(): Promise<void>;

    shutdown(): Promise<void>;

}