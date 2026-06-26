import type { ProtocolAdapter } from "../adapters/ProtocolAdapter.js";

import { MockAuthority } from "./MockAuthority.js";
import { MockSettlement } from "./MockSettlement.js";
import { ERC8060ReservableAdapter } from "./erc8060-reservable/ERC8060ReservableAdapter.js";

export class ProtocolFactory {

    static create(protocolId: string): ProtocolAdapter {

        switch (protocolId) {

            case "MockAuthority":
                return new MockAuthority();

            case "ERC8060Reservable":
                return new ERC8060ReservableAdapter();

            case "MockSettlement":
                return new MockSettlement();

            default:
                throw new Error(`Unknown protocol: ${protocolId}`);

        }

    }

}