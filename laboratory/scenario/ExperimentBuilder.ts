import { Scenario } from "./Scenario.js";
import type { ExecutableExperiment } from "../engine/ExperimentExecutor.js";

export class ExperimentBuilder {
    build(scenario: Scenario): ExecutableExperiment {
        return {
            id: scenario.id,
            name: scenario.name,
            requiredCapabilities: [
                "Authority",
                "Reservation",
                "Accounting",
                "Cursor",
                "Settlement"
            ],
            actions: []
        };
    }
}
