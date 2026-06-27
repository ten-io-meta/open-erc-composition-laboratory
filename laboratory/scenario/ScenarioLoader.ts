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
            json.parameters
        );

    }

}