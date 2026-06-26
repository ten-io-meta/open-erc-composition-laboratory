import { readFile } from "fs/promises";

import { CapabilityLoader } from "../laboratory/capabilities/CapabilityLoader.js";
import { CapabilityRegistry } from "../laboratory/capabilities/CapabilityRegistry.js";
import { CapabilityResolver } from "../laboratory/capabilities/CapabilityResolver.js";
import { ProtocolRegistry } from "../laboratory/registry/ProtocolRegistry.js";
import { ProtocolFactory } from "../laboratory/protocols/ProtocolFactory.js";
import { ProtocolManifestLoader } from "../laboratory/protocols/ProtocolManifestLoader.js";
import { ProtocolDiscovery } from "../laboratory/discovery/ProtocolDiscovery.js";
import { DatasetWriter } from "../laboratory/dataset/DatasetWriter.js";
import { ReportWriter } from "../laboratory/publication/ReportWriter.js";
import { ValidationEngine } from "../laboratory/validation/ValidationEngine.js";
import { ReservationSafetyRule } from "../laboratory/validation/ReservationSafetyRule.js";
import { AuthoritySafetyRule } from "../laboratory/validation/AuthoritySafetyRule.js";
import { ExecutionContext } from "../laboratory/runtime/ExecutionContext.js";

async function main() {
    const experimentId = process.argv[2] ?? "CASE-0001";

    console.log("====================================");
    console.log("Open ERC Composition Laboratory");
    console.log("====================================");
    console.log("");
    console.log(`Selected experiment: ${experimentId}`);

    const experiment = JSON.parse(
        await readFile(`./experiments/${experimentId}.json`, "utf8")
    );

    const context = new ExecutionContext();

    const capabilityRegistry = new CapabilityRegistry();
    const capabilityLoader = new CapabilityLoader();

    const protocolRegistry = new ProtocolRegistry();
    const manifestLoader = new ProtocolManifestLoader();
    const protocolDiscovery = new ProtocolDiscovery(
        protocolRegistry,
        manifestLoader
    );

    const datasetWriter = new DatasetWriter();
    const reportWriter = new ReportWriter();

    const validationEngine = new ValidationEngine();
    validationEngine.register(new ReservationSafetyRule());
    validationEngine.register(new AuthoritySafetyRule());

    const capabilities = await capabilityLoader.load("./registry/capabilities.json");

    for (const capability of capabilities) {
        capabilityRegistry.register(capability);
    }

    await protocolDiscovery.discover("./laboratory/protocols");

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
        await adapter.initialize(context);
        console.log("OK initialized " + adapter.protocolId);
    }

    console.log("");
    console.log("Executing adapters:");

    for (const adapter of adapters) {
        await adapter.execute(context);
        console.log("OK executed " + adapter.protocolId);
    }

    console.log("");
    console.log("Protocol states:");

    const states: Record<string, unknown> = {};

    for (const adapter of adapters) {
        const state = await adapter.getState(context);
        states[adapter.protocolId] = state;
        console.log(adapter.protocolId, state);
    }

    console.log("");
    console.log("Validation:");

    const validationResults = validationEngine.validate(states);
    const validationPassed = validationResults.every(result => result.passed);

    for (const result of validationResults) {
        console.log(
            `${result.passed ? "PASS" : "FAIL"} ${result.rule}: ${result.message}`
        );
    }

    if (!validationPassed) {
        console.log("");
        console.log("Experiment validation failed.");
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
        context,
        states,
        validationResults,
        validationPassed,
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