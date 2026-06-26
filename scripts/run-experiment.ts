import { readFile } from "fs/promises";

import { CapabilityRegistry } from "../laboratory/capabilities/CapabilityRegistry.js";
import { CapabilityResolver } from "../laboratory/capabilities/CapabilityResolver.js";
import { ProtocolRegistry } from "../laboratory/registry/ProtocolRegistry.js";
import { ProtocolFactory } from "../laboratory/protocols/ProtocolFactory.js";
import { ProtocolManifestLoader } from "../laboratory/protocols/ProtocolManifestLoader.js";
import { DatasetWriter } from "../laboratory/dataset/DatasetWriter.js";
import { ReportWriter } from "../laboratory/publication/ReportWriter.js";
import { ValidationEngine } from "../laboratory/validation/ValidationEngine.js";
import { ReservationSafetyRule } from "../laboratory/validation/ReservationSafetyRule.js";
import { AuthoritySafetyRule } from "../laboratory/validation/AuthoritySafetyRule.js";

async function main() {
    console.log("====================================");
    console.log("Open ERC Composition Laboratory");
    console.log("====================================");

    const experiment = JSON.parse(
        await readFile("./experiments/CASE-0001.json", "utf8")
    );

    const capabilityRegistry = new CapabilityRegistry();
    const protocolRegistry = new ProtocolRegistry();
    const manifestLoader = new ProtocolManifestLoader();
    const datasetWriter = new DatasetWriter();
    const reportWriter = new ReportWriter();

    const validationEngine = new ValidationEngine();
    validationEngine.register(new ReservationSafetyRule());
    validationEngine.register(new AuthoritySafetyRule());

    capabilityRegistry.register({
        id: "Authority",
        name: "Authority",
        description: "Authority and permission boundary"
    });

    capabilityRegistry.register({
        id: "Reservation",
        name: "Reservation",
        description: "Value reservation and availability accounting"
    });

    capabilityRegistry.register({
        id: "Settlement",
        name: "Settlement",
        description: "Settlement execution"
    });

    protocolRegistry.register({
        id: "MockAuthority",
        name: "Mock Authority Protocol",
        version: "0.1",
        capabilities: ["Authority"]
    });

    const erc8060Manifest = await manifestLoader.load(
        "./laboratory/protocols/erc8060-reservable/manifest.json"
    );

    protocolRegistry.register({
        id: erc8060Manifest.id,
        name: erc8060Manifest.name,
        version: erc8060Manifest.version,
        capabilities: erc8060Manifest.capabilities
    });

    protocolRegistry.register({
        id: "MockSettlement",
        name: "Mock Settlement Protocol",
        version: "0.1",
        capabilities: ["Settlement"]
    });

    const resolver = new CapabilityResolver(
        capabilityRegistry,
        protocolRegistry
    );

    console.log("");
    console.log("Experiment:");
    console.log(experiment.name);

    console.log("");
    console.log("Required capabilities:");

    for (const capability of experiment.requiredCapabilities) {
        console.log("- " + capability);
    }

    const resolvedProtocols = resolver.resolve(
        experiment.requiredCapabilities
    );

    console.log("");
    console.log("Resolved protocols:");

    for (const protocol of resolvedProtocols) {
        console.log(
            "OK " + protocol.id + " -> " + protocol.capabilities.join(", ")
        );
    }

    console.log("");
    console.log("Loading protocol adapters:");

    const adapters = resolvedProtocols.map(protocol => {
        const adapter = ProtocolFactory.create(protocol.id);
        console.log("OK " + adapter.protocolId);
        return adapter;
    });

    console.log("");
    console.log("Initializing adapters:");

    for (const adapter of adapters) {
        await adapter.initialize();
        console.log("OK initialized " + adapter.protocolId);
    }

    console.log("");
    console.log("Protocol states:");

    const states: Record<string, unknown> = {};

    for (const adapter of adapters) {
        const state = await adapter.getState();
        states[adapter.protocolId] = state;
        console.log(adapter.protocolId, state);
    }

    console.log("");
    console.log("Validation:");

    const validationResults = validationEngine.validate(states);

    for (const result of validationResults) {
        console.log(
            `${result.passed ? "PASS" : "FAIL"} ${result.rule}: ${result.message}`
        );
    }

    console.log("");
    console.log("Metrics:");

    for (const metric of experiment.metrics) {
        console.log("- " + metric);
    }

    console.log("");
    console.log("Benchmark:");
    console.log(experiment.benchmark);

    const executedAt = new Date().toISOString();

    await datasetWriter.write(experiment.id, {
        experimentId: experiment.id,
        experimentName: experiment.name,
        requiredCapabilities: experiment.requiredCapabilities,
        resolvedProtocols: resolvedProtocols.map(protocol => protocol.id),
        states,
        validationResults,
        metrics: experiment.metrics,
        benchmark: experiment.benchmark,
        executedAt
    });

    console.log("");
    console.log("Dataset written:");
    console.log(`./datasets/${experiment.id}.json`);

    await reportWriter.write(experiment.id, {
        experimentName: experiment.name,
        composition: resolvedProtocols.map(protocol => protocol.id),
        validationResults,
        metrics: experiment.metrics,
        benchmark: experiment.benchmark,
        executedAt
    });

    console.log("Report written:");
    console.log(`./reports/${experiment.id}.md`);

    console.log("");
    console.log("Experiment finished.");
}

main();