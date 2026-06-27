import { mkdir, writeFile } from "fs/promises";

import { BenchmarkLoader } from "../laboratory/benchmark/BenchmarkLoader.js";
import { BenchmarkEngine } from "../laboratory/benchmark/BenchmarkEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL Benchmark Engine");
    console.log("====================================");

    const loader = new BenchmarkLoader();
    const engine = new BenchmarkEngine();

    const batches = await loader.loadAll();

    const benchmark = engine.aggregate(batches);

    const successRate =
        benchmark.scenariosExecuted === 0
            ? 0
            : (benchmark.scenariosPassed / benchmark.scenariosExecuted) * 100;

    const validationPassRate =
        benchmark.validationRulesChecked === 0
            ? 0
            : (benchmark.validationPassed / benchmark.validationRulesChecked) * 100;

    const validationFailRate =
        benchmark.validationRulesChecked === 0
            ? 0
            : (benchmark.validationFailed / benchmark.validationRulesChecked) * 100;

    console.log("");
    console.log("Benchmark Summary");
    console.log("------------------------------");

    console.log("Batches analysed:", benchmark.batchesAnalysed);
    console.log("Scenarios:", benchmark.scenariosExecuted);
    console.log("Passed:", benchmark.scenariosPassed);
    console.log("Failed:", benchmark.scenariosFailed);
    console.log("Success Rate:", `${successRate.toFixed(2)}%`);

    console.log("");

    console.log("Validation Rules:", benchmark.validationRulesChecked);
    console.log("Validation Passed:", benchmark.validationPassed);
    console.log("Validation Failed:", benchmark.validationFailed);
    console.log("Validation Pass Rate:", `${validationPassRate.toFixed(2)}%`);
    console.log("Validation Fail Rate:", `${validationFailRate.toFixed(2)}%`);

    console.log("");

    console.log("Composition Properties:", benchmark.compositionPropertiesEvaluated);
    console.log("Protocols:", benchmark.protocolsUsed);
    console.log("Capabilities:", benchmark.capabilitiesResolved);

    console.log("");

    console.log("Datasets:", benchmark.datasetsGenerated);
    console.log("Reports:", benchmark.reportsGenerated);

    // Exportación del benchmark
    await mkdir("./benchmark-results", { recursive: true });

    await writeFile(
        "./benchmark-results/benchmark.json",
        JSON.stringify(benchmark, null, 4)
    );

    console.log("");
    console.log("Benchmark exported:");
    console.log("./benchmark-results/benchmark.json");

    console.log("");
    console.log("Benchmark finished.");

}

main();