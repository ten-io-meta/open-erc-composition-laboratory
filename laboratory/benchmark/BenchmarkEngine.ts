import type { Benchmark } from "./Benchmark.js";
import type { BenchmarkConfiguration } from "./BenchmarkConfiguration.js";

export class BenchmarkEngine {

    async execute(

        benchmark: Benchmark,

        configuration: BenchmarkConfiguration

    ): Promise<void> {

        console.log("==============================");

        console.log("Benchmark");

        console.log(benchmark.name);

        console.log(configuration);

        console.log("==============================");

    }

}