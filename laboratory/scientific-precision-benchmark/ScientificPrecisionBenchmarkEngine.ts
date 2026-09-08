import type {
    ScientificPrecisionBenchmarkCase,
    ScientificPrecisionBenchmarkResult
} from "./ScientificPrecisionBenchmark.js";


function uniqueSorted(
    values:
        string[]
): string[] {

    return [
        ...new Set(
            values
        )
    ].sort();

}


export class ScientificPrecisionBenchmarkEngine {

    benchmark(
        cases:
            ScientificPrecisionBenchmarkCase[],
        targetPrecision:
            number =
            0.95
    ): ScientificPrecisionBenchmarkResult {

        const errors:
            string[] =
            [];


        if (
            typeof targetPrecision !==
                "number" ||
            !Number.isFinite(
                targetPrecision
            ) ||
            targetPrecision <
                0 ||
            targetPrecision >
                1
        ) {

            return {

                metrics:
                    null,

                cases:
                    [],

                errors: [
                    "targetPrecision must be a finite number between 0 and 1."
                ]

            };

        }


        const seenCaseIds =
            new Set<string>();


        for (
            const benchmarkCase
            of cases
        ) {

            if (
                benchmarkCase.caseId.trim().length ===
                0
            ) {

                errors.push(
                    "Precision benchmark case has no caseId."
                );

                continue;

            }


            if (
                seenCaseIds.has(
                    benchmarkCase.caseId
                )
            ) {

                errors.push(
                    `Duplicate precision benchmark case ${benchmarkCase.caseId}.`
                );

                continue;

            }


            seenCaseIds.add(
                benchmarkCase.caseId
            );


            if (
                benchmarkCase.expected !==
                    "POSITIVE" &&
                benchmarkCase.expected !==
                    "NEGATIVE"
            ) {

                errors.push(
                    `Precision benchmark case ${benchmarkCase.caseId} has invalid ground truth.`
                );

            }


            if (
                benchmarkCase.observed !==
                    "POSITIVE" &&
                benchmarkCase.observed !==
                    "NEGATIVE" &&
                benchmarkCase.observed !==
                    "ABSTAIN"
            ) {

                errors.push(
                    `Precision benchmark case ${benchmarkCase.caseId} has invalid observed decision.`
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                metrics:
                    null,

                cases:
                    [],

                errors:
                    uniqueSorted(
                        errors
                    )

            };

        }


        let truePositive =
            0;

        let falsePositive =
            0;

        let trueNegative =
            0;

        let falseNegative =
            0;

        let abstainedPositive =
            0;

        let abstainedNegative =
            0;


        for (
            const benchmarkCase
            of cases
        ) {

            if (
                benchmarkCase.expected ===
                    "POSITIVE" &&
                benchmarkCase.observed ===
                    "POSITIVE"
            ) {

                truePositive++;

                continue;

            }


            if (
                benchmarkCase.expected ===
                    "NEGATIVE" &&
                benchmarkCase.observed ===
                    "POSITIVE"
            ) {

                falsePositive++;

                continue;

            }


            if (
                benchmarkCase.expected ===
                    "NEGATIVE" &&
                benchmarkCase.observed ===
                    "NEGATIVE"
            ) {

                trueNegative++;

                continue;

            }


            if (
                benchmarkCase.expected ===
                    "POSITIVE" &&
                benchmarkCase.observed ===
                    "NEGATIVE"
            ) {

                falseNegative++;

                continue;

            }


            if (
                benchmarkCase.expected ===
                    "POSITIVE" &&
                benchmarkCase.observed ===
                    "ABSTAIN"
            ) {

                abstainedPositive++;

                continue;

            }


            if (
                benchmarkCase.expected ===
                    "NEGATIVE" &&
                benchmarkCase.observed ===
                    "ABSTAIN"
            ) {

                abstainedNegative++;

                continue;

            }

        }


        const positiveDecisions =
            truePositive +
            falsePositive;


        const negativeDecisions =
            trueNegative +
            falseNegative;


        const firmDecisions =
            positiveDecisions +
            negativeDecisions;


        const actualPositive =
            truePositive +
            falseNegative +
            abstainedPositive;


        const actualNegative =
            trueNegative +
            falsePositive +
            abstainedNegative;


        const precision =
            positiveDecisions >
                0
                    ? truePositive /
                        positiveDecisions
                    : null;


        const recall =
            actualPositive >
                0
                    ? truePositive /
                        actualPositive
                    : null;


        const negativeRecall =
            actualNegative >
                0
                    ? trueNegative /
                        actualNegative
                    : null;


        const firmAccuracy =
            firmDecisions >
                0
                    ? (
                        truePositive +
                        trueNegative
                    ) /
                        firmDecisions
                    : null;


        const coverage =
            cases.length >
                0
                    ? firmDecisions /
                        cases.length
                    : 0;


        return {

            metrics: {

                totalCases:
                    cases.length,

                truePositive,

                falsePositive,

                trueNegative,

                falseNegative,

                abstainedPositive,

                abstainedNegative,

                firmDecisions,

                positiveDecisions,

                negativeDecisions,

                precision,

                recall,

                negativeRecall,

                firmAccuracy,

                coverage,

                targetPrecision,

                targetPrecisionMet:
                    precision ===
                    null
                        ? null
                        : precision >=
                            targetPrecision

            },

            cases:
                [...cases]
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            a.caseId.localeCompare(
                                b.caseId
                            )
                    ),

            errors:
                []

        };

    }

}