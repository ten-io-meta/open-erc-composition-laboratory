import type { Composition } from "./Composition.js";
import type { CompositionConfiguration } from "./CompositionConfiguration.js";
import type { CompositionResult } from "./CompositionResult.js";

export class CompositionEngine {

    async execute(

        composition: Composition,

        configuration: CompositionConfiguration

    ): Promise<CompositionResult> {

        console.log("==============================");

        console.log("OECL Composition Engine");

        console.log(composition.name);

        console.log(configuration);

        console.log("==============================");

        return {

            success: true,

            executedProtocols: composition.protocols,

            startedAt: new Date().toISOString(),

            completedAt: new Date().toISOString()

        };

    }

}
