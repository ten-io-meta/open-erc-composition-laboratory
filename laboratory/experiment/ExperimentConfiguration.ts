export interface ExperimentConfiguration {
    id: string;
    title: string;
    description: string;
    protocols: string[];
    capabilities: string[];
    benchmarks: string[];
    metrics: string[];
    seed: number;
}