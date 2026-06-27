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

    console.log("");
    console.log("Benchmark Summary");
    console.log("------------------------------");

    console.log("Batches analysed:", benchmark.batchesAnalysed);
    console.log("Scenarios:", benchmark.scenariosExecuted);
    console.log("Passed:", benchmark.scenariosPassed);
    console.log("Failed:", benchmark.scenariosFailed);

    console.log("");

    console.log("Validation Rules:", benchmark.validationRulesChecked);
    console.log("Validation Passed:", benchmark.validationPassed);
    console.log("Validation Failed:", benchmark.validationFailed);

    console.log("");

    console.log("Composition Properties:", benchmark.compositionPropertiesEvaluated);
    console.log("Protocols:", benchmark.protocolsUsed);
    console.log("Capabilities:", benchmark.capabilitiesResolved);

    console.log("");

    console.log("Datasets:", benchmark.datasetsGenerated);
    console.log("Reports:", benchmark.reportsGenerated);

    console.log("");
    console.log("Benchmark finished.");

}

main();