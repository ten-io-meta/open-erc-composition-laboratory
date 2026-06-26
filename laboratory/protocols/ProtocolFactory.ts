import type { ProtocolAdapter } from "../adapters/ProtocolAdapter.js";
import { MockAuthority } from "./MockAuthority.js";
import { MockReservation } from "./MockReservation.js";
import { MockSettlement } from "./MockSettlement.js";

export class ProtocolFactory {
    static create(protocolId: string): ProtocolAdapter {
        switch (protocolId) {
            case "MockAuthority":
                return new MockAuthority();

            case "MockReservation":
                return new MockReservation();

            case "MockSettlement":
                return new MockSettlement();

            default:
                throw new Error(`Unknown protocol: ${protocolId}`);
        }
    }
}