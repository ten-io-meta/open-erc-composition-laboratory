import { readFile } from "fs/promises";
import { ProtocolFactory } from "../laboratory/protocols/ProtocolFactory.js";
import { DatasetWriter } from "../laboratory/dataset/DatasetWriter.js";

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

    const datasetWriter = new DatasetWriter();

    console.log("");
    console.log("Experiment:");
    console.log(experiment.name);

    console.log("");
    console.log("Loading protocols:");

    const protocols = experiment.composition.map((protocolId: string) => {
        const protocol = ProtocolFactory.create(protocolId);
        console.log("OK " + protocol.protocolId);
        return protocol;
    });

    console.log("");
    console.log("Initializing protocols:");

    for (const protocol of protocols) {
        await protocol.initialize();
        console.log("OK initialized " + protocol.protocolId);
    }

    console.log("");
    console.log("Protocol states:");

    for (const protocol of protocols) {
        const state = await protocol.getState();
        console.log(protocol.protocolId, state);
    }

    console.log("");
    console.log("Metrics:");

    for (const metric of experiment.metrics) {
        console.log("- " + metric);
    }

    console.log("");
    console.log("Benchmark:");
    console.log(experiment.benchmark);

    await datasetWriter.write(experiment.id, {
        experimentId: experiment.id,
        experimentName: experiment.name,
        composition: experiment.composition,
        metrics: experiment.metrics,
        benchmark: experiment.benchmark,
        executedAt: new Date().toISOString()
    });

    console.log("");
    console.log("Dataset written:");
    console.log(`./datasets/${experiment.id}.json`);

    console.log("");
    console.log("Experiment finished.");
}

main();