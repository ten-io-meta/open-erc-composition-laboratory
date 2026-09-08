import {
    ScientificPrecisionBenchmarkEngine
} from "../laboratory/scientific-precision-benchmark/ScientificPrecisionBenchmarkEngine.js";


let pass =
    0;

let fail =
    0;


function check(
    name:
        string,
    condition:
        boolean
): void {

    console.log(
        `${name}: ${condition ? "PASS" : "FAIL"}`
    );

    if (condition) {
        pass++;
    }
    else {
        fail++;
    }

}


function approximately(
    actual:
        number | null,
    expected:
        number
): boolean {

    return (
        actual !==
            null &&
        Math.abs(
            actual -
            expected
        ) <
            1e-12
    );

}


const engine =
    new ScientificPrecisionBenchmarkEngine();


const result =
    engine.benchmark(
        [

            {
                caseId:
                    "TP-1",
                expected:
                    "POSITIVE",
                observed:
                    "POSITIVE"
            },

            {
                caseId:
                    "TP-2",
                expected:
                    "POSITIVE",
                observed:
                    "POSITIVE"
            },

            {
                caseId:
                    "FP-1",
                expected:
                    "NEGATIVE",
                observed:
                    "POSITIVE"
            },

            {
                caseId:
                    "TN-1",
                expected:
                    "NEGATIVE",
                observed:
                    "NEGATIVE"
            },

            {
                caseId:
                    "TN-2",
                expected:
                    "NEGATIVE",
                observed:
                    "NEGATIVE"
            },

            {
                caseId:
                    "FN-1",
                expected:
                    "POSITIVE",
                observed:
                    "NEGATIVE"
            },

            {
                caseId:
                    "ABSTAIN-POSITIVE",
                expected:
                    "POSITIVE",
                observed:
                    "ABSTAIN"
            },

            {
                caseId:
                    "ABSTAIN-NEGATIVE",
                expected:
                    "NEGATIVE",
                observed:
                    "ABSTAIN"
            }

        ],
        0.95
    );


console.log("");
console.log(
    "SCIENTIFIC PRECISION BENCHMARK CORE"
);
console.log(
    "==================================="
);


check(
    "BENCHMARK HAS NO ERRORS",
    result.errors.length ===
        0
);


check(
    "METRICS ARE PRODUCED",
    result.metrics !==
        null
);


const metrics =
    result.metrics!;


check(
    "CONFUSION MATRIX IS CORRECT",
    metrics.truePositive ===
        2 &&
    metrics.falsePositive ===
        1 &&
    metrics.trueNegative ===
        2 &&
    metrics.falseNegative ===
        1
);


check(
    "ABSTENTIONS ARE COUNTED SEPARATELY",
    metrics.abstainedPositive ===
        1 &&
    metrics.abstainedNegative ===
        1
);


check(
    "PRECISION IS TP OVER POSITIVE DECISIONS",
    approximately(
        metrics.precision,
        2 / 3
    )
);


check(
    "RECALL COUNTS POSITIVE ABSTENTIONS AS MISSED POSITIVES",
    approximately(
        metrics.recall,
        0.5
    )
);


check(
    "NEGATIVE RECALL COUNTS NEGATIVE ABSTENTIONS",
    approximately(
        metrics.negativeRecall,
        0.5
    )
);


check(
    "FIRM ACCURACY EXCLUDES ABSTENTIONS",
    approximately(
        metrics.firmAccuracy,
        4 / 6
    )
);


check(
    "COVERAGE IS FIRM DECISIONS OVER ALL CASES",
    approximately(
        metrics.coverage,
        0.75
    )
);


check(
    "95 PERCENT TARGET IS NOT FALSELY REPORTED AS MET",
    metrics.targetPrecisionMet ===
        false
);


const noPositiveDecision =
    engine.benchmark(
        [
            {
                caseId:
                    "NEGATIVE-ONLY",
                expected:
                    "NEGATIVE",
                observed:
                    "NEGATIVE"
            }
        ],
        0.95
    );


check(
    "NO POSITIVE DECISIONS DOES NOT MANUFACTURE 100 PERCENT PRECISION",
    noPositiveDecision.metrics
        ?.precision ===
        null &&
    noPositiveDecision.metrics
        ?.targetPrecisionMet ===
        null
);


const duplicate =
    engine.benchmark(
        [
            {
                caseId:
                    "DUPLICATE",
                expected:
                    "POSITIVE",
                observed:
                    "POSITIVE"
            },
            {
                caseId:
                    "DUPLICATE",
                expected:
                    "NEGATIVE",
                observed:
                    "NEGATIVE"
            }
        ]
    );


check(
    "DUPLICATE CASE IDS FAIL CLOSED",
    duplicate.errors.length >
        0 &&
    duplicate.metrics ===
        null
);


console.log("");
console.log(
    `PASS: ${pass}`
);

console.log(
    `FAIL: ${fail}`
);

console.log(
    `RESULT: ${fail === 0 ? "PASS" : "FAIL"}`
);


if (fail > 0) {
    process.exitCode = 1;
}