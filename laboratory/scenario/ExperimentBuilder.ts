import { Scenario } from "./Scenario.js";

export class ExperimentBuilder {

    build(scenario: Scenario) {

        return {
            id: scenario.id,
            name: scenario.name,
            requiredCapabilities: [
                "Authority",
                "Reservation",
                "Accounting",
                "Cursor",
                "Settlement"
            ]
        };

    }

}