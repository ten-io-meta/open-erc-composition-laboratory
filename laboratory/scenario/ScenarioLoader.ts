import { readFile } from "fs/promises";
import { Scenario } from "./Scenario.js";

export class ScenarioLoader {
    async load(path: string): Promise<Scenario> {
        const json = JSON.parse(
            await readFile(path, "utf8")
        );

        return new Scenario(
            json.id,
            json.name,
            json.parameters,
            json.description,
            json.target,
            json.protocolA,
            json.protocolB,
            json.priority,
            json.scenarioType,
            json.sourceHypothesis,
            json.validationTarget,
            json.supportingEvidence
        );
    }
}
