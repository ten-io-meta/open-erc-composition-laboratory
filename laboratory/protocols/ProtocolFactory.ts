import type { ProtocolAdapter } from "../adapters/ProtocolAdapter.js";

import { MockAuthority } from "./MockAuthority.js";
import { MockSettlement } from "./MockSettlement.js";

import { ERC8060ReservableAdapter } from "./erc8060-reservable/ERC8060ReservableAdapter.js";
import { ERC8275SettlementAdapter } from "./erc8275-settlement/ERC8275SettlementAdapter.js";

export class ProtocolFactory {

    static create(protocolId: string): ProtocolAdapter {

        switch (protocolId) {

            case "MockAuthority":
                return new MockAuthority();

            case "ERC8060Reservable":
                return new ERC8060ReservableAdapter();

            case "MockSettlement":
                return new MockSettlement();

            case "ERC8275Settlement":
                return new ERC8275SettlementAdapter();

            default:
                throw new Error(`Unknown protocol: ${protocolId}`);

        }

    }

}