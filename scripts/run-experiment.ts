import { readFile } from "fs/promises";

async function main() {

    console.log("====================================");
    console.log("Open ERC Composition Laboratory");
    console.log("====================================");

    const experiment = JSON.parse(

        await readFile(
            "./experiments/CASE-0001.json",
            "utf8"
        )

    );

    console.log("");

    console.log("Experiment:");
    console.log(experiment.name);

    console.log("");

    console.log("Composition:");

    for (const protocol of experiment.composition) {

        console.log("✔ " + protocol);

    }

    console.log("");

    console.log("Metrics:");

    for (const metric of experiment.metrics) {

        console.log("• " + metric);

    }

    console.log("");

    console.log("Benchmark:");

    console.log(experiment.benchmark);

    console.log("");

    console.log("Experiment finished.");

}

main();