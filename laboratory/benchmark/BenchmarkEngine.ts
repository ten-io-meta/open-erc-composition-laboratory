import type { BenchmarkResult } from "./BenchmarkResult.js";

export interface BatchResultSummary {
    batchId: string;
    scenariosExecuted: number;
    passed: number;
    failed: number;
    validationRulesChecked: number;
    validationPassed: number;
    validationFailed: number;
    compositionPropertiesEvaluated: number;
    protocolsUsed: number;
    capabilitiesResolved: number;
    datasetsGenerated: number;
    reportsGenerated: number;
}

export class BenchmarkEngine {
    aggregate(results: BatchResultSummary[]): BenchmarkResult {
        return {
            batchesAnalysed: results.length,
            scenariosExecuted: results.reduce((t, r) => t + r.scenariosExecuted, 0),
            scenariosPassed: results.reduce((t, r) => t + r.passed, 0),
            scenariosFailed: results.reduce((t, r) => t + r.failed, 0),
            validationRulesChecked: results.reduce((t, r) => t + r.validationRulesChecked, 0),
            validationPassed: results.reduce((t, r) => t + r.validationPassed, 0),
            validationFailed: results.reduce((t, r) => t + r.validationFailed, 0),
            compositionPropertiesEvaluated: results.reduce((t, r) => t + r.compositionPropertiesEvaluated, 0),
            protocolsUsed: Math.max(...results.map(r => r.protocolsUsed)),
            capabilitiesResolved: results.reduce((t, r) => t + r.capabilitiesResolved, 0),
            datasetsGenerated: results.reduce((t, r) => t + r.datasetsGenerated, 0),
            reportsGenerated: results.reduce((t, r) => t + r.reportsGenerated, 0)
        };
    }
}