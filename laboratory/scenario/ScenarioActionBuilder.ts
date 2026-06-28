import type { ExecutionAction } from "../runtime/ExecutionAction.js";
import { Scenario } from "./Scenario.js";

export class ScenarioActionBuilder {
    build(scenario: Scenario): ExecutionAction[] {
        return [
            {
                protocol: "ERC8001Authority",
                action: "authorize",
                amount: scenario.parameters.authority
            },
            {
                protocol: "ERC8060Reservable",
                action: "reserve",
                amount: scenario.parameters.reserve
            },
            {
                protocol: "ERC8312Cursor",
                action: "consume",
                amount: scenario.parameters.consume
            },
            {
                protocol: "ERC8275Settlement",
                action: "settle",
                amount: scenario.parameters.settle
            }
        ];
    }
}
