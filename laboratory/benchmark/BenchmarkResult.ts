export interface BenchmarkResult {
    batchesAnalysed: number;
    scenariosExecuted: number;
    scenariosPassed: number;
    scenariosFailed: number;
    validationRulesChecked: number;
    validationPassed: number;
    validationFailed: number;
    compositionPropertiesEvaluated: number;
    protocolsUsed: number;
    capabilitiesResolved: number;
    datasetsGenerated: number;
    reportsGenerated: number;
}
