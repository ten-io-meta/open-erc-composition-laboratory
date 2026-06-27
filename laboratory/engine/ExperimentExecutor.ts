import { CapabilityLoader } from "../capabilities/CapabilityLoader.js";
import { CapabilityRegistry } from "../capabilities/CapabilityRegistry.js";
import { CapabilityResolver } from "../capabilities/CapabilityResolver.js";
import { ProtocolRegistry } from "../registry/ProtocolRegistry.js";
import { ProtocolFactory } from "../protocols/ProtocolFactory.js";
import { ProtocolManifestLoader } from "../protocols/ProtocolManifestLoader.js";
import { ProtocolDiscovery } from "../discovery/ProtocolDiscovery.js";
import { DatasetWriter } from "../dataset/DatasetWriter.js";
import { ReportWriter } from "../publication/ReportWriter.js";

import { ValidationEngine } from "../validation/ValidationEngine.js";
import { ReservationSafetyRule } from "../validation/ReservationSafetyRule.js";
import { AuthoritySafetyRule } from "../validation/AuthoritySafetyRule.js";
import { SettlementSafetyRule } from "../validation/SettlementSafetyRule.js";
import { CursorSafetyRule } from "../validation/CursorSafetyRule.js";

import { CompositionPropertyEngine } from "../properties/CompositionPropertyEngine.js";
import { CompatibilityProperty } from "../properties/CompatibilityProperty.js";
import { ComposabilityProperty } from "../properties/ComposabilityProperty.js";

import { ExecutionContext } from "../runtime/ExecutionContext.js";
import type { ExecutionAction } from "../runtime/ExecutionAction.js";

export interface ExecutableExperiment {
    id: string;
    name: string;
    requiredCapabilities: string[];
    actions: ExecutionAction[];
    metrics?: string[];
    benchmark?: Record<string, unknown>;
}

export interface ExperimentExecutionResult {
    experimentId: string;
    validationPassed: boolean;
    validationResults: unknown[];
    propertyResults: unknown[];
}

export class ExperimentExecutor {
    async execute(
        experiment: ExecutableExperiment
    ): Promise<ExperimentExecutionResult> {
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
        validationEngine.register(new SettlementSafetyRule());
        validationEngine.register(new CursorSafetyRule());

        const propertyEngine = new CompositionPropertyEngine();
        propertyEngine.register(new CompatibilityProperty());
        propertyEngine.register(new ComposabilityProperty());

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
        console.log("Executing actions:");

        for (const action of experiment.actions ?? []) {
            const adapter = adapters.find(
                adapter => adapter.protocolId === action.protocol
            );

            if (!adapter) {
                throw new Error(`No adapter found for action protocol: ${action.protocol}`);
            }

            await adapter.execute(context, action);

            console.log(
                `OK ${action.protocol}.${action.action}(${action.amount ?? ""})`
            );
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

        const propertyResults = propertyEngine.evaluate({
            requiredCapabilities: experiment.requiredCapabilities,
            resolvedProtocols: resolvedProtocols.map(protocol => protocol.id),
            validationPassed
        });

        console.log("");
        console.log("Composition Properties:");

        for (const property of propertyResults) {
            console.log(
                `${property.passed ? "PASS" : "FAIL"} ${property.property}: ${property.message} (Score: ${property.score})`
            );
        }

        if (!validationPassed) {
            console.log("");
            console.log("Experiment validation failed.");
            process.exitCode = 1;
        }

        const metrics = experiment.metrics ?? [
            "Safety",
            "Isolation",
            "Determinism",
            "Composability"
        ];

        const benchmark = experiment.benchmark ?? {
            generated: true
        };

        console.log("");
        console.log("Metrics:");

        for (const metric of metrics) {
            console.log("- " + metric);
        }

        console.log("");
        console.log("Benchmark:");
        console.log(benchmark);

        const executedAt = new Date().toISOString();

        await datasetWriter.write(experiment.id, {
            experimentId: experiment.id,
            experimentName: experiment.name,
            requiredCapabilities: experiment.requiredCapabilities,
            resolvedProtocols: resolvedProtocols.map(protocol => protocol.id),
            actions: experiment.actions,
            context,
            states,
            validationResults,
            validationPassed,
            propertyResults,
            metrics,
            benchmark,
            executedAt
        });

        console.log("");
        console.log("Dataset written:");
        console.log(`./datasets/${experiment.id}.json`);

        await reportWriter.write(experiment.id, {
            experimentName: experiment.name,
            composition: resolvedProtocols.map(protocol => protocol.id),
            actions: experiment.actions,
            validationResults,
            metrics,
            benchmark,
            executedAt
        });

        console.log("Report written:");
        console.log(`./reports/${experiment.id}.md`);

        return {
            experimentId: experiment.id,
            validationPassed,
            validationResults,
            propertyResults
        };
    }
}