import type { Metric } from "./Metric.js";

export class MetricsEngine {

    private readonly metrics: Metric[] = [];

    add(metric: Metric): void {

        this.metrics.push(metric);

    }

    getAll(): Metric[] {

        return [...this.metrics];

    }

    get(id: string): Metric[] {

        return this.metrics.filter(metric => metric.id === id);

    }

    clear(): void {

        this.metrics.length = 0;

    }

}