import type { ProtocolAdapter } from "../adapters/ProtocolAdapter.js";

export class Laboratory {

    private adapters: ProtocolAdapter[] = [];

    register(adapter: ProtocolAdapter): void {

        this.adapters.push(adapter);

    }

    getAdapters(): ProtocolAdapter[] {

        return this.adapters;

    }

}
