export interface ScenarioParameters {
    authority: number;
    reserve: number;
    consume: number;
    settle: number;
}

export class Scenario {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly parameters: ScenarioParameters
    ) {}
}