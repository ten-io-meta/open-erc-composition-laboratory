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
        public readonly parameters: ScenarioParameters,
        public readonly description?: string,
        public readonly target?: string,
        public readonly protocolA?: string,
        public readonly protocolB?: string,
        public readonly priority?: "Low" | "Medium" | "High",
        public readonly scenarioType?: string,
        public readonly sourceHypothesis?: string,
        public readonly validationTarget?: string,
        public readonly supportingEvidence?: string[]
    ) {}
}
