import { Scenario } from "./Scenario.js";
import { ScenarioActionBuilder } from "./ScenarioActionBuilder.js";

import type { ExecutionAction } from "../runtime/ExecutionAction.js";

export class ScenarioRunner {

    private readonly builder = new ScenarioActionBuilder();

    buildActions(
        scenario: Scenario
    ): ExecutionAction[] {

        return this.builder.build(scenario);

    }

}