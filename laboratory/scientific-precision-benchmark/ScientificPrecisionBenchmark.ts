export type ScientificBenchmarkGroundTruth =
    | "POSITIVE"
    | "NEGATIVE";


export type ScientificBenchmarkDecision =
    | "POSITIVE"
    | "NEGATIVE"
    | "ABSTAIN";


export interface ScientificPrecisionBenchmarkCase {

    caseId:
        string;

    expected:
        ScientificBenchmarkGroundTruth;

    observed:
        ScientificBenchmarkDecision;

}


export interface ScientificPrecisionBenchmarkMetrics {

    totalCases:
        number;

    truePositive:
        number;

    falsePositive:
        number;

    trueNegative:
        number;

    falseNegative:
        number;

    abstainedPositive:
        number;

    abstainedNegative:
        number;

    firmDecisions:
        number;

    positiveDecisions:
        number;

    negativeDecisions:
        number;

    precision:
        number | null;

    recall:
        number | null;

    negativeRecall:
        number | null;

    firmAccuracy:
        number | null;

    coverage:
        number;

    targetPrecision:
        number;

    targetPrecisionMet:
        boolean | null;

}


export interface ScientificPrecisionBenchmarkResult {

    metrics:
        ScientificPrecisionBenchmarkMetrics | null;

    cases:
        ScientificPrecisionBenchmarkCase[];

    errors:
        string[];

}