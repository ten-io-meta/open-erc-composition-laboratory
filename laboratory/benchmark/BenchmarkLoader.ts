import { readdir, readFile } from "fs/promises";
import type { BatchResultSummary } from "./BenchmarkEngine.js";

export class BenchmarkLoader {
    async loadAll(): Promise<BatchResultSummary[]> {
        const files = await readdir("./datasets");

        const datasets = [];

        for (const file of files) {
            if (!file.endsWith(".json")) {
                continue;
            }

            const json = JSON.parse(
                await readFile(
                    `./datasets/${file}`,
                    "utf8"
                )
            );

            datasets.push(json);
        }

        const scenariosExecuted = datasets.length;

        const passed = datasets.filter(
            dataset => dataset.validationPassed === true
        ).length;

        const failed = scenariosExecuted - passed;

        const validationRulesChecked = datasets.reduce(
            (total, dataset) =>
                total + (dataset.validationResults ?? []).length,
            0
        );

        const validationPassed = datasets.reduce(
            (total, dataset) =>
                total +
                (dataset.validationResults ?? []).filter(
                    (result: any) => result.passed === true
                ).length,
            0
        );

        const validationFailed =
            validationRulesChecked - validationPassed;

        const compositionPropertiesEvaluated = datasets.reduce(
            (total, dataset) =>
                total + (dataset.propertyResults ?? []).length,
            0
        );

        const protocols = new Set<string>();
        const capabilities = new Set<string>();

        for (const dataset of datasets) {
            for (const protocol of dataset.resolvedProtocols ?? []) {
                protocols.add(protocol);
            }

            for (const capability of dataset.requiredCapabilities ?? []) {
                capabilities.add(capability);
            }
        }

        return [
            {
                batchId: "GLOBAL-DATASET-BENCHMARK",
                scenariosExecuted,
                passed,
                failed,
                validationRulesChecked,
                validationPassed,
                validationFailed,
                compositionPropertiesEvaluated,
                protocolsUsed: protocols.size,
                capabilitiesResolved: capabilities.size,
                datasetsGenerated: scenariosExecuted,
                reportsGenerated: scenariosExecuted
            }
        ];
    }
}
