import { Scenario } from "./Scenario.js";
import { ScenarioStrategy } from "./strategies/ScenarioStrategy.js";

export class ScenarioGenerator {

    generate(
        count: number,
        strategy: ScenarioStrategy = "random"
    ): Scenario[] {

        const scenarios: Scenario[] = [];

        for (let i = 1; i <= count; i++) {

            scenarios.push(
                this.generateScenario(
                    i,
                    strategy
                )
            );

        }

        return scenarios;

    }

    private generateScenario(
        index: number,
        strategy: ScenarioStrategy
    ): Scenario {

        switch (strategy) {

            case "valid":
                return this.generateValid(index);

            case "settlement-failure":
                return this.generateSettlementFailure(index);

            case "cursor-failure":
                return this.generateCursorFailure(index);

            case "boundary":
                return this.generateBoundary(index);

            default:
                return this.generateRandom(index);

        }

    }

    private generateValid(index: number): Scenario {

        return new Scenario(

            `VALID-${index}`,

            "Generated Valid Scenario",

            {

                authority:100,

                reserve:60,

                consume:60,

                settle:60

            }

        );

    }

    private generateSettlementFailure(index:number): Scenario{

        return new Scenario(

            `SETTLEMENT-${index}`,

            "Generated Settlement Failure",

            {

                authority:100,

                reserve:40,

                consume:40,

                settle:60

            }

        );

    }

    private generateCursorFailure(index:number): Scenario{

        return new Scenario(

            `CURSOR-${index}`,

            "Generated Cursor Failure",

            {

                authority:40,

                reserve:40,

                consume:60,

                settle:40

            }

        );

    }

    private generateBoundary(index:number): Scenario{

        return new Scenario(

            `BOUNDARY-${index}`,

            "Boundary Scenario",

            {

                authority:100,

                reserve:100,

                consume:100,

                settle:100

            }

        );

    }

    private generateRandom(index:number): Scenario{

        return new Scenario(

            `RANDOM-${index}`,

            "Random Scenario",

            {

                authority:100,

                reserve:this.random(100),

                consume:this.random(100),

                settle:this.random(100)

            }

        );

    }

    private random(max:number){

        return Math.floor(Math.random()*(max+1));

    }

}